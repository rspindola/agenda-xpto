import { DateTime } from "luxon";

import { minutesSinceMidnightUtc } from "~/shared/utils/time-of-day.js";

import type { BusinessHourBookingRow } from "~/modules/booking/booking.repository.js";

/** Same values as Prisma `Weekday` — kept here so this file does not import generated `@prisma/client` types. */
export type PrismaWeekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type MinuteSegment = { start: number; end: number };

export function luxonDateToPrismaWeekday(dt: DateTime): PrismaWeekday {
  switch (dt.weekday) {
    case 1:
      return "MON";
    case 2:
      return "TUE";
    case 3:
      return "WED";
    case 4:
      return "THU";
    case 5:
      return "FRI";
    case 6:
      return "SAT";
    case 7:
      return "SUN";
    default:
      throw new Error("Invalid Luxon weekday.");
  }
}

export function establishmentOpenMinuteSegments(row: BusinessHourBookingRow | undefined): MinuteSegment[] {
  if (!row) {
    return [];
  }
  const openStart = minutesSinceMidnightUtc(row.opensAt);
  const openEnd = minutesSinceMidnightUtc(row.closesAt);
  if (openEnd <= openStart) {
    return [];
  }
  if (row.breakStartsAt !== null && row.breakEndsAt !== null) {
    const b0 = minutesSinceMidnightUtc(row.breakStartsAt);
    const b1 = minutesSinceMidnightUtc(row.breakEndsAt);
    if (b0 > openStart && b1 < openEnd && b1 > b0) {
      return [
        { start: openStart, end: b0 },
        { start: b1, end: openEnd },
      ];
    }
  }
  return [{ start: openStart, end: openEnd }];
}

export function mergeOverlappingMinuteSegments(segments: MinuteSegment[]): MinuteSegment[] {
  if (segments.length === 0) {
    return [];
  }
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const merged: MinuteSegment[] = [];
  for (const seg of sorted) {
    const last = merged.at(-1);
    if (last !== undefined && seg.start < last.end) {
      merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, seg.end) };
    } else {
      merged.push(seg);
    }
  }
  return merged;
}

export function intersectMinuteSegments(a: MinuteSegment[], b: MinuteSegment[]): MinuteSegment[] {
  const out: MinuteSegment[] = [];
  for (const x of a) {
    for (const y of b) {
      const s = Math.max(x.start, y.start);
      const e = Math.min(x.end, y.end);
      if (e > s) {
        out.push({ start: s, end: e });
      }
    }
  }
  return mergeOverlappingMinuteSegments(out);
}

export function minuteSegmentsToLuxonIntervals(
  dayStart: DateTime,
  segments: MinuteSegment[],
): Array<{ start: DateTime; end: DateTime }> {
  return segments.map((s) => ({
    start: dayStart.plus({ minutes: s.start }),
    end: dayStart.plus({ minutes: s.end }),
  }));
}

function mergeLuxonIntervals(intervals: Array<{ start: DateTime; end: DateTime }>): Array<{ start: DateTime; end: DateTime }> {
  if (intervals.length === 0) {
    return [];
  }
  const sorted = [...intervals].sort((a, b) => a.start.toMillis() - b.start.toMillis());
  const merged: Array<{ start: DateTime; end: DateTime }> = [];
  for (const seg of sorted) {
    const last = merged.at(-1);
    if (last !== undefined && seg.start.toMillis() < last.end.toMillis()) {
      merged[merged.length - 1] = {
        start: last.start,
        end: seg.end.toMillis() > last.end.toMillis() ? seg.end : last.end,
      };
    } else {
      merged.push(seg);
    }
  }
  return merged;
}

function splitIntervalMinusCut(
  iv: { start: DateTime; end: DateTime },
  cut: { start: DateTime; end: DateTime },
): Array<{ start: DateTime; end: DateTime }> {
  if (cut.end <= iv.start || cut.start >= iv.end) {
    return [iv];
  }
  const out: Array<{ start: DateTime; end: DateTime }> = [];
  if (cut.start > iv.start) {
    const endPart = cut.start < iv.end ? cut.start : iv.end;
    if (endPart > iv.start) {
      out.push({ start: iv.start, end: endPart });
    }
  }
  if (cut.end < iv.end) {
    const startPart = cut.end > iv.start ? cut.end : iv.start;
    if (iv.end > startPart) {
      out.push({ start: startPart, end: iv.end });
    }
  }
  return out.filter((x) => x.end > x.start);
}

export function subtractLuxonIntervals(
  base: Array<{ start: DateTime; end: DateTime }>,
  cuts: Array<{ start: DateTime; end: DateTime }>,
): Array<{ start: DateTime; end: DateTime }> {
  if (base.length === 0) {
    return [];
  }
  const mergedCuts = mergeLuxonIntervals(
    cuts.filter((c) => c.end > c.start).map((c) => ({ start: c.start, end: c.end })),
  );
  let work = [...base];
  for (const cut of mergedCuts) {
    work = work.flatMap((iv) => splitIntervalMinusCut(iv, cut));
  }
  return work.filter((iv) => iv.end > iv.start);
}

export function roundUpToMinuteGrid(dt: DateTime, stepMinutes: number): DateTime {
  const t = dt.startOf("minute");
  const total = t.hour * 60 + t.minute;
  const mod = total % stepMinutes;
  if (mod === 0) {
    return t;
  }
  return t.plus({ minutes: stepMinutes - mod });
}

export function enumerateSlotsInFreeIntervals(
  free: Array<{ start: DateTime; end: DateTime }>,
  durationMinutes: number,
  stepMinutes: number,
  earliestStartUtc: DateTime,
): Array<{ startAt: DateTime; endAt: DateTime }> {
  const slots: Array<{ startAt: DateTime; endAt: DateTime }> = [];
  for (const iv of free) {
    const rounded = roundUpToMinuteGrid(iv.start, stepMinutes);
    let c = DateTime.max(rounded, iv.start);
    for (;;) {
      const end = c.plus({ minutes: durationMinutes });
      if (end > iv.end) {
        break;
      }
      if (c.toMillis() >= earliestStartUtc.toMillis()) {
        slots.push({ startAt: c, endAt: end });
      }
      c = c.plus({ minutes: stepMinutes });
    }
  }
  return slots;
}
