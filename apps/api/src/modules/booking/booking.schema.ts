import { z } from "zod";

import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

export const establishmentSlugParamSchema = z.object({
  slug: z.string().min(1).max(200).describe("Public establishment slug from the booking URL (e.g. demo-salon)"),
});

export type EstablishmentSlugParams = z.infer<typeof establishmentSlugParamSchema>;

const serviceIdsQuerySchema = z.preprocess((val: unknown): string[] => {
  if (val === undefined || val === null) {
    return [];
  }
  if (Array.isArray(val)) {
    return val.filter((item): item is string => typeof item === "string");
  }
  if (typeof val === "string") {
    return [val];
  }
  return [];
}, z.array(z.string().min(1)).min(1));

export const getAvailableSlotsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Calendar date in the establishment timezone (YYYY-MM-DD), e.g. 2026-05-20"),
  serviceIds: serviceIdsQuerySchema.describe("One or more service IDs to include in duration calculation"),
  professionalId: z.string().min(1).optional().describe("When set, slots are returned only for this professional"),
});

export type GetAvailableSlotsQuery = z.infer<typeof getAvailableSlotsQuerySchema>;

export const publicServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMinutes: z.number().int(),
  priceCents: z.number().int(),
  catalogCombo: z.boolean(),
});

export const publicProfessionalSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const getPublicEstablishmentResponseSchema = z.object({
  establishment: z.object({
    name: z.string(),
    slug: z.string(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    timezone: z.string(),
    minAdvanceMinutes: z.number().int(),
  }),
  services: z.array(publicServiceSchema),
  professionals: z.array(publicProfessionalSchema),
});

export type GetPublicEstablishmentResponse = z.infer<typeof getPublicEstablishmentResponseSchema>;

export const availableSlotSchema = z.object({
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  professionalId: z.string(),
});

export const getAvailableSlotsResponseSchema = z.object({
  slots: z.array(availableSlotSchema),
});

export type GetAvailableSlotsResponse = z.infer<typeof getAvailableSlotsResponseSchema>;

export const createPublicAppointmentBodySchema = z.object({
  professionalId: z.string().min(1).describe("Professional performing the services (cuid2)"),
  serviceIds: z
    .array(z.string().min(1))
    .min(1)
    .describe("Services to book in execution order (cuid2 identifiers)"),
  startAt: z
    .iso.datetime()
    .describe("Appointment start in ISO 8601 UTC, e.g. 2026-05-20T14:00:00.000Z"),
  clientName: z.string().min(2).max(100).describe("Client full name"),
  clientEmail: z.email().describe("Client email for confirmation"),
  clientPhone: z.string().min(8).max(20).describe("Client phone with country code"),
});

export type CreatePublicAppointmentBody = z.infer<typeof createPublicAppointmentBodySchema>;

export const createPublicAppointmentResponseSchema = z.object({
  id: z.string(),
  professionalId: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  clientName: z.string(),
  clientEmail: z.string(),
  clientPhone: z.string(),
  cancelToken: z.uuid(),
});

export type CreatePublicAppointmentResponse = z.infer<typeof createPublicAppointmentResponseSchema>;

export const cancelAppointmentParamsSchema = z.object({
  cancelToken: z.uuid().describe("Opaque cancellation token from the confirmation email"),
});

export type CancelAppointmentParams = z.infer<typeof cancelAppointmentParamsSchema>;

export const cancelPublicAppointmentResponseSchema = z.object({
  appointmentId: z.string(),
  establishmentName: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  clientName: z.string(),
});

export type CancelPublicAppointmentResponse = z.infer<typeof cancelPublicAppointmentResponseSchema>;

export const getPublicEstablishmentErrorResponses = {
  404: errorResponseSchema,
} as const;

export const getAvailableSlotsErrorResponses = {
  400: errorResponseSchema,
  404: errorResponseSchema,
} as const;

export const createPublicAppointmentErrorResponses = {
  400: errorResponseSchema,
  404: errorResponseSchema,
  409: errorResponseSchema,
  422: errorResponseSchema,
} as const;

export const cancelPublicAppointmentErrorResponses = {
  404: errorResponseSchema,
  422: errorResponseSchema,
} as const;
