/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unnecessary-type-assertion -- partial repository mocks */
import { PlanType, SubscriptionStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";

import type { ProfessionalsRepository } from "../professionals.repository.js";
import { ProfessionalsService } from "../professionals.service.js";

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
  });

  describe("replaceServices", () => {
    it("should throw INVALID_SERVICE_IDS when a service is not in the establishment", async () => {
      vi.mocked(establishmentsRepo.findOwnedById).mockResolvedValue(establishment);
      vi.mocked(professionalsRepo.findActiveByIdInEstablishment).mockResolvedValue(professionalRow);
      vi.mocked(professionalsRepo.countServicesInEstablishment).mockResolvedValue(0);

      await expect(
        service.replaceServices("user_1", "est_1", "prof_1", { serviceIds: ["svc_bad"] }),
      ).rejects.toMatchObject({ code: "INVALID_SERVICE_IDS" });
    });
  });
});
