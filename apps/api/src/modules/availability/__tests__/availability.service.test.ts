/* eslint-disable @typescript-eslint/unbound-method -- repository methods are vi.fn() mocks */
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { AvailabilityRepository } from "../availability.repository.js";
import { AvailabilityService } from "../availability.service.js";

function buildMockRepository(): AvailabilityRepository {
  return {
    isEstablishmentOwned: vi.fn(),
    findBusinessHours: vi.fn(),
    replaceBusinessHours: vi.fn(),
    findHolidays: vi.fn(),
    createHoliday: vi.fn(),
    deleteHoliday: vi.fn(),
    findBlocks: vi.fn(),
    createBlock: vi.fn(),
    deleteBlock: vi.fn(),
    findProfessionalInEstablishment: vi.fn(),
    findProfessionalAvailabilities: vi.fn(),
    replaceProfessionalAvailabilities: vi.fn(),
  };
}

describe("AvailabilityService", () => {
  let mockRepository: AvailabilityRepository;
  let service: AvailabilityService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = buildMockRepository();
    service = new AvailabilityService(mockRepository);
  });

  describe("createBlock", () => {
    it("should throw INVALID_BLOCK_RANGE when endsAt is not after startsAt", async () => {
      vi.mocked(mockRepository.isEstablishmentOwned).mockResolvedValue(true);

      await expect(
        service.createBlock("user_1", "est_1", {
          scope: "ESTABLISHMENT",
          startsAt: "2026-06-01T14:00:00.000Z",
          endsAt: "2026-06-01T12:00:00.000Z",
          reason: "Team meeting",
        }),
      ).rejects.toMatchObject({ code: "INVALID_BLOCK_RANGE" });
    });

    it("should throw NOT_FOUND when professional scope references unknown professional", async () => {
      vi.mocked(mockRepository.isEstablishmentOwned).mockResolvedValue(true);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue(null);

      await expect(
        service.createBlock("user_1", "est_1", {
          scope: "PROFESSIONAL",
          professionalId: "prof_missing",
          startsAt: "2026-06-01T10:00:00.000Z",
          endsAt: "2026-06-01T18:00:00.000Z",
          reason: "Vacation",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("replaceProfessionalAvailabilities", () => {
    it("should throw OVERLAPPING_AVAILABILITY when two windows on the same weekday overlap", async () => {
      vi.mocked(mockRepository.isEstablishmentOwned).mockResolvedValue(true);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          id: "bh1",
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);

      await expect(
        service.replaceProfessionalAvailabilities("user_1", "est_1", "prof_1", [
          { weekday: "MON", startsAt: "09:00", endsAt: "13:00" },
          { weekday: "MON", startsAt: "12:00", endsAt: "17:00" },
        ]),
      ).rejects.toMatchObject({ code: "OVERLAPPING_AVAILABILITY" });
    });
  });

  describe("ensureEstablishment", () => {
    it("should surface NOT_FOUND when establishment is not owned", async () => {
      vi.mocked(mockRepository.isEstablishmentOwned).mockResolvedValue(false);

      await expect(service.getBusinessHours("user_1", "est_x")).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });
});
