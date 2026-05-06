import { describe, it, expect, vi, beforeEach } from "vitest";

import type { BookingService } from "~/modules/booking/booking.service.js";
import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import type { NotificationsService } from "~/modules/notifications/notifications.service.js";

import type { AppointmentsRepository } from "~/modules/appointments/appointments.repository.js";
import { AppointmentsService } from "~/modules/appointments/appointments.service.js";

const establishment = {
  id: "est_1",
  name: "Shop",
  slug: "shop",
  email: "a@b.com",
  phone: null,
  address: null,
  timezone: "UTC",
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: null,
  archivedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function buildMockRepository(): AppointmentsRepository {
  return {
    findConfirmedOverlappingInterval: vi.fn(),
    bulkCancelConfirmedInTransaction: vi.fn(),
    listForEstablishment: vi.fn(),
    findByIdForEstablishment: vi.fn(),
    cancelConfirmedByOwner: vi.fn(),
    markConfirmedStatus: vi.fn(),
    findForReschedule: vi.fn(),
    rescheduleConfirmedInTransaction: vi.fn(),
  } as unknown as AppointmentsRepository;
}

function buildEstablishmentsRepo(): EstablishmentsRepository {
  return {
    findOwnedById: vi.fn(),
  } as unknown as EstablishmentsRepository;
}

function buildBookingService(): BookingService {
  return {
    createManualDashboardAppointment: vi.fn(),
    assertStartAtMeetsMinAdvance: vi.fn(),
  } as unknown as BookingService;
}

function buildNotificationsService(): NotificationsService {
  return {
    scheduleAfterBooking: vi.fn(),
    onClientCancelledAppointment: vi.fn(),
    onOwnerCancelledAppointment: vi.fn(),
    onOwnerBulkCancelled: vi.fn(),
    onTerminalAppointmentStatus: vi.fn(),
    onAppointmentRescheduled: vi.fn(),
    listNotificationLogs: vi.fn(),
  } as unknown as NotificationsService;
}

describe("AppointmentsService", () => {
  let mockRepository: AppointmentsRepository;
  let mockEstablishments: EstablishmentsRepository;
  let mockBooking: BookingService;
  let mockNotifications: NotificationsService;
  let service: AppointmentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = buildMockRepository();
    mockEstablishments = buildEstablishmentsRepo();
    mockBooking = buildBookingService();
    mockNotifications = buildNotificationsService();
    service = new AppointmentsService(mockRepository, mockEstablishments, mockBooking, mockNotifications);
  });

  describe("list", () => {
    it("should return paginated data when establishment is owned", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      const start = new Date("2026-06-01T00:00:00.000Z");
      const row = {
        id: "appt_1",
        establishmentId: "est_1",
        professionalId: "prof_1",
        status: "CONFIRMED" as const,
        startAt: start,
        endAt: new Date("2026-06-01T01:00:00.000Z"),
        clientName: "Jane",
        clientEmail: "jane@example.com",
        clientPhone: "+5511999999999",
        createdAt: start,
        updatedAt: start,
        services: [{ serviceId: "svc_1", snapshotName: "Cut" }],
      };
      vi.mocked(mockRepository.listForEstablishment).mockResolvedValue({ rows: [row], total: 1 });

      const result = await service.list("user_1", "est_1", {
        from: "2026-06-01",
        page: 1,
        pageSize: 20,
      });

      expect(result.total).toBe(1);
      expect(result.data[0]?.id).toBe("appt_1");
      expect(result.data[0]?.startAt).toBe(start.toISOString());
      expect(vi.mocked(mockRepository.listForEstablishment)).toHaveBeenCalledWith(
        expect.objectContaining({
          establishmentId: "est_1",
          page: 1,
          pageSize: 20,
          rangeStartUtcInclusive: start,
        }),
      );
    });

    it("should throw NOT_FOUND when establishment is archived", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue({
        ...establishment,
        archivedAt: "2026-02-01T00:00:00.000Z",
      });

      await expect(
        service.list("user_1", "est_1", { to: "2026-06-30", page: 1, pageSize: 20 }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should list when only to is provided", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.listForEstablishment).mockResolvedValue({ rows: [], total: 0 });

      await service.list("user_1", "est_1", { to: "2026-06-30", page: 1, pageSize: 20 });

      expect(vi.mocked(mockRepository.listForEstablishment)).toHaveBeenCalledOnce();
      const calls = vi.mocked(mockRepository.listForEstablishment).mock.calls;
      expect(calls).toHaveLength(1);
      const filter = calls[0][0];
      expect(filter.rangeStartUtcInclusive).toBeUndefined();
      expect(filter.rangeEndUtcExclusive).toBeInstanceOf(Date);
    });

    it("should throw VALIDATION_ERROR when from is not a valid calendar date", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);

      await expect(
        service.list("user_1", "est_1", { from: "2026-13-40", page: 1, pageSize: 20 }),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw VALIDATION_ERROR when to is not a valid calendar date", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);

      await expect(
        service.list("user_1", "est_1", { from: "2026-06-01", to: "2026-13-01", page: 1, pageSize: 20 }),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });
  });

  describe("getById", () => {
    it("should return mapped appointment when found", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      const start = new Date("2026-06-01T12:00:00.000Z");
      vi.mocked(mockRepository.findByIdForEstablishment).mockResolvedValue({
        id: "appt_1",
        establishmentId: "est_1",
        professionalId: "prof_1",
        status: "CONFIRMED",
        startAt: start,
        endAt: new Date("2026-06-01T13:00:00.000Z"),
        clientName: "Jane",
        clientEmail: "jane@example.com",
        clientPhone: "+5511999999999",
        cancelledAt: null,
        cancelledBy: null,
        createdByUserId: "user_1",
        createdAt: start,
        updatedAt: start,
        services: [
          {
            id: "line_1",
            serviceId: "svc_1",
            snapshotName: "Cut",
            snapshotDurationMinutes: 60,
            snapshotPriceCents: 5000,
            sortOrder: 0,
          },
        ],
      });

      const result = await service.getById("user_1", "est_1", "appt_1");

      expect(result.id).toBe("appt_1");
      expect(result.cancelledAt).toBeNull();
      expect(result.services[0]?.snapshotName).toBe("Cut");
    });

    it("should throw APPOINTMENT_NOT_FOUND when appointment is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findByIdForEstablishment).mockResolvedValue(null);

      await expect(service.getById("user_1", "est_1", "missing")).rejects.toMatchObject({
        code: "APPOINTMENT_NOT_FOUND",
      });
    });
  });

  describe("createManual", () => {
    it("should delegate to BookingService after ownership check", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockBooking.createManualDashboardAppointment).mockResolvedValue({
        id: "appt_new",
        professionalId: "prof_1",
        startAt: "2026-06-10T12:00:00.000Z",
        endAt: "2026-06-10T13:00:00.000Z",
        clientName: "Jane",
        clientEmail: "jane@example.com",
        clientPhone: "+5511999999999",
      });

      const body = {
        professionalId: "prof_1",
        serviceIds: ["svc_1"],
        startAt: "2026-06-10T12:00:00.000Z",
        clientName: "Jane",
        clientEmail: "jane@example.com",
        clientPhone: "+5511999999999",
      };

      const now = new Date("2026-06-01T00:00:00.000Z");
      const result = await service.createManual("user_1", "est_1", body, now);

      expect(result.id).toBe("appt_new");
      expect(vi.mocked(mockBooking.createManualDashboardAppointment)).toHaveBeenCalledWith(
        "user_1",
        "est_1",
        body,
        now,
      );
    });
  });

  describe("cancelOne", () => {
    it("should return id and CANCELLED status", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.cancelConfirmedByOwner).mockResolvedValue({ id: "appt_1", status: "CANCELLED" });

      const result = await service.cancelOne("user_1", "est_1", "appt_1");

      expect(result).toEqual({ id: "appt_1", status: "CANCELLED" });
    });
  });

  describe("markCompleted", () => {
    it("should return COMPLETED when repository succeeds", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.markConfirmedStatus).mockResolvedValue({ id: "appt_1", status: "COMPLETED" });

      const result = await service.markCompleted("user_1", "est_1", "appt_1");

      expect(result).toEqual({ id: "appt_1", status: "COMPLETED" });
      expect(vi.mocked(mockRepository.markConfirmedStatus)).toHaveBeenCalledWith("est_1", "appt_1", "COMPLETED");
    });
  });

  describe("markNoShow", () => {
    it("should return NO_SHOW when repository succeeds", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.markConfirmedStatus).mockResolvedValue({ id: "appt_1", status: "NO_SHOW" });

      const result = await service.markNoShow("user_1", "est_1", "appt_1");

      expect(result).toEqual({ id: "appt_1", status: "NO_SHOW" });
      expect(vi.mocked(mockRepository.markConfirmedStatus)).toHaveBeenCalledWith("est_1", "appt_1", "NO_SHOW");
    });
  });

  describe("reschedule", () => {
    it("should throw APPOINTMENT_NOT_FOUND when appointment does not exist", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findForReschedule).mockResolvedValue(null);

      await expect(
        service.reschedule(
          "user_1",
          "est_1",
          "missing",
          { startAt: "2026-06-15T14:00:00.000Z" },
          new Date(),
        ),
      ).rejects.toMatchObject({ code: "APPOINTMENT_NOT_FOUND" });
    });

    it("should throw VALIDATION_ERROR when startAt is not a valid datetime", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findForReschedule).mockResolvedValue({
        id: "appt_1",
        establishmentId: "est_1",
        professionalId: "prof_1",
        status: "CONFIRMED",
        snapshotDurationSumMinutes: 60,
        serviceIdsOrdered: ["svc_1"],
      });

      await expect(
        service.reschedule("user_1", "est_1", "appt_1", { startAt: "not-a-date" }, new Date()),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw APPOINTMENT_NOT_RESCHEDULABLE when status is not CONFIRMED", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findForReschedule).mockResolvedValue({
        id: "appt_1",
        establishmentId: "est_1",
        professionalId: "prof_1",
        status: "CANCELLED",
        snapshotDurationSumMinutes: 60,
        serviceIdsOrdered: ["svc_1"],
      });

      await expect(
        service.reschedule(
          "user_1",
          "est_1",
          "appt_1",
          { startAt: "2026-06-15T14:00:00.000Z" },
          new Date(),
        ),
      ).rejects.toMatchObject({ code: "APPOINTMENT_NOT_RESCHEDULABLE" });
    });

    it("should update schedule when appointment is confirmed", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findForReschedule).mockResolvedValue({
        id: "appt_1",
        establishmentId: "est_1",
        professionalId: "prof_1",
        status: "CONFIRMED",
        snapshotDurationSumMinutes: 60,
        serviceIdsOrdered: ["svc_1"],
      });
      const newStart = new Date("2026-06-15T14:00:00.000Z");
      const newEnd = new Date("2026-06-15T15:00:00.000Z");
      vi.mocked(mockRepository.rescheduleConfirmedInTransaction).mockResolvedValue({
        id: "appt_1",
        startAt: newStart,
        endAt: newEnd,
      });

      const now = new Date("2026-06-01T00:00:00.000Z");
      const result = await service.reschedule(
        "user_1",
        "est_1",
        "appt_1",
        { startAt: "2026-06-15T14:00:00.000Z" },
        now,
      );

      expect(result.startAt).toBe(newStart.toISOString());
      expect(vi.mocked(mockBooking.assertStartAtMeetsMinAdvance)).toHaveBeenCalledWith(60, expect.any(Date), now);
      expect(vi.mocked(mockRepository.rescheduleConfirmedInTransaction)).toHaveBeenCalled();
    });
  });

  describe("bulkCancelConfirmed", () => {
    it("should return cancelledIds when repository succeeds", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.bulkCancelConfirmedInTransaction).mockResolvedValue({
        cancelledIds: ["appt_1", "appt_2"],
      });

      const result = await service.bulkCancelConfirmed("user_1", "est_1", {
        appointmentIds: ["appt_1", "appt_2"],
      });

      expect(result.cancelledIds).toEqual(["appt_1", "appt_2"]);
      expect(vi.mocked(mockRepository.bulkCancelConfirmedInTransaction)).toHaveBeenCalledWith("est_1", [
        "appt_1",
        "appt_2",
      ]);
    });

    it("should deduplicate appointmentIds before calling repository", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.bulkCancelConfirmedInTransaction).mockResolvedValue({
        cancelledIds: ["appt_1"],
      });

      await service.bulkCancelConfirmed("user_1", "est_1", {
        appointmentIds: ["appt_1", "appt_1"],
      });

      expect(vi.mocked(mockRepository.bulkCancelConfirmedInTransaction)).toHaveBeenCalledWith("est_1", ["appt_1"]);
    });

    it("should throw NOT_FOUND when establishment is missing or archived", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(null);

      await expect(
        service.bulkCancelConfirmed("user_1", "est_1", { appointmentIds: ["appt_1"] }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });

      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue({
        ...establishment,
        archivedAt: "2026-02-01T00:00:00.000Z",
      });

      await expect(
        service.bulkCancelConfirmed("user_1", "est_1", { appointmentIds: ["appt_1"] }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });
});
