/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { AppError } from "~/shared/errors/AppError.js";
import { PlansService } from "~/modules/plans/plans.service.js";
import * as subscriptionRepository from "~/modules/plans/subscription.repository.js";

// Mock the repository and establishments repository
vi.mock("~/modules/plans/subscription.repository.js");
vi.mock("~/modules/establishments/establishments.repository.js");

// eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/unbound-method, @typescript-eslint/no-unused-vars

describe("PlansService", () => {
  let plansService: PlansService;

  beforeEach(() => {
    vi.clearAllMocks();
    plansService = new PlansService();
  });

  describe("getCurrentPlan", () => {
    it("should return plan with limits and usage for STARTER", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
      });
      vi.mocked(subscriptionRepository.countActiveEstablishmentsByUserId).mockResolvedValueOnce(1);

      const result = await plansService.getCurrentPlan("user-123");

      expect(result.planType).toBe("STARTER");
      expect(result.status).toBe("ACTIVE");
      expect(result.limits.maxEstablishments).toBe(1);
      expect(result.limits.maxAppointmentsMonth).toBe(100);
    });

    it("should return plan with trial info", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "TRIALING",
      });
      vi.mocked(subscriptionRepository.countActiveEstablishmentsByUserId).mockResolvedValueOnce(0);

      const result = await plansService.getCurrentPlan("user-123");

      expect(result.status).toBe("TRIALING");
      expect(result.planType).toBe("PRO");
    });

    it("should throw when subscription not found", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce(null);

      await expect(plansService.getCurrentPlan("user-123")).rejects.toThrow(AppError);
    });
  });

  describe("getQuota", () => {
    it("should return quota with no alert when count < 80", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 50,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.count).toBe(50);
      expect(result.alertLevel).toBeNull();
    });

    it("should return WARNING_80 alert when count = 80", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 80,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.alertLevel).toBe("WARNING_80");
    });

    it("should return WARNING_90 alert when count = 90", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 90,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.alertLevel).toBe("WARNING_90");
    });

    it("should return LIMIT_REACHED alert when count >= 100", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
        starterMonthlyAppointmentsCount: 100,
      });

      const result = await plansService.getQuota("est-123");

      expect(result.alertLevel).toBe("LIMIT_REACHED");
    });

    it("should return unlimited for PRO plan", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionQuotaByEstablishmentId).mockResolvedValueOnce({
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
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "TRIALING",
      });
      vi.mocked(subscriptionRepository.updateSubscriptionAfterConversion).mockResolvedValueOnce(undefined);

      await plansService.convertTrial("user-123", "STARTER");

      expect(subscriptionRepository.updateSubscriptionAfterConversion).toHaveBeenCalledWith(
        "user-123",
        "STARTER",
        expect.any(Date),
        expect.any(Date),
      );
    });

    it("should throw ALREADY_ACTIVE when status is not TRIALING", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "STARTER",
        status: "ACTIVE",
      });

      await expect(plansService.convertTrial("user-123", "PRO")).rejects.toThrow(
        expect.objectContaining({ statusCode: 422, code: "ALREADY_ACTIVE" }),
      );
    });

    it("should throw when subscription not found", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce(null);

      await expect(plansService.convertTrial("user-123", "PRO")).rejects.toThrow(AppError);
    });
  });

  describe("upgradeImmediate", () => {
    it("should upgrade PRO to BUSINESS", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(subscriptionRepository.updateSubscriptionAfterConversion).mockResolvedValueOnce(undefined);

      await plansService.upgradeImmediate("user-123", "BUSINESS");

      expect(subscriptionRepository.updateSubscriptionAfterConversion).toHaveBeenCalled();
    });

    it("should throw USE_DOWNGRADE_ENDPOINT when trying to downgrade", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });

      await expect(plansService.upgradeImmediate("user-123", "STARTER")).rejects.toThrow(
        expect.objectContaining({ code: "USE_DOWNGRADE_ENDPOINT" }),
      );
    });
  });

  describe("downgradeWithConflictCheck", () => {
    it("should return empty conflicts when no conflicts exist", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(subscriptionRepository.countActiveEstablishmentsByUserId).mockResolvedValueOnce(1);
      vi.mocked(((plansService as unknown) as Record<string, unknown>).establishmentsRepository as any).findAllActiveByUserId.mockResolvedValueOnce([
        { id: "est-1", name: "Est 1" } as any,
      ]);
      vi.mocked(subscriptionRepository.countActiveProfessionalsByEstablishmentId).mockResolvedValueOnce(2);

      const conflicts = await plansService.downgradeWithConflictCheck("user-123", "STARTER");

      expect(conflicts).toHaveLength(0);
    });

    it("should return ESTABLISHMENT_EXCESS conflict when too many establishments", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(subscriptionRepository.countActiveEstablishmentsByUserId).mockResolvedValueOnce(3);
      vi.mocked(((plansService as unknown) as Record<string, unknown>).establishmentsRepository as any).findAllActiveByUserId.mockResolvedValueOnce([]);

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
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(subscriptionRepository.countActiveEstablishmentsByUserId).mockResolvedValueOnce(1);
      vi.mocked(((plansService as unknown) as Record<string, unknown>).establishmentsRepository as any).findAllActiveByUserId.mockResolvedValueOnce([
        { id: "est-1" } as any,
      ]);
      vi.mocked(subscriptionRepository.countActiveProfessionalsByEstablishmentId).mockResolvedValueOnce(5);

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
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });

      await expect(plansService.downgradeWithConflictCheck("user-123", "BUSINESS")).rejects.toThrow(
        expect.objectContaining({ code: "NOT_A_DOWNGRADE" }),
      );
    });
  });

  describe("downgradeConfirmWithValidation", () => {
    it("should confirm downgrade when no conflicts exist", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(subscriptionRepository.countActiveEstablishmentsByUserId).mockResolvedValueOnce(1);
      vi.mocked(((plansService as unknown) as Record<string, unknown>).establishmentsRepository as any).findAllActiveByUserId.mockResolvedValueOnce([
        { id: "est-1" } as any,
      ]);
      vi.mocked(subscriptionRepository.countActiveProfessionalsByEstablishmentId).mockResolvedValueOnce(2);
      vi.mocked(subscriptionRepository.updateSubscriptionAfterDowngrade).mockResolvedValueOnce(undefined);

      await plansService.downgradeConfirmWithValidation("user-123", "STARTER");

      expect(subscriptionRepository.updateSubscriptionAfterDowngrade).toHaveBeenCalledWith("user-123", "STARTER");
    });

    it("should throw DOWNGRADE_CONFLICTS_NOT_RESOLVED when conflicts persist", async () => {
      vi.mocked(subscriptionRepository.findSubscriptionByUserId).mockResolvedValueOnce({
        planType: "PRO",
        status: "ACTIVE",
      });
      vi.mocked(subscriptionRepository.countActiveEstablishmentsByUserId).mockResolvedValueOnce(3);
      vi.mocked(((plansService as unknown) as Record<string, unknown>).establishmentsRepository as any).findAllActiveByUserId.mockResolvedValueOnce([]);

      await expect(plansService.downgradeConfirmWithValidation("user-123", "STARTER")).rejects.toThrow(
        expect.objectContaining({ code: "DOWNGRADE_CONFLICTS_NOT_RESOLVED" }),
      );
    });
  });

  describe("resetMonthlyQuotaForStarterAccounts", () => {
    it("should call repository to reset quota", async () => {
      vi.mocked(subscriptionRepository.resetMonthlyQuotaForStarterAccounts).mockResolvedValueOnce(5);

      const count = await plansService.resetMonthlyQuotaForStarterAccounts();

      expect(count).toBe(5);
      expect(subscriptionRepository.resetMonthlyQuotaForStarterAccounts).toHaveBeenCalled();
    });
  });

  describe("expireTrialsToStarter", () => {
    it("should downgrade expired trials to STARTER", async () => {
      vi.mocked(subscriptionRepository.findAllSubscriptionsWithTrialExpired).mockResolvedValueOnce([
        { userId: "user-1", planType: "PRO" },
        { userId: "user-2", planType: "PRO" },
      ]);
      vi.mocked(subscriptionRepository.updateSubscriptionAfterDowngrade).mockResolvedValue(undefined);

      const count = await plansService.expireTrialsToStarter();

      expect(count).toBe(2);
      expect(subscriptionRepository.updateSubscriptionAfterDowngrade).toHaveBeenCalledTimes(2);
    });

    it("should handle empty expired trials list", async () => {
      vi.mocked(subscriptionRepository.findAllSubscriptionsWithTrialExpired).mockResolvedValueOnce([]);

      const count = await plansService.expireTrialsToStarter();

      expect(count).toBe(0);
    });
  });
});
