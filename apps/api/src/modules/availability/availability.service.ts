import type { Weekday } from "@prisma/client";

import type {
  AppointmentsRepository,
  OverlappingAppointmentRowDto,
} from "~/modules/appointments/appointments.repository.js";
import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { AppError } from "~/shared/errors/AppError.js";
import { formatUtcTimeAsHm, minutesSinceMidnightUtc, parseTimeHmToUtcDate } from "~/shared/utils/time-of-day.js";

import type {
  AvailabilityRepository,
  BlockRowDto,
  BusinessHourRowDto,
  HolidayRowDto,
  OpenBusinessHourRow,
  ProfessionalAvailabilityRowDto,
  ProfessionalAvailabilityWindow,
} from "./availability.repository.js";
import type {
  BusinessHourDayInput,
  BusinessHoursListResponse,
  CreateBlockBody,
  CreateHolidayBody,
  CreateProfessionalAvailabilityBody,
  PatchProfessionalAvailabilityBody,
  ProfessionalAvailabilityInput,
  PutBusinessHourBody,
  ReplaceProfessionalAvailabilitiesBody,
} from "./availability.schema.js";
import { WEEKDAY_VALUES } from "./availability.schema.js";

type MinuteSegment = { start: number; end: number };

function establishmentOpenSegmentsForWeekday(row: BusinessHourRowDto | undefined): MinuteSegment[] {
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

function isWindowContainedInUnion(window: MinuteSegment, union: MinuteSegment[]): boolean {
  return union.some((seg) => window.start >= seg.start && window.end <= seg.end);
}

function validateNoOverlapSameWeekday(windows: ProfessionalAvailabilityWindow[]): void {
  const byDay = new Map<Weekday, ProfessionalAvailabilityWindow[]>();
  for (const w of windows) {
    const list = byDay.get(w.weekday) ?? [];
    list.push(w);
    byDay.set(w.weekday, list);
  }
  for (const [, list] of byDay) {
    const sorted = [...list].sort((a, b) => minutesSinceMidnightUtc(a.startsAt) - minutesSinceMidnightUtc(b.startsAt));
    for (const [i, cur] of sorted.entries()) {
      const a0 = minutesSinceMidnightUtc(cur.startsAt);
      const a1 = minutesSinceMidnightUtc(cur.endsAt);
      if (a1 <= a0) {
        throw new AppError(422, "INVALID_AVAILABILITY_WINDOW", "Availability end time must be after start time.");
      }
      const next = sorted.at(i + 1);
      if (next === undefined) {
        continue;
      }
      const b0 = minutesSinceMidnightUtc(next.startsAt);
      if (b0 < a1) {
        throw new AppError(422, "OVERLAPPING_AVAILABILITY", "Professional availability windows must not overlap.");
      }
    }
  }
}

function validateProfessionalWindowsAgainstEstablishment(
  businessRows: BusinessHourRowDto[],
  windows: ProfessionalAvailabilityWindow[],
): void {
  const byWeekday = new Map<Weekday, BusinessHourRowDto>();
  for (const r of businessRows) {
    byWeekday.set(r.weekday, r);
  }
  for (const w of windows) {
    const row = byWeekday.get(w.weekday);
    const segments = establishmentOpenSegmentsForWeekday(row);
    if (segments.length === 0) {
      throw new AppError(
        422,
        "AVAILABILITY_OUTSIDE_BUSINESS_HOURS",
        "Professional availability cannot be set on a weekday when the establishment is closed.",
      );
    }
    const p0 = minutesSinceMidnightUtc(w.startsAt);
    const p1 = minutesSinceMidnightUtc(w.endsAt);
    if (p1 <= p0) {
      throw new AppError(422, "INVALID_AVAILABILITY_WINDOW", "Availability end time must be after start time.");
    }
    if (!isWindowContainedInUnion({ start: p0, end: p1 }, segments)) {
      throw new AppError(
        422,
        "AVAILABILITY_OUTSIDE_BUSINESS_HOURS",
        "Professional availability must fall entirely within establishment business hours.",
      );
    }
  }
}

function validateOpenBusinessDay(day: BusinessHourDayInput): void {
  if (day.closed || day.opensAt === undefined || day.closesAt === undefined) {
    return;
  }
  const opens = parseTimeHmToUtcDate(day.opensAt);
  const closes = parseTimeHmToUtcDate(day.closesAt);
  if (minutesSinceMidnightUtc(closes) <= minutesSinceMidnightUtc(opens)) {
    throw new AppError(422, "INVALID_BUSINESS_HOURS", "Business close time must be after open time.");
  }
  const breakStart =
    day.breakStartsAt !== undefined && day.breakStartsAt !== null ? parseTimeHmToUtcDate(day.breakStartsAt) : null;
  const breakEnd =
    day.breakEndsAt !== undefined && day.breakEndsAt !== null ? parseTimeHmToUtcDate(day.breakEndsAt) : null;
  if (breakStart !== null && breakEnd !== null) {
    const o = minutesSinceMidnightUtc(opens);
    const c = minutesSinceMidnightUtc(closes);
    const b0 = minutesSinceMidnightUtc(breakStart);
    const b1 = minutesSinceMidnightUtc(breakEnd);
    if (b1 <= b0) {
      throw new AppError(422, "INVALID_BREAK_HOURS", "Break end must be after break start.");
    }
    if (b0 < o || b1 > c) {
      throw new AppError(422, "INVALID_BREAK_HOURS", "Break must be fully inside business hours.");
    }
  }
}

function validatePutBusinessHourBody(body: PutBusinessHourBody, weekday: Weekday): void {
  validateOpenBusinessDay({ ...body, weekday });
}

function mapPutBodyToOpenRow(body: PutBusinessHourBody, weekday: Weekday): OpenBusinessHourRow {
  if (body.opensAt === undefined || body.closesAt === undefined) {
    throw new AppError(400, "VALIDATION_ERROR", "opensAt and closesAt are required when closed is false.");
  }
  const breakStartsAt =
    body.breakStartsAt !== undefined && body.breakStartsAt !== null ? parseTimeHmToUtcDate(body.breakStartsAt) : null;
  const breakEndsAt =
    body.breakEndsAt !== undefined && body.breakEndsAt !== null ? parseTimeHmToUtcDate(body.breakEndsAt) : null;
  return {
    weekday,
    opensAt: parseTimeHmToUtcDate(body.opensAt),
    closesAt: parseTimeHmToUtcDate(body.closesAt),
    breakStartsAt,
    breakEndsAt,
  };
}

function mergeBusinessHoursResponse(rows: BusinessHourRowDto[]): BusinessHoursListResponse {
  const byWeekday = new Map<Weekday, BusinessHourRowDto>();
  for (const r of rows) {
    byWeekday.set(r.weekday, r);
  }
  return WEEKDAY_VALUES.map((weekday) => {
    const r = byWeekday.get(weekday);
    if (!r) {
      return { weekday, closed: true as const };
    }
    return {
      id: r.id,
      weekday: r.weekday,
      closed: false as const,
      opensAt: formatUtcTimeAsHm(r.opensAt),
      closesAt: formatUtcTimeAsHm(r.closesAt),
      breakStartsAt: r.breakStartsAt ? formatUtcTimeAsHm(r.breakStartsAt) : null,
      breakEndsAt: r.breakEndsAt ? formatUtcTimeAsHm(r.breakEndsAt) : null,
    };
  });
}

function mapHoliday(row: HolidayRowDto): {
  id: string;
  date: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
} {
  const y = row.date.getUTCFullYear();
  const m = (row.date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = row.date.getUTCDate().toString().padStart(2, "0");
  return {
    id: row.id,
    date: `${String(y)}-${m}-${d}`,
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapAppointmentConflict(row: OverlappingAppointmentRowDto): {
  id: string;
  professionalId: string;
  startAt: string;
  endAt: string;
  clientName: string;
} {
  return {
    id: row.id,
    professionalId: row.professionalId,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    clientName: row.clientName,
  };
}

function mapBlock(row: BlockRowDto): {
  id: string;
  scope: BlockRowDto["scope"];
  professionalId: string | null;
  startsAt: string;
  endsAt: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    scope: row.scope,
    professionalId: row.professionalId,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapProfessionalAvailability(row: ProfessionalAvailabilityRowDto): {
  id: string;
  weekday: Weekday;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    weekday: row.weekday,
    startsAt: formatUtcTimeAsHm(row.startsAt),
    endsAt: formatUtcTimeAsHm(row.endsAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class AvailabilityService {
  constructor(
    private readonly repository: AvailabilityRepository,
    private readonly establishmentsRepository: EstablishmentsRepository,
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  private async assertOwnedNonArchivedEstablishment(userId: string, establishmentId: string): Promise<void> {
    const establishment = await this.establishmentsRepository.findOwnedById(userId, establishmentId);
    if (!establishment || establishment.archivedAt !== null) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }
  }

  async getBusinessHours(userId: string, establishmentId: string): Promise<BusinessHoursListResponse> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const rows = await this.repository.findBusinessHours(establishmentId);
    return mergeBusinessHoursResponse(rows);
  }

  async putBusinessHourForWeekday(
    userId: string,
    establishmentId: string,
    weekday: Weekday,
    body: PutBusinessHourBody,
  ): Promise<BusinessHoursListResponse> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    validatePutBusinessHourBody(body, weekday);
    if (body.closed) {
      await this.repository.deleteBusinessHourByWeekday(establishmentId, weekday);
    } else {
      const row = mapPutBodyToOpenRow(body, weekday);
      await this.repository.upsertBusinessHour(establishmentId, weekday, row);
    }
    const rows = await this.repository.findBusinessHours(establishmentId);
    return mergeBusinessHoursResponse(rows);
  }

  async deleteBusinessHourForWeekday(
    userId: string,
    establishmentId: string,
    weekday: Weekday,
  ): Promise<BusinessHoursListResponse> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    await this.repository.deleteBusinessHourByWeekday(establishmentId, weekday);
    const rows = await this.repository.findBusinessHours(establishmentId);
    return mergeBusinessHoursResponse(rows);
  }

  async listHolidays(userId: string, establishmentId: string): Promise<ReturnType<typeof mapHoliday>[]> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const rows = await this.repository.findHolidays(establishmentId);
    return rows.map(mapHoliday);
  }

  async createHoliday(
    userId: string,
    establishmentId: string,
    body: CreateHolidayBody,
  ): Promise<ReturnType<typeof mapHoliday>> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    try {
      const row = await this.repository.createHoliday(establishmentId, body);
      return mapHoliday(row);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        throw new AppError(422, "HOLIDAY_DATE_DUPLICATE", "A holiday already exists for this date.");
      }
      throw error;
    }
  }

  async deleteHoliday(userId: string, establishmentId: string, holidayId: string): Promise<void> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const deleted = await this.repository.deleteHoliday(establishmentId, holidayId);
    if (!deleted) {
      throw new AppError(404, "NOT_FOUND", "Holiday not found.");
    }
  }

  async listBlocks(userId: string, establishmentId: string): Promise<ReturnType<typeof mapBlock>[]> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const rows = await this.repository.findBlocks(establishmentId);
    return rows.map(mapBlock);
  }

  async createBlock(
    userId: string,
    establishmentId: string,
    body: CreateBlockBody,
  ): Promise<{ block: ReturnType<typeof mapBlock>; conflicts: ReturnType<typeof mapAppointmentConflict>[] }> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);
    if (endsAt <= startsAt) {
      throw new AppError(422, "INVALID_BLOCK_RANGE", "Block end must be after block start.");
    }
    let professionalId: string | null = null;
    if (body.scope === "PROFESSIONAL") {
      if (body.professionalId === undefined || body.professionalId === null) {
        throw new AppError(400, "VALIDATION_ERROR", "professionalId is required when scope is PROFESSIONAL.");
      }
      professionalId = body.professionalId;
      const prof = await this.repository.findProfessionalInEstablishment(establishmentId, professionalId);
      if (!prof) {
        throw new AppError(404, "NOT_FOUND", "Professional not found.");
      }
    }

    const overlapFilter =
      body.scope === "PROFESSIONAL" && professionalId !== null
        ? { type: "PROFESSIONAL" as const, professionalId }
        : { type: "ESTABLISHMENT" as const };

    const conflicts = await this.appointmentsRepository.findConfirmedOverlappingInterval(
      establishmentId,
      { startsAt, endsAt },
      overlapFilter,
    );

    const row = await this.repository.createBlock(establishmentId, {
      scope: body.scope,
      professionalId,
      startsAt,
      endsAt,
      reason: body.reason,
    });

    return {
      block: mapBlock(row),
      conflicts: conflicts.map(mapAppointmentConflict),
    };
  }

  async deleteBlock(userId: string, establishmentId: string, blockId: string): Promise<void> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const deleted = await this.repository.deleteBlock(establishmentId, blockId);
    if (!deleted) {
      throw new AppError(404, "NOT_FOUND", "Block not found.");
    }
  }

  async listProfessionalAvailabilities(
    userId: string,
    establishmentId: string,
    professionalId: string,
  ): Promise<ReturnType<typeof mapProfessionalAvailability>[]> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const prof = await this.repository.findProfessionalInEstablishment(establishmentId, professionalId);
    if (!prof) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
    const rows = await this.repository.findProfessionalAvailabilities(professionalId);
    return rows.map(mapProfessionalAvailability);
  }

  async replaceProfessionalAvailabilities(
    userId: string,
    establishmentId: string,
    professionalId: string,
    body: ReplaceProfessionalAvailabilitiesBody,
  ): Promise<ReturnType<typeof mapProfessionalAvailability>[]> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const prof = await this.repository.findProfessionalInEstablishment(establishmentId, professionalId);
    if (!prof) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
    const windows: ProfessionalAvailabilityWindow[] = body.map((w: ProfessionalAvailabilityInput) => ({
      weekday: w.weekday,
      startsAt: parseTimeHmToUtcDate(w.startsAt),
      endsAt: parseTimeHmToUtcDate(w.endsAt),
    }));
    validateNoOverlapSameWeekday(windows);
    const businessRows = await this.repository.findBusinessHours(establishmentId);
    validateProfessionalWindowsAgainstEstablishment(businessRows, windows);
    const rows = await this.repository.replaceProfessionalAvailabilities(professionalId, windows);
    return rows.map(mapProfessionalAvailability);
  }

  async createProfessionalAvailability(
    userId: string,
    establishmentId: string,
    professionalId: string,
    body: CreateProfessionalAvailabilityBody,
  ): Promise<ReturnType<typeof mapProfessionalAvailability>> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const prof = await this.repository.findProfessionalInEstablishment(establishmentId, professionalId);
    if (!prof) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
    const window: ProfessionalAvailabilityWindow = {
      weekday: body.weekday,
      startsAt: parseTimeHmToUtcDate(body.startsAt),
      endsAt: parseTimeHmToUtcDate(body.endsAt),
    };
    const existing = await this.repository.findProfessionalAvailabilities(professionalId);
    const windows: ProfessionalAvailabilityWindow[] = [
      ...existing.map((r) => ({ weekday: r.weekday, startsAt: r.startsAt, endsAt: r.endsAt })),
      window,
    ];
    validateNoOverlapSameWeekday(windows);
    const businessRows = await this.repository.findBusinessHours(establishmentId);
    validateProfessionalWindowsAgainstEstablishment(businessRows, [window]);
    const row = await this.repository.createProfessionalAvailability(professionalId, window);
    return mapProfessionalAvailability(row);
  }

  async updateProfessionalAvailability(
    userId: string,
    establishmentId: string,
    professionalId: string,
    availabilityId: string,
    body: PatchProfessionalAvailabilityBody,
  ): Promise<ReturnType<typeof mapProfessionalAvailability>> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const prof = await this.repository.findProfessionalInEstablishment(establishmentId, professionalId);
    if (!prof) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
    const existingRow = await this.repository.findProfessionalAvailabilityById(
      establishmentId,
      professionalId,
      availabilityId,
    );
    if (!existingRow) {
      throw new AppError(404, "NOT_FOUND", "Availability not found.");
    }
    const window: ProfessionalAvailabilityWindow = {
      weekday: body.weekday,
      startsAt: parseTimeHmToUtcDate(body.startsAt),
      endsAt: parseTimeHmToUtcDate(body.endsAt),
    };
    const existing = await this.repository.findProfessionalAvailabilities(professionalId);
    const windows: ProfessionalAvailabilityWindow[] = [
      ...existing
        .filter((r) => r.id !== availabilityId)
        .map((r) => ({ weekday: r.weekday, startsAt: r.startsAt, endsAt: r.endsAt })),
      window,
    ];
    validateNoOverlapSameWeekday(windows);
    const businessRows = await this.repository.findBusinessHours(establishmentId);
    validateProfessionalWindowsAgainstEstablishment(businessRows, [window]);
    const row = await this.repository.updateProfessionalAvailability(
      establishmentId,
      professionalId,
      availabilityId,
      window,
    );
    if (!row) {
      throw new AppError(404, "NOT_FOUND", "Availability not found.");
    }
    return mapProfessionalAvailability(row);
  }

  async deleteProfessionalAvailability(
    userId: string,
    establishmentId: string,
    professionalId: string,
    availabilityId: string,
  ): Promise<void> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const prof = await this.repository.findProfessionalInEstablishment(establishmentId, professionalId);
    if (!prof) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
    const deleted = await this.repository.deleteProfessionalAvailability(
      establishmentId,
      professionalId,
      availabilityId,
    );
    if (!deleted) {
      throw new AppError(404, "NOT_FOUND", "Availability not found.");
    }
  }
}
