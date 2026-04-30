import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { findSubscriptionByUserId } from "~/modules/plans/subscription.repository.js";
import { AppError } from "~/shared/errors/AppError.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import { EstablishmentsRepository } from "./establishments.repository.js";
import {
  createEstablishmentBodySchema,
  type EstablishmentPublic,
  establishmentIdParamsSchema,
  establishmentListResponseSchema,
  establishmentPublicSchema,
  patchEstablishmentBodySchema,
} from "./establishments.schema.js";
import { EstablishmentsService } from "./establishments.service.js";

const commonErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  404: errorResponseSchema,
  422: errorResponseSchema,
} as const;

export function registerEstablishmentsModule(app: FastifyInstance): void {
  const repository = new EstablishmentsRepository();
  const service = new EstablishmentsService(repository, findSubscriptionByUserId);

  app.post(
    "/api/v1/establishments",
    {
      preHandler: requireSession,
      schema: {
        tags: ["establishments"],
        summary: "Create establishment",
        description:
          "Creates a new establishment for the authenticated account. Respects subscription plan limits and global slug uniqueness.",
        body: createEstablishmentBodySchema,
        response: {
          201: establishmentPublicSchema,
          ...commonErrorResponses,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }
      const body = createEstablishmentBodySchema.parse(request.body);
      const created = await service.create(user.id, body);
      await reply.status(201).send(created);
    },
  );

  app.get(
    "/api/v1/establishments",
    {
      preHandler: requireSession,
      schema: {
        tags: ["establishments"],
        summary: "List establishments",
        description: "Returns all non-archived establishments owned by the authenticated user.",
        response: {
          200: establishmentListResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request: FastifyRequest): Promise<EstablishmentPublic[]> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }
      return service.listByUser(user.id);
    },
  );

  app.get(
    "/api/v1/establishments/:id",
    {
      preHandler: requireSession,
      schema: {
        tags: ["establishments"],
        summary: "Get establishment by ID",
        description: "Returns one establishment if it exists and belongs to the authenticated user.",
        params: establishmentIdParamsSchema,
        response: {
          200: establishmentPublicSchema,
          ...commonErrorResponses,
        },
      },
    },
    async (request: FastifyRequest): Promise<EstablishmentPublic> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }
      const { id } = establishmentIdParamsSchema.parse(request.params);
      return service.findById(user.id, id);
    },
  );

  app.patch(
    "/api/v1/establishments/:id",
    {
      preHandler: requireSession,
      schema: {
        tags: ["establishments"],
        summary: "Update establishment",
        description: "Partially updates establishment fields. Slug must remain globally unique.",
        params: establishmentIdParamsSchema,
        body: patchEstablishmentBodySchema,
        response: {
          200: establishmentPublicSchema,
          ...commonErrorResponses,
        },
      },
    },
    async (request: FastifyRequest): Promise<EstablishmentPublic> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }
      const { id } = establishmentIdParamsSchema.parse(request.params);
      const body = patchEstablishmentBodySchema.parse(request.body);
      return service.update(user.id, id, body);
    },
  );

  app.delete(
    "/api/v1/establishments/:id",
    {
      preHandler: requireSession,
      schema: {
        tags: ["establishments"],
        summary: "Archive establishment",
        description:
          "Sets archivedAt (soft archive). Idempotent: repeated calls return 204. Does not remove the database row.",
        params: establishmentIdParamsSchema,
        response: {
          204: z.null(),
          ...commonErrorResponses,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }
      const { id } = establishmentIdParamsSchema.parse(request.params);
      await service.archive(user.id, id);
      await reply.status(204).send();
    },
  );
}
