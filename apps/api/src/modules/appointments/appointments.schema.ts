import { z } from "zod";

import { createPublicAppointmentBodySchema } from "~/modules/booking/booking.schema.js";

export const bulkCancelAppointmentsParamsSchema = z.object({
  establishmentId: z.string().min(1).describe("Establishment cuid2 identifier"),
});

export type BulkCancelAppointmentsParams = z.infer<typeof bulkCancelAppointmentsParamsSchema>;

export const bulkCancelAppointmentsBodySchema = z.object({
  appointmentIds: z
    .array(z.string().min(1))
    .min(1)
    .describe("Confirmed appointment IDs to cancel in bulk (owner dashboard)"),
});

export type BulkCancelAppointmentsBody = z.infer<typeof bulkCancelAppointmentsBodySchema>;

export const bulkCancelAppointmentsResponseSchema = z.object({
  cancelledIds: z.array(z.string()).describe("Appointment IDs that were updated to CANCELLED"),
});

export type BulkCancelAppointmentsResponse = z.infer<typeof bulkCancelAppointmentsResponseSchema>;

export const appointmentStatusFilterSchema = z.enum(["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]);

export type AppointmentStatusFilter = z.infer<typeof appointmentStatusFilterSchema>;

const statusQueryPreprocess = (val: unknown): AppointmentStatusFilter[] | undefined => {
  if (val === undefined || val === null) {
    return undefined;
  }
  if (Array.isArray(val)) {
    return val.filter((item): item is AppointmentStatusFilter =>
      typeof item === "string" && ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].includes(item),
    );
  }
  if (typeof val === "string") {
    return [val as AppointmentStatusFilter];
  }
  return undefined;
};

export const listAppointmentsParamsSchema = z.object({
  establishmentId: z.string().min(1).describe("Establishment cuid2 identifier"),
});

export const listAppointmentsQuerySchema = z
  .object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Local calendar date start (YYYY-MM-DD) in the establishment timezone"),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Local calendar date end (YYYY-MM-DD) inclusive, establishment timezone"),
    status: z.preprocess(statusQueryPreprocess, z.array(appointmentStatusFilterSchema).optional()),
    professionalId: z.string().min(1).optional().describe("Filter by professional cuid2"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine((q) => q.from !== undefined || q.to !== undefined, {
    message: "At least one of from or to is required.",
    path: ["from"],
  });

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;

export const appointmentServiceSummarySchema = z.object({
  serviceId: z.string().nullable(),
  snapshotName: z.string(),
});

export const appointmentListItemSchema = z.object({
  id: z.string(),
  establishmentId: z.string(),
  professionalId: z.string(),
  status: appointmentStatusFilterSchema,
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  clientName: z.string(),
  clientEmail: z.string(),
  clientPhone: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  services: z.array(appointmentServiceSummarySchema),
});

export const listAppointmentsResponseSchema = z.object({
  data: z.array(appointmentListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export type ListAppointmentsResponse = z.infer<typeof listAppointmentsResponseSchema>;

export const appointmentIdParamsSchema = z.object({
  establishmentId: z.string().min(1),
  appointmentId: z.string().min(1),
});

export type AppointmentIdParams = z.infer<typeof appointmentIdParamsSchema>;

export const appointmentServiceLineDetailSchema = z.object({
  id: z.string(),
  serviceId: z.string().nullable(),
  snapshotName: z.string(),
  snapshotDurationMinutes: z.number().int(),
  snapshotPriceCents: z.number().int(),
  sortOrder: z.number().int(),
});

export const getAppointmentResponseSchema = z.object({
  id: z.string(),
  establishmentId: z.string(),
  professionalId: z.string(),
  status: appointmentStatusFilterSchema,
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  clientName: z.string(),
  clientEmail: z.string(),
  clientPhone: z.string(),
  cancelledAt: z.iso.datetime().nullable(),
  cancelledBy: z.enum(["CLIENT", "OWNER", "SYSTEM"]).nullable(),
  createdByUserId: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  services: z.array(appointmentServiceLineDetailSchema),
});

export type GetAppointmentResponse = z.infer<typeof getAppointmentResponseSchema>;

export const createManualAppointmentBodySchema = createPublicAppointmentBodySchema;

export type CreateManualAppointmentBody = z.infer<typeof createManualAppointmentBodySchema>;

export const createManualAppointmentResponseSchema = z.object({
  id: z.string(),
  professionalId: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  clientName: z.string(),
  clientEmail: z.string(),
  clientPhone: z.string(),
});

export type CreateManualAppointmentResponse = z.infer<typeof createManualAppointmentResponseSchema>;

export const cancelAppointmentResponseSchema = z.object({
  id: z.string(),
  status: z.literal("CANCELLED"),
});

export type CancelAppointmentResponse = z.infer<typeof cancelAppointmentResponseSchema>;

export const markStatusResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["COMPLETED", "NO_SHOW"]),
});

export type MarkStatusResponse = z.infer<typeof markStatusResponseSchema>;

export const rescheduleAppointmentBodySchema = z.object({
  startAt: z.iso.datetime().describe("New appointment start in ISO 8601 UTC"),
});

export type RescheduleAppointmentBody = z.infer<typeof rescheduleAppointmentBodySchema>;

export const rescheduleAppointmentResponseSchema = z.object({
  id: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
});

export type RescheduleAppointmentResponse = z.infer<typeof rescheduleAppointmentResponseSchema>;
