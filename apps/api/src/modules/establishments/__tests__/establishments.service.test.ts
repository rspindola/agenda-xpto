/* eslint-disable @typescript-eslint/unbound-method -- repository methods are vi.fn() mocks */
import { PlanType, SubscriptionStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EstablishmentsRepository } from "../establishments.repository.js";
import { EstablishmentsService, generateSlugFromName } from "../establishments.service.js";

const publicDto = {
  id: "est_1",
  name: "Downtown Barber Shop",
  slug: "downtown-barber-shop",
  email: "contact@example.com",
  phone: "+5511999990000",
  address: "123 Main St",
  timezone: "America/Sao_Paulo",
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: null,
  archivedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function buildMockRepository(): EstablishmentsRepository {
  return {
    findAllActiveByUserId: vi.fn(),
    findOwnedById: vi.fn(),
    findBySlug: vi.fn(),
    findBySlugExcludingId: vi.fn(),
    countActiveByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setArchivedAt: vi.fn(),
  };
}

describe("generateSlugFromName", () => {
  it("should normalize accents and spaces to hyphenated slug", () => {
    expect(generateSlugFromName("Barbearia do João")).toBe("barbearia-do-joao");
  });

  it("should return establishment when name yields no alphanumeric characters", () => {
    expect(generateSlugFromName("!!!")).toBe("establishment");
  });
});

describe("EstablishmentsService", () => {
  let mockRepository: EstablishmentsRepository;
  let findSubscription: ReturnType<typeof vi.fn>;
  let service: EstablishmentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = buildMockRepository();
    findSubscription = vi.fn();
    service = new EstablishmentsService(mockRepository, findSubscription);
  });

  describe("create", () => {
    it("should create an establishment when active count is below plan limit", async () => {
      findSubscription.mockResolvedValue({
        planType: PlanType.PRO,
        status: SubscriptionStatus.TRIALING,
      });
      vi.mocked(mockRepository.countActiveByUserId).mockResolvedValue(0);
      vi.mocked(mockRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue(publicDto);

      const result = await service.create("user_1", {
        name: "Downtown Barber Shop",
        email: "contact@example.com",
        timezone: "America/Sao_Paulo",
      });

      expect(result.slug).toBe("downtown-barber-shop");
      expect(vi.mocked(mockRepository.create)).toHaveBeenCalledTimes(1);
    });

    it("should throw PLAN_LIMIT_REACHED when active count reaches plan limit", async () => {
      findSubscription.mockResolvedValue({
        planType: PlanType.STARTER,
        status: SubscriptionStatus.ACTIVE,
      });
      vi.mocked(mockRepository.countActiveByUserId).mockResolvedValue(1);

      await expect(
        service.create("user_1", {
          name: "Second Shop",
          email: "a@b.com",
          timezone: "America/Sao_Paulo",
        }),
      ).rejects.toMatchObject({ code: "PLAN_LIMIT_REACHED" });
      expect(vi.mocked(mockRepository.create)).not.toHaveBeenCalled();
    });

    it("should generate slug from name when slug is omitted", async () => {
      findSubscription.mockResolvedValue({
        planType: PlanType.PRO,
        status: SubscriptionStatus.ACTIVE,
      });
      vi.mocked(mockRepository.countActiveByUserId).mockResolvedValue(0);
      vi.mocked(mockRepository.findBySlug).mockResolvedValueOnce({ id: "other" }).mockResolvedValueOnce(null);
      vi.mocked(mockRepository.create).mockResolvedValue({ ...publicDto, slug: "cool-cuts-2" });

      await service.create("user_1", {
        name: "Cool Cuts",
        email: "cool@example.com",
        timezone: "Europe/Lisbon",
      });

      expect(vi.mocked(mockRepository.create)).toHaveBeenCalledWith(
        "user_1",
        expect.objectContaining({ slug: "cool-cuts-2" }),
      );
    });

    it("should throw SLUG_ALREADY_TAKEN when manual slug already exists", async () => {
      findSubscription.mockResolvedValue({
        planType: PlanType.BUSINESS,
        status: SubscriptionStatus.ACTIVE,
      });
      vi.mocked(mockRepository.countActiveByUserId).mockResolvedValue(0);
      vi.mocked(mockRepository.findBySlug).mockResolvedValue({ id: "taken" });

      await expect(
        service.create("user_1", {
          name: "Any",
          slug: "taken-slug",
          email: "a@b.com",
          timezone: "America/Sao_Paulo",
        }),
      ).rejects.toMatchObject({ code: "SLUG_ALREADY_TAKEN" });
    });

    it("should throw SUBSCRIPTION_NOT_ACTIVE when subscription is PAST_DUE", async () => {
      findSubscription.mockResolvedValue({
        planType: PlanType.PRO,
        status: SubscriptionStatus.PAST_DUE,
      });

      await expect(
        service.create("user_1", {
          name: "Shop",
          email: "a@b.com",
          timezone: "UTC",
        }),
      ).rejects.toMatchObject({ code: "SUBSCRIPTION_NOT_ACTIVE" });
    });

    it("should throw SUBSCRIPTION_NOT_FOUND when subscription row is missing", async () => {
      findSubscription.mockResolvedValue(null);

      await expect(
        service.create("user_1", {
          name: "Shop",
          email: "a@b.com",
          timezone: "UTC",
        }),
      ).rejects.toMatchObject({ code: "SUBSCRIPTION_NOT_FOUND" });
    });
  });

  describe("findById", () => {
    it("should throw NOT_FOUND when establishment belongs to another user", async () => {
      vi.mocked(mockRepository.findOwnedById).mockResolvedValue(null);

      await expect(service.findById("user_1", "est_x")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("archive", () => {
    it("should throw NOT_FOUND when establishment belongs to another user", async () => {
      vi.mocked(mockRepository.findOwnedById).mockResolvedValue(null);

      await expect(service.archive("user_1", "est_x")).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(vi.mocked(mockRepository.setArchivedAt)).not.toHaveBeenCalled();
    });

    it("should call setArchivedAt when establishment belongs to the user", async () => {
      vi.mocked(mockRepository.findOwnedById).mockResolvedValue(publicDto);
      vi.mocked(mockRepository.setArchivedAt).mockResolvedValue({ ...publicDto, archivedAt: "2026-02-01T00:00:00.000Z" });

      await service.archive("user_1", "est_1");

      expect(vi.mocked(mockRepository.setArchivedAt)).toHaveBeenCalledTimes(1);
    });
  });
});
