import { prisma } from "~/lib/prisma.js";

/** Same values as Prisma `PlanType` — avoids importing generated `@prisma/client` types in this module. */
export type PlanType = "STARTER" | "PRO" | "BUSINESS";

/** Same values as Prisma `SubscriptionStatus` — avoids importing generated `@prisma/client` types in this module. */
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";

export type SubscriptionRow = {
  planType: PlanType;
  status: SubscriptionStatus;
};

export type SubscriptionQuotaRow = SubscriptionRow & {
  starterMonthlyAppointmentsCount: number;
};

export async function findSubscriptionByUserId(userId: string): Promise<SubscriptionRow | null> {
  const row = await prisma.subscription.findUnique({
    where: { userId },
    select: { planType: true, status: true },
  });
  return row;
}

/**
 * Resolves the owner's subscription for quota checks on public booking (Starter limit).
 */
export async function findSubscriptionQuotaByEstablishmentId(
  establishmentId: string,
): Promise<SubscriptionQuotaRow | null> {
  const establishment = await prisma.establishment.findFirst({
    where: { id: establishmentId, deletedAt: null },
    select: { userId: true },
  });
  if (!establishment) {
    return null;
  }
  const row = await prisma.subscription.findUnique({
    where: { userId: establishment.userId },
    select: { planType: true, status: true, starterMonthlyAppointmentsCount: true },
  });
  return row;
}

/**
 * Increments Starter monthly counter when plan is STARTER and ACTIVE (trial does not increment).
 * Call only inside a transaction after locking the subscription row.
 */
export async function incrementStarterMonthlyCountIfEligible(
  tx: Pick<typeof prisma, "subscription">,
  userId: string,
): Promise<void> {
  const row = await tx.subscription.findUnique({
    where: { userId },
    select: { planType: true, status: true },
  });
  if (row?.planType === "STARTER" && row.status === "ACTIVE") {
    await tx.subscription.update({
      where: { userId },
      data: { starterMonthlyAppointmentsCount: { increment: 1 } },
    });
  }
}

/**
 * Counts active (non-deleted, non-archived) establishments owned by a user.
 */
export async function countActiveEstablishmentsByUserId(userId: string): Promise<number> {
  return prisma.establishment.count({
    where: {
      userId,
      deletedAt: null,
      archivedAt: null,
    },
  });
}

/**
 * Counts active (non-soft-deleted) professionals in an establishment.
 */
export async function countActiveProfessionalsByEstablishmentId(establishmentId: string): Promise<number> {
  return prisma.professional.count({
    where: {
      establishmentId,
      deletedAt: null,
    },
  });
}

/**
 * Finds all subscriptions with trial expiration date in the past and status TRIALING.
 * Used for cron job: trial-expiry.
 */
export async function findAllSubscriptionsWithTrialExpired(now: Date): Promise<Array<{ userId: string; planType: PlanType }>> {
  const rows = await prisma.subscription.findMany({
    where: {
      status: "TRIALING",
      trialEndsAt: {
        lt: now,
      },
    },
    select: {
      userId: true,
      planType: true,
    },
  });
  return rows;
}

/**
 * Updates subscription after trial conversion to paid plan.
 * Sets status to ACTIVE and currentPeriodStart/End (30 days).
 */
export async function updateSubscriptionAfterConversion(
  userId: string,
  planType: PlanType,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      planType,
      status: "ACTIVE",
      currentPeriodStart,
      currentPeriodEnd,
      starterMonthlyAppointmentsCount: 0,
    },
  });
}

/**
 * Updates subscription after downgrade (e.g., downgrade confirm or trial expiry → STARTER).
 * Sets planType and status to ACTIVE; resets Starter counter if destination is STARTER.
 */
export async function updateSubscriptionAfterDowngrade(
  userId: string,
  targetPlanType: PlanType,
): Promise<void> {
  const data: Record<string, unknown> = {
    planType: targetPlanType,
    status: "ACTIVE",
  };
  if (targetPlanType === "STARTER") {
    data.starterMonthlyAppointmentsCount = 0;
    data.starterQuotaPeriodStart = new Date(); // Reset to today UTC
  }
  await prisma.subscription.update({
    where: { userId },
    data,
  });
}

/**
 * Resets starterMonthlyAppointmentsCount to 0 for all STARTER + ACTIVE subscriptions.
 * Called by cron job reset-monthly-quota at 03:00 UTC (midnight America/Sao_Paulo).
 * Returns count of subscriptions updated.
 */
export async function resetMonthlyQuotaForStarterAccounts(): Promise<number> {
  const result = await prisma.subscription.updateMany({
    where: {
      planType: "STARTER",
      status: "ACTIVE",
    },
    data: {
      starterMonthlyAppointmentsCount: 0,
      starterQuotaPeriodStart: new Date(),
    },
  });
  return result.count;
}
