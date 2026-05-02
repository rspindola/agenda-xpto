import type { AppointmentStatus, Prisma } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";
import { AppError } from "~/shared/errors/AppError.js";

export type OverlappingAppointmentRowDto = {
  id: string;
  professionalId: string;
  startAt: Date;
  endAt: Date;
  clientName: string;
};

export type OverlappingBlockInterval = {
  startsAt: Date;
  endsAt: Date;
};

export type OverlappingAppointmentFilter =
  | { type: "ESTABLISHMENT" }
  | { type: "PROFESSIONAL"; professionalId: string };

export type AppointmentServiceSummaryDto = {
  serviceId: string | null;
  snapshotName: string;
};

export type AppointmentListRowDto = {
  id: string;
  establishmentId: string;
  professionalId: string;
  status: AppointmentStatus;
  startAt: Date;
  endAt: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  createdAt: Date;
  updatedAt: Date;
  services: AppointmentServiceSummaryDto[];
};

export type AppointmentDetailDto = {
  id: string;
  establishmentId: string;
  professionalId: string;
  status: AppointmentStatus;
  startAt: Date;
  endAt: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  cancelledAt: Date | null;
  cancelledBy: "CLIENT" | "OWNER" | "SYSTEM" | null;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  services: Array<{
    id: string;
    serviceId: string | null;
    snapshotName: string;
    snapshotDurationMinutes: number;
    snapshotPriceCents: number;
    sortOrder: number;
  }>;
};

export type AppointmentForRescheduleDto = {
  id: string;
  establishmentId: string;
  professionalId: string;
  status: AppointmentStatus;
  snapshotDurationSumMinutes: number;
  serviceIdsOrdered: string[];
};

export type ListAppointmentsFilter = {
  establishmentId: string;
  statusIn?: AppointmentStatus[];
  professionalId?: string;
  rangeStartUtcInclusive?: Date;
  rangeEndUtcExclusive?: Date;
  page: number;
  pageSize: number;
};

export class AppointmentsRepository {
  async findConfirmedOverlappingInterval(
    establishmentId: string,
    interval: OverlappingBlockInterval,
    filter: OverlappingAppointmentFilter,
    excludeAppointmentId?: string,
  ): Promise<OverlappingAppointmentRowDto[]> {
    const professionalWhere =
      filter.type === "PROFESSIONAL" ? { professionalId: filter.professionalId } : {};

    const excludeWhere =
      excludeAppointmentId !== undefined ? { id: { not: excludeAppointmentId } } : {};

    const rows = await prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "CONFIRMED",
        ...professionalWhere,
        ...excludeWhere,
        startAt: { lt: interval.endsAt },
        endAt: { gt: interval.startsAt },
      },
      select: {
        id: true,
        professionalId: true,
        startAt: true,
        endAt: true,
        clientName: true,
      },
      orderBy: { startAt: "asc" },
    });

    return rows.map((r) => ({
      id: r.id,
      professionalId: r.professionalId,
      startAt: r.startAt,
      endAt: r.endAt,
      clientName: r.clientName,
    }));
  }

  async listForEstablishment(filter: ListAppointmentsFilter): Promise<{ rows: AppointmentListRowDto[]; total: number }> {
    const where: Prisma.AppointmentWhereInput = {
      establishmentId: filter.establishmentId,
    };

    if (filter.statusIn !== undefined && filter.statusIn.length > 0) {
      where.status = { in: filter.statusIn };
    }

    if (filter.professionalId !== undefined) {
      where.professionalId = filter.professionalId;
    }

    if (filter.rangeStartUtcInclusive !== undefined && filter.rangeEndUtcExclusive !== undefined) {
      where.startAt = {
        gte: filter.rangeStartUtcInclusive,
        lt: filter.rangeEndUtcExclusive,
      };
    } else if (filter.rangeStartUtcInclusive !== undefined) {
      where.startAt = { gte: filter.rangeStartUtcInclusive };
    } else if (filter.rangeEndUtcExclusive !== undefined) {
      where.startAt = { lt: filter.rangeEndUtcExclusive };
    }

    const skip = (filter.page - 1) * filter.pageSize;

    const [rows, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        select: {
          id: true,
          establishmentId: true,
          professionalId: true,
          status: true,
          startAt: true,
          endAt: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          createdAt: true,
          updatedAt: true,
          appointmentServices: {
            orderBy: { sortOrder: "asc" },
            select: {
              serviceId: true,
              snapshotName: true,
            },
          },
        },
        orderBy: { startAt: "desc" },
        skip,
        take: filter.pageSize,
      }),
      prisma.appointment.count({ where }),
    ]);

    const mapped: AppointmentListRowDto[] = rows.map((r) => ({
      id: r.id,
      establishmentId: r.establishmentId,
      professionalId: r.professionalId,
      status: r.status,
      startAt: r.startAt,
      endAt: r.endAt,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      clientPhone: r.clientPhone,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      services: r.appointmentServices.map((s) => ({
        serviceId: s.serviceId,
        snapshotName: s.snapshotName,
      })),
    }));

    return { rows: mapped, total };
  }

  async findByIdForEstablishment(
    establishmentId: string,
    appointmentId: string,
  ): Promise<AppointmentDetailDto | null> {
    const row = await prisma.appointment.findFirst({
      where: { id: appointmentId, establishmentId },
      select: {
        id: true,
        establishmentId: true,
        professionalId: true,
        status: true,
        startAt: true,
        endAt: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        cancelledAt: true,
        cancelledBy: true,
        createdByUserId: true,
        createdAt: true,
        updatedAt: true,
        appointmentServices: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            serviceId: true,
            snapshotName: true,
            snapshotDurationMinutes: true,
            snapshotPriceCents: true,
            sortOrder: true,
          },
        },
      },
    });

    if (row === null) {
      return null;
    }

    return {
      id: row.id,
      establishmentId: row.establishmentId,
      professionalId: row.professionalId,
      status: row.status,
      startAt: row.startAt,
      endAt: row.endAt,
      clientName: row.clientName,
      clientEmail: row.clientEmail,
      clientPhone: row.clientPhone,
      cancelledAt: row.cancelledAt,
      cancelledBy: row.cancelledBy,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      services: row.appointmentServices.map((s) => ({
        id: s.id,
        serviceId: s.serviceId,
        snapshotName: s.snapshotName,
        snapshotDurationMinutes: s.snapshotDurationMinutes,
        snapshotPriceCents: s.snapshotPriceCents,
        sortOrder: s.sortOrder,
      })),
    };
  }

  async findForReschedule(
    establishmentId: string,
    appointmentId: string,
  ): Promise<AppointmentForRescheduleDto | null> {
    const row = await prisma.appointment.findFirst({
      where: { id: appointmentId, establishmentId },
      select: {
        id: true,
        establishmentId: true,
        professionalId: true,
        status: true,
        appointmentServices: {
          orderBy: { sortOrder: "asc" },
          select: { serviceId: true, snapshotDurationMinutes: true },
        },
      },
    });

    if (row === null) {
      return null;
    }

    const snapshotDurationSumMinutes = row.appointmentServices.reduce((acc, s) => acc + s.snapshotDurationMinutes, 0);
    const serviceIdsOrdered = row.appointmentServices
      .map((s) => s.serviceId)
      .filter((id): id is string => id !== null);

    return {
      id: row.id,
      establishmentId: row.establishmentId,
      professionalId: row.professionalId,
      status: row.status,
      snapshotDurationSumMinutes,
      serviceIdsOrdered,
    };
  }

  async rescheduleConfirmedInTransaction(input: {
    establishmentId: string;
    appointmentId: string;
    professionalId: string;
    newStartAt: Date;
    newEndAt: Date;
  }): Promise<{ id: string; startAt: Date; endAt: Date }> {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM professionals WHERE id = ${input.professionalId} FOR UPDATE`;

      const overlapping = await tx.appointment.findMany({
        where: {
          establishmentId: input.establishmentId,
          professionalId: input.professionalId,
          status: "CONFIRMED",
          id: { not: input.appointmentId },
          startAt: { lt: input.newEndAt },
          endAt: { gt: input.newStartAt },
        },
        select: { id: true },
        take: 1,
      });

      if (overlapping.length > 0) {
        throw new AppError(409, "SLOT_NOT_AVAILABLE", "The selected time slot is no longer available.");
      }

      const updated = await tx.appointment.update({
        where: { id: input.appointmentId, establishmentId: input.establishmentId },
        data: {
          startAt: input.newStartAt,
          endAt: input.newEndAt,
        },
        select: { id: true, startAt: true, endAt: true },
      });

      return { id: updated.id, startAt: updated.startAt, endAt: updated.endAt };
    });
  }

  async cancelConfirmedByOwner(
    establishmentId: string,
    appointmentId: string,
  ): Promise<{ id: string; status: "CANCELLED" }> {
    const row = await prisma.appointment.findFirst({
      where: { id: appointmentId, establishmentId },
      select: { id: true, status: true },
    });

    if (row === null) {
      throw new AppError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
    }

    if (row.status !== "CONFIRMED") {
      throw new AppError(422, "APPOINTMENT_NOT_CANCELLABLE", "Only confirmed appointments can be cancelled.");
    }

    const now = new Date();
    await prisma.appointment.update({
      where: { id: row.id },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        cancelledBy: "OWNER",
      },
    });

    return { id: row.id, status: "CANCELLED" };
  }

  async markConfirmedStatus<S extends "COMPLETED" | "NO_SHOW">(
    establishmentId: string,
    appointmentId: string,
    nextStatus: S,
  ): Promise<{ id: string; status: S }> {
    const row = await prisma.appointment.findFirst({
      where: { id: appointmentId, establishmentId },
      select: { id: true, status: true, startAt: true },
    });

    if (row === null) {
      throw new AppError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
    }

    if (row.status !== "CONFIRMED") {
      throw new AppError(422, "APPOINTMENT_INVALID_STATUS", "Only confirmed appointments can be updated to this status.");
    }

    const now = new Date();
    if (row.startAt > now) {
      throw new AppError(422, "APPOINTMENT_NOT_YET_STARTED", "Cannot mark a future appointment as completed or no-show.");
    }

    await prisma.appointment.update({
      where: { id: row.id },
      data: { status: nextStatus },
    });

    return { id: row.id, status: nextStatus };
  }

  async bulkCancelConfirmedInTransaction(
    establishmentId: string,
    appointmentIds: string[],
  ): Promise<{ cancelledIds: string[] }> {
    return prisma.$transaction(async (tx) => {
      const rows = await tx.appointment.findMany({
        where: { establishmentId, id: { in: appointmentIds } },
        select: { id: true, status: true },
      });

      if (rows.length !== appointmentIds.length) {
        throw new AppError(
          422,
          "APPOINTMENT_IDS_INVALID",
          "One or more appointments were not found for this establishment.",
        );
      }

      const notConfirmed = rows.filter((r) => r.status !== "CONFIRMED");
      if (notConfirmed.length > 0) {
        throw new AppError(
          422,
          "APPOINTMENT_NOT_CANCELLABLE",
          "Only confirmed appointments can be cancelled in bulk.",
        );
      }

      const now = new Date();
      await tx.appointment.updateMany({
        where: {
          establishmentId,
          id: { in: appointmentIds },
          status: "CONFIRMED",
        },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          cancelledBy: "OWNER",
        },
      });

      return { cancelledIds: appointmentIds };
    });
  }
}
