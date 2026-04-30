import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { AvailabilityService } from "../availability.service.js";
import type { ProfessionalAvailabilitiesListResponse } from "../availability.schema.js";
import {
  createProfessionalAvailabilityBodySchema,
  patchProfessionalAvailabilityBodySchema,
  professionalAvailabilitiesListResponseSchema,
  professionalAvailabilityIdParamsSchema,
  professionalAvailabilityRowSchema,
  professionalIdParamsSchema,
  replaceProfessionalAvailabilitiesBodySchema,
} from "../availability.schema.js";

const commonErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  404: errorResponseSchema,
  422: errorResponseSchema,
} as const;

export function createProfessionalAvailabilitiesRoutesPlugin(service: AvailabilityService): FastifyPluginCallback {
  return (fastify, _opts, done): void => {
    fastify.get(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "List professional weekly availability",
          description:
            "Returns recurring weekly time windows for a professional under the establishment (US-411).",
          params: professionalIdParamsSchema,
          response: {
            200: professionalAvailabilitiesListResponseSchema,
            401: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request): Promise<ProfessionalAvailabilitiesListResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, professionalId } = professionalIdParamsSchema.parse(request.params);
        return service.listProfessionalAvailabilities(user.id, establishmentId, professionalId);
      },
    );

    fastify.put(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "Replace professional weekly availability",
          description:
            "Replaces all weekly availability rows for the professional. Windows must sit inside establishment business hours (US-411).",
          params: professionalIdParamsSchema,
          body: replaceProfessionalAvailabilitiesBodySchema,
          response: {
            200: professionalAvailabilitiesListResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<ProfessionalAvailabilitiesListResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, professionalId } = professionalIdParamsSchema.parse(request.params);
        const body = replaceProfessionalAvailabilitiesBodySchema.parse(request.body);
        return service.replaceProfessionalAvailabilities(user.id, establishmentId, professionalId, body);
      },
    );

    fastify.post(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "Create professional availability window",
          description:
            "Adds one recurring weekly window. Must not overlap other windows for the same weekday and must fall within establishment business hours (US-411).",
          params: professionalIdParamsSchema,
          body: createProfessionalAvailabilityBodySchema,
          response: {
            201: professionalAvailabilityRowSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request, reply) => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, professionalId } = professionalIdParamsSchema.parse(request.params);
        const body = createProfessionalAvailabilityBodySchema.parse(request.body);
        const row = await service.createProfessionalAvailability(user.id, establishmentId, professionalId, body);
        return reply.status(201).send(row);
      },
    );

    fastify.patch(
      "/:availabilityId",
      {
        schema: {
          tags: ["availability"],
          summary: "Update professional availability window",
          description:
            "Updates one recurring weekly window by id. Same overlap and business-hours rules as create (US-411).",
          params: professionalAvailabilityIdParamsSchema,
          body: patchProfessionalAvailabilityBodySchema,
          response: {
            200: professionalAvailabilityRowSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request) => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, professionalId, availabilityId } = professionalAvailabilityIdParamsSchema.parse(
          request.params,
        );
        const body = patchProfessionalAvailabilityBodySchema.parse(request.body);
        return service.updateProfessionalAvailability(
          user.id,
          establishmentId,
          professionalId,
          availabilityId,
          body,
        );
      },
    );

    fastify.delete(
      "/:availabilityId",
      {
        schema: {
          tags: ["availability"],
          summary: "Delete professional availability window",
          description: "Removes one recurring weekly availability row by id (US-411).",
          params: professionalAvailabilityIdParamsSchema,
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
        const { establishmentId, professionalId, availabilityId } = professionalAvailabilityIdParamsSchema.parse(
          request.params,
        );
        await service.deleteProfessionalAvailability(user.id, establishmentId, professionalId, availabilityId);
        await reply.status(204).send();
      },
    );

    done();
  };
}
