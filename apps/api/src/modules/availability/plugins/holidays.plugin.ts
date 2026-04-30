import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { AvailabilityService } from "../availability.service.js";
import type { HolidaysListResponse } from "../availability.schema.js";
import {
  createHolidayBodySchema,
  establishmentIdParamsSchema,
  holidayIdParamsSchema,
  holidayRowSchema,
  holidaysListResponseSchema,
} from "../availability.schema.js";

const commonErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  404: errorResponseSchema,
  422: errorResponseSchema,
} as const;

export function createHolidaysRoutesPlugin(service: AvailabilityService): FastifyPluginCallback {
  return (fastify, _opts, done): void => {
    fastify.get(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "List establishment holidays",
          description: "Returns scheduled closure dates for the establishment (US-412).",
          params: establishmentIdParamsSchema,
          response: {
            200: holidaysListResponseSchema,
            401: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request): Promise<HolidaysListResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = establishmentIdParamsSchema.parse(request.params);
        return service.listHolidays(user.id, establishmentId);
      },
    );

    fastify.post(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "Create establishment holiday",
          description: "Registers a calendar date when the establishment does not accept bookings (US-412).",
          params: establishmentIdParamsSchema,
          body: createHolidayBodySchema,
          response: {
            201: holidayRowSchema,
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
        const body = createHolidayBodySchema.parse(request.body);
        const created = await service.createHoliday(user.id, establishmentId, body);
        await reply.status(201).send(created);
      },
    );

    fastify.delete(
      "/:holidayId",
      {
        schema: {
          tags: ["availability"],
          summary: "Delete establishment holiday",
          description: "Removes a holiday row by identifier when it belongs to the establishment.",
          params: holidayIdParamsSchema,
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
        const { establishmentId, holidayId } = holidayIdParamsSchema.parse(request.params);
        await service.deleteHoliday(user.id, establishmentId, holidayId);
        await reply.status(204).send();
      },
    );

    done();
  };
}
