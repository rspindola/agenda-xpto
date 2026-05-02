import type { NotificationStatus, NotificationType, Prisma } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";

export type CreateNotificationRowInput = {
  establishmentId: string;
  appointmentId: string | null;
  type: NotificationType;
  status: NotificationStatus;
  recipientEmail: string;
  idempotencyKey: string | null;
  scheduledFor: Date | null;
};

export type AppointmentTemplateContextRow = {
  id: string;
  status: string;
  startAt: Date;
  endAt: Date;
  clientName: string;
  clientEmail: string;
  cancelToken: string;
  reminder24hJobId: string | null;
  reminder2hJobId: string | null;
  establishment: {
    id: string;
    name: string;
    email: string;
    operationalEmail: string | null;
  };
  professional: { name: string };
  appointmentServices: Array<{
    snapshotName: string;
    snapshotDurationMinutes: number;
    snapshotPriceCents: number;
    sortOrder: number;
  }>;
};

export type NotificationRow = {
  id: string;
  establishmentId: string;
  appointmentId: string | null;
  type: NotificationType;
  status: NotificationStatus;
  recipientEmail: string;
  attemptCount: number;
  lastError: string | null;
  scheduledFor: Date | null;
  sentAt: Date | null;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class NotificationsRepository {
  async findNotificationById(id: string): Promise<NotificationRow | null> {
    const row = await prisma.notification.findUnique({
      where: { id },
    });
    return row;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<NotificationRow | null> {
    const row = await prisma.notification.findUnique({
      where: { idempotencyKey },
    });
    return row;
  }

  async createNotification(input: CreateNotificationRowInput): Promise<{ id: string }> {
    const row = await prisma.notification.create({
      data: {
        establishmentId: input.establishmentId,
        appointmentId: input.appointmentId,
        type: input.type,
        status: input.status,
        recipientEmail: input.recipientEmail,
        idempotencyKey: input.idempotencyKey,
        scheduledFor: input.scheduledFor,
      },
      select: { id: true },
    });
    return row;
  }

  async updateNotificationStatus(
    id: string,
    data: Pick<Prisma.NotificationUpdateInput, "status" | "lastError" | "sentAt" | "attemptCount">,
  ): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data,
    });
  }

  async incrementNotificationAttemptCount(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { attemptCount: { increment: 1 } },
    });
  }

  async findAppointmentTemplateContext(appointmentId: string): Promise<AppointmentTemplateContextRow | null> {
    const row = await prisma.appointment.findFirst({
      where: { id: appointmentId },
      select: {
        id: true,
        status: true,
        startAt: true,
        endAt: true,
        clientName: true,
        clientEmail: true,
        cancelToken: true,
        reminder24hJobId: true,
        reminder2hJobId: true,
        establishment: {
          select: { id: true, name: true, email: true, operationalEmail: true },
        },
        professional: { select: { name: true } },
        appointmentServices: {
          select: {
            snapshotName: true,
            snapshotDurationMinutes: true,
            snapshotPriceCents: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return row;
  }

  async deletePendingReminderNotifications(appointmentId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: {
        appointmentId,
        type: { in: ["REMINDER_24H", "REMINDER_2H"] },
        status: "PENDING",
      },
    });
  }

  async setAppointmentReminderJobIds(
    appointmentId: string,
    data: { reminder24hJobId: string | null; reminder2hJobId: string | null },
  ): Promise<void> {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        reminder24hJobId: data.reminder24hJobId,
        reminder2hJobId: data.reminder2hJobId,
      },
    });
  }

  async clearAppointmentReminderJobIds(appointmentId: string): Promise<void> {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { reminder24hJobId: null, reminder2hJobId: null },
    });
  }

  async listForEstablishment(
    establishmentId: string,
    page: number,
    pageSize: number,
  ): Promise<{ rows: NotificationRow[]; total: number }> {
    const where = { establishmentId };
    const [rows, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ]);
    return { rows, total };
  }
}
