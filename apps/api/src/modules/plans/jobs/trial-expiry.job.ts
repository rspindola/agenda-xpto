import { plansService } from "~/modules/plans/plans.service.js";

/**
 * BullMQ Worker Job: trial-expiry
 *
 * Scheduled: cron "0 8 * * *" → Daily at 08:00 UTC
 *
 * Action:
 * 1. Find all TRIALING subscriptions with trialEndsAt < now
 * 2. Downgrade each to STARTER (status ACTIVE, reset counter)
 * 3. Enqueue PLAN_CHANGED notification (trial expired)
 *
 * Note: PLAN_CHANGED notifications are ONLY sent on trial expiry (automatic).
 * Manual upgrade/downgrade do NOT trigger notifications (users have UI feedback).
 */
export async function handleTrialExpiryJob(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("[trial-expiry] Starting trial expiry check...");

  const count = await plansService.expireTrialsToStarter();

  // eslint-disable-next-line no-console
  console.log(
    `[trial-expiry] Trial expiry check complete. Downgraded ${String(count)} subscription(s) to STARTER.`,
  );
}
