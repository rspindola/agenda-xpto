import { describe, it, expect, vi, beforeEach, beforeAll, type MockInstance } from "vitest";

import * as subscriptionRepository from "~/modules/plans/subscription.repository.js";
import type { SubscriptionQuotaRow } from "~/modules/plans/subscription.repository.js";
import { AppError } from "~/shared/errors/AppError.js";

import type { BookingRepository } from "~/modules/booking/booking.repository.js";
import { BookingService } from "~/modules/booking/booking.service.js";

const fixedNow = new Date("2026-05-15T12:00:00.000Z");

const mockRepository: BookingRepository = {
  findEstablishmentBySlug: vi.fn(),
  findEstablishmentByIdForOwner: vi.fn(),
  findPublicServices: vi.fn(),
  findPublicProfessionals: vi.fn(),
  findServicesByIds: vi.fn(),
  findProfessionalIdsOfferingAllServices: vi.fn(),
  findProfessionalInEstablishment: vi.fn(),
  findBusinessHours: vi.fn(),
  findHolidayOnDate: vi.fn(),
  findBlocksOverlapping: vi.fn(),
  findConfirmedAppointmentsInRange: vi.fn(),
  findAvailabilitiesForProfessionalsOnWeekday: vi.fn(),
  createPublicAppointment: vi.fn(),
  createManualDashboardAppointment: vi.fn(),
  cancelAppointmentByToken: vi.fn(),
  findProfessionalServicePrices: vi.fn(),
} as unknown as BookingRepository;

type FindSubscriptionQuotaByEstablishmentId = (
  establishmentId: string,
) => Promise<SubscriptionQuotaRow | null>;

describe("BookingService", () => {
  let service: BookingService;
  let subscriptionQuotaSpy: MockInstance<FindSubscriptionQuotaByEstablishmentId>;

  beforeAll(() => {
    subscriptionQuotaSpy = vi.spyOn(subscriptionRepository, "findSubscriptionQuotaByEstablishmentId");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    subscriptionQuotaSpy.mockResolvedValue({
      planType: "PRO",
      status: "TRIALING",
      starterMonthlyAppointmentsCount: 0,
    });
    service = new BookingService(mockRepository);
  });

  describe("getEstablishmentBySlug", () => {
    it("should throw NOT_FOUND when slug does not exist or establishment is not publicly bookable", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(null);

      await expect(service.getEstablishmentBySlug("missing-slug")).rejects.toMatchObject({
        code: "NOT_FOUND",
        statusCode: 404,
      });
    });

    it("should return establishment, services, and professionals when slug exists", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue({
        id: "est_1",
        userId: "user_1",
        name: "Shop",
        slug: "shop",
        phone: "+5511999990000",
        address: "Rua A",
        timezone: "America/Sao_Paulo",
        minAdvanceMinutes: 30,
      });
      vi.mocked(mockRepository.findPublicServices).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findPublicProfessionals).mockResolvedValue([{ id: "prof_1", name: "Alex" }]);

      const result = await service.getEstablishmentBySlug("shop");

      expect(result.establishment.name).toBe("Shop");
      expect(result.establishment.slug).toBe("shop");
      expect(result.services).toHaveLength(1);
      expect(result.professionals).toHaveLength(1);
      expect(vi.mocked(mockRepository.findPublicServices)).toHaveBeenCalledWith("est_1");
    });
  });

  describe("getAvailableSlots", () => {
    const establishment = {
      id: "est_1",
      userId: "user_1",
      name: "Shop",
      slug: "shop",
      phone: null,
      address: null,
      timezone: "America/Sao_Paulo",
      minAdvanceMinutes: 60,
    };

    it("should return empty list when establishment is closed on the day", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          weekday: "TUE",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.findHolidayOnDate).mockResolvedValue(false);
      vi.mocked(mockRepository.findBlocksOverlapping).mockResolvedValue([]);
      vi.mocked(mockRepository.findConfirmedAppointmentsInRange).mockResolvedValue([]);
      vi.mocked(mockRepository.findAvailabilitiesForProfessionalsOnWeekday).mockResolvedValue([
        {
          professionalId: "prof_1",
          weekday: "TUE",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        },
      ]);

      const slots = await service.getAvailableSlots(
        "shop",
        { date: "2026-05-18", serviceIds: ["svc_1"] },
        fixedNow,
      );

      expect(slots).toEqual([]);
    });

    it("should return empty list when there is a holiday on that date", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.findHolidayOnDate).mockResolvedValue(true);

      const slots = await service.getAvailableSlots(
        "shop",
        { date: "2026-05-18", serviceIds: ["svc_1"] },
        fixedNow,
      );

      expect(slots).toEqual([]);
      expect(mockRepository.findBlocksOverlapping).not.toHaveBeenCalled();
    });

    it("should exclude slot starts before minimum advance from now", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue({
        ...establishment,
        minAdvanceMinutes: 7 * 24 * 60,
      });
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.findHolidayOnDate).mockResolvedValue(false);
      vi.mocked(mockRepository.findBlocksOverlapping).mockResolvedValue([]);
      vi.mocked(mockRepository.findConfirmedAppointmentsInRange).mockResolvedValue([]);
      vi.mocked(mockRepository.findAvailabilitiesForProfessionalsOnWeekday).mockResolvedValue([
        {
          professionalId: "prof_1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        },
      ]);

      const slots = await service.getAvailableSlots(
        "shop",
        { date: "2026-05-18", serviceIds: ["svc_1"] },
        fixedNow,
      );

      expect(slots.length).toBe(0);
    });

    it("should exclude intervals blocked by CONFIRMED appointments", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 60, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.findHolidayOnDate).mockResolvedValue(false);
      vi.mocked(mockRepository.findBlocksOverlapping).mockResolvedValue([]);
      vi.mocked(mockRepository.findConfirmedAppointmentsInRange).mockResolvedValue([
        {
          id: "appt_1",
          professionalId: "prof_1",
          startAt: new Date("2026-05-18T14:00:00.000Z"),
          endAt: new Date("2026-05-18T15:00:00.000Z"),
        },
      ]);
      vi.mocked(mockRepository.findAvailabilitiesForProfessionalsOnWeekday).mockResolvedValue([
        {
          professionalId: "prof_1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        },
      ]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });

      const slots = await service.getAvailableSlots(
        "shop",
        { date: "2026-05-18", serviceIds: ["svc_1"], professionalId: "prof_1" },
        new Date("2026-05-18T08:00:00.000Z"),
      );

      const blockedStart = "2026-05-18T14:00:00.000Z";
      expect(slots.some((s) => s.startAt === blockedStart)).toBe(false);
    });

    it("should throw NOT_FOUND when establishment slug is unknown", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(null);
      await expect(service.getAvailableSlots("x", { date: "2026-05-18", serviceIds: ["svc_1"] }, fixedNow)).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("should throw VALIDATION_ERROR when one or more service ids are invalid", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([]);
      await expect(
        service.getAvailableSlots("shop", { date: "2026-05-18", serviceIds: ["svc_missing"] }, fixedNow),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw VALIDATION_ERROR when total duration is not positive", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_0", name: "Zero", durationMinutes: 0, priceCents: 0, catalogCombo: false },
      ]);
      await expect(
        service.getAvailableSlots("shop", { date: "2026-05-18", serviceIds: ["svc_0"] }, fixedNow),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw VALIDATION_ERROR when date is not a valid local calendar day", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      await expect(
        service.getAvailableSlots("shop", { date: "not-a-date", serviceIds: ["svc_1"] }, fixedNow),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw VALIDATION_ERROR when professionalId is not found", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue(null);
      await expect(
        service.getAvailableSlots(
          "shop",
          { date: "2026-05-18", serviceIds: ["svc_1"], professionalId: "prof_unknown" },
          fixedNow,
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw VALIDATION_ERROR when professional cannot perform all services", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_2" });
      await expect(
        service.getAvailableSlots(
          "shop",
          { date: "2026-05-18", serviceIds: ["svc_1"], professionalId: "prof_2" },
          fixedNow,
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should return empty slots when no professional can perform all services", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue([]);
      const slots = await service.getAvailableSlots("shop", { date: "2026-05-18", serviceIds: ["svc_1"] }, fixedNow);
      expect(slots).toEqual([]);
      expect(mockRepository.findAvailabilitiesForProfessionalsOnWeekday).not.toHaveBeenCalled();
    });

    it("should subtract establishment-wide blocks from availability", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.findHolidayOnDate).mockResolvedValue(false);
      vi.mocked(mockRepository.findBlocksOverlapping).mockResolvedValue([
        {
          scope: "ESTABLISHMENT",
          professionalId: null,
          startsAt: new Date("2026-05-18T03:00:00.000Z"),
          endsAt: new Date("2026-05-19T03:00:00.000Z"),
        },
      ]);
      vi.mocked(mockRepository.findConfirmedAppointmentsInRange).mockResolvedValue([]);
      vi.mocked(mockRepository.findAvailabilitiesForProfessionalsOnWeekday).mockResolvedValue([
        {
          professionalId: "prof_1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        },
      ]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      const slots = await service.getAvailableSlots(
        "shop",
        { date: "2026-05-18", serviceIds: ["svc_1"], professionalId: "prof_1" },
        new Date("2026-05-18T11:00:00.000Z"),
      );
      expect(slots).toEqual([]);
    });

    it("should ignore professional-scoped blocks for other professionals", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 12, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.findHolidayOnDate).mockResolvedValue(false);
      vi.mocked(mockRepository.findBlocksOverlapping).mockResolvedValue([
        {
          scope: "PROFESSIONAL",
          professionalId: "prof_other",
          startsAt: new Date("2026-05-18T12:00:00.000Z"),
          endsAt: new Date("2026-05-18T15:00:00.000Z"),
        },
      ]);
      vi.mocked(mockRepository.findConfirmedAppointmentsInRange).mockResolvedValue([]);
      vi.mocked(mockRepository.findAvailabilitiesForProfessionalsOnWeekday).mockResolvedValue([
        {
          professionalId: "prof_1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 12, 0, 0, 0)),
        },
      ]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      const slots = await service.getAvailableSlots(
        "shop",
        { date: "2026-05-18", serviceIds: ["svc_1"], professionalId: "prof_1" },
        new Date("2026-05-18T11:00:00.000Z"),
      );
      expect(slots.length).toBeGreaterThan(0);
    });

    it("should return available slots when business is open and nothing blocks", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findBusinessHours).mockResolvedValue([
        {
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);
      vi.mocked(mockRepository.findHolidayOnDate).mockResolvedValue(false);
      vi.mocked(mockRepository.findBlocksOverlapping).mockResolvedValue([]);
      vi.mocked(mockRepository.findConfirmedAppointmentsInRange).mockResolvedValue([]);
      vi.mocked(mockRepository.findAvailabilitiesForProfessionalsOnWeekday).mockResolvedValue([
        {
          professionalId: "prof_1",
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        },
      ]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      const slots = await service.getAvailableSlots(
        "shop",
        { date: "2026-05-18", serviceIds: ["svc_1"], professionalId: "prof_1" },
        new Date("2026-05-18T11:00:00.000Z"),
      );
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]?.professionalId).toBe("prof_1");
      expect(slots[0]?.startAt).toMatch(/T/);
    });
  });

  describe("createAppointment", () => {
    const establishment = {
      id: "est_1",
      userId: "user_1",
      name: "Shop",
      slug: "shop",
      phone: null,
      address: null,
      timezone: "America/Sao_Paulo",
      minAdvanceMinutes: 0,
    };

    const body = {
      professionalId: "prof_1",
      serviceIds: ["svc_1"],
      startAt: "2026-06-01T15:00:00.000Z",
      clientName: "Test Client",
      clientEmail: "client@example.com",
      clientPhone: "+5511999990000",
    };

    it("should throw STARTER_QUOTA_EXCEEDED when Starter monthly limit is reached", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalServicePrices).mockResolvedValue(
        new Map([["svc_1", { priceCents: 5000 }]]),
      );

      subscriptionQuotaSpy.mockResolvedValue({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 100,
      });

      await expect(service.createAppointment("shop", body, fixedNow)).rejects.toMatchObject({
        code: "STARTER_QUOTA_EXCEEDED",
        statusCode: 422,
      });
    });

    it("should throw SLOT_NOT_AVAILABLE when slot is taken at commit time", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalServicePrices).mockResolvedValue(
        new Map([["svc_1", { priceCents: 5000 }]]),
      );
      vi.mocked(mockRepository.createPublicAppointment).mockRejectedValue(
        new AppError(409, "SLOT_NOT_AVAILABLE", "The selected time slot is no longer available."),
      );

      await expect(service.createAppointment("shop", body, fixedNow)).rejects.toMatchObject({
        code: "SLOT_NOT_AVAILABLE",
        statusCode: 409,
      });
    });

    it("should throw NOT_FOUND when establishment slug is unknown", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(null);
      await expect(service.createAppointment("bad", body, fixedNow)).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should throw VALIDATION_ERROR when services are invalid for establishment", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([]);
      await expect(service.createAppointment("shop", body, fixedNow)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("should throw VALIDATION_ERROR when professional is not eligible for all services", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue([]);
      await expect(service.createAppointment("shop", body, fixedNow)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("should throw VALIDATION_ERROR when professional is not found", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue(null);
      await expect(service.createAppointment("shop", body, fixedNow)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("should throw VALIDATION_ERROR when startAt is not a valid date", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      await expect(
        service.createAppointment(
          "shop",
          { ...body, startAt: "invalid" },
          fixedNow,
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw BOOKING_MIN_ADVANCE_VIOLATION when start is before minimum advance", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue({
        ...establishment,
        minAdvanceMinutes: 120,
      });
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      await expect(
        service.createAppointment(
          "shop",
          { ...body, startAt: "2026-06-01T12:30:00.000Z" },
          new Date("2026-06-01T12:00:00.000Z"),
        ),
      ).rejects.toMatchObject({ code: "BOOKING_MIN_ADVANCE_VIOLATION" });
    });

    it("should throw VALIDATION_ERROR when professional is not linked to a selected service", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
        { id: "svc_2", name: "Beard", durationMinutes: 15, priceCents: 3000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalServicePrices).mockResolvedValue(new Map([["svc_1", { priceCents: 5000 }]]));
      await expect(
        service.createAppointment(
          "shop",
          { ...body, serviceIds: ["svc_1", "svc_2"] },
          fixedNow,
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw VALIDATION_ERROR when loaded services omit an id from body.serviceIds", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
        { id: "svc_1", name: "Cut dup", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalServicePrices).mockResolvedValue(
        new Map([
          ["svc_1", { priceCents: 5000 }],
          ["svc_2", { priceCents: 3000 }],
        ]),
      );

      await expect(
        service.createAppointment(
          "shop",
          { ...body, serviceIds: ["svc_1", "svc_2"] },
          fixedNow,
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should create appointment and return cancel token when repository succeeds", async () => {
      vi.mocked(mockRepository.findEstablishmentBySlug).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalServicePrices).mockResolvedValue(
        new Map([["svc_1", { priceCents: 5000 }]]),
      );
      subscriptionQuotaSpy.mockResolvedValue(null);
      vi.mocked(mockRepository.createPublicAppointment).mockResolvedValue({
        appointmentId: "appt_new",
        establishmentId: establishment.id,
        professionalId: "prof_1",
        startAt: new Date(body.startAt),
        endAt: new Date("2026-06-01T15:30:00.000Z"),
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone,
        cancelToken: "00000000-0000-4000-8000-000000000099",
      });

      const result = await service.createAppointment("shop", body, fixedNow);

      expect(result.id).toBe("appt_new");
      expect(result.cancelToken).toBe("00000000-0000-4000-8000-000000000099");
      expect(vi.mocked(mockRepository.createPublicAppointment)).toHaveBeenCalledOnce();
    });
  });

  describe("createManualDashboardAppointment", () => {
    const establishment = {
      id: "est_1",
      userId: "user_1",
      name: "Shop",
      slug: "shop",
      phone: null,
      address: null,
      timezone: "America/Sao_Paulo",
      minAdvanceMinutes: 0,
    };

    const body = {
      professionalId: "prof_1",
      serviceIds: ["svc_1"],
      startAt: "2026-06-01T15:00:00.000Z",
      clientName: "Test Client",
      clientEmail: "client@example.com",
      clientPhone: "+5511999990000",
    };

    it("should throw NOT_FOUND when establishment is not owned by user", async () => {
      vi.mocked(mockRepository.findEstablishmentByIdForOwner).mockResolvedValue(null);

      await expect(service.createManualDashboardAppointment("user_1", "est_1", body, fixedNow)).rejects.toMatchObject(
        { code: "NOT_FOUND" },
      );
    });

    it("should succeed without Starter quota check and omit cancel token in response", async () => {
      vi.mocked(mockRepository.findEstablishmentByIdForOwner).mockResolvedValue(establishment);
      vi.mocked(mockRepository.findServicesByIds).mockResolvedValue([
        { id: "svc_1", name: "Cut", durationMinutes: 30, priceCents: 5000, catalogCombo: false },
      ]);
      vi.mocked(mockRepository.findProfessionalIdsOfferingAllServices).mockResolvedValue(["prof_1"]);
      vi.mocked(mockRepository.findProfessionalInEstablishment).mockResolvedValue({ id: "prof_1" });
      vi.mocked(mockRepository.findProfessionalServicePrices).mockResolvedValue(
        new Map([["svc_1", { priceCents: 5000 }]]),
      );
      vi.mocked(mockRepository.createManualDashboardAppointment).mockResolvedValue({
        appointmentId: "appt_manual",
        professionalId: "prof_1",
        startAt: new Date(body.startAt),
        endAt: new Date("2026-06-01T15:30:00.000Z"),
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone,
      });

      subscriptionQuotaSpy.mockResolvedValue({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 100,
      });

      const result = await service.createManualDashboardAppointment("user_1", "est_1", body, fixedNow);

      expect(result.id).toBe("appt_manual");
      expect("cancelToken" in result).toBe(false);
      expect(vi.mocked(mockRepository.createManualDashboardAppointment)).toHaveBeenCalledOnce();
      expect(vi.mocked(mockRepository.createPublicAppointment)).not.toHaveBeenCalled();
    });
  });

  describe("assertStartAtMeetsMinAdvance", () => {
    it("should throw BOOKING_MIN_ADVANCE_VIOLATION when start is before minimum advance", () => {
      const now = new Date("2026-06-01T12:00:00.000Z");
      const tooSoon = new Date("2026-06-01T12:30:00.000Z");
      try {
        service.assertStartAtMeetsMinAdvance(120, tooSoon, now);
        expect.fail("expected throw");
      } catch (error: unknown) {
        expect(error).toMatchObject({ code: "BOOKING_MIN_ADVANCE_VIOLATION" });
      }
    });

    it("should not throw when start respects minimum advance", () => {
      const now = new Date("2026-06-01T12:00:00.000Z");
      const ok = new Date("2026-06-01T14:00:00.000Z");
      expect(() => {
        service.assertStartAtMeetsMinAdvance(120, ok, now);
      }).not.toThrow();
    });
  });

  describe("cancelAppointment", () => {
    it("should throw INVALID_CANCEL_TOKEN when cancel token was already used", async () => {
      vi.mocked(mockRepository.cancelAppointmentByToken).mockRejectedValue(
        new AppError(422, "INVALID_CANCEL_TOKEN", "This cancellation link is no longer valid."),
      );

      await expect(service.cancelAppointment("00000000-0000-4000-8000-000000000001")).rejects.toMatchObject({
        code: "INVALID_CANCEL_TOKEN",
        statusCode: 422,
      });
    });

    it("should throw APPOINTMENT_NOT_CANCELLABLE when appointment status is not CONFIRMED", async () => {
      vi.mocked(mockRepository.cancelAppointmentByToken).mockRejectedValue(
        new AppError(422, "APPOINTMENT_NOT_CANCELLABLE", "This appointment cannot be cancelled."),
      );

      await expect(service.cancelAppointment("00000000-0000-4000-8000-000000000002")).rejects.toMatchObject({
        code: "APPOINTMENT_NOT_CANCELLABLE",
        statusCode: 422,
      });
    });

    it("should return cancellation summary when repository succeeds", async () => {
      vi.mocked(mockRepository.cancelAppointmentByToken).mockResolvedValue({
        appointmentId: "appt_1",
        establishmentName: "Shop",
        startAt: new Date("2026-06-01T15:00:00.000Z"),
        endAt: new Date("2026-06-01T15:30:00.000Z"),
        clientName: "Maria",
      });

      const result = await service.cancelAppointment("00000000-0000-4000-8000-000000000003");

      expect(result.appointmentId).toBe("appt_1");
      expect(result.establishmentName).toBe("Shop");
      expect(result.clientName).toBe("Maria");
    });
  });
});
