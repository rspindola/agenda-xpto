import type { FastifyPluginCallback } from "fastify";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { AvailabilityService } from "../availability.service.js";
import type { BusinessHoursListResponse } from "../availability.schema.js";
import {
  businessHoursListResponseSchema,
  establishmentIdParamsSchema,
  establishmentWeekdayParamsSchema,
  putBusinessHourBodySchema,
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
            "Returns the weekly business-hours template (Mon–Sun). Closed days have no row and appear as closed.",
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
      "/:weekday",
      {
        schema: {
          tags: ["availability"],
          summary: "Upsert business hours for one weekday",
          description:
            "Creates or updates the business-hour row for a single weekday. Send closed: true to remove the row (establishment closed that day).",
          params: establishmentWeekdayParamsSchema,
          body: putBusinessHourBodySchema,
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
        const { establishmentId, weekday } = establishmentWeekdayParamsSchema.parse(request.params);
        const body = putBusinessHourBodySchema.parse(request.body);
        return service.putBusinessHourForWeekday(user.id, establishmentId, weekday, body);
      },
    );

    fastify.delete(
      "/:weekday",
      {
        schema: {
          tags: ["availability"],
          summary: "Remove business hours for one weekday",
          description: "Deletes the row for that weekday (establishment closed that day).",
          params: establishmentWeekdayParamsSchema,
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
        const { establishmentId, weekday } = establishmentWeekdayParamsSchema.parse(request.params);
        return service.deleteBusinessHourForWeekday(user.id, establishmentId, weekday);
      },
    );

    done();
  };
}
