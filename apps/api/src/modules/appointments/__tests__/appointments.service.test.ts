/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unnecessary-type-assertion -- partial repository mocks */
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";

import type { AppointmentsRepository } from "../appointments.repository.js";
import { AppointmentsService } from "../appointments.service.js";

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
  } as unknown as AppointmentsRepository;
}

function buildEstablishmentsRepo(): EstablishmentsRepository {
  return {
    findOwnedById: vi.fn(),
  } as unknown as EstablishmentsRepository;
}

describe("AppointmentsService", () => {
  let mockRepository: AppointmentsRepository;
  let mockEstablishments: EstablishmentsRepository;
  let service: AppointmentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = buildMockRepository();
    mockEstablishments = buildEstablishmentsRepo();
    service = new AppointmentsService(mockRepository, mockEstablishments);
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
