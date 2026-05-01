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
