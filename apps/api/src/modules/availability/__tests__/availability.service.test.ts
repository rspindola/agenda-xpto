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
    it("should throw NOT_FOUND when professional is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue(null);

      await expect(
        service.replaceProfessionalAvailabilities("user_1", "est_1", "prof_x", [
          { weekday: "MON", startsAt: "09:00", endsAt: "12:00" },
        ]),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

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

    it("should replace with empty list when business hours allow no windows", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([]);
      vi.mocked(mockRepository.replaceProfessionalAvailabilities).mockResolvedValue([]);

      const rows = await service.replaceProfessionalAvailabilities("user_1", "est_1", "prof_1", []);

      expect(rows).toHaveLength(0);
      expect(vi.mocked(mockRepository.replaceProfessionalAvailabilities)).toHaveBeenCalledWith("prof_1", []);
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

    it("should upsert business hour when closed is false with valid hours", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
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

      await service.putBusinessHourForWeekday("user_1", "est_1", "MON", {
        closed: false,
        opensAt: "09:00",
        closesAt: "18:00",
      });

      expect(vi.mocked(mockRepository.upsertBusinessHour)).toHaveBeenCalledOnce();
      expect(vi.mocked(mockRepository.deleteBusinessHourByWeekday)).not.toHaveBeenCalled();
    });

    it("should throw INVALID_BUSINESS_HOURS when close is not after open", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);

      await expect(
        service.putBusinessHourForWeekday("user_1", "est_1", "MON", {
          closed: false,
          opensAt: "18:00",
          closesAt: "09:00",
        }),
      ).rejects.toMatchObject({ code: "INVALID_BUSINESS_HOURS" });
    });

    it("should throw VALIDATION_ERROR when closed is false but opensAt is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);

      await expect(
        service.putBusinessHourForWeekday("user_1", "est_1", "MON", {
          closed: false,
          closesAt: "18:00",
        }),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });
  });

  describe("getBusinessHours", () => {
    it("should throw NOT_FOUND when establishment is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(null);

      await expect(service.getBusinessHours("user_1", "est_1")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should merge weekdays including closed days without rows", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          id: "bh1",
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 8, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 17, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);

      const result = await service.getBusinessHours("user_1", "est_1");

      expect(result).toHaveLength(7);
      const tue = result.find((d) => d.weekday === "TUE");
      expect(tue?.closed).toBe(true);
      const mon = result.find((d) => d.weekday === "MON");
      expect(mon?.closed).toBe(false);
      if (mon && !mon.closed) {
        expect(mon.opensAt).toBe("08:00");
        expect(mon.closesAt).toBe("17:00");
      }
    });
  });

  describe("deleteBusinessHourForWeekday", () => {
    it("should delete and return merged hours", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([]);

      await service.deleteBusinessHourForWeekday("user_1", "est_1", "MON");

      expect(vi.mocked(mockRepository.deleteBusinessHourByWeekday)).toHaveBeenCalledWith("est_1", "MON");
    });
  });

  describe("holidays", () => {
    it("should list holidays mapped to ISO date strings", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      const holidayDate = new Date(Date.UTC(2026, 5, 15, 12, 0, 0, 0));
      vi.mocked(mockRepository.findHolidays).mockResolvedValue([
        {
          id: "hol_1",
          date: holidayDate,
          reason: "Feriado",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ]);

      const rows = await service.listHolidays("user_1", "est_1");

      expect(rows).toHaveLength(1);
      expect(rows[0]?.date).toBe("2026-06-15");
      expect(rows[0]?.reason).toBe("Feriado");
    });

    it("should create holiday and return mapped row", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      const holidayDate = new Date(Date.UTC(2026, 7, 1, 0, 0, 0, 0));
      vi.mocked(mockRepository.createHoliday).mockResolvedValue({
        id: "hol_new",
        date: holidayDate,
        reason: "Recesso",
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
        updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      });

      const row = await service.createHoliday("user_1", "est_1", { date: "2026-08-01", reason: "Recesso" });

      expect(row.id).toBe("hol_new");
      expect(row.date).toBe("2026-08-01");
    });

    it("should throw HOLIDAY_DATE_DUPLICATE when prisma returns P2002", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      const prismaError = Object.assign(new Error("dup"), { code: "P2002" });
      vi.mocked(mockRepository.createHoliday).mockRejectedValue(prismaError);

      await expect(
        service.createHoliday("user_1", "est_1", { date: "2026-08-01", reason: "Dup" }),
      ).rejects.toMatchObject({ code: "HOLIDAY_DATE_DUPLICATE" });
    });

    it("should delete holiday when repository returns true", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.deleteHoliday).mockResolvedValue(true);

      await expect(service.deleteHoliday("user_1", "est_1", "hol_1")).resolves.toBeUndefined();
    });

    it("should throw NOT_FOUND when holiday delete misses", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.deleteHoliday).mockResolvedValue(false);

      await expect(service.deleteHoliday("user_1", "est_1", "hol_x")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("blocks", () => {
    it("should list blocks mapped to ISO strings", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findBlocks).mockResolvedValue([
        {
          id: "blk_1",
          scope: "ESTABLISHMENT",
          professionalId: null,
          startsAt: new Date("2026-06-01T10:00:00.000Z"),
          endsAt: new Date("2026-06-01T12:00:00.000Z"),
          reason: "Meeting",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ]);

      const rows = await service.listBlocks("user_1", "est_1");

      expect(rows).toHaveLength(1);
      expect(rows[0]?.scope).toBe("ESTABLISHMENT");
    });

    it("should create establishment block and return conflicts from appointments", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockAppointments.findConfirmedOverlappingInterval).mockResolvedValue([
        {
          id: "apt_1",
          professionalId: "prof_1",
          startAt: new Date("2026-06-01T11:00:00.000Z"),
          endAt: new Date("2026-06-01T11:30:00.000Z"),
          clientName: "Client",
        },
      ]);
      vi.mocked(mockRepository.createBlock).mockResolvedValue({
        id: "blk_2",
        scope: "ESTABLISHMENT",
        professionalId: null,
        startsAt: new Date("2026-06-01T10:00:00.000Z"),
        endsAt: new Date("2026-06-01T18:00:00.000Z"),
        reason: "Closure",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createBlock("user_1", "est_1", {
        scope: "ESTABLISHMENT",
        startsAt: "2026-06-01T10:00:00.000Z",
        endsAt: "2026-06-01T18:00:00.000Z",
        reason: "Closure",
      });

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]?.clientName).toBe("Client");
      expect(vi.mocked(mockAppointments.findConfirmedOverlappingInterval)).toHaveBeenCalledWith(
        "est_1",
        expect.any(Object),
        { type: "ESTABLISHMENT" },
      );
    });

    it("should throw VALIDATION_ERROR when scope is PROFESSIONAL without professionalId", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);

      await expect(
        service.createBlock("user_1", "est_1", {
          scope: "PROFESSIONAL",
          startsAt: "2026-06-01T10:00:00.000Z",
          endsAt: "2026-06-01T18:00:00.000Z",
          reason: "X",
        }),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should delete block when repository returns true", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.deleteBlock).mockResolvedValue(true);

      await expect(service.deleteBlock("user_1", "est_1", "blk_1")).resolves.toBeUndefined();
    });

    it("should throw NOT_FOUND when block delete misses", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.deleteBlock).mockResolvedValue(false);

      await expect(service.deleteBlock("user_1", "est_1", "blk_x")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("listProfessionalAvailabilities", () => {
    it("should return mapped rows when professional exists", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalAvailabilities).mockResolvedValue([
        {
          id: "pa1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 12, 0, 0, 0)),
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ]);

      const rows = await service.listProfessionalAvailabilities("user_1", "est_1", "prof_1");

      expect(rows).toHaveLength(1);
      expect(rows[0]?.startsAt).toBe("10:00");
      expect(rows[0]?.endsAt).toBe("12:00");
    });

    it("should throw NOT_FOUND when professional is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue(null);

      await expect(service.listProfessionalAvailabilities("user_1", "est_1", "prof_x")).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("replaceProfessionalAvailabilities", () => {
    it("should replace when windows are valid within business hours", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          id: "bh1",
          weekday: "TUE",
          opensAt: new Date(Date.UTC(1970, 0, 1, 8, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.replaceProfessionalAvailabilities).mockResolvedValue([
        {
          id: "pa_new",
          weekday: "TUE",
          startsAt: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 12, 0, 0, 0)),
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ]);

      const rows = await service.replaceProfessionalAvailabilities("user_1", "est_1", "prof_1", [
        { weekday: "TUE", startsAt: "10:00", endsAt: "12:00" },
      ]);

      expect(rows).toHaveLength(1);
      expect(vi.mocked(mockRepository.replaceProfessionalAvailabilities)).toHaveBeenCalledOnce();
    });
  });

  describe("createProfessionalAvailability", () => {
    it("should throw NOT_FOUND when professional is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue(null);

      await expect(
        service.createProfessionalAvailability("user_1", "est_1", "prof_x", {
          weekday: "MON",
          startsAt: "09:00",
          endsAt: "11:00",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should create when window fits business hours and does not overlap", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalAvailabilities).mockResolvedValue([]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          id: "bh1",
          weekday: "WED",
          opensAt: new Date(Date.UTC(1970, 0, 1, 8, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.createProfessionalAvailability).mockResolvedValue({
        id: "pa_new",
        weekday: "WED",
        startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
        endsAt: new Date(Date.UTC(1970, 0, 1, 11, 0, 0, 0)),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const row = await service.createProfessionalAvailability("user_1", "est_1", "prof_1", {
        weekday: "WED",
        startsAt: "09:00",
        endsAt: "11:00",
      });

      expect(row.id).toBe("pa_new");
      expect(vi.mocked(mockRepository.createProfessionalAvailability)).toHaveBeenCalledOnce();
    });

    it("should throw AVAILABILITY_OUTSIDE_BUSINESS_HOURS when weekday is closed", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalAvailabilities).mockResolvedValue([]);
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
          weekday: "FRI",
          startsAt: "09:00",
          endsAt: "11:00",
        }),
      ).rejects.toMatchObject({ code: "AVAILABILITY_OUTSIDE_BUSINESS_HOURS" });
    });

    it("should throw INVALID_AVAILABILITY_WINDOW when end is before start", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalAvailabilities).mockResolvedValue([]);
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
          startsAt: "14:00",
          endsAt: "10:00",
        }),
      ).rejects.toMatchObject({ code: "INVALID_AVAILABILITY_WINDOW" });
    });
  });

  describe("updateProfessionalAvailability", () => {
    it("should throw NOT_FOUND when professional is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue(null);

      await expect(
        service.updateProfessionalAvailability("user_1", "est_1", "prof_x", "pa1", {
          weekday: "MON",
          startsAt: "10:00",
          endsAt: "12:00",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should update when payload is valid", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalAvailabilityById).mockResolvedValue({
        id: "pa1",
        weekday: "MON",
        startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
        endsAt: new Date(Date.UTC(1970, 0, 1, 11, 0, 0, 0)),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });
      vi.mocked(mockRepository.findProfessionalAvailabilities).mockResolvedValue([
        {
          id: "pa1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 11, 0, 0, 0)),
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
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
      vi.mocked(mockRepository.updateProfessionalAvailability).mockResolvedValue({
        id: "pa1",
        weekday: "MON",
        startsAt: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
        endsAt: new Date(Date.UTC(1970, 0, 1, 12, 0, 0, 0)),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      });

      const row = await service.updateProfessionalAvailability("user_1", "est_1", "prof_1", "pa1", {
        weekday: "MON",
        startsAt: "10:00",
        endsAt: "12:00",
      });

      expect(row.startsAt).toBe("10:00");
      expect(vi.mocked(mockRepository.updateProfessionalAvailability)).toHaveBeenCalledOnce();
    });

    it("should throw NOT_FOUND when availability row is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalAvailabilityById).mockResolvedValue(null);

      await expect(
        service.updateProfessionalAvailability("user_1", "est_1", "prof_1", "pa_x", {
          weekday: "MON",
          startsAt: "10:00",
          endsAt: "12:00",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should throw NOT_FOUND when update returns null", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalAvailabilityById).mockResolvedValue({
        id: "pa1",
        weekday: "MON",
        startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
        endsAt: new Date(Date.UTC(1970, 0, 1, 11, 0, 0, 0)),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });
      vi.mocked(mockRepository.findProfessionalAvailabilities).mockResolvedValue([
        {
          id: "pa1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 11, 0, 0, 0)),
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
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
      vi.mocked(mockRepository.updateProfessionalAvailability).mockResolvedValue(null);

      await expect(
        service.updateProfessionalAvailability("user_1", "est_1", "prof_1", "pa1", {
          weekday: "MON",
          startsAt: "10:00",
          endsAt: "12:00",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("deleteProfessionalAvailability", () => {
    it("should throw NOT_FOUND when professional is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue(null);

      await expect(
        service.deleteProfessionalAvailability("user_1", "est_1", "prof_x", "pa1"),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should delete when row exists", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.deleteProfessionalAvailability).mockResolvedValue(true);

      await expect(
        service.deleteProfessionalAvailability("user_1", "est_1", "prof_1", "pa1"),
      ).resolves.toBeUndefined();
    });

    it("should throw NOT_FOUND when delete misses", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.deleteProfessionalAvailability).mockResolvedValue(false);

      await expect(
        service.deleteProfessionalAvailability("user_1", "est_1", "prof_1", "pa_x"),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });
});
