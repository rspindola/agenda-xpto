import { z } from "zod";

export const listNotificationsParamsSchema = z.object({
  establishmentId: z.string().min(1).describe("Establishment cuid2 identifier"),
});

export type ListNotificationsParams = z.infer<typeof listNotificationsParamsSchema>;

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const notificationLogItemSchema = z.object({
  id: z.string(),
  establishmentId: z.string(),
  appointmentId: z.string().nullable(),
  type: z.string(),
  status: z.string(),
  recipientEmailMasked: z.string(),
  attemptCount: z.number().int(),
  scheduledFor: z.string().nullable(),
  sentAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type NotificationLogItem = z.infer<typeof notificationLogItemSchema>;

export const listNotificationsResponseSchema = z.object({
  data: z.array(notificationLogItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export type ListNotificationsResponse = z.infer<typeof listNotificationsResponseSchema>;
