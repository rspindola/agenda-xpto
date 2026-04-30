import type { FastifyPluginCallback } from "fastify";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { AvailabilityService } from "../availability.service.js";
import type { ProfessionalAvailabilitiesListResponse } from "../availability.schema.js";
import {
  professionalAvailabilitiesListResponseSchema,
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

    done();
  };
}
