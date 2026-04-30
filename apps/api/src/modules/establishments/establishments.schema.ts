import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const establishmentIdParamsSchema = z.object({
  id: z.string().min(1).describe("Establishment cuid2 identifier"),
});

export type EstablishmentIdParams = z.infer<typeof establishmentIdParamsSchema>;

export const createEstablishmentBodySchema = z
  .object({
    name: z.string().min(1).max(200).describe("Public name of the establishment"),
    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(SLUG_PATTERN, "Slug must be lowercase letters, numbers, and single hyphens between segments.")
      .optional()
      .describe("URL slug; omit to auto-generate from name"),
    email: z.email().describe("Contact email for clients and notifications"),
    phone: z.string().min(8).max(30).optional().describe("Contact phone with country code"),
    address: z.string().max(500).optional().describe("Full street address"),
    timezone: z.string().min(1).max(64).describe("IANA timezone, e.g. America/Sao_Paulo"),
    minAdvanceMinutes: z.number().int().min(0).max(10080).optional().describe("Minimum advance booking in minutes"),
    isActive: z.boolean().optional().describe("Whether the establishment accepts new bookings"),
    operationalEmail: z.email().optional().describe("Operational alerts recipient"),
  })
  .describe("Create establishment payload");

export type CreateEstablishmentBody = z.infer<typeof createEstablishmentBodySchema>;

export const patchEstablishmentBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(SLUG_PATTERN, "Slug must be lowercase letters, numbers, and single hyphens between segments.")
      .optional(),
    email: z.email().optional(),
    phone: z.string().min(8).max(30).nullable().optional(),
    address: z.string().max(500).nullable().optional(),
    timezone: z.string().min(1).max(64).optional(),
    minAdvanceMinutes: z.number().int().min(0).max(10080).optional(),
    isActive: z.boolean().optional(),
    operationalEmail: z.email().nullable().optional(),
  })
  .describe("Partial update for an establishment");

export type PatchEstablishmentBody = z.infer<typeof patchEstablishmentBodySchema>;

export const establishmentPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  timezone: z.string(),
  minAdvanceMinutes: z.number().int(),
  isActive: z.boolean(),
  operationalEmail: z.string().nullable(),
  archivedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type EstablishmentPublic = z.infer<typeof establishmentPublicSchema>;

export const establishmentListResponseSchema = z.array(establishmentPublicSchema);
