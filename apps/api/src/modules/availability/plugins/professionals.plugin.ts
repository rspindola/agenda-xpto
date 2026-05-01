import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { ProfessionalsService } from "~/modules/availability/professionals.service.js";
import {
  createProfessionalBodySchema,
  establishmentIdParamsSchema,
  patchProfessionalBodySchema,
  professionalIdParamsSchema,
  professionalPublicSchema,
  professionalsListResponseSchema,
  replaceProfessionalServicesBodySchema,
  type ProfessionalPublic,
} from "~/modules/availability/professionals.schema.js";

const commonErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  404: errorResponseSchema,
  422: errorResponseSchema,
} as const;

const professionalServicesParamsSchema = professionalIdParamsSchema;

export function createProfessionalsRoutesPlugin(service: ProfessionalsService): FastifyPluginCallback {
  return (fastify, _opts, done): void => {
    fastify.post(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "Create professional",
          description: "Creates a professional for the establishment. Enforces plan limits on active professionals.",
          params: establishmentIdParamsSchema,
          body: createProfessionalBodySchema,
          response: {
            201: professionalPublicSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request, reply): Promise<void> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = establishmentIdParamsSchema.parse(request.params);
        const body = createProfessionalBodySchema.parse(request.body);
        const created = await service.create(user.id, establishmentId, body);
        await reply.status(201).send(created);
      },
    );

    fastify.get(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "List professionals",
          description: "Returns active (non–soft-deleted) professionals for the establishment.",
          params: establishmentIdParamsSchema,
          response: {
            200: professionalsListResponseSchema,
            401: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request): Promise<ProfessionalPublic[]> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = establishmentIdParamsSchema.parse(request.params);
        return service.list(user.id, establishmentId);
      },
    );

    fastify.put(
      "/:professionalId/services",
      {
        schema: {
          tags: ["availability"],
          summary: "Replace professional services",
          description: "Replaces the N:N links between this professional and establishment services.",
          params: professionalServicesParamsSchema,
          body: replaceProfessionalServicesBodySchema,
          response: {
            204: z.null(),
            ...commonErrorResponses,
          },
        },
      },
      async (request, reply): Promise<void> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, professionalId } = professionalServicesParamsSchema.parse(request.params);
        const body = replaceProfessionalServicesBodySchema.parse(request.body);
        await service.replaceServices(user.id, establishmentId, professionalId, body);
        await reply.status(204).send();
      },
    );

    fastify.get(
      "/:professionalId",
      {
        schema: {
          tags: ["availability"],
          summary: "Get professional by ID",
          description: "Returns one active professional belonging to the establishment.",
          params: professionalIdParamsSchema,
          response: {
            200: professionalPublicSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<Awaited<ReturnType<ProfessionalsService["findById"]>>> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, professionalId } = professionalIdParamsSchema.parse(request.params);
        return service.findById(user.id, establishmentId, professionalId);
      },
    );

    fastify.patch(
      "/:professionalId",
      {
        schema: {
          tags: ["availability"],
          summary: "Update professional",
          description: "Partially updates professional fields.",
          params: professionalIdParamsSchema,
          body: patchProfessionalBodySchema,
          response: {
            200: professionalPublicSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<Awaited<ReturnType<ProfessionalsService["update"]>>> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, professionalId } = professionalIdParamsSchema.parse(request.params);
        const body = patchProfessionalBodySchema.parse(request.body);
        return service.update(user.id, establishmentId, professionalId, body);
      },
    );

    fastify.delete(
      "/:professionalId",
      {
        schema: {
          tags: ["availability"],
          summary: "Soft delete professional",
          description: "Sets deletedAt. Rejected when future confirmed appointments exist.",
          params: professionalIdParamsSchema,
          response: {
            204: z.null(),
            ...commonErrorResponses,
          },
        },
      },
      async (request, reply): Promise<void> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, professionalId } = professionalIdParamsSchema.parse(request.params);
        await service.softDelete(user.id, establishmentId, professionalId);
        await reply.status(204).send();
      },
    );

    done();
  };
}
