import type { PlanType, SubscriptionStatus } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";

export type SubscriptionRow = {
  planType: PlanType;
  status: SubscriptionStatus;
};

export async function findSubscriptionByUserId(userId: string): Promise<SubscriptionRow | null> {
  const row = await prisma.subscription.findUnique({
    where: { userId },
    select: { planType: true, status: true },
  });
  return row;
}
