import type { Queue } from "bullmq";

import { logger } from "~/lib/logger.js";
import { handleResetMonthlyQuotaJob } from "~/modules/plans/jobs/reset-monthly-quota.job.js";
import { handleTrialExpiryJob } from "~/modules/plans/jobs/trial-expiry.job.js";

/**
 * Registers all plans-related BullMQ cron jobs.
 * Call from server.ts bootstrap to add repeatable jobs to the system queue.
 */
export async function registerPlansJobs(systemQueue: Queue): Promise<void> {
  // Reset Starter monthly quota: 1st day of month at 03:00 UTC (midnight America/Sao_Paulo)
  await systemQueue.add(
    "reset-monthly-quota",
    {},
    {
      repeat: {
        pattern: "0 3 1 * *", // 03:00 on day 1
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  // Check for expired trials daily: 08:00 UTC
  await systemQueue.add(
    "trial-expiry",
    {},
    {
      repeat: {
        pattern: "0 8 * * *", // 08:00 every day
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

   
  logger.info("Registered reset-monthly-quota and trial-expiry cron jobs");
}

/**
 * Routes job names to handlers.
 * Call from system queue worker in server.ts.
 */
export async function handlePlansSystemJob(jobName: string): Promise<void> {
  if (jobName === "reset-monthly-quota") {
    await handleResetMonthlyQuotaJob();
  } else if (jobName === "trial-expiry") {
    await handleTrialExpiryJob();
  } else {
     
    logger.warn({ jobName }, "Unknown job name");
  }
}
