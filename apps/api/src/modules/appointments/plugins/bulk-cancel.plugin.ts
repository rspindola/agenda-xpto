import type { FastifyPluginCallback } from "fastify";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { AppointmentsService } from "~/modules/appointments/appointments.service.js";
import {
  bulkCancelAppointmentsBodySchema,
  bulkCancelAppointmentsParamsSchema,
  bulkCancelAppointmentsResponseSchema,
  type BulkCancelAppointmentsResponse,
} from "~/modules/appointments/appointments.schema.js";

const commonErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  404: errorResponseSchema,
  422: errorResponseSchema,
} as const;

export function createBulkCancelAppointmentsRoutesPlugin(service: AppointmentsService): FastifyPluginCallback {
  return (fastify, _opts, done): void => {
    fastify.post(
      "/bulk-cancel-confirmed",
      {
        schema: {
          tags: ["appointments"],
          summary: "Bulk cancel confirmed appointments",
          description:
            "Marks multiple CONFIRMED appointments as CANCELLED (owner dashboard). Use after reviewing block conflicts.",
          params: bulkCancelAppointmentsParamsSchema,
          body: bulkCancelAppointmentsBodySchema,
          response: {
            200: bulkCancelAppointmentsResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<BulkCancelAppointmentsResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = bulkCancelAppointmentsParamsSchema.parse(request.params);
        const body = bulkCancelAppointmentsBodySchema.parse(request.body);
        return service.bulkCancelConfirmed(user.id, establishmentId, body);
      },
    );

    done();
  };
}
