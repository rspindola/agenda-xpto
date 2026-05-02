import { Queue } from "bullmq";

import { bullmqConnection } from "~/lib/bullmq.js";

export type SendNotificationJobData = {
  notificationId: string;
};

export type ReminderFireJobData = {
  appointmentId: string;
  kind: "REMINDER_24H" | "REMINDER_2H";
};

const NOTIFICATION_SEND_ATTEMPTS = 3;

/** Immediate outbound e-mail jobs; processor loads full context from the database. */
export const notificationsQueue = new Queue<SendNotificationJobData>("notifications", {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: NOTIFICATION_SEND_ATTEMPTS,
    backoff: {
      type: "custom",
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

/** Delayed reminder fires; processor enqueues a row + job on the notifications queue. */
export const remindersQueue = new Queue<ReminderFireJobData>("reminders", {
  connection: bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

/** Cron-style system jobs (quota reset, trial expiry). */
export const systemQueue = new Queue("system", {
  connection: bullmqConnection,
});
