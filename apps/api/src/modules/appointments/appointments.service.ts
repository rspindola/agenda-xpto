import { DateTime } from "luxon";

import type { BookingService } from "~/modules/booking/booking.service.js";
import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { AppError } from "~/shared/errors/AppError.js";

import type {
  AppointmentDetailDto,
  AppointmentListRowDto,
  AppointmentsRepository,
  ListAppointmentsFilter,
} from "~/modules/appointments/appointments.repository.js";
import type {
  BulkCancelAppointmentsBody,
  CreateManualAppointmentBody,
  CreateManualAppointmentResponse,
  GetAppointmentResponse,
  ListAppointmentsQuery,
  ListAppointmentsResponse,
  RescheduleAppointmentBody,
} from "~/modules/appointments/appointments.schema.js";

type EstablishmentPublic = NonNullable<Awaited<ReturnType<EstablishmentsRepository["findOwnedById"]>>>;

export class AppointmentsService {
  constructor(
    private readonly repository: AppointmentsRepository,
    private readonly establishmentsRepository: EstablishmentsRepository,
    private readonly bookingService: BookingService,
  ) {}

  private async requireOwnedEstablishment(
    userId: string,
    establishmentId: string,
  ): Promise<EstablishmentPublic> {
    const establishment = await this.establishmentsRepository.findOwnedById(userId, establishmentId);
    if (!establishment || establishment.archivedAt !== null) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }
    return establishment;
  }

  private computeUtcRangeFromLocalDates(
    timezone: string,
    from: string | undefined,
    to: string | undefined,
  ): Pick<ListAppointmentsFilter, "rangeStartUtcInclusive" | "rangeEndUtcExclusive"> {
    let rangeStartUtcInclusive: Date | undefined;
    let rangeEndUtcExclusive: Date | undefined;

    if (from !== undefined) {
      const dt = DateTime.fromISO(`${from}T00:00:00`, { zone: timezone });
      if (!dt.isValid) {
        throw new AppError(400, "VALIDATION_ERROR", "Invalid from date; expected YYYY-MM-DD.");
      }
      rangeStartUtcInclusive = dt.toUTC().toJSDate();
    }

    if (to !== undefined) {
      const dt = DateTime.fromISO(`${to}T00:00:00`, { zone: timezone });
      if (!dt.isValid) {
        throw new AppError(400, "VALIDATION_ERROR", "Invalid to date; expected YYYY-MM-DD.");
      }
      rangeEndUtcExclusive = dt.plus({ days: 1 }).startOf("day").toUTC().toJSDate();
    }

    return { rangeStartUtcInclusive, rangeEndUtcExclusive };
  }

  private mapListItem(row: AppointmentListRowDto): ListAppointmentsResponse["data"][number] {
    return {
      id: row.id,
      establishmentId: row.establishmentId,
      professionalId: row.professionalId,
      status: row.status,
      startAt: row.startAt.toISOString(),
      endAt: row.endAt.toISOString(),
      clientName: row.clientName,
      clientEmail: row.clientEmail,
      clientPhone: row.clientPhone,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      services: row.services.map((s) => ({
        serviceId: s.serviceId,
        snapshotName: s.snapshotName,
      })),
    };
  }

  private mapDetail(row: AppointmentDetailDto): GetAppointmentResponse {
    return {
      id: row.id,
      establishmentId: row.establishmentId,
      professionalId: row.professionalId,
      status: row.status,
      startAt: row.startAt.toISOString(),
      endAt: row.endAt.toISOString(),
      clientName: row.clientName,
      clientEmail: row.clientEmail,
      clientPhone: row.clientPhone,
      cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
      cancelledBy: row.cancelledBy,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      services: row.services.map((s) => ({
        id: s.id,
        serviceId: s.serviceId,
        snapshotName: s.snapshotName,
        snapshotDurationMinutes: s.snapshotDurationMinutes,
        snapshotPriceCents: s.snapshotPriceCents,
        sortOrder: s.sortOrder,
      })),
    };
  }

  async list(
    userId: string,
    establishmentId: string,
    query: ListAppointmentsQuery,
  ): Promise<ListAppointmentsResponse> {
    const establishment = await this.requireOwnedEstablishment(userId, establishmentId);
    const { rangeStartUtcInclusive, rangeEndUtcExclusive } = this.computeUtcRangeFromLocalDates(
      establishment.timezone,
      query.from,
      query.to,
    );

    const filter: ListAppointmentsFilter = {
      establishmentId,
      statusIn: query.status,
      professionalId: query.professionalId,
      rangeStartUtcInclusive,
      rangeEndUtcExclusive,
      page: query.page,
      pageSize: query.pageSize,
    };

    const { rows, total } = await this.repository.listForEstablishment(filter);
    return {
      data: rows.map((r) => this.mapListItem(r)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getById(userId: string, establishmentId: string, appointmentId: string): Promise<GetAppointmentResponse> {
    await this.requireOwnedEstablishment(userId, establishmentId);
    const row = await this.repository.findByIdForEstablishment(establishmentId, appointmentId);
    if (row === null) {
      throw new AppError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
    }
    return this.mapDetail(row);
  }

  async createManual(
    userId: string,
    establishmentId: string,
    body: CreateManualAppointmentBody,
    now: Date,
  ): Promise<CreateManualAppointmentResponse> {
    await this.requireOwnedEstablishment(userId, establishmentId);
    const created = await this.bookingService.createManualDashboardAppointment(userId, establishmentId, body, now);
    // TODO: enqueue notification via module 07 (manual appointment confirmation)
    return created;
  }

  async cancelOne(
    userId: string,
    establishmentId: string,
    appointmentId: string,
  ): Promise<{ id: string; status: "CANCELLED" }> {
    await this.requireOwnedEstablishment(userId, establishmentId);
    return this.repository.cancelConfirmedByOwner(establishmentId, appointmentId);
  }

  async markCompleted(
    userId: string,
    establishmentId: string,
    appointmentId: string,
  ): Promise<{ id: string; status: "COMPLETED" }> {
    await this.requireOwnedEstablishment(userId, establishmentId);
    return this.repository.markConfirmedStatus(establishmentId, appointmentId, "COMPLETED");
  }

  async markNoShow(
    userId: string,
    establishmentId: string,
    appointmentId: string,
  ): Promise<{ id: string; status: "NO_SHOW" }> {
    await this.requireOwnedEstablishment(userId, establishmentId);
    return this.repository.markConfirmedStatus(establishmentId, appointmentId, "NO_SHOW");
  }

  async reschedule(
    userId: string,
    establishmentId: string,
    appointmentId: string,
    body: RescheduleAppointmentBody,
    now: Date,
  ): Promise<{ id: string; startAt: string; endAt: string }> {
    const establishment = await this.requireOwnedEstablishment(userId, establishmentId);
    const apt = await this.repository.findForReschedule(establishmentId, appointmentId);
    if (apt === null) {
      throw new AppError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
    }
    if (apt.status !== "CONFIRMED") {
      throw new AppError(422, "APPOINTMENT_NOT_RESCHEDULABLE", "Only confirmed appointments can be rescheduled.");
    }

    const newStartAt = new Date(body.startAt);
    if (Number.isNaN(newStartAt.getTime())) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid startAt datetime.");
    }

    const newEndAt = new Date(newStartAt.getTime() + apt.snapshotDurationSumMinutes * 60 * 1000);

    this.bookingService.assertStartAtMeetsMinAdvance(establishment.minAdvanceMinutes, newStartAt, now);

    const updated = await this.repository.rescheduleConfirmedInTransaction({
      establishmentId,
      appointmentId,
      professionalId: apt.professionalId,
      newStartAt,
      newEndAt,
    });

    // TODO: enqueue notification via module 07 (appointment rescheduled)

    return {
      id: updated.id,
      startAt: updated.startAt.toISOString(),
      endAt: updated.endAt.toISOString(),
    };
  }

  async bulkCancelConfirmed(
    userId: string,
    establishmentId: string,
    body: BulkCancelAppointmentsBody,
  ): Promise<{ cancelledIds: string[] }> {
    const establishment = await this.establishmentsRepository.findOwnedById(userId, establishmentId);
    if (!establishment || establishment.archivedAt !== null) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }

    const uniqueIds = [...new Set(body.appointmentIds)];
    return this.repository.bulkCancelConfirmedInTransaction(establishmentId, uniqueIds);
  }
}
