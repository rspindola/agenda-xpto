import { Queue } from "bullmq";
import { bullmqConnection } from "../lib/bullmq.js";

/** Outbound e-mails and reminders (ARCHITECTURE §7). */
export const notificationsQueue = new Queue("notifications", {
  connection: bullmqConnection,
});

/** Cron-style system jobs (quota reset, trial expiry). */
export const systemQueue = new Queue("system", {
  connection: bullmqConnection,
});
