/* eslint-disable @typescript-eslint/unbound-method -- repository methods are vi.fn() mocks */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { EstablishmentsService, generateSlugFromName } from "~/modules/establishments/establishments.service.js";

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
        planType: "PRO",
        status: "TRIALING",
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
        planType: "STARTER",
        status: "ACTIVE",
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
        planType: "PRO",
        status: "ACTIVE",
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

    it("should use manual slug when it is available", async () => {
      findSubscription.mockResolvedValue({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(mockRepository.countActiveByUserId).mockResolvedValue(0);
      vi.mocked(mockRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue({ ...publicDto, slug: "custom-slug" });

      const result = await service.create("user_1", {
        name: "Shop",
        slug: "custom-slug",
        email: "a@b.com",
        timezone: "UTC",
      });

      expect(result.slug).toBe("custom-slug");
      expect(vi.mocked(mockRepository.findBySlug)).toHaveBeenCalledWith("custom-slug");
    });

    it("should throw SLUG_ALREADY_TAKEN when manual slug already exists", async () => {
      findSubscription.mockResolvedValue({
        planType: "BUSINESS",
        status: "ACTIVE",
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
        planType: "PRO",
        status: "PAST_DUE",
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

    it("should throw SLUG_ALREADY_TAKEN when repository returns P2002", async () => {
      findSubscription.mockResolvedValue({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(mockRepository.countActiveByUserId).mockResolvedValue(0);
      vi.mocked(mockRepository.findBySlug).mockResolvedValue(null);
      const prismaError = Object.assign(new Error("Unique"), { code: "P2002" });
      vi.mocked(mockRepository.create).mockRejectedValue(prismaError);

      await expect(
        service.create("user_1", {
          name: "Shop",
          email: "a@b.com",
          timezone: "UTC",
        }),
      ).rejects.toMatchObject({ code: "SLUG_ALREADY_TAKEN" });
    });
  });

  describe("findById", () => {
    it("should throw NOT_FOUND when establishment belongs to another user", async () => {
      vi.mocked(mockRepository.findOwnedById).mockResolvedValue(null);

      await expect(service.findById("user_1", "est_x")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("update", () => {
    it("should throw VALIDATION_ERROR when body has no defined fields", async () => {
      await expect(service.update("user_1", "est_1", {})).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("should throw SLUG_ALREADY_TAKEN when slug is taken by another establishment", async () => {
      vi.mocked(mockRepository.findBySlugExcludingId).mockResolvedValue({ id: "other" });

      await expect(service.update("user_1", "est_1", { slug: "taken" })).rejects.toMatchObject({
        code: "SLUG_ALREADY_TAKEN",
      });
      expect(vi.mocked(mockRepository.update)).not.toHaveBeenCalled();
    });

    it("should return updated establishment when update succeeds", async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(publicDto);

      const result = await service.update("user_1", "est_1", { name: "Renamed" });

      expect(result).toEqual(publicDto);
      expect(vi.mocked(mockRepository.update)).toHaveBeenCalledWith("user_1", "est_1", { name: "Renamed" });
    });

    it("should throw NOT_FOUND when repository returns null", async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(null);

      await expect(service.update("user_1", "est_1", { name: "X" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("should throw SLUG_ALREADY_TAKEN when repository returns P2002", async () => {
      const prismaError = Object.assign(new Error("Unique"), { code: "P2002" });
      vi.mocked(mockRepository.update).mockRejectedValue(prismaError);

      await expect(service.update("user_1", "est_1", { name: "X" })).rejects.toMatchObject({
        code: "SLUG_ALREADY_TAKEN",
      });
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
