import { Prisma } from "@prisma/client";
import type { Queue } from "bullmq";

import type { SendNotificationJobData, ReminderFireJobData } from "~/jobs/queues.js";
import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import {
  FIRE_REMINDER_JOB_NAME,
  SEND_NOTIFICATION_JOB_NAME,
  reminder24hJobId,
  reminder2hJobId,
} from "~/modules/notifications/notifications.constants.js";
import type {
  AppointmentTemplateContextRow,
  NotificationsRepository,
} from "~/modules/notifications/notifications.repository.js";
import type { ListNotificationsQuery, ListNotificationsResponse } from "~/modules/notifications/notifications.schema.js";
import { AppError } from "~/shared/errors/AppError.js";

function isUniqueConstraintViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Masks recipient e-mail for dashboard logs (PII minimisation in API responses). */
export function maskRecipientEmailForLogs(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0 || at === email.length - 1) {
    return "***";
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length <= 1) {
    return `*@${domain}`;
  }
  return `${local[0]}***@${domain}`;
}

export class NotificationsService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly establishmentsRepository: EstablishmentsRepository,
    private readonly notificationsQueue: Queue<SendNotificationJobData>,
    private readonly remindersQueue: Queue<ReminderFireJobData>,
    private readonly apiBaseUrl: string,
  ) {}

  async listNotificationLogs(
    userId: string,
    establishmentId: string,
    query: ListNotificationsQuery,
  ): Promise<ListNotificationsResponse> {
    const establishment = await this.establishmentsRepository.findOwnedById(userId, establishmentId);
    if (!establishment || establishment.archivedAt !== null) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }

    const { rows, total } = await this.repository.listForEstablishment(establishmentId, query.page, query.pageSize);
    return {
      data: rows.map((r) => ({
        id: r.id,
        establishmentId: r.establishmentId,
        appointmentId: r.appointmentId,
        type: r.type,
        status: r.status,
        recipientEmailMasked: maskRecipientEmailForLogs(r.recipientEmail),
        attemptCount: r.attemptCount,
        scheduledFor: r.scheduledFor ? r.scheduledFor.toISOString() : null,
        sentAt: r.sentAt ? r.sentAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async scheduleAfterBooking(appointmentId: string): Promise<void> {
    await this.enqueueAppointmentConfirmation(appointmentId);
    await this.scheduleReminderJobsFromDb(appointmentId);
  }

  async onAppointmentRescheduled(appointmentId: string): Promise<void> {
    await this.clearReminderInfrastructure(appointmentId);
    await this.enqueueAppointmentConfirmation(appointmentId);
    await this.scheduleReminderJobsFromDb(appointmentId);
  }

  async onClientCancelledAppointment(appointmentId: string): Promise<void> {
    await this.clearReminderInfrastructure(appointmentId);
    const ctx = await this.repository.findAppointmentTemplateContext(appointmentId);
    if (ctx === null) {
      return;
    }

    const clientKey = `cancel-client:${appointmentId}`;
    const ownerKey = `cancel-owner:${appointmentId}`;

    try {
      const clientRowId = await this.repository.createNotification({
        establishmentId: ctx.establishment.id,
        appointmentId: ctx.id,
        type: "CANCELLATION_CLIENT",
        status: "PENDING",
        recipientEmail: ctx.clientEmail,
        idempotencyKey: clientKey,
        scheduledFor: null,
      });
      await this.notificationsQueue.add(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: clientRowId.id },
        { jobId: `send-notif:${clientRowId.id}` },
      );
    } catch (error: unknown) {
      if (!isUniqueConstraintViolation(error)) {
        throw error;
      }
    }

    const ownerEmail = ctx.establishment.operationalEmail ?? ctx.establishment.email;
    try {
      const ownerRowId = await this.repository.createNotification({
        establishmentId: ctx.establishment.id,
        appointmentId: ctx.id,
        type: "CANCELLATION_OWNER",
        status: "PENDING",
        recipientEmail: ownerEmail,
        idempotencyKey: ownerKey,
        scheduledFor: null,
      });
      await this.notificationsQueue.add(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: ownerRowId.id },
        { jobId: `send-notif:${ownerRowId.id}` },
      );
    } catch (error: unknown) {
      if (!isUniqueConstraintViolation(error)) {
        throw error;
      }
    }
  }

  async onOwnerCancelledAppointment(appointmentId: string): Promise<void> {
    await this.clearReminderInfrastructure(appointmentId);
  }

  async onOwnerBulkCancelled(appointmentIds: string[]): Promise<void> {
    await Promise.all(appointmentIds.map((id) => this.clearReminderInfrastructure(id)));
  }

  async onTerminalAppointmentStatus(appointmentId: string): Promise<void> {
    await this.clearReminderInfrastructure(appointmentId);
  }

  private async clearReminderInfrastructure(appointmentId: string): Promise<void> {
    const ctx = await this.repository.findAppointmentTemplateContext(appointmentId);
    const id24 = reminder24hJobId(appointmentId);
    const id2 = reminder2hJobId(appointmentId);

    const job24 = await this.remindersQueue.getJob(id24);
    if (job24 !== undefined) {
      await job24.remove();
    }
    const job2 = await this.remindersQueue.getJob(id2);
    if (job2 !== undefined) {
      await job2.remove();
    }

    if (ctx?.reminder24hJobId !== null && ctx?.reminder24hJobId !== undefined && ctx.reminder24hJobId !== id24) {
      const legacy = await this.remindersQueue.getJob(ctx.reminder24hJobId);
      if (legacy !== undefined) {
        await legacy.remove();
      }
    }
    if (ctx?.reminder2hJobId !== null && ctx?.reminder2hJobId !== undefined && ctx.reminder2hJobId !== id2) {
      const legacy = await this.remindersQueue.getJob(ctx.reminder2hJobId);
      if (legacy !== undefined) {
        await legacy.remove();
      }
    }

    await this.repository.deletePendingReminderNotifications(appointmentId);
    await this.repository.clearAppointmentReminderJobIds(appointmentId);
  }

  private async enqueueAppointmentConfirmation(appointmentId: string): Promise<void> {
    const ctx = await this.repository.findAppointmentTemplateContext(appointmentId);
    if (ctx === null || ctx.status !== "CONFIRMED") {
      return;
    }

    const idempotencyKey = `confirm:${appointmentId}:${ctx.startAt.toISOString()}`;
    const existing = await this.repository.findByIdempotencyKey(idempotencyKey);
    if (existing !== null) {
      if (existing.status === "PENDING") {
        await this.notificationsQueue.add(
          SEND_NOTIFICATION_JOB_NAME,
          { notificationId: existing.id },
          { jobId: `send-notif:${existing.id}` },
        );
      }
      return;
    }

    try {
      const created = await this.repository.createNotification({
        establishmentId: ctx.establishment.id,
        appointmentId: ctx.id,
        type: "APPOINTMENT_CONFIRMATION",
        status: "PENDING",
        recipientEmail: ctx.clientEmail,
        idempotencyKey,
        scheduledFor: null,
      });
      await this.notificationsQueue.add(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: created.id },
        { jobId: `send-notif:${created.id}` },
      );
    } catch (error: unknown) {
      if (isUniqueConstraintViolation(error)) {
        const again = await this.repository.findByIdempotencyKey(idempotencyKey);
        if (again !== null && again.status === "PENDING") {
          await this.notificationsQueue.add(
            SEND_NOTIFICATION_JOB_NAME,
            { notificationId: again.id },
            { jobId: `send-notif:${again.id}` },
          );
        }
        return;
      }
      throw error;
    }
  }

  private async scheduleReminderJobsFromDb(appointmentId: string): Promise<void> {
    const ctx = await this.repository.findAppointmentTemplateContext(appointmentId);
    if (ctx === null || ctx.status !== "CONFIRMED") {
      return;
    }

    const now = new Date();
    const startAt = ctx.startAt;
    const at24h = new Date(startAt.getTime() - 24 * 60 * 60 * 1000);
    const at2h = new Date(startAt.getTime() - 2 * 60 * 60 * 1000);

    let next24: string | null = null;
    let next2: string | null = null;

    if (at24h.getTime() > now.getTime()) {
      const jid = reminder24hJobId(appointmentId);
      await this.remindersQueue.add(
        FIRE_REMINDER_JOB_NAME,
        { appointmentId, kind: "REMINDER_24H" },
        { delay: at24h.getTime() - now.getTime(), jobId: jid },
      );
      next24 = jid;
    }

    if (at2h.getTime() > now.getTime()) {
      const jid = reminder2hJobId(appointmentId);
      await this.remindersQueue.add(
        FIRE_REMINDER_JOB_NAME,
        { appointmentId, kind: "REMINDER_2H" },
        { delay: at2h.getTime() - now.getTime(), jobId: jid },
      );
      next2 = jid;
    }

    await this.repository.setAppointmentReminderJobIds(appointmentId, {
      reminder24hJobId: next24,
      reminder2hJobId: next2,
    });
  }

  /** Used by the reminders worker to enqueue the actual e-mail notification row + send job. */
  async enqueueReminderNotificationFromWorker(
    appointmentId: string,
    kind: "REMINDER_24H" | "REMINDER_2H",
  ): Promise<void> {
    const ctx = await this.repository.findAppointmentTemplateContext(appointmentId);
    if (ctx === null || ctx.status !== "CONFIRMED") {
      return;
    }

    const idempotencyKey = kind === "REMINDER_24H" ? `reminder24h:${appointmentId}` : `reminder2h:${appointmentId}`;
    const existing = await this.repository.findByIdempotencyKey(idempotencyKey);
    if (existing !== null) {
      if (existing.status === "PENDING") {
        await this.notificationsQueue.add(
          SEND_NOTIFICATION_JOB_NAME,
          { notificationId: existing.id },
          { jobId: `send-notif:${existing.id}` },
        );
      }
      return;
    }

    try {
      const created = await this.repository.createNotification({
        establishmentId: ctx.establishment.id,
        appointmentId: ctx.id,
        type: kind,
        status: "PENDING",
        recipientEmail: ctx.clientEmail,
        idempotencyKey,
        scheduledFor: null,
      });
      await this.notificationsQueue.add(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: created.id },
        { jobId: `send-notif:${created.id}` },
      );
    } catch (error: unknown) {
      if (isUniqueConstraintViolation(error)) {
        return;
      }
      throw error;
    }
  }

  /** After REMINDER_2H reaches permanent failure, notify the establishment owner/ops inbox once. */
  async enqueueOwnerFailForReminder2hFromWorker(
    ctx: Pick<AppointmentTemplateContextRow, "id" | "startAt" | "establishment">,
  ): Promise<void> {
    const idempotencyKey = `owner-fail-reminder2h:${ctx.id}`;
    const existing = await this.repository.findByIdempotencyKey(idempotencyKey);
    if (existing !== null) {
      return;
    }

    const ownerEmail = ctx.establishment.operationalEmail ?? ctx.establishment.email;
    try {
      const created = await this.repository.createNotification({
        establishmentId: ctx.establishment.id,
        appointmentId: ctx.id,
        type: "OWNER_NOTIFICATION_FAIL",
        status: "PENDING",
        recipientEmail: ownerEmail,
        idempotencyKey,
        scheduledFor: null,
      });
      await this.notificationsQueue.add(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: created.id },
        { jobId: `send-notif:${created.id}` },
      );
    } catch (error: unknown) {
      if (isUniqueConstraintViolation(error)) {
        return;
      }
      throw error;
    }
  }

  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }
}
