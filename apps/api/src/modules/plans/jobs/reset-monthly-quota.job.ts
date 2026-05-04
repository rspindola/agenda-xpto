import { plansService } from "~/modules/plans/plans.service.js";

/**
 * BullMQ Worker Job: reset-monthly-quota
 *
 * Scheduled: cron "0 3 1 * *" → Every 1st day of month at 03:00 UTC
 * (This corresponds to midnight in America/Sao_Paulo timezone)
 *
 * LIMITATION: This job uses a fixed UTC time. If users are spread across multiple timezones,
 * the reset may not align perfectly with each user's local "day 1". For MVP, this is acceptable.
 * Future enhancement: implement per-timezone reset via region-based cron jobs or database-driven scheduling.
 *
 * Action: Zeros starterMonthlyAppointmentsCount for all STARTER + ACTIVE subscriptions.
 */
export async function handleResetMonthlyQuotaJob(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("[reset-monthly-quota] Starting monthly quota reset...");

  const count = await plansService.resetMonthlyQuotaForStarterAccounts();

  // eslint-disable-next-line no-console
  console.log(`[reset-monthly-quota] Reset complete. Updated ${String(count)} Starter subscription(s).`);
}
