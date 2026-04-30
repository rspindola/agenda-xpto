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

export class AppointmentsRepository {
  async findConfirmedOverlappingInterval(
    establishmentId: string,
    interval: OverlappingBlockInterval,
    filter: OverlappingAppointmentFilter,
  ): Promise<OverlappingAppointmentRowDto[]> {
    const professionalWhere =
      filter.type === "PROFESSIONAL" ? { professionalId: filter.professionalId } : {};

    const rows = await prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "CONFIRMED",
        ...professionalWhere,
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

      // TODO: enqueue notification via module 07 (cancellation emails per appointment)

      return { cancelledIds: appointmentIds };
    });
  }
}
