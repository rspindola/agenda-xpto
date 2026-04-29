import { PlanType, SubscriptionStatus } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";

const TRIAL_DAYS = 15;

export async function createTrialSubscriptionIfMissing(userId: string): Promise<void> {
  const trialEndsAt = new Date();
  trialEndsAt.setUTCDate(trialEndsAt.getUTCDate() + TRIAL_DAYS);

  await prisma.subscription.createMany({
    data: [
      {
        userId,
        planType: PlanType.PRO,
        status: SubscriptionStatus.TRIALING,
        trialEndsAt,
      },
    ],
    skipDuplicates: true,
  });
}
