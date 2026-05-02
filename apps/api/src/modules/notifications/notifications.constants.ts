import type { NotificationType } from "@prisma/client";

/** Deterministic BullMQ job id for T-24h reminder. */
export function reminder24hJobId(appointmentId: string): string {
  return `reminder-24h:${appointmentId}`;
}

/** Deterministic BullMQ job id for T-2h reminder. */
export function reminder2hJobId(appointmentId: string): string {
  return `reminder-2h:${appointmentId}`;
}

export const SEND_NOTIFICATION_JOB_NAME = "send-notification" as const;
export const FIRE_REMINDER_JOB_NAME = "fire-reminder" as const;

export const HANDLED_OUTBOUND_NOTIFICATION_TYPES = [
  "APPOINTMENT_CONFIRMATION",
  "REMINDER_24H",
  "REMINDER_2H",
  "CANCELLATION_CLIENT",
  "CANCELLATION_OWNER",
  "OWNER_NOTIFICATION_FAIL",
] as const;

export type HandledOutboundNotificationType = (typeof HANDLED_OUTBOUND_NOTIFICATION_TYPES)[number];

export function isHandledOutboundNotificationType(
  type: NotificationType,
): type is HandledOutboundNotificationType {
  return (HANDLED_OUTBOUND_NOTIFICATION_TYPES as readonly NotificationType[]).includes(type);
}
