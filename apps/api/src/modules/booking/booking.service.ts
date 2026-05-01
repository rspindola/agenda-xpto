import { DateTime } from "luxon";

import { findSubscriptionQuotaByEstablishmentId } from "~/modules/plans/subscription.repository.js";
import { AppError } from "~/shared/errors/AppError.js";
import { minutesSinceMidnightUtc } from "~/shared/utils/time-of-day.js";

import type {
  BookingRepository,
  ConfirmedAppointmentIntervalRow,
  CreatePublicAppointmentLineInput,
  PublicEstablishmentRow,
  PublicProfessionalRow,
  PublicServiceRow,
} from "./booking.repository.js";
import type { CreatePublicAppointmentBody as CreatePublicAppointmentBodyInput } from "./booking.schema.js";
import {
  enumerateSlotsInFreeIntervals,
  establishmentOpenMinuteSegments,
  intersectMinuteSegments,
  luxonDateToPrismaWeekday,
  mergeOverlappingMinuteSegments,
  minuteSegmentsToLuxonIntervals,
  subtractLuxonIntervals,
  type MinuteSegment,
} from "./slot-engine.js";

const SLOT_STEP_MINUTES = 15;

function toHolidayProbeDateUtc(localDay: DateTime): Date {
  const ymd = localDay.toFormat("yyyy-MM-dd");
  return new Date(`${ymd}T12:00:00.000Z`);
}

function dateToLuxonUtc(d: Date): DateTime {
  return DateTime.fromJSDate(d, { zone: "utc" });
}

function parseLocalDateInZone(date: string, timeZone: string): DateTime {
  const dt = DateTime.fromISO(`${date}T00:00:00`, { zone: timeZone });
  if (!dt.isValid) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid date format; expected YYYY-MM-DD.");
  }
  return dt;
}

function professionalWindowsToMinuteSegments(rows: { startsAt: Date; endsAt: Date }[]): MinuteSegment[] {
  const raw: MinuteSegment[] = [];
  for (const w of rows) {
    const s0 = minutesSinceMidnightUtc(w.startsAt);
    const s1 = minutesSinceMidnightUtc(w.endsAt);
    if (s1 > s0) {
      raw.push({ start: s0, end: s1 });
    }
  }
  return mergeOverlappingMinuteSegments(raw);
}

function blocksToUtcIntervals(
  rows: Array<{ scope: "ESTABLISHMENT" | "PROFESSIONAL"; professionalId: string | null; startsAt: Date; endsAt: Date }>,
  professionalId: string,
): Array<{ start: DateTime; end: DateTime }> {
  return rows
    .filter((b) => {
      if (b.scope === "ESTABLISHMENT") {
        return true;
      }
      return b.professionalId === professionalId;
    })
    .map((b) => ({
      start: dateToLuxonUtc(b.startsAt),
      end: dateToLuxonUtc(b.endsAt),
    }));
}

function appointmentsToUtcIntervals(
  rows: ConfirmedAppointmentIntervalRow[],
  professionalId: string,
): Array<{ start: DateTime; end: DateTime }> {
  return rows
    .filter((a) => a.professionalId === professionalId)
    .map((a) => ({
      start: dateToLuxonUtc(a.startAt),
      end: dateToLuxonUtc(a.endAt),
    }));
}

export type PublicEstablishmentPayload = {
  establishment: {
    name: string;
    slug: string;
    phone: string | null;
    address: string | null;
    timezone: string;
    minAdvanceMinutes: number;
  };
  services: PublicServiceRow[];
  professionals: PublicProfessionalRow[];
};

export type AvailableSlotDto = {
  startAt: string;
  endAt: string;
  professionalId: string;
};

export type CreatedPublicAppointmentDto = {
  id: string;
  professionalId: string;
  startAt: string;
  endAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  cancelToken: string;
};

export type CancelledPublicAppointmentDto = {
  appointmentId: string;
  establishmentName: string;
  startAt: string;
  endAt: string;
  clientName: string;
};

export type CreatedDashboardManualAppointmentDto = {
  id: string;
  professionalId: string;
  startAt: string;
  endAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
};

export class BookingService {
  constructor(private readonly repository: BookingRepository) {}

  async getEstablishmentBySlug(slug: string): Promise<PublicEstablishmentPayload> {
    const row = await this.repository.findEstablishmentBySlug(slug);
    if (!row) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }
    const [services, professionals] = await Promise.all([
      this.repository.findPublicServices(row.id),
      this.repository.findPublicProfessionals(row.id),
    ]);
    return {
      establishment: {
        name: row.name,
        slug: row.slug,
        phone: row.phone,
        address: row.address,
        timezone: row.timezone,
        minAdvanceMinutes: row.minAdvanceMinutes,
      },
      services,
      professionals,
    };
  }

  async getAvailableSlots(
    slug: string,
    input: { date: string; serviceIds: string[]; professionalId?: string },
    now: Date,
  ): Promise<AvailableSlotDto[]> {
    const establishment = await this.repository.findEstablishmentBySlug(slug);
    if (!establishment) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }

    const services = await this.repository.findServicesByIds(establishment.id, input.serviceIds);
    if (services.length !== input.serviceIds.length) {
      throw new AppError(400, "VALIDATION_ERROR", "One or more services are invalid for this establishment.");
    }

    const totalDurationMinutes = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    if (totalDurationMinutes <= 0) {
      throw new AppError(400, "VALIDATION_ERROR", "Total duration must be positive.");
    }

    const eligibleIds = await this.repository.findProfessionalIdsOfferingAllServices(
      establishment.id,
      input.serviceIds,
    );

    let professionalIds = eligibleIds;
    if (input.professionalId !== undefined) {
      const prof = await this.repository.findProfessionalInEstablishment(establishment.id, input.professionalId);
      if (!prof) {
        throw new AppError(400, "VALIDATION_ERROR", "Professional not found for this establishment.");
      }
      if (!eligibleIds.includes(input.professionalId)) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "The selected professional cannot perform all selected services.",
        );
      }
      professionalIds = [input.professionalId];
    }

    const dayStart = parseLocalDateInZone(input.date, establishment.timezone);
    const weekday = luxonDateToPrismaWeekday(dayStart);
    const businessRows = await this.repository.findBusinessHours(establishment.id);
    const businessRow = businessRows.find((r) => r.weekday === weekday);

    const estSegs = establishmentOpenMinuteSegments(businessRow);
    if (estSegs.length === 0) {
      return [];
    }

    const hasHoliday = await this.repository.findHolidayOnDate(establishment.id, toHolidayProbeDateUtc(dayStart));
    if (hasHoliday) {
      return [];
    }

    const rangeStartJs = dayStart.toUTC().toJSDate();
    const rangeEndJs = dayStart.plus({ days: 1 }).toUTC().toJSDate();

    const [blocks, appts] = await Promise.all([
      this.repository.findBlocksOverlapping(establishment.id, rangeStartJs, rangeEndJs),
      this.repository.findConfirmedAppointmentsInRange(establishment.id, rangeStartJs, rangeEndJs),
    ]);

    const avails =
      professionalIds.length > 0
        ? await this.repository.findAvailabilitiesForProfessionalsOnWeekday(professionalIds, weekday)
        : [];

    const earliestStartUtc = dateToLuxonUtc(now).plus({ minutes: establishment.minAdvanceMinutes });

    const out: AvailableSlotDto[] = [];

    for (const professionalId of professionalIds) {
      const profAvailRows = avails.filter((a) => a.professionalId === professionalId);
      const profSegs = professionalWindowsToMinuteSegments(profAvailRows);
      const baseMin = intersectMinuteSegments(estSegs, profSegs);
      const freeLocal = minuteSegmentsToLuxonIntervals(dayStart, baseMin);
      const freeUtc = freeLocal.map((iv) => ({
        start: iv.start.toUTC(),
        end: iv.end.toUTC(),
      }));

      const cuts = [
        ...blocksToUtcIntervals(blocks, professionalId),
        ...appointmentsToUtcIntervals(appts, professionalId),
      ];

      const freeAfterCuts = subtractLuxonIntervals(freeUtc, cuts);
      const slots = enumerateSlotsInFreeIntervals(
        freeAfterCuts,
        totalDurationMinutes,
        SLOT_STEP_MINUTES,
        earliestStartUtc,
      );

      for (const s of slots) {
        out.push({
          startAt: s.startAt.toISO() ?? "",
          endAt: s.endAt.toISO() ?? "",
          professionalId,
        });
      }
    }

    out.sort((a, b) => {
      const c = a.startAt.localeCompare(b.startAt);
      return c !== 0 ? c : a.professionalId.localeCompare(b.professionalId);
    });

    return out;
  }

  private async resolvePublicAppointmentCreationContext(
    establishment: PublicEstablishmentRow,
    body: CreatePublicAppointmentBodyInput,
    now: Date,
  ): Promise<{
    startAtJs: Date;
    endAtJs: Date;
    lines: CreatePublicAppointmentLineInput[];
  }> {
    const services = await this.repository.findServicesByIds(establishment.id, body.serviceIds);
    if (services.length !== body.serviceIds.length) {
      throw new AppError(400, "VALIDATION_ERROR", "One or more services are invalid for this establishment.");
    }

    const eligibleIds = await this.repository.findProfessionalIdsOfferingAllServices(
      establishment.id,
      body.serviceIds,
    );
    if (!eligibleIds.includes(body.professionalId)) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "The selected professional cannot perform all selected services.",
      );
    }

    const prof = await this.repository.findProfessionalInEstablishment(establishment.id, body.professionalId);
    if (!prof) {
      throw new AppError(400, "VALIDATION_ERROR", "Professional not found for this establishment.");
    }

    const startAtJs = new Date(body.startAt);
    if (Number.isNaN(startAtJs.getTime())) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid startAt datetime.");
    }

    const earliest = dateToLuxonUtc(now).plus({ minutes: establishment.minAdvanceMinutes });
    if (dateToLuxonUtc(startAtJs) < earliest) {
      throw new AppError(422, "BOOKING_MIN_ADVANCE_VIOLATION", "The selected start time violates minimum advance rules.");
    }

    const totalDurationMinutes = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    const endAtJs = new Date(startAtJs.getTime() + totalDurationMinutes * 60 * 1000);

    const priceMap = await this.repository.findProfessionalServicePrices(body.professionalId, body.serviceIds);
    const lines: CreatePublicAppointmentLineInput[] = body.serviceIds.map((serviceId: string, index: number) => {
      const svc = services.find((s) => s.id === serviceId);
      if (!svc) {
        throw new AppError(400, "VALIDATION_ERROR", "Invalid service in selection.");
      }
      const priced = priceMap.get(serviceId);
      if (priced === undefined) {
        throw new AppError(400, "VALIDATION_ERROR", "Professional is not linked to one of the selected services.");
      }
      return {
        serviceId,
        snapshotName: svc.name,
        snapshotDurationMinutes: svc.durationMinutes,
        snapshotPriceCents: priced.priceCents,
        sortOrder: index,
      };
    });

    return { startAtJs, endAtJs, lines };
  }

  async createAppointment(
    slug: string,
    body: CreatePublicAppointmentBodyInput,
    now: Date,
  ): Promise<CreatedPublicAppointmentDto> {
    const establishment = await this.repository.findEstablishmentBySlug(slug);
    if (!establishment) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }

    const { startAtJs, endAtJs, lines } = await this.resolvePublicAppointmentCreationContext(establishment, body, now);

    const quota = await findSubscriptionQuotaByEstablishmentId(establishment.id);
    if (
      quota !== null &&
      quota.planType === "STARTER" &&
      quota.status === "ACTIVE" &&
      quota.starterMonthlyAppointmentsCount >= 100
    ) {
      throw new AppError(
        422,
        "STARTER_QUOTA_EXCEEDED",
        "The monthly appointment limit for this establishment has been reached.",
      );
    }

    const created = await this.repository.createPublicAppointment({
      establishmentId: establishment.id,
      ownerUserId: establishment.userId,
      professionalId: body.professionalId,
      startAt: startAtJs,
      endAt: endAtJs,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      lines,
    });

    return {
      id: created.appointmentId,
      professionalId: created.professionalId,
      startAt: created.startAt.toISOString(),
      endAt: created.endAt.toISOString(),
      clientName: created.clientName,
      clientEmail: created.clientEmail,
      clientPhone: created.clientPhone,
      cancelToken: created.cancelToken,
    };
  }

  async createManualDashboardAppointment(
    userId: string,
    establishmentId: string,
    body: CreatePublicAppointmentBodyInput,
    now: Date,
  ): Promise<CreatedDashboardManualAppointmentDto> {
    const establishment = await this.repository.findEstablishmentByIdForOwner(establishmentId, userId);
    if (!establishment) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }

    const { startAtJs, endAtJs, lines } = await this.resolvePublicAppointmentCreationContext(establishment, body, now);

    const created = await this.repository.createManualDashboardAppointment({
      establishmentId: establishment.id,
      createdByUserId: userId,
      professionalId: body.professionalId,
      startAt: startAtJs,
      endAt: endAtJs,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      lines,
    });

    return {
      id: created.appointmentId,
      professionalId: created.professionalId,
      startAt: created.startAt.toISOString(),
      endAt: created.endAt.toISOString(),
      clientName: created.clientName,
      clientEmail: created.clientEmail,
      clientPhone: created.clientPhone,
    };
  }

  assertStartAtMeetsMinAdvance(minAdvanceMinutes: number, startAtJs: Date, now: Date): void {
    const earliest = dateToLuxonUtc(now).plus({ minutes: minAdvanceMinutes });
    if (dateToLuxonUtc(startAtJs) < earliest) {
      throw new AppError(422, "BOOKING_MIN_ADVANCE_VIOLATION", "The selected start time violates minimum advance rules.");
    }
  }

  async cancelAppointment(cancelToken: string): Promise<CancelledPublicAppointmentDto> {
    const row = await this.repository.cancelAppointmentByToken(cancelToken);
    return {
      appointmentId: row.appointmentId,
      establishmentName: row.establishmentName,
      startAt: row.startAt.toISOString(),
      endAt: row.endAt.toISOString(),
      clientName: row.clientName,
    };
  }
}
