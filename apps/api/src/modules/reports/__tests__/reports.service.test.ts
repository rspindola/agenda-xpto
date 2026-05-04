/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion -- partial repository mocks */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ReportsService } from "~/modules/reports/reports.service.js";
import type { ReportsRepository } from "~/modules/reports/reports.repository.js";
import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import * as subscriptionRepository from "~/modules/plans/subscription.repository.js";

const establishment = {
  id: "est_1",
  name: "Test Salon",
  slug: "test-salon",
  email: "salon@example.com",
  timezone: "UTC",
  minAdvanceMinutes: 60,
};

function buildMockRepository(): ReportsRepository {
  return {
    findCompletedInRange: vi.fn().mockResolvedValue([]),
    findCancellationsInRange: vi.fn().mockResolvedValue([]),
    findNoShowInRange: vi.fn().mockResolvedValue([]),
    countAppointmentsInRange: vi.fn().mockResolvedValue(0),
    findClientAppointments: vi.fn().mockResolvedValue([]),
    findAppointmentsByProfessional: vi.fn().mockResolvedValue([]),
    findAppointmentsByService: vi.fn().mockResolvedValue([]),
    findCancellationReasons: vi.fn().mockResolvedValue([]),
    getAverageAdvanceMinutes: vi.fn().mockResolvedValue(null),
  } as unknown as ReportsRepository;
}

function buildMockEstablishmentsRepository(): EstablishmentsRepository {
  return {
    findOwnedById: vi.fn().mockResolvedValue(establishment),
  } as unknown as EstablishmentsRepository;
}

describe("ReportsService", () => {
  let mockRepository: ReportsRepository;
  let mockEstablishments: EstablishmentsRepository;
  let service: ReportsService;
  let findSubSpy: unknown;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = buildMockRepository();
    mockEstablishments = buildMockEstablishmentsRepository();
    findSubSpy = vi.spyOn(subscriptionRepository, "findSubscriptionByUserId");
    // Mock Pro subscription by default
    (findSubSpy as Record<string, (value: unknown) => unknown>).mockResolvedValue({ planType: "PRO", status: "ACTIVE" } as never);
    service = new ReportsService(mockRepository, mockEstablishments, subscriptionRepository);
  });

  afterEach(() => {
    (findSubSpy as Record<string, () => void>).mockRestore();
  });

  describe("getReport", () => {
    it("should throw REPORT_REQUIRES_UPGRADE for Starter plan on no-show-rate", async () => {
      (findSubSpy as Record<string, (value: unknown) => unknown>).mockResolvedValueOnce({ planType: "STARTER", status: "ACTIVE" } as never);

      try {
        await service.getReport("user_1", "est_1", "no-show-rate", {
          from: "2026-01-01",
          to: "2026-01-31",
          page: 1,
          pageSize: 20,
        });
        expect.fail("Should have thrown");
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && 'statusCode' in error) {
          expect(error.code).toBe("REPORT_REQUIRES_UPGRADE");
          expect(error.statusCode).toBe(403);
        }
      }
    });

    it("should return correct data for appointments-completed report", async () => {
      (mockRepository.findCompletedInRange as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        {
          id: "apt_1",
          startAt: new Date("2026-01-15T10:00:00Z"),
          endAt: new Date("2026-01-15T11:00:00Z"),
          clientEmail: "client@example.com",
          professionalId: "prof_1",
          services: [{ snapshotName: "Haircut", snapshotPriceCents: 5000, snapshotDurationMinutes: 60 }],
        },
      ]);

      const result = await service.getReport("user_1", "est_1", "appointments-completed", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.reportType).toBe("appointments-completed");
      expect(result.data).toHaveLength(1);
      expect(result.data[0].label).toBe("Total Completed Appointments");
      expect(result.data[0].value).toBe(1);
    });

    it("should throw NOT_FOUND when establishmentId does not belong to user", async () => {
      (mockEstablishments.findOwnedById as unknown as { mockResolvedValueOnce: (value: unknown) => void }).mockResolvedValueOnce(null);

      try {
        await service.getReport("user_1", "est_999", "appointments-completed", {
          from: "2026-01-01",
          to: "2026-01-31",
          page: 1,
          pageSize: 20,
        });
        expect.fail("Should have thrown");
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && 'statusCode' in error) {
          expect(error.code).toBe("NOT_FOUND");
          expect(error.statusCode).toBe(404);
        }
      }
    });

    it("should throw INVALID_DATE_RANGE when from > to", async () => {
      try {
        await service.getReport("user_1", "est_1", "appointments-completed", {
          from: "2026-01-31",
          to: "2026-01-01",
          page: 1,
          pageSize: 20,
        });
        expect.fail("Should have thrown");
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && 'statusCode' in error) {
          expect(error.code).toBe("INVALID_DATE_RANGE");
          expect(error.statusCode).toBe(400);
        }
      }
    });
  });

  describe("calculateNoShowRate", () => {
    it("should return 0 when no appointments in period", async () => {
      (mockRepository.countAppointmentsInRange as unknown as { mockResolvedValueOnce: (value: number) => void }).mockResolvedValueOnce(0);
      (mockRepository.findNoShowInRange as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([]);

      const result = await service.getReport("user_1", "est_1", "appointments-completed", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].value).toBe(0);
    });

    it("should return correct percentage with no-show appointments", async () => {
      (mockRepository.findNoShowInRange as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([{ id: "apt_1" }, { id: "apt_2" }]);
      (mockRepository.countAppointmentsInRange as unknown as { mockResolvedValueOnce: (value: number) => void }).mockResolvedValueOnce(10);

      const result = await service.getReport("user_1", "est_1", "no-show-rate", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      const rateItem = result.data.find((d) => d.label === "No-Show Rate (%)");
      expect(rateItem?.value).toBe("20.00%");
    });
  });

  describe("calculateReturnRate", () => {
    it("should return 0 when all clients are unique", async () => {
      (mockRepository.findClientAppointments as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        { clientEmail: "client1@example.com", appointmentCount: 1 },
        { clientEmail: "client2@example.com", appointmentCount: 1 },
        { clientEmail: "client3@example.com", appointmentCount: 1 },
      ]);

      const result = await service.getReport("user_1", "est_1", "return-rate", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      const rateItem = result.data.find((d) => d.label === "Return Rate (%)");
      expect(rateItem?.value).toBe("0.00%");
    });

    it("should return correct percentage with returning clients", async () => {
      (mockRepository.findClientAppointments as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        { clientEmail: "client1@example.com", appointmentCount: 1 },
        { clientEmail: "client2@example.com", appointmentCount: 3 },
        { clientEmail: "client3@example.com", appointmentCount: 2 },
        { clientEmail: "client4@example.com", appointmentCount: 1 },
      ]);

      const result = await service.getReport("user_1", "est_1", "return-rate", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      const rateItem = result.data.find((d) => d.label === "Return Rate (%)");
      expect(rateItem?.value).toBe("50.00%");
    });
  });

  describe("peak-hours report", () => {
    it("should return appointments grouped by hour", async () => {
      (mockRepository.findCompletedInRange as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        { id: "apt_1", startAt: new Date("2026-01-15T09:00:00Z"), endAt: new Date("2026-01-15T10:00:00Z"), clientEmail: "c1@ex.com", professionalId: "p1", services: [] },
        { id: "apt_2", startAt: new Date("2026-01-15T09:30:00Z"), endAt: new Date("2026-01-15T10:30:00Z"), clientEmail: "c2@ex.com", professionalId: "p1", services: [] },
        { id: "apt_3", startAt: new Date("2026-01-15T14:00:00Z"), endAt: new Date("2026-01-15T15:00:00Z"), clientEmail: "c3@ex.com", professionalId: "p1", services: [] },
      ]);

      const result = await service.getReport("user_1", "est_1", "peak-hours", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.reportType).toBe("peak-hours");
      expect(result.data).toHaveLength(2);
      expect(result.data[0].label).toBe("09:00");
      expect(result.data[0].value).toBe(2);
      expect(result.data[1].label).toBe("14:00");
      expect(result.data[1].value).toBe(1);
    });
  });

  describe("most-profitable report", () => {
    it("should return services sorted by revenue", async () => {
      (mockRepository.findAppointmentsByService as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        { serviceName: "Haircut", count: 5, totalRevenue: 10000 },
        { serviceName: "Color", count: 3, totalRevenue: 25000 },
        { serviceName: "Styling", count: 2, totalRevenue: 8000 },
      ]);

      const result = await service.getReport("user_1", "est_1", "most-profitable", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.reportType).toBe("most-profitable");
      expect(result.data).toHaveLength(3);
      expect(result.data[0].label).toBe("Color");
      expect(result.data[0].value).toContain("250.00");
    });
  });

  describe("by-professional report", () => {
    it("should return appointments grouped by professional", async () => {
      (mockRepository.findAppointmentsByProfessional as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        { professionalName: "John", professionalId: "p1", count: 10, totalRevenue: 50000 },
        { professionalName: "Jane", professionalId: "p2", count: 8, totalRevenue: 40000 },
      ]);

      const result = await service.getReport("user_1", "est_1", "by-professional", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.reportType).toBe("by-professional");
      expect(result.data).toHaveLength(2);
      expect(result.data[0].label).toBe("John");
      expect(result.data[0].value).toContain("10 appointments");
      expect(result.data[0].value).toContain("500.00");
    });
  });

  describe("by-service report", () => {
    it("should return appointments grouped by service", async () => {
      (mockRepository.findAppointmentsByService as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        { serviceName: "Haircut", count: 15, totalRevenue: 75000 },
        { serviceName: "Color", count: 8, totalRevenue: 80000 },
      ]);

      const result = await service.getReport("user_1", "est_1", "by-service", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.reportType).toBe("by-service");
      expect(result.data).toHaveLength(2);
      expect(result.data[0].label).toBe("Haircut");
      expect(result.data[0].value).toContain("15 bookings");
    });
  });

  describe("avg-advance report", () => {
    it("should return N/A when no average minutes", async () => {
      (mockRepository.getAverageAdvanceMinutes as unknown as { mockResolvedValueOnce: (value: unknown) => void }).mockResolvedValueOnce(null);

      const result = await service.getReport("user_1", "est_1", "avg-advance", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.reportType).toBe("avg-advance");
      expect(result.data[0].label).toBe("Average Advance Notice");
      expect(result.data[0].value).toBe("N/A");
    });

    it("should format days, hours and minutes correctly", async () => {
      // 2 days + 3 hours + 30 minutes = 2*24*60 + 3*60 + 30 = 2880 + 180 + 30 = 3090 minutes
      (mockRepository.getAverageAdvanceMinutes as unknown as { mockResolvedValueOnce: (value: number) => void }).mockResolvedValueOnce(3090);

      const result = await service.getReport("user_1", "est_1", "avg-advance", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.data[0].value).toBe("2d 3h 30m");
    });

    it("should format only hours and minutes when no days", async () => {
      // 1 hour 45 minutes = 60 + 45 = 105 minutes
      (mockRepository.getAverageAdvanceMinutes as unknown as { mockResolvedValueOnce: (value: number) => void }).mockResolvedValueOnce(105);

      const result = await service.getReport("user_1", "est_1", "avg-advance", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.data[0].value).toBe("1h 45m");
    });

    it("should format only minutes when less than an hour", async () => {
      (mockRepository.getAverageAdvanceMinutes as unknown as { mockResolvedValueOnce: (value: number) => void }).mockResolvedValueOnce(30);

      const result = await service.getReport("user_1", "est_1", "avg-advance", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.data[0].value).toBe("30m");
    });
  });

  describe("cancellation-reasons report", () => {
    it("should return cancellation reasons with counts", async () => {
      (mockRepository.findCancellationReasons as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        { reason: "Client requested", count: 5 },
        { reason: "Professional unavailable", count: 3 },
        { reason: "Weather", count: 1 },
      ]);

      const result = await service.getReport("user_1", "est_1", "cancellation-reasons", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.reportType).toBe("cancellation-reasons");
      expect(result.data).toHaveLength(3);
      expect(result.data[0].label).toBe("Client requested");
      expect(result.data[0].value).toBe(5);
    });
  });

  describe("cancellations report", () => {
    it("should return total cancellations", async () => {
      (mockRepository.findCancellationsInRange as unknown as { mockResolvedValueOnce: (value: unknown[]) => void }).mockResolvedValueOnce([
        { id: "apt_1", startAt: new Date("2026-01-15T10:00:00Z"), clientEmail: "c1@ex.com", cancelledBy: "CLIENT" },
        { id: "apt_2", startAt: new Date("2026-01-15T14:00:00Z"), clientEmail: "c2@ex.com", cancelledBy: "PROFESSIONAL" },
      ]);

      const result = await service.getReport("user_1", "est_1", "cancellations", {
        from: "2026-01-01",
        to: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      expect(result.reportType).toBe("cancellations");
      expect(result.data[0].value).toBe(2);
    });
  });
});
