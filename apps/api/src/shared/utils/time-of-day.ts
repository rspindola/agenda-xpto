import { AppError } from "~/shared/errors/AppError.js";

/**
 * Parses "HH:mm" (24h) into a UTC Date at 1970-01-01 with that wall-clock time (Prisma @db.Time convention).
 */
export function parseTimeHmToUtcDate(time: string): Date {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!match) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid time format; expected HH:mm.");
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
}

/** Formats a UTC time-of-day Date as "HH:mm" (24h). */
export function formatUtcTimeAsHm(d: Date): string {
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Minutes since midnight UTC for a @db.Time-backed Date. */
export function minutesSinceMidnightUtc(d: Date): number {
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}
