import { z } from "zod";

import { establishmentIdParamsSchema, professionalIdParamsSchema } from "~/modules/availability/availability.schema.js";

export const createProfessionalBodySchema = z.object({
  name: z.string().min(1).max(200).describe("Professional display name"),
  email: z.email().optional().describe("Optional work email; must be unique per establishment when set"),
  phone: z.string().min(8).max(30).optional().describe("Contact phone with country code"),
});

export type CreateProfessionalBody = z.infer<typeof createProfessionalBodySchema>;

export const patchProfessionalBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    email: z.email().nullable().optional(),
    phone: z.string().min(8).max(30).nullable().optional(),
  })
  .describe("Partial update for a professional");

export type PatchProfessionalBody = z.infer<typeof patchProfessionalBodySchema>;

export const professionalPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type ProfessionalPublic = z.infer<typeof professionalPublicSchema>;

export const professionalsListResponseSchema = z.array(professionalPublicSchema);

export const replaceProfessionalServicesBodySchema = z.object({
  serviceIds: z
    .array(z.string().min(1))
    .describe("Complete list of service IDs offered by this professional; replaces existing links"),
});

export type ReplaceProfessionalServicesBody = z.infer<typeof replaceProfessionalServicesBodySchema>;

export { establishmentIdParamsSchema, professionalIdParamsSchema };
