import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "~/shared/errors/AppError.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";
import { plansService } from "~/modules/plans/plans.service.js";
import {
  getCurrentPlanResponseSchema,
  getQuotaResponseSchema,
  convertTrialBodySchema,
  convertTrialResponseSchema,
  upgradeBodySchema,
  upgradeResponseSchema,
  downgradeBodySchema,
  downgradeResponseSchema,
  downgradeConfirmBodySchema,
  downgradeConfirmResponseSchema,
} from "~/modules/plans/plans.schema.js";

export function registerPlansRoutes(fastify: FastifyInstance): void {
  const quotaQuerystringSchema = z.object({
    establishmentId: z.cuid2(),
  });

  type QuotaQuerystring = z.infer<typeof quotaQuerystringSchema>;

  /**
   * GET /api/v1/plans/current — Get current plan details with limits and usage
   */
  fastify.get(
    "/plans/current",
    {
      preHandler: requireSession,
      schema: {
        tags: ["plans"],
        summary: "Get current plan",
        description: "Retrieve the current subscription plan, limits, trial status, and usage.",
        response: {
          200: getCurrentPlanResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }

      const plan = await plansService.getCurrentPlan(user.id);
      await reply.code(200).send(plan);
    },
  );

  /**
   * GET /api/v1/plans/quota — Get Starter quota status and alert level
   */
  fastify.get<{ Querystring: QuotaQuerystring }>(
    "/plans/quota",
    {
      preHandler: requireSession,
      schema: {
        tags: ["plans"],
        summary: "Get plan quota status",
        description: "Get current Starter monthly appointment count, limit, and alert level for an establishment.",
        querystring: quotaQuerystringSchema,
        response: {
          200: getQuotaResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }

      // TODO: Validate that establishment belongs to user
      const query = quotaQuerystringSchema.parse(request.query);
      const quota = await plansService.getQuota(query.establishmentId);
      await reply.code(200).send(quota);
    },
  );

  /**
   * POST /api/v1/plans/convert — Convert trial to paid plan
   */
  fastify.post<{ Body: z.infer<typeof convertTrialBodySchema> }>(
    "/plans/convert",
    {
      preHandler: requireSession,
      schema: {
        tags: ["plans"],
        summary: "Convert trial to paid plan",
        description: "Convert active trial subscription to a paid plan (STARTER, PRO, or BUSINESS).",
        body: convertTrialBodySchema,
        response: {
          200: convertTrialResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }

      const body = convertTrialBodySchema.parse(request.body);
      await plansService.convertTrial(user.id, body.planType);
      const plan = await plansService.getCurrentPlan(user.id);
      await reply.code(200).send(plan);
    },
  );

  /**
   * POST /api/v1/plans/upgrade — Upgrade to higher plan
   */
  fastify.post<{ Body: z.infer<typeof upgradeBodySchema> }>(
    "/plans/upgrade",
    {
      preHandler: requireSession,
      schema: {
        tags: ["plans"],
        summary: "Upgrade to higher plan",
        description: "Immediately upgrade subscription to a higher plan tier.",
        body: upgradeBodySchema,
        response: {
          200: upgradeResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }

      const body = upgradeBodySchema.parse(request.body);
      await plansService.upgradeImmediate(user.id, body.planType);
      const plan = await plansService.getCurrentPlan(user.id);
      await reply.code(200).send(plan);
    },
  );

  /**
   * POST /api/v1/plans/downgrade — Check downgrade conflicts
   */
  fastify.post<{ Body: z.infer<typeof downgradeBodySchema> }>(
    "/plans/downgrade",
    {
      preHandler: requireSession,
      schema: {
        tags: ["plans"],
        summary: "Check downgrade conflicts",
        description: "Validate downgrade to lower plan. Returns conflicts that must be resolved before confirming.",
        body: downgradeBodySchema,
        response: {
          200: downgradeResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }

      const body = downgradeBodySchema.parse(request.body);
      const conflicts = await plansService.downgradeWithConflictCheck(user.id, body.planType);
      await reply.code(200).send({
        conflicts,
        canConfirm: conflicts.length === 0,
      });
    },
  );

  /**
   * POST /api/v1/plans/downgrade/confirm — Confirm downgrade
   */
  fastify.post<{ Body: z.infer<typeof downgradeConfirmBodySchema> }>(
    "/plans/downgrade/confirm",
    {
      preHandler: requireSession,
      schema: {
        tags: ["plans"],
        summary: "Confirm plan downgrade",
        description: "Confirm downgrade after resolving all conflicts. Immediate effect on limits.",
        body: downgradeConfirmBodySchema,
        response: {
          200: downgradeConfirmResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: errorResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }

      const body = downgradeConfirmBodySchema.parse(request.body);
      await plansService.downgradeConfirmWithValidation(user.id, body.planType);
      const plan = await plansService.getCurrentPlan(user.id);
      await reply.code(200).send(plan);
    },
  );
}
