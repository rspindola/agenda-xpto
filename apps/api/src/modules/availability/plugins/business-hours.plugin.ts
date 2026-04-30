import type { FastifyPluginCallback } from "fastify";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { AvailabilityService } from "../availability.service.js";
import type { BusinessHoursListResponse } from "../availability.schema.js";
import {
  businessHoursListResponseSchema,
  establishmentIdParamsSchema,
  replaceBusinessHoursBodySchema,
} from "../availability.schema.js";

const commonErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  404: errorResponseSchema,
  422: errorResponseSchema,
} as const;

export function createBusinessHoursRoutesPlugin(service: AvailabilityService): FastifyPluginCallback {
  return (fastify, _opts, done): void => {
    fastify.get(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "List establishment business hours",
          description:
            "Returns the weekly business-hours template (Mon–Sun). Closed days are represented without clock times.",
          params: establishmentIdParamsSchema,
          response: {
            200: businessHoursListResponseSchema,
            401: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request): Promise<BusinessHoursListResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = establishmentIdParamsSchema.parse(request.params);
        return service.getBusinessHours(user.id, establishmentId);
      },
    );

    fastify.put(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "Replace establishment business hours",
          description:
            "Replaces all business-hour rows for the establishment with the provided weekly configuration (US-410).",
          params: establishmentIdParamsSchema,
          body: replaceBusinessHoursBodySchema,
          response: {
            200: businessHoursListResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<BusinessHoursListResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = establishmentIdParamsSchema.parse(request.params);
        const body = replaceBusinessHoursBodySchema.parse(request.body);
        return service.replaceBusinessHours(user.id, establishmentId, body);
      },
    );

    done();
  };
}
