import { z } from "zod";

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
