import type { FastifyBaseLogger } from "fastify";
import { Worker } from "bullmq";

import { bullmqConnection } from "~/lib/bullmq.js";
import { processSendNotificationJob } from "~/jobs/process-send-notification.js";
import {
  notificationsQueue,
  remindersQueue,
  type ReminderFireJobData,
  type SendNotificationJobData,
} from "~/jobs/queues.js";
import { parseRetryDelaysMs } from "~/modules/notifications/notifications-retry.js";
import type { NotificationsRepository } from "~/modules/notifications/notifications.repository.js";
import type { NotificationsService } from "~/modules/notifications/notifications.service.js";

export type NotificationWorkersDeps = {
  logger: FastifyBaseLogger;
  notificationsRepository: NotificationsRepository;
  notificationsService: NotificationsService;
};

/**
 * Starts BullMQ workers for outbound e-mails and delayed reminder fires.
 * Call the returned `close` function during Fastify shutdown.
 */
export function startNotificationAndReminderWorkers(deps: NotificationWorkersDeps): () => Promise<void> {
  const sendWorker = new Worker<SendNotificationJobData>(
    notificationsQueue.name,
    (job) =>
      processSendNotificationJob(job, {
        logger: deps.logger,
        repository: deps.notificationsRepository,
        notificationsService: deps.notificationsService,
      }),
    {
      connection: bullmqConnection,
      concurrency: 4,
      settings: {
        backoffStrategy(attemptsMade: number): number {
          const delays = parseRetryDelaysMs();
          const fallback = delays[delays.length - 1] ?? 900_000;
          return delays[attemptsMade] ?? fallback;
        },
      },
    },
  );

  const reminderWorker = new Worker<ReminderFireJobData>(
    remindersQueue.name,
    async (job) => {
      await deps.notificationsService.enqueueReminderNotificationFromWorker(job.data.appointmentId, job.data.kind);
    },
    { connection: bullmqConnection, concurrency: 2 },
  );

  return async (): Promise<void> => {
    await Promise.all([sendWorker.close(), reminderWorker.close()]);
  };
}
