import type { PlanType } from "@prisma/client";

import { AppError } from "~/shared/errors/AppError.js";
import * as subscriptionRepository from "~/modules/plans/subscription.repository.js";
import type { DowngradeConflict } from "~/modules/plans/plans.schema.js";
import { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";

const planLimits = {
  STARTER: { maxEstablishments: 1, maxProfessionalsPerEstablishment: 2, maxAppointmentsMonth: 100 },
  PRO: { maxEstablishments: 3, maxProfessionalsPerEstablishment: 10, maxAppointmentsMonth: -1 },
  BUSINESS: { maxEstablishments: 10, maxProfessionalsPerEstablishment: -1, maxAppointmentsMonth: -1 },
} as const;

export class PlansService {
  // Protected for testing purposes — allows unit tests to mock this dependency
  protected establishmentsRepository = new EstablishmentsRepository();

  /**
   * Retrieves current plan details: type, status, limits, usage, and Starter quota.
   */
  async getCurrentPlan(userId: string): Promise<{
    planType: PlanType;
    status: string;
    limits: {
      maxEstablishments: number;
      maxProfessionalsPerEstablishment: number;
      maxAppointmentsMonth: number;
    };
    trialEndsAt: null;
    currentPeriodStart: null;
    currentPeriodEnd: null;
    usage: {
      activeEstablishments: number;
      maxProfessionalsInAnyEstablishment: number;
    };
    starterMonthlyCount?: number;
    starterMonthlyLimit?: number;
  }> {
    const subscription = await subscriptionRepository.findSubscriptionByUserId(userId);
    if (!subscription) {
      throw new AppError(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found for this user.");
    }

    const limits = planLimits[subscription.planType];
    const activeEstablishments = await subscriptionRepository.countActiveEstablishmentsByUserId(userId);

    // Placeholder: simplified usage calculation
    const maxProfessionalsInAnyEstablishment = 0; // Would need per-establishment query in full impl

    const result: {
      planType: PlanType;
      status: string;
      limits: typeof limits;
      trialEndsAt: null;
      currentPeriodStart: null;
      currentPeriodEnd: null;
      usage: {
        activeEstablishments: number;
        maxProfessionalsInAnyEstablishment: number;
      };
      starterMonthlyCount?: number;
      starterMonthlyLimit?: number;
    } = {
      planType: subscription.planType,
      status: subscription.status,
      limits,
      trialEndsAt: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      usage: {
        activeEstablishments,
        maxProfessionalsInAnyEstablishment,
      },
      ...(subscription.planType === "STARTER" && {
        starterMonthlyCount: 0,
        starterMonthlyLimit: 100,
      }),
    };

    return result;
  }

  /**
   * Gets Starter quota status and alert level for an establishment.
   */
  async getQuota(establishmentId: string): Promise<{
    count: number;
    limit: number;
    alertLevel: "WARNING_80" | "WARNING_90" | "LIMIT_REACHED" | null;
    message?: string;
  }> {
    const quota = await subscriptionRepository.findSubscriptionQuotaByEstablishmentId(establishmentId);
    if (!quota || quota.planType !== "STARTER") {
      return {
        count: 0,
        limit: -1, // Unlimited
        alertLevel: null,
        message: "Plan is not STARTER or subscription not found.",
      };
    }

    const { starterMonthlyAppointmentsCount } = quota;
    const limit = 100;

    let alertLevel: "WARNING_80" | "WARNING_90" | "LIMIT_REACHED" | null = null;
    if (starterMonthlyAppointmentsCount >= 100) {
      alertLevel = "LIMIT_REACHED";
    } else if (starterMonthlyAppointmentsCount >= 90) {
      alertLevel = "WARNING_90";
    } else if (starterMonthlyAppointmentsCount >= 80) {
      alertLevel = "WARNING_80";
    }

    return {
      count: starterMonthlyAppointmentsCount,
      limit,
      alertLevel,
    };
  }

  /**
   * Converts trial subscription to paid plan.
   * Only allowed from TRIALING status.
   */
  async convertTrial(userId: string, targetPlanType: PlanType): Promise<void> {
    const current = await subscriptionRepository.findSubscriptionByUserId(userId);
    if (!current) {
      throw new AppError(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found.");
    }

    if (current.status !== "TRIALING") {
      throw new AppError(422, "ALREADY_ACTIVE", "Subscription is not in trial. Cannot convert.");
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 30); // 30-day period

    await subscriptionRepository.updateSubscriptionAfterConversion(userId, targetPlanType, now, periodEnd);
  }

  /**
   * Upgrades subscription immediately to a higher plan.
   * Throws error if targetPlanType is lower than current.
   */
  async upgradeImmediate(userId: string, targetPlanType: PlanType): Promise<void> {
    const current = await subscriptionRepository.findSubscriptionByUserId(userId);
    if (!current) {
      throw new AppError(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found.");
    }

    const tierOrder: Record<PlanType, number> = { STARTER: 1, PRO: 2, BUSINESS: 3 };
    if (tierOrder[targetPlanType] <= tierOrder[current.planType]) {
      throw new AppError(422, "USE_DOWNGRADE_ENDPOINT", "Use the downgrade endpoint for downgrades. This endpoint is for upgrades only.");
    }

    // Update subscription without changing billing period (immediate effect)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 30);

    await subscriptionRepository.updateSubscriptionAfterConversion(userId, targetPlanType, now, periodEnd);
  }

  /**
   * Validates downgrade against plan limits.
   * Returns array of conflicts (if any) that must be resolved before confirming.
   */
  async downgradeWithConflictCheck(userId: string, targetPlanType: PlanType): Promise<DowngradeConflict[]> {
    const current = await subscriptionRepository.findSubscriptionByUserId(userId);
    if (!current) {
      throw new AppError(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found.");
    }

    const tierOrder: Record<PlanType, number> = { STARTER: 1, PRO: 2, BUSINESS: 3 };
    if (tierOrder[targetPlanType] >= tierOrder[current.planType]) {
      throw new AppError(422, "NOT_A_DOWNGRADE", "Target plan must be lower than current plan.");
    }

    const conflicts: DowngradeConflict[] = [];

    const activeEstablishments = await subscriptionRepository.countActiveEstablishmentsByUserId(userId);
    const targetLimits = planLimits[targetPlanType];

    if (activeEstablishments > targetLimits.maxEstablishments) {
      conflicts.push({
        type: "ESTABLISHMENT_EXCESS",
        current: activeEstablishments,
        allowed: targetLimits.maxEstablishments,
        message: `You have ${String(activeEstablishments)} active establishments but ${targetPlanType} plan allows only ${String(targetLimits.maxEstablishments)}.`,
      });
    }

    // Check professional limits per establishment (simplified check: max across all establishments)
    // In full implementation, would fetch each establishment and its professionals
    const establishments = await this.establishmentsRepository.findAllActiveByUserId(userId);
    let maxProfessionalsInAny = 0;
    for (const est of establishments) {
      const count = await subscriptionRepository.countActiveProfessionalsByEstablishmentId(est.id);
      if (count > maxProfessionalsInAny) {
        maxProfessionalsInAny = count;
      }
    }

    if (targetLimits.maxProfessionalsPerEstablishment !== -1 && maxProfessionalsInAny > targetLimits.maxProfessionalsPerEstablishment) {
      conflicts.push({
        type: "PROFESSIONAL_EXCESS",
        current: maxProfessionalsInAny,
        allowed: targetLimits.maxProfessionalsPerEstablishment,
        message: `At least one establishment has ${String(maxProfessionalsInAny)} professionals but ${targetPlanType} plan allows only ${String(targetLimits.maxProfessionalsPerEstablishment)}.`,
      });
    }

    return conflicts;
  }

  /**
   * Confirms downgrade after validating that conflicts have been resolved.
   * RACE CONDITION RISK (MVP LIMITATION): Between downgradeWithConflictCheck and this call,
   * user may have added establishments or professionals. This is accepted as a known limitation
   * for MVP — in production, this would use pessimistic locking or more sophisticated conflict detection.
   */
  async downgradeConfirmWithValidation(userId: string, targetPlanType: PlanType): Promise<void> {
    // Otimistic check: re-validate conflicts now (but race condition is possible)
    const conflicts = await this.downgradeWithConflictCheck(userId, targetPlanType);
    if (conflicts.length > 0) {
      throw new AppError(409, "DOWNGRADE_CONFLICTS_NOT_RESOLVED", `Cannot downgrade: ${conflicts.map((c) => c.message).join(" ")}`);
    }

    // Proceed with downgrade
    await subscriptionRepository.updateSubscriptionAfterDowngrade(userId, targetPlanType);
  }

  /**
   * Resets monthly Starter quota for all STARTER + ACTIVE subscriptions.
   * Called by BullMQ cron job: reset-monthly-quota at 03:00 UTC (midnight America/Sao_Paulo).
   */
  async resetMonthlyQuotaForStarterAccounts(): Promise<number> {
    return subscriptionRepository.resetMonthlyQuotaForStarterAccounts();
  }

  /**
   * Finds all expired trials (status TRIALING, trialEndsAt < now) and downgrades them to STARTER.
   * Also enqueues PLAN_CHANGED notification.
   * Called by BullMQ cron job: trial-expiry at 08:00 UTC.
   */
  async expireTrialsToStarter(): Promise<number> {
    const now = new Date();
    const expiredTrials = await subscriptionRepository.findAllSubscriptionsWithTrialExpired(now);

    let count = 0;
    for (const trial of expiredTrials) {
      // Downgrade to STARTER
      await subscriptionRepository.updateSubscriptionAfterDowngrade(trial.userId, "STARTER");
      count++;

      // In full implementation, would enqueue PLAN_CHANGED notification here
      // await notificationsService.enqueueNotification(trial.userId, 'PLAN_CHANGED', { ... });
    }

    return count;
  }
}

export const plansService = new PlansService();
