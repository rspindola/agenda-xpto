import { prisma } from "~/lib/prisma.js";
import type {
  AppointmentByProfessional,
  AppointmentByService,
  AppointmentForReturnRate,
  CancellationReasonData,
  CancellationRecord,
  CompletedAppointment,
} from "~/modules/reports/reports.schema.js";

export class ReportsRepository {
  async findCompletedInRange(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<CompletedAppointment[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "COMPLETED",
        startAt: { gte: startAt, lte: endAt },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        clientEmail: true,
        professionalId: true,
        appointmentServices: {
          select: {
            snapshotName: true,
            snapshotPriceCents: true,
            snapshotDurationMinutes: true,
          },
        },
      },
      orderBy: { startAt: "asc" },
    });

    return appointments.map((apt) => ({
      id: apt.id,
      startAt: apt.startAt,
      endAt: apt.endAt,
      clientEmail: apt.clientEmail,
      professionalId: apt.professionalId,
      services: apt.appointmentServices,
    }));
  }

  async findCancellationsInRange(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<CancellationRecord[]> {
    return prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "CANCELLED",
        startAt: { gte: startAt, lte: endAt },
      },
      select: {
        id: true,
        startAt: true,
        clientEmail: true,
        cancelledBy: true,
      },
      orderBy: { startAt: "asc" },
    });
  }

  async findNoShowInRange(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ id: string }>> {
    return prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "NO_SHOW",
        startAt: { gte: startAt, lte: endAt },
      },
      select: { id: true },
    });
  }

  async countAppointmentsInRange(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
    statuses: ("CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW")[] = ["COMPLETED", "NO_SHOW", "CANCELLED"],
  ): Promise<number> {
    return prisma.appointment.count({
      where: {
        establishmentId,
        status: { in: statuses },
        startAt: { gte: startAt, lte: endAt },
      },
    });
  }

  async findClientAppointments(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentForReturnRate[]> {
    const result = await prisma.appointment.groupBy({
      by: ["clientEmail"],
      where: {
        establishmentId,
        status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] },
        startAt: { gte: startAt, lte: endAt },
      },
      _count: { clientEmail: true },
    });

    return result.map((r) => ({
      clientEmail: r.clientEmail,
      appointmentCount: r._count.clientEmail,
    }));
  }

  async findAppointmentsByProfessional(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentByProfessional[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "COMPLETED",
        startAt: { gte: startAt, lte: endAt },
      },
      select: {
        professionalId: true,
        professional: {
          select: {
            name: true,
          },
        },
        appointmentServices: {
          select: {
            snapshotPriceCents: true,
          },
        },
      },
    });

    const grouped = new Map<string, AppointmentByProfessional>();
    for (const apt of appointments) {
      const key = apt.professionalId;
      const existing = grouped.get(key) || {
        professionalId: apt.professionalId,
        professionalName: apt.professional.name,
        count: 0,
        totalRevenue: 0,
      };

      existing.count += 1;
      existing.totalRevenue += apt.appointmentServices.reduce((sum, s) => sum + s.snapshotPriceCents, 0);
      grouped.set(key, existing);
    }

    return Array.from(grouped.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  async findAppointmentsByService(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentByService[]> {
    const services = await prisma.appointmentService.findMany({
      where: {
        appointment: {
          establishmentId,
          status: "COMPLETED",
          startAt: { gte: startAt, lte: endAt },
        },
      },
      select: {
        snapshotName: true,
        snapshotPriceCents: true,
      },
    });

    const grouped = new Map<string, AppointmentByService>();
    for (const svc of services) {
      const existing = grouped.get(svc.snapshotName) || {
        serviceName: svc.snapshotName,
        count: 0,
        totalRevenue: 0,
      };

      existing.count += 1;
      existing.totalRevenue += svc.snapshotPriceCents;
      grouped.set(svc.snapshotName, existing);
    }

    return Array.from(grouped.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  async findCancellationReasons(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<CancellationReasonData[]> {
    const cancellations = await prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "CANCELLED",
        startAt: { gte: startAt, lte: endAt },
      },
      select: {
        cancelledBy: true,
      },
    });

    const grouped = new Map<string, number>();
    for (const c of cancellations) {
      const reason = c.cancelledBy === "CLIENT" ? "Client" : c.cancelledBy === "OWNER" ? "Owner" : "System";
      grouped.set(reason, (grouped.get(reason) ?? 0) + 1);
    }

    return Array.from(grouped.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getAverageAdvanceMinutes(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<number | null> {
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: {
        createdAt: true,
        timezone: true,
      },
    });

    if (!establishment) {
      return null;
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "COMPLETED",
        startAt: { gte: startAt, lte: endAt },
      },
      select: {
        startAt: true,
        createdAt: true,
      },
    });

    if (appointments.length === 0) {
      return 0;
    }

    const totalAdvanceMinutes = appointments.reduce((sum, apt) => {
      const advanceMs = apt.startAt.getTime() - apt.createdAt.getTime();
      return sum + Math.floor(advanceMs / (1000 * 60));
    }, 0);

    return Math.round(totalAdvanceMinutes / appointments.length);
  }
}
