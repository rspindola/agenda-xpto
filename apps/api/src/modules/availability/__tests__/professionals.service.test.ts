import { PlanType, SubscriptionStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";

import type { ProfessionalsRepository } from "~/modules/availability/professionals.repository.js";
import { ProfessionalsService } from "~/modules/availability/professionals.service.js";

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

const professionalRow = {
  id: "prof_1",
  name: "Alex Barber",
  email: "alex@example.com",
  phone: "+5511999990000",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function buildEstablishmentsRepo(): EstablishmentsRepository {
  return {
    findOwnedById: vi.fn(),
  } as unknown as EstablishmentsRepository;
}

function buildProfessionalsRepo(): ProfessionalsRepository {
  return {
    countActiveByEstablishmentId: vi.fn(),
    create: vi.fn(),
    findAllActiveByEstablishmentId: vi.fn(),
    findActiveByIdInEstablishment: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    hasFutureConfirmedAppointments: vi.fn(),
    countServicesInEstablishment: vi.fn(),
    replaceProfessionalServices: vi.fn(),
  } as unknown as ProfessionalsRepository;
}

describe("ProfessionalsService", () => {
  let establishmentsRepo: EstablishmentsRepository;
  let professionalsRepo: ProfessionalsRepository;
  let findSubscription: ReturnType<typeof vi.fn>;
  let service: ProfessionalsService;

  beforeEach(() => {
    vi.clearAllMocks();
    establishmentsRepo = buildEstablishmentsRepo();
    professionalsRepo = buildProfessionalsRepo();
    findSubscription = vi.fn();
    service = new ProfessionalsService(establishmentsRepo, professionalsRepo, findSubscription);
  });

  describe("create", () => {
    it("should create when under plan limit", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      findSubscription.mockResolvedValue({ planType: PlanType.PRO, status: SubscriptionStatus.ACTIVE });
      vi.mocked(professionalsRepo.countActiveByEstablishmentId).mockResolvedValue(0);
      vi.mocked(professionalsRepo.create).mockResolvedValue(professionalRow);

      const result = await service.create("user_1", "est_1", {
        name: "Alex Barber",
        email: "alex@example.com",
        phone: "+5511999990000",
      });

      expect(result.id).toBe("prof_1");
      expect(vi.mocked(professionalsRepo.create)).toHaveBeenCalledOnce();
    });

    it("should throw NOT_FOUND when establishment is archived", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue({
        ...establishment,
        archivedAt: "2026-02-01T00:00:00.000Z",
      });

      await expect(
        service.create("user_1", "est_1", { name: "X", email: "x@y.com" }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should throw PLAN_LIMIT_REACHED when at cap for Starter", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      findSubscription.mockResolvedValue({ planType: PlanType.STARTER, status: SubscriptionStatus.ACTIVE });
      vi.mocked(professionalsRepo.countActiveByEstablishmentId).mockResolvedValue(2);

      await expect(
        service.create("user_1", "est_1", { name: "Third", email: "third@example.com" }),
      ).rejects.toMatchObject({ code: "PLAN_LIMIT_REACHED" });
    });

    it("should throw SUBSCRIPTION_NOT_FOUND when subscription is missing", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      findSubscription.mockResolvedValue(null);

      await expect(
        service.create("user_1", "est_1", { name: "X", email: "x@y.com" }),
      ).rejects.toMatchObject({ code: "SUBSCRIPTION_NOT_FOUND" });
    });

    it("should throw SUBSCRIPTION_NOT_ACTIVE when subscription is not active", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      findSubscription.mockResolvedValue({ planType: PlanType.PRO, status: SubscriptionStatus.PAST_DUE });

      await expect(
        service.create("user_1", "est_1", { name: "X", email: "x@y.com" }),
      ).rejects.toMatchObject({ code: "SUBSCRIPTION_NOT_ACTIVE" });
    });

    it("should throw PROFESSIONAL_EMAIL_TAKEN when prisma returns P2002", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      findSubscription.mockResolvedValue({ planType: PlanType.BUSINESS, status: SubscriptionStatus.ACTIVE });
      vi.mocked(professionalsRepo.countActiveByEstablishmentId).mockResolvedValue(0);
      const prismaError = Object.assign(new Error("dup"), { code: "P2002" });
      vi.mocked(professionalsRepo.create).mockRejectedValue(prismaError);

      await expect(
        service.create("user_1", "est_1", { name: "X", email: "dup@example.com" }),
      ).rejects.toMatchObject({ code: "PROFESSIONAL_EMAIL_TAKEN" });
    });

    it("should rethrow unexpected errors from repository create", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      findSubscription.mockResolvedValue({ planType: PlanType.BUSINESS, status: SubscriptionStatus.ACTIVE });
      vi.mocked(professionalsRepo.countActiveByEstablishmentId).mockResolvedValue(0);
      vi.mocked(professionalsRepo.create).mockRejectedValue(new Error("database offline"));

      await expect(
        service.create("user_1", "est_1", { name: "X", email: "x@y.com" }),
      ).rejects.toThrow("database offline");
    });
  });

  describe("softDelete", () => {
    it("should throw PROFESSIONAL_HAS_ACTIVE_APPOINTMENTS when future confirmed exist", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(professionalRow);
      vi.mocked(professionalsRepo.hasFutureConfirmedAppointments).mockResolvedValue(true);

      await expect(service.softDelete("user_1", "est_1", "prof_1")).rejects.toMatchObject({
        code: "PROFESSIONAL_HAS_ACTIVE_APPOINTMENTS",
      });
      expect(vi.mocked(professionalsRepo.softDelete)).not.toHaveBeenCalled();
    });

    it("should soft delete when no future appointments", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(professionalRow);
      vi.mocked(professionalsRepo.hasFutureConfirmedAppointments).mockResolvedValue(false);
      vi.mocked(professionalsRepo.softDelete).mockResolvedValue(true);

      await expect(service.softDelete("user_1", "est_1", "prof_1")).resolves.toBeUndefined();
      expect(vi.mocked(professionalsRepo.softDelete)).toHaveBeenCalledWith("est_1", "prof_1");
    });

    it("should throw NOT_FOUND when professional is missing", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(null);

      await expect(service.softDelete("user_1", "est_1", "prof_x")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should throw NOT_FOUND when softDelete returns false", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(professionalRow);
      vi.mocked(professionalsRepo.hasFutureConfirmedAppointments).mockResolvedValue(false);
      vi.mocked(professionalsRepo.softDelete).mockResolvedValue(false);

      await expect(service.softDelete("user_1", "est_1", "prof_1")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("replaceServices", () => {
    it("should throw NOT_FOUND when professional is missing", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(null);

      await expect(
        service.replaceServices("user_1", "est_1", "prof_x", { serviceIds: ["svc_1"] }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should throw INVALID_SERVICE_IDS when a service is not in the establishment", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(professionalRow);
      vi.mocked(professionalsRepo.countServicesInEstablishment).mockResolvedValue(0);

      await expect(
        service.replaceServices("user_1", "est_1", "prof_1", { serviceIds: ["svc_bad"] }),
      ).rejects.toMatchObject({ code: "INVALID_SERVICE_IDS" });
    });

    it("should throw VALIDATION_ERROR when serviceIds contain duplicates", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(professionalRow);

      await expect(
        service.replaceServices("user_1", "est_1", "prof_1", { serviceIds: ["svc_1", "svc_1"] }),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      expect(vi.mocked(professionalsRepo.replaceProfessionalServices)).not.toHaveBeenCalled();
    });

    it("should replace services when all ids belong to the establishment", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(professionalRow);
      vi.mocked(professionalsRepo.countServicesInEstablishment).mockResolvedValue(2);
      vi.mocked(professionalsRepo.replaceProfessionalServices).mockResolvedValue(undefined);

      await service.replaceServices("user_1", "est_1", "prof_1", { serviceIds: ["svc_1", "svc_2"] });

      expect(vi.mocked(professionalsRepo.replaceProfessionalServices)).toHaveBeenCalledWith("prof_1", ["svc_1", "svc_2"]);
    });
  });

  describe("list", () => {
    it("should return mapped professionals", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findAllActiveByEstablishmentId).mockResolvedValue([professionalRow]);

      const rows = await service.list("user_1", "est_1");

      expect(rows).toHaveLength(1);
      expect(rows[0]?.name).toBe("Alex Barber");
    });
  });

  describe("findById", () => {
    it("should return professional when found", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(professionalRow);

      const row = await service.findById("user_1", "est_1", "prof_1");

      expect(row.id).toBe("prof_1");
    });

    it("should throw NOT_FOUND when professional is missing", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(null);

      await expect(service.findById("user_1", "est_1", "prof_x")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("update", () => {
    it("should throw VALIDATION_ERROR when body is empty", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);

      await expect(service.update("user_1", "est_1", "prof_1", {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("should return updated professional on success", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.update).mockResolvedValue({ ...professionalRow, name: "Renamed" });

      const row = await service.update("user_1", "est_1", "prof_1", { name: "Renamed" });

      expect(row.name).toBe("Renamed");
    });

    it("should throw NOT_FOUND when update returns null", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.update).mockResolvedValue(null);

      await expect(service.update("user_1", "est_1", "prof_1", { name: "X" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("should throw PROFESSIONAL_EMAIL_TAKEN when prisma returns P2002", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      const prismaError = Object.assign(new Error("dup"), { code: "P2002" });
      vi.mocked(professionalsRepo.update).mockRejectedValue(prismaError);

      await expect(
        service.update("user_1", "est_1", "prof_1", { email: "taken@example.com" }),
      ).rejects.toMatchObject({ code: "PROFESSIONAL_EMAIL_TAKEN" });
    });

    it("should rethrow unexpected errors from repository update", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.update).mockRejectedValue(new Error("timeout"));

      await expect(service.update("user_1", "est_1", "prof_1", { name: "X" })).rejects.toThrow("timeout");
    });
  });
});
