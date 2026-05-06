import { describe, it, expect, vi, beforeEach } from "vitest";

import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { PlansService, type PlansSubscriptionRepository } from "~/modules/plans/plans.service.js";
import { AppError } from "~/shared/errors/AppError.js";

function buildSubscriptionRepository(): PlansSubscriptionRepository {
  return {
    findSubscriptionByUserId: vi.fn(),
    countActiveEstablishmentsByUserId: vi.fn(),
    findSubscriptionQuotaByEstablishmentId: vi.fn(),
    updateSubscriptionAfterConversion: vi.fn(),
    updateSubscriptionAfterDowngrade: vi.fn(),
    countActiveProfessionalsByEstablishmentId: vi.fn(),
    resetMonthlyQuotaForStarterAccounts: vi.fn(),
    findAllSubscriptionsWithTrialExpired: vi.fn(),
  };
}

function buildEstablishmentsRepository(): Pick<EstablishmentsRepository, "findAllActiveByUserId"> {
  return {
    findAllActiveByUserId: vi.fn(),
  };
}

type ActiveEstablishmentRow = Awaited<ReturnType<EstablishmentsRepository["findAllActiveByUserId"]>>[number];

function activeEstablishmentRow(overrides: Partial<ActiveEstablishmentRow> & Pick<ActiveEstablishmentRow, "id">): ActiveEstablishmentRow {
  return {
    name: "Est",
    slug: "est-slug",
    email: "est@example.com",
    phone: null,
    address: null,
    timezone: "UTC",
    minAdvanceMinutes: 60,
    isActive: true,
    operationalEmail: null,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("PlansService", () => {
  let mockSubscription: PlansSubscriptionRepository;
  let mockEstablishments: Pick<EstablishmentsRepository, "findAllActiveByUserId">;
  let plansService: PlansService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscription = buildSubscriptionRepository();
    mockEstablishments = buildEstablishmentsRepository();
    plansService = new PlansService(mockSubscription, mockEstablishments);
  });

  describe("getCurrentPlan", () => {
    it("should return plan with limits and usage for STARTER", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
      });
      vi.mocked(mockSubscription.countActiveEstablishmentsByUserId).mockResolvedValueOnce(1);

      const result = await plansService.getCurrentPlan("user-123");

      expect(result.planType).toBe("STARTER");
      expect(result.status).toBe("ACTIVE");
      expect(result.limits.maxEstablishments).toBe(1);
      expect(result.limits.maxAppointmentsMonth).toBe(100);
    });

    it("should return plan with trial info", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "TRIALING",
      });
      vi.mocked(mockSubscription.countActiveEstablishmentsByUserId).mockResolvedValueOnce(0);

      const result = await plansService.getCurrentPlan("user-123");

      expect(result.status).toBe("TRIALING");
      expect(result.planType).toBe("PRO");
    });

    it("should throw when subscription not found", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce(null);

      await expect(plansService.getCurrentPlan("user-123")).rejects.toThrow(AppError);
    });
  });

  describe("getQuota", () => {
    it("should return quota with no alert when count < 80", async () => {
      vi.mocked(mockSubscription.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 50,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.count).toBe(50);
      expect(result.alertLevel).toBeNull();
    });

    it("should return WARNING_80 alert when count = 80", async () => {
      vi.mocked(mockSubscription.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 80,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.alertLevel).toBe("WARNING_80");
    });

    it("should return WARNING_90 alert when count = 90", async () => {
      vi.mocked(mockSubscription.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 90,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.alertLevel).toBe("WARNING_90");
    });

    it("should return LIMIT_REACHED alert when count >= 100", async () => {
      vi.mocked(mockSubscription.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 100,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.alertLevel).toBe("LIMIT_REACHED");
    });

    it("should return unlimited for PRO plan", async () => {
      vi.mocked(mockSubscription.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 0,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.limit).toBe(-1);
      expect(result.alertLevel).toBeNull();
    });
  });

  describe("convertTrial", () => {
    it("should convert trial to STARTER", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "TRIALING",
      });
      vi.mocked(mockSubscription.updateSubscriptionAfterConversion).mockResolvedValueOnce(undefined);

      await plansService.convertTrial("user-123", "STARTER");

      expect(mockSubscription.updateSubscriptionAfterConversion).toHaveBeenCalledWith(
        "user-123",
        "STARTER",
        expect.any(Date),
        expect.any(Date),
      );
    });

    it("should throw ALREADY_ACTIVE when status is not TRIALING", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
      });

      await expect(plansService.convertTrial("user-123", "PRO")).rejects.toMatchObject({
        statusCode: 422,
        code: "ALREADY_ACTIVE",
      });
    });

    it("should throw when subscription not found", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce(null);

      await expect(plansService.convertTrial("user-123", "PRO")).rejects.toThrow(AppError);
    });
  });

  describe("upgradeImmediate", () => {
    it("should upgrade PRO to BUSINESS", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(mockSubscription.updateSubscriptionAfterConversion).mockResolvedValueOnce(undefined);

      await plansService.upgradeImmediate("user-123", "BUSINESS");

      expect(mockSubscription.updateSubscriptionAfterConversion).toHaveBeenCalled();
    });

    it("should throw USE_DOWNGRADE_ENDPOINT when trying to downgrade", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });

      await expect(plansService.upgradeImmediate("user-123", "STARTER")).rejects.toMatchObject({
        code: "USE_DOWNGRADE_ENDPOINT",
      });
    });
  });

  describe("downgradeWithConflictCheck", () => {
    it("should return empty conflicts when no conflicts exist", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(mockSubscription.countActiveEstablishmentsByUserId).mockResolvedValueOnce(1);
      vi.mocked(mockEstablishments.findAllActiveByUserId).mockResolvedValueOnce([
        activeEstablishmentRow({ id: "est-1", name: "Est 1" }),
      ]);
      vi.mocked(mockSubscription.countActiveProfessionalsByEstablishmentId).mockResolvedValueOnce(2);

      const conflicts = await plansService.downgradeWithConflictCheck("user-123", "STARTER");

      expect(conflicts).toHaveLength(0);
    });

    it("should return ESTABLISHMENT_EXCESS conflict when too many establishments", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(mockSubscription.countActiveEstablishmentsByUserId).mockResolvedValueOnce(3);
      vi.mocked(mockEstablishments.findAllActiveByUserId).mockResolvedValueOnce([]);

      const conflicts = await plansService.downgradeWithConflictCheck("user-123", "STARTER");

      expect(conflicts).toContainEqual(
        expect.objectContaining({
          type: "ESTABLISHMENT_EXCESS",
          current: 3,
          allowed: 1,
        }),
      );
    });

    it("should return PROFESSIONAL_EXCESS conflict when too many professionals", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(mockSubscription.countActiveEstablishmentsByUserId).mockResolvedValueOnce(1);
      vi.mocked(mockEstablishments.findAllActiveByUserId).mockResolvedValueOnce([activeEstablishmentRow({ id: "est-1" })]);
      vi.mocked(mockSubscription.countActiveProfessionalsByEstablishmentId).mockResolvedValueOnce(5);

      const conflicts = await plansService.downgradeWithConflictCheck("user-123", "STARTER");

      expect(conflicts).toContainEqual(
        expect.objectContaining({
          type: "PROFESSIONAL_EXCESS",
          current: 5,
          allowed: 2,
        }),
      );
    });

    it("should throw NOT_A_DOWNGRADE when target is same or higher tier", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });

      await expect(plansService.downgradeWithConflictCheck("user-123", "BUSINESS")).rejects.toMatchObject({
        code: "NOT_A_DOWNGRADE",
      });
    });
  });

  describe("downgradeConfirmWithValidation", () => {
    it("should confirm downgrade when no conflicts exist", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(mockSubscription.countActiveEstablishmentsByUserId).mockResolvedValueOnce(1);
      vi.mocked(mockEstablishments.findAllActiveByUserId).mockResolvedValueOnce([activeEstablishmentRow({ id: "est-1" })]);
      vi.mocked(mockSubscription.countActiveProfessionalsByEstablishmentId).mockResolvedValueOnce(2);
      vi.mocked(mockSubscription.updateSubscriptionAfterDowngrade).mockResolvedValueOnce(undefined);

      await plansService.downgradeConfirmWithValidation("user-123", "STARTER");

      expect(mockSubscription.updateSubscriptionAfterDowngrade).toHaveBeenCalledWith("user-123", "STARTER");
    });

    it("should throw DOWNGRADE_CONFLICTS_NOT_RESOLVED when conflicts persist", async () => {
      vi.mocked(mockSubscription.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(mockSubscription.countActiveEstablishmentsByUserId).mockResolvedValueOnce(3);
      vi.mocked(mockEstablishments.findAllActiveByUserId).mockResolvedValueOnce([]);

      await expect(plansService.downgradeConfirmWithValidation("user-123", "STARTER")).rejects.toMatchObject({
        code: "DOWNGRADE_CONFLICTS_NOT_RESOLVED",
      });
    });
  });

  describe("resetMonthlyQuotaForStarterAccounts", () => {
    it("should call repository to reset quota", async () => {
      vi.mocked(mockSubscription.resetMonthlyQuotaForStarterAccounts).mockResolvedValueOnce(5);

      const count = await plansService.resetMonthlyQuotaForStarterAccounts();

      expect(count).toBe(5);
      expect(mockSubscription.resetMonthlyQuotaForStarterAccounts).toHaveBeenCalled();
    });
  });

  describe("expireTrialsToStarter", () => {
    it("should downgrade expired trials to STARTER", async () => {
      vi.mocked(mockSubscription.findAllSubscriptionsWithTrialExpired).mockResolvedValueOnce([
        { userId: "user-1", planType: "PRO" },
        { userId: "user-2", planType: "PRO" },
      ]);
      vi.mocked(mockSubscription.updateSubscriptionAfterDowngrade).mockResolvedValue(undefined);

      const count = await plansService.expireTrialsToStarter();

      expect(count).toBe(2);
      expect(mockSubscription.updateSubscriptionAfterDowngrade).toHaveBeenCalledTimes(2);
    });

    it("should handle empty expired trials list", async () => {
      vi.mocked(mockSubscription.findAllSubscriptionsWithTrialExpired).mockResolvedValueOnce([]);

      const count = await plansService.expireTrialsToStarter();

      expect(count).toBe(0);
    });
  });
});
