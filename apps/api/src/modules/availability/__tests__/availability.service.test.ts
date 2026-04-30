/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unnecessary-type-assertion -- partial repository mocks */
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { AppointmentsRepository } from "~/modules/appointments/appointments.repository.js";
import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";

import type { AvailabilityRepository } from "../availability.repository.js";
import { AvailabilityService } from "../availability.service.js";

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

function buildMockRepository(): AvailabilityRepository {
  return {
    findBusinessHours: vi.fn(),
    upsertBusinessHour: vi.fn(),
    deleteBusinessHourByWeekday: vi.fn(),
    findHolidays: vi.fn(),
    createHoliday: vi.fn(),
    deleteHoliday: vi.fn(),
    findBlocks: vi.fn(),
    createBlock: vi.fn(),
    deleteBlock: vi.fn(),
    findProfessionalInEstablishment: vi.fn(),
    findProfessionalAvailabilities: vi.fn(),
    replaceProfessionalAvailabilities: vi.fn(),
    findProfessionalAvailabilityById: vi.fn(),
    createProfessionalAvailability: vi.fn(),
    updateProfessionalAvailability: vi.fn(),
    deleteProfessionalAvailability: vi.fn(),
  } as unknown as AvailabilityRepository;
}

function buildEstablishmentsRepo(): EstablishmentsRepository {
  return {
    findOwnedById: vi.fn(),
  } as unknown as EstablishmentsRepository;
}

function buildMockAppointmentsRepository(): AppointmentsRepository {
  return {
    findConfirmedOverlappingInterval: vi.fn().mockResolvedValue([]),
    bulkCancelConfirmedInTransaction: vi.fn(),
  } as unknown as AppointmentsRepository;
}

describe("AvailabilityService", () => {
  let mockRepository: AvailabilityRepository;
  let mockEstablishments: EstablishmentsRepository;
  let mockAppointments: AppointmentsRepository;
  let service: AvailabilityService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = buildMockRepository();
    mockEstablishments = buildEstablishmentsRepo();
    mockAppointments = buildMockAppointmentsRepository();
    service = new AvailabilityService(mockRepository, mockEstablishments, mockAppointments);
  });

  describe("createBlock", () => {
    it("should call findConfirmedOverlappingInterval with PROFESSIONAL filter when scope is PROFESSIONAL", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.createBlock).mockResolvedValue({
        id: "blk_1",
        scope: "PROFESSIONAL",
        professionalId: "prof_1",
        startsAt: new Date("2026-06-01T10:00:00.000Z"),
        endsAt: new Date("2026-06-01T18:00:00.000Z"),
        reason: "Vacation",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.createBlock("user_1", "est_1", {
        scope: "PROFESSIONAL",
        professionalId: "prof_1",
        startsAt: "2026-06-01T10:00:00.000Z",
        endsAt: "2026-06-01T18:00:00.000Z",
        reason: "Vacation",
      });

      expect(vi.mocked(mockAppointments.findConfirmedOverlappingInterval)).toHaveBeenCalledWith(
        "est_1",
        {
          startsAt: new Date("2026-06-01T10:00:00.000Z"),
          endsAt: new Date("2026-06-01T18:00:00.000Z"),
        },
        { type: "PROFESSIONAL", professionalId: "prof_1" },
      );
    });

    it("should throw INVALID_BLOCK_RANGE when endsAt is not after startsAt", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);

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
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
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

  describe("createProfessionalAvailability", () => {
    it("should throw OVERLAPPING_AVAILABILITY when new window overlaps an existing row on the same weekday", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalAvailabilities).mockResolvedValue([
        {
          id: "pa1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 12, 0, 0, 0)),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          id: "bh1",
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 8, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);

      await expect(
        service.createProfessionalAvailability("user_1", "est_1", "prof_1", {
          weekday: "MON",
          startsAt: "11:00",
          endsAt: "14:00",
        }),
      ).rejects.toMatchObject({ code: "OVERLAPPING_AVAILABILITY" });
      expect(vi.mocked(mockRepository.createProfessionalAvailability)).not.toHaveBeenCalled();
    });
  });

  describe("replaceProfessionalAvailabilities", () => {
    it("should throw OVERLAPPING_AVAILABILITY when two windows on the same weekday overlap", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
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
          { weekday: "MON", startsAt: "09:00", endsAt: "12:00" },
          { weekday: "MON", startsAt: "11:00", endsAt: "14:00" },
        ]),
      ).rejects.toMatchObject({ code: "OVERLAPPING_AVAILABILITY" });
    });
  });

  describe("putBusinessHourForWeekday", () => {
    it("should delete row when closed is true", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.deleteBusinessHourByWeekday).mockResolvedValue(undefined);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([]);

      await service.putBusinessHourForWeekday("user_1", "est_1", "MON", { closed: true });

      expect(vi.mocked(mockRepository.deleteBusinessHourByWeekday)).toHaveBeenCalledWith("est_1", "MON");
      expect(vi.mocked(mockRepository.upsertBusinessHour)).not.toHaveBeenCalled();
    });
  });
});
