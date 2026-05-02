import type { FastifyBaseLogger } from "fastify";
import { UnrecoverableError, type Job } from "bullmq";
import { sendTransactionalEmail } from "~/lib/email.js";
import type { SendNotificationJobData } from "~/jobs/queues.js";
import {
  type HandledOutboundNotificationType,
  isHandledOutboundNotificationType,
} from "~/modules/notifications/notifications.constants.js";
import type { NotificationsRepository } from "~/modules/notifications/notifications.repository.js";
import type { NotificationsService } from "~/modules/notifications/notifications.service.js";
import {
  buildAppointmentConfirmationEmail,
  buildCancellationClientEmail,
  buildCancellationOwnerEmail,
  buildOwnerNotificationFailEmail,
  buildPublicCancelRequestUrl,
  buildReminder2hEmail,
  buildReminder24hEmail,
  type AppointmentEmailContext,
} from "~/modules/notifications/notifications.templates.js";

const MAX_SEND_ATTEMPTS = 3;

function truncateErrorMessage(message: string, maxLen: number): string {
  if (message.length <= maxLen) {
    return message;
  }
  return `${message.slice(0, maxLen)}…`;
}

function toAppointmentEmailContext(
  row: NonNullable<Awaited<ReturnType<NotificationsRepository["findAppointmentTemplateContext"]>>>,
  apiBaseUrl: string,
): AppointmentEmailContext {
  return {
    establishmentName: row.establishment.name,
    professionalName: row.professional.name,
    clientName: row.clientName,
    startAtIso: row.startAt.toISOString(),
    endAtIso: row.endAt.toISOString(),
    services: row.appointmentServices.map((s) => ({
      snapshotName: s.snapshotName,
      snapshotDurationMinutes: s.snapshotDurationMinutes,
      snapshotPriceCents: s.snapshotPriceCents,
      sortOrder: s.sortOrder,
    })),
    cancelToken: row.cancelToken,
    cancelRequestUrl: buildPublicCancelRequestUrl(apiBaseUrl, row.cancelToken),
  };
}

function buildPayloadForType(
  type: HandledOutboundNotificationType,
  row: NonNullable<Awaited<ReturnType<NotificationsRepository["findAppointmentTemplateContext"]>>>,
  apiBaseUrl: string,
): { subject: string; text: string } {
  const ctx = toAppointmentEmailContext(row, apiBaseUrl);
  switch (type) {
    case "APPOINTMENT_CONFIRMATION":
      return buildAppointmentConfirmationEmail(ctx);
    case "REMINDER_24H":
      return buildReminder24hEmail(ctx);
    case "REMINDER_2H":
      return buildReminder2hEmail(ctx);
    case "CANCELLATION_CLIENT":
      return buildCancellationClientEmail({
        establishmentName: row.establishment.name,
        clientName: row.clientName,
        startAtIso: row.startAt.toISOString(),
        endAtIso: row.endAt.toISOString(),
      });
    case "CANCELLATION_OWNER":
      return buildCancellationOwnerEmail({
        establishmentName: row.establishment.name,
        clientName: row.clientName,
        startAtIso: row.startAt.toISOString(),
        endAtIso: row.endAt.toISOString(),
      });
    case "OWNER_NOTIFICATION_FAIL":
      return buildOwnerNotificationFailEmail({
        establishmentName: row.establishment.name,
        appointmentId: row.id,
        startAtIso: row.startAt.toISOString(),
      });
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unhandled outbound template branch: ${String(_exhaustive)}`);
    }
  }
}

const NON_RETRYABLE_ERROR_CODES = new Set(["validation_error", "ValidationError"]);

export type ProcessSendNotificationDeps = {
  logger: FastifyBaseLogger;
  repository: NotificationsRepository;
  notificationsService: NotificationsService;
};

export async function processSendNotificationJob(
  job: Job<SendNotificationJobData>,
  deps: ProcessSendNotificationDeps,
): Promise<void> {
  const { logger, repository, notificationsService } = deps;
  const { notificationId } = job.data;

  const notification = await repository.findNotificationById(notificationId);
  if (notification === null) {
    return;
  }

  if (notification.status === "SENT" || notification.status === "FAILED_PERMANENT") {
    return;
  }

  if (!isHandledOutboundNotificationType(notification.type)) {
    await repository.updateNotificationStatus(notificationId, {
      status: "FAILED_PERMANENT",
      lastError: "Unsupported notification type for outbound e-mail.",
    });
    throw new UnrecoverableError("Unsupported notification type.");
  }

  const outboundType = notification.type;

  await repository.incrementNotificationAttemptCount(notificationId);

  const afterInc = await repository.findNotificationById(notificationId);
  if (afterInc === null) {
    return;
  }

  await repository.updateNotificationStatus(notificationId, { status: "SENDING" });

  if (afterInc.appointmentId === null) {
    await repository.updateNotificationStatus(notificationId, {
      status: "FAILED_PERMANENT",
      lastError: "Missing appointment context for this notification type.",
    });
    throw new UnrecoverableError("Missing appointmentId on notification row.");
  }

  const row = await repository.findAppointmentTemplateContext(afterInc.appointmentId);
  if (row === null) {
    await repository.updateNotificationStatus(notificationId, {
      status: "FAILED_PERMANENT",
      lastError: "Appointment not found for notification context.",
    });
    throw new UnrecoverableError("Appointment context missing.");
  }

  const { subject, text } = buildPayloadForType(outboundType, row, notificationsService.getApiBaseUrl());

  const sendResult = await sendTransactionalEmail(logger, {
    to: afterInc.recipientEmail,
    subject,
    text,
  });

  if (sendResult.skipped) {
    await repository.updateNotificationStatus(notificationId, {
      status: "SENT",
      sentAt: new Date(),
      lastError: null,
    });
    return;
  }

  if (!sendResult.ok) {
    const errMsg = truncateErrorMessage(sendResult.errorCode, 480);
    const nonRetryable = NON_RETRYABLE_ERROR_CODES.has(sendResult.errorCode);
    if (nonRetryable) {
      await repository.updateNotificationStatus(notificationId, {
        status: "FAILED_PERMANENT",
        lastError: errMsg,
      });
      if (outboundType === "REMINDER_2H") {
        await notificationsService.enqueueOwnerFailForReminder2hFromWorker(row);
      }
      throw new UnrecoverableError("Non-retryable provider error.");
    }

    if (afterInc.attemptCount >= MAX_SEND_ATTEMPTS) {
      await repository.updateNotificationStatus(notificationId, {
        status: "FAILED_PERMANENT",
        lastError: errMsg,
      });
      if (outboundType === "REMINDER_2H") {
        await notificationsService.enqueueOwnerFailForReminder2hFromWorker(row);
      }
      return;
    }

    await repository.updateNotificationStatus(notificationId, {
      status: "FAILED_RETRYING",
      lastError: errMsg,
    });
    throw new Error(`Transactional e-mail send failed: ${sendResult.errorCode}`);
  }

  await repository.updateNotificationStatus(notificationId, {
    status: "SENT",
    sentAt: new Date(),
    lastError: null,
  });
}
