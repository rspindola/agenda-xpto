import { randomUUID } from "node:crypto";

import type { Weekday } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";

import { incrementStarterMonthlyCountIfEligible } from "~/modules/plans/subscription.repository.js";
import { AppError } from "~/shared/errors/AppError.js";

export type PublicEstablishmentRow = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  timezone: string;
  minAdvanceMinutes: number;
};

export type PublicServiceRow = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  catalogCombo: boolean;
};

export type PublicProfessionalRow = {
  id: string;
  name: string;
};

export type BusinessHourBookingRow = {
  weekday: Weekday;
  opensAt: Date;
  closesAt: Date;
  breakStartsAt: Date | null;
  breakEndsAt: Date | null;
};

export type BlockBookingRow = {
  scope: "ESTABLISHMENT" | "PROFESSIONAL";
  professionalId: string | null;
  startsAt: Date;
  endsAt: Date;
};

export type ConfirmedAppointmentIntervalRow = {
  id: string;
  professionalId: string;
  startAt: Date;
  endAt: Date;
};

export type ProfessionalAvailabilityBookingRow = {
  professionalId: string;
  weekday: Weekday;
  startsAt: Date;
  endsAt: Date;
};

export type CreatePublicAppointmentLineInput = {
  serviceId: string;
  snapshotName: string;
  snapshotDurationMinutes: number;
  snapshotPriceCents: number;
  sortOrder: number;
};

export type CreatePublicAppointmentResult = {
  appointmentId: string;
  establishmentId: string;
  professionalId: string;
  startAt: Date;
  endAt: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  cancelToken: string;
};

export type CancelAppointmentResult = {
  appointmentId: string;
  establishmentName: string;
  startAt: Date;
  endAt: Date;
  clientName: string;
};

export class BookingRepository {
  async findEstablishmentBySlug(slug: string): Promise<PublicEstablishmentRow | null> {
    const row = await prisma.establishment.findFirst({
      where: {
        slug,
        deletedAt: null,
        archivedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
        phone: true,
        address: true,
        timezone: true,
        minAdvanceMinutes: true,
      },
    });
    return row;
  }

  async findEstablishmentByIdForOwner(
    establishmentId: string,
    ownerUserId: string,
  ): Promise<PublicEstablishmentRow | null> {
    const row = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        userId: ownerUserId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
        phone: true,
        address: true,
        timezone: true,
        minAdvanceMinutes: true,
      },
    });
    return row;
  }

  async findPublicServices(establishmentId: string): Promise<PublicServiceRow[]> {
    const rows = await prisma.service.findMany({
      where: { establishmentId, deletedAt: null },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        priceCents: true,
        catalogCombo: true,
      },
      orderBy: { name: "asc" },
    });
    return rows;
  }

  async findPublicProfessionals(establishmentId: string): Promise<PublicProfessionalRow[]> {
    const rows = await prisma.professional.findMany({
      where: { establishmentId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return rows;
  }

  async findServicesByIds(establishmentId: string, serviceIds: string[]): Promise<PublicServiceRow[]> {
    if (serviceIds.length === 0) {
      return [];
    }
    const rows = await prisma.service.findMany({
      where: { establishmentId, deletedAt: null, id: { in: serviceIds } },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        priceCents: true,
        catalogCombo: true,
      },
    });
    return rows;
  }

  async findProfessionalIdsOfferingAllServices(
    establishmentId: string,
    serviceIds: string[],
  ): Promise<string[]> {
    if (serviceIds.length === 0) {
      return [];
    }
    const professionals = await prisma.professional.findMany({
      where: {
        establishmentId,
        deletedAt: null,
        AND: serviceIds.map((serviceId) => ({
          professionalServices: { some: { serviceId } },
        })),
      },
      select: { id: true },
    });
    return professionals.map((p) => p.id);
  }

  async findProfessionalInEstablishment(
    establishmentId: string,
    professionalId: string,
  ): Promise<{ id: string } | null> {
    return prisma.professional.findFirst({
      where: { id: professionalId, establishmentId, deletedAt: null },
      select: { id: true },
    });
  }

  async findBusinessHours(establishmentId: string): Promise<BusinessHourBookingRow[]> {
    const rows = await prisma.establishmentBusinessHour.findMany({
      where: { establishmentId },
      orderBy: { weekday: "asc" },
    });
    return rows.map((r) => ({
      weekday: r.weekday,
      opensAt: r.opensAt,
      closesAt: r.closesAt,
      breakStartsAt: r.breakStartsAt,
      breakEndsAt: r.breakEndsAt,
    }));
  }

  async findHolidayOnDate(establishmentId: string, holidayDateUtcNoon: Date): Promise<boolean> {
    const row = await prisma.establishmentHoliday.findFirst({
      where: { establishmentId, date: holidayDateUtcNoon },
      select: { id: true },
    });
    return row !== null;
  }

  async findBlocksOverlapping(
    establishmentId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<BlockBookingRow[]> {
    const rows = await prisma.block.findMany({
      where: {
        establishmentId,
        startsAt: { lt: rangeEnd },
        endsAt: { gt: rangeStart },
      },
      select: {
        scope: true,
        professionalId: true,
        startsAt: true,
        endsAt: true,
      },
    });
    return rows;
  }

  async findConfirmedAppointmentsInRange(
    establishmentId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<ConfirmedAppointmentIntervalRow[]> {
    const rows = await prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "CONFIRMED",
        startAt: { lt: rangeEnd },
        endAt: { gt: rangeStart },
      },
      select: {
        id: true,
        professionalId: true,
        startAt: true,
        endAt: true,
      },
      orderBy: { startAt: "asc" },
    });
    return rows;
  }

  async findAvailabilitiesForProfessionalsOnWeekday(
    professionalIds: string[],
    weekday: Weekday,
  ): Promise<ProfessionalAvailabilityBookingRow[]> {
    if (professionalIds.length === 0) {
      return [];
    }
    const rows = await prisma.professionalAvailability.findMany({
      where: { professionalId: { in: professionalIds }, weekday },
      select: {
        professionalId: true,
        weekday: true,
        startsAt: true,
        endsAt: true,
      },
      orderBy: [{ professionalId: "asc" }, { startsAt: "asc" }],
    });
    return rows;
  }

  async createPublicAppointment(input: {
    establishmentId: string;
    ownerUserId: string;
    professionalId: string;
    startAt: Date;
    endAt: Date;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    lines: CreatePublicAppointmentLineInput[];
  }): Promise<CreatePublicAppointmentResult> {
    const cancelToken = randomUUID();

    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM subscriptions WHERE user_id = ${input.ownerUserId} FOR UPDATE`;

      const sub = await tx.subscription.findUnique({
        where: { userId: input.ownerUserId },
        select: { planType: true, status: true, starterMonthlyAppointmentsCount: true },
      });

      if (
        sub !== null &&
        sub.planType === "STARTER" &&
        sub.status === "ACTIVE" &&
        sub.starterMonthlyAppointmentsCount >= 100
      ) {
        throw new AppError(
          422,
          "STARTER_QUOTA_EXCEEDED",
          "The monthly appointment limit for this establishment has been reached.",
        );
      }

      await tx.$executeRaw`SELECT id FROM professionals WHERE id = ${input.professionalId} FOR UPDATE`;

      const overlapping = await tx.appointment.findMany({
        where: {
          establishmentId: input.establishmentId,
          professionalId: input.professionalId,
          status: "CONFIRMED",
          startAt: { lt: input.endAt },
          endAt: { gt: input.startAt },
        },
        select: { id: true },
        take: 1,
      });

      if (overlapping.length > 0) {
        throw new AppError(409, "SLOT_NOT_AVAILABLE", "The selected time slot is no longer available.");
      }

      const appointment = await tx.appointment.create({
        data: {
          establishmentId: input.establishmentId,
          professionalId: input.professionalId,
          status: "CONFIRMED",
          startAt: input.startAt,
          endAt: input.endAt,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          cancelToken,
          appointmentServices: {
            create: input.lines.map((line) => ({
              serviceId: line.serviceId,
              snapshotName: line.snapshotName,
              snapshotDurationMinutes: line.snapshotDurationMinutes,
              snapshotPriceCents: line.snapshotPriceCents,
              sortOrder: line.sortOrder,
            })),
          },
        },
        select: {
          id: true,
          establishmentId: true,
          professionalId: true,
          startAt: true,
          endAt: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          cancelToken: true,
        },
      });

      await incrementStarterMonthlyCountIfEligible(tx, input.ownerUserId);

      return {
        appointmentId: appointment.id,
        establishmentId: appointment.establishmentId,
        professionalId: appointment.professionalId,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        clientPhone: appointment.clientPhone,
        cancelToken: appointment.cancelToken,
      };
    });
  }

  async createManualDashboardAppointment(input: {
    establishmentId: string;
    createdByUserId: string;
    professionalId: string;
    startAt: Date;
    endAt: Date;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    lines: CreatePublicAppointmentLineInput[];
  }): Promise<{
    appointmentId: string;
    professionalId: string;
    startAt: Date;
    endAt: Date;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
  }> {
    const cancelToken = randomUUID();

    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM professionals WHERE id = ${input.professionalId} FOR UPDATE`;

      const overlapping = await tx.appointment.findMany({
        where: {
          establishmentId: input.establishmentId,
          professionalId: input.professionalId,
          status: "CONFIRMED",
          startAt: { lt: input.endAt },
          endAt: { gt: input.startAt },
        },
        select: { id: true },
        take: 1,
      });

      if (overlapping.length > 0) {
        throw new AppError(409, "SLOT_NOT_AVAILABLE", "The selected time slot is no longer available.");
      }

      const appointment = await tx.appointment.create({
        data: {
          establishmentId: input.establishmentId,
          professionalId: input.professionalId,
          status: "CONFIRMED",
          startAt: input.startAt,
          endAt: input.endAt,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          cancelToken,
          createdByUserId: input.createdByUserId,
          appointmentServices: {
            create: input.lines.map((line) => ({
              serviceId: line.serviceId,
              snapshotName: line.snapshotName,
              snapshotDurationMinutes: line.snapshotDurationMinutes,
              snapshotPriceCents: line.snapshotPriceCents,
              sortOrder: line.sortOrder,
            })),
          },
        },
        select: {
          id: true,
          professionalId: true,
          startAt: true,
          endAt: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
        },
      });

      return {
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        clientPhone: appointment.clientPhone,
      };
    });
  }

  async cancelAppointmentByToken(cancelToken: string): Promise<CancelAppointmentResult> {
    return prisma.$transaction(async (tx) => {
      const row = await tx.appointment.findUnique({
        where: { cancelToken },
        select: {
          id: true,
          status: true,
          cancelTokenUsedAt: true,
          startAt: true,
          endAt: true,
          clientName: true,
          establishment: { select: { name: true } },
        },
      });

      if (!row) {
        throw new AppError(404, "NOT_FOUND", "Resource not found.");
      }

      if (row.cancelTokenUsedAt !== null) {
        throw new AppError(422, "INVALID_CANCEL_TOKEN", "This cancellation link is no longer valid.");
      }

      if (row.status !== "CONFIRMED") {
        throw new AppError(422, "APPOINTMENT_NOT_CANCELLABLE", "This appointment cannot be cancelled.");
      }

      const now = new Date();
      await tx.appointment.update({
        where: { id: row.id },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          cancelledBy: "CLIENT",
          cancelTokenUsedAt: now,
        },
      });

      return {
        appointmentId: row.id,
        establishmentName: row.establishment.name,
        startAt: row.startAt,
        endAt: row.endAt,
        clientName: row.clientName,
      };
    });
  }

  async findProfessionalServicePrices(
    professionalId: string,
    serviceIds: string[],
  ): Promise<Map<string, { priceCents: number }>> {
    const rows = await prisma.professionalService.findMany({
      where: { professionalId, serviceId: { in: serviceIds } },
      select: { serviceId: true, priceOverrideCents: true, service: { select: { priceCents: true } } },
    });
    const map = new Map<string, { priceCents: number }>();
    for (const r of rows) {
      const priceCents = r.priceOverrideCents ?? r.service.priceCents;
      map.set(r.serviceId, { priceCents });
    }
    return map;
  }
}
