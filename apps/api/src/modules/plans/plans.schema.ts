import { z } from "zod";

const planTypeEnum = z.enum(["STARTER", "PRO", "BUSINESS"]);

const subscriptionStatusEnum = z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"]);

/** GET /api/v1/plans/current — resposta estruturada */
export const getCurrentPlanResponseSchema = z.object({
  planType: planTypeEnum,
  status: subscriptionStatusEnum,
  limits: z.object({
    maxEstablishments: z.number().int(),
    maxProfessionalsPerEstablishment: z.number().int(),
    maxAppointmentsMonth: z.number().int().or(z.literal(-1)),
  }),
  trialEndsAt: z.string().nullable(),
  currentPeriodStart: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
  usage: z.object({
    activeEstablishments: z.number().int(),
    maxProfessionalsInAnyEstablishment: z.number().int().optional(),
  }),
  starterMonthlyCount: z.number().int().optional(),
  starterMonthlyLimit: z.number().int().optional(),
});

export type GetCurrentPlanResponse = z.infer<typeof getCurrentPlanResponseSchema>;

/** GET /api/v1/plans/quota — alertas por quota Starter */
export const quotaAlertLevelEnum = z.enum(["WARNING_80", "WARNING_90", "LIMIT_REACHED"]);

export const getQuotaResponseSchema = z.object({
  count: z.number().int(),
  limit: z.number().int(),
  alertLevel: quotaAlertLevelEnum.nullable(),
  message: z.string().optional(),
});

export type GetQuotaResponse = z.infer<typeof getQuotaResponseSchema>;

/** POST /api/v1/plans/convert — converter trial para plano pago */
export const convertTrialBodySchema = z.object({
  planType: planTypeEnum,
});

export type ConvertTrialBody = z.infer<typeof convertTrialBodySchema>;

export const convertTrialResponseSchema = getCurrentPlanResponseSchema;

/** POST /api/v1/plans/upgrade — upgrade imediato */
export const upgradeBodySchema = z.object({
  planType: planTypeEnum,
});

export type UpgradeBody = z.infer<typeof upgradeBodySchema>;

export const upgradeResponseSchema = getCurrentPlanResponseSchema;

/** POST /api/v1/plans/downgrade — downgrade com validação de conflitos */
export const downgradeConflictSchema = z.object({
  type: z.enum(["ESTABLISHMENT_EXCESS", "PROFESSIONAL_EXCESS"]),
  current: z.number().int(),
  allowed: z.number().int(),
  message: z.string(),
});

export type DowngradeConflict = z.infer<typeof downgradeConflictSchema>;

export const downgradeBodySchema = z.object({
  planType: planTypeEnum,
});

export type DowngradeBody = z.infer<typeof downgradeBodySchema>;

export const downgradeResponseSchema = z.object({
  conflicts: z.array(downgradeConflictSchema),
  canConfirm: z.boolean(),
});

export type DowngradeResponse = z.infer<typeof downgradeResponseSchema>;

/** POST /api/v1/plans/downgrade/confirm — confirmar downgrade após resolver conflitos */
export const downgradeConfirmBodySchema = z.object({
  planType: planTypeEnum,
});

export type DowngradeConfirmBody = z.infer<typeof downgradeConfirmBodySchema>;

export const downgradeConfirmResponseSchema = getCurrentPlanResponseSchema;

/** Error response schema (reutilizar shared) */
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
});
