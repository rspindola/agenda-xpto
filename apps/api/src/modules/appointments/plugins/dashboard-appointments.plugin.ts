import type { FastifyPluginCallback } from "fastify";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { AppointmentsService } from "~/modules/appointments/appointments.service.js";
import {
  type CancelAppointmentResponse,
  type GetAppointmentResponse,
  type ListAppointmentsResponse,
  type MarkStatusResponse,
  type RescheduleAppointmentResponse,
  appointmentIdParamsSchema,
  cancelAppointmentResponseSchema,
  createManualAppointmentBodySchema,
  createManualAppointmentResponseSchema,
  getAppointmentResponseSchema,
  listAppointmentsParamsSchema,
  listAppointmentsQuerySchema,
  listAppointmentsResponseSchema,
  markStatusResponseSchema,
  rescheduleAppointmentBodySchema,
  rescheduleAppointmentResponseSchema,
} from "~/modules/appointments/appointments.schema.js";

const commonErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  404: errorResponseSchema,
  409: errorResponseSchema,
  422: errorResponseSchema,
} as const;

export function createDashboardAppointmentsRoutesPlugin(service: AppointmentsService): FastifyPluginCallback {
  return (fastify, _opts, done): void => {
    fastify.get(
      "/",
      {
        schema: {
          tags: ["appointments"],
          summary: "List appointments",
          description:
            "Returns paginated appointments for the establishment. Requires at least one of from or to (local YYYY-MM-DD in the establishment timezone), converted to UTC for querying.",
          params: listAppointmentsParamsSchema,
          querystring: listAppointmentsQuerySchema,
          response: {
            200: listAppointmentsResponseSchema,
            400: errorResponseSchema,
            401: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request): Promise<ListAppointmentsResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = listAppointmentsParamsSchema.parse(request.params);
        const query = listAppointmentsQuerySchema.parse(request.query);
        return service.list(user.id, establishmentId, query);
      },
    );

    fastify.get(
      "/:appointmentId",
      {
        schema: {
          tags: ["appointments"],
          summary: "Get appointment by ID",
          description: "Returns one appointment with service line snapshots. Omits cancel token fields.",
          params: appointmentIdParamsSchema,
          response: {
            200: getAppointmentResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<GetAppointmentResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, appointmentId } = appointmentIdParamsSchema.parse(request.params);
        return service.getById(user.id, establishmentId, appointmentId);
      },
    );

    fastify.post(
      "/",
      {
        schema: {
          tags: ["appointments"],
          summary: "Create manual appointment",
          description:
            "Creates a CONFIRMED appointment from the owner dashboard with the same slot rules as public booking (no Starter quota check; cancel token is stored but not returned).",
          params: listAppointmentsParamsSchema,
          body: createManualAppointmentBodySchema,
          response: {
            201: createManualAppointmentResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request, reply): Promise<void> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = listAppointmentsParamsSchema.parse(request.params);
        const body = createManualAppointmentBodySchema.parse(request.body);
        const created = await service.createManual(user.id, establishmentId, body, new Date());
        await reply.status(201).send(created);
      },
    );

    fastify.patch(
      "/:appointmentId",
      {
        schema: {
          tags: ["appointments"],
          summary: "Reschedule appointment",
          description:
            "Updates startAt for a CONFIRMED appointment and recalculates endAt from snapshot durations. Excludes the appointment itself from overlap detection.",
          params: appointmentIdParamsSchema,
          body: rescheduleAppointmentBodySchema,
          response: {
            200: rescheduleAppointmentResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<RescheduleAppointmentResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, appointmentId } = appointmentIdParamsSchema.parse(request.params);
        const body = rescheduleAppointmentBodySchema.parse(request.body);
        return service.reschedule(user.id, establishmentId, appointmentId, body, new Date());
      },
    );

    fastify.post(
      "/:appointmentId/cancel",
      {
        schema: {
          tags: ["appointments"],
          summary: "Cancel appointment (owner)",
          description: "Sets a CONFIRMED appointment to CANCELLED with cancelledBy OWNER.",
          params: appointmentIdParamsSchema,
          response: {
            200: cancelAppointmentResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<CancelAppointmentResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, appointmentId } = appointmentIdParamsSchema.parse(request.params);
        return service.cancelOne(user.id, establishmentId, appointmentId);
      },
    );

    fastify.post(
      "/:appointmentId/mark-completed",
      {
        schema: {
          tags: ["appointments"],
          summary: "Mark appointment completed",
          description: "Transitions CONFIRMED to COMPLETED when the appointment start is not in the future.",
          params: appointmentIdParamsSchema,
          response: {
            200: markStatusResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<MarkStatusResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, appointmentId } = appointmentIdParamsSchema.parse(request.params);
        return service.markCompleted(user.id, establishmentId, appointmentId);
      },
    );

    fastify.post(
      "/:appointmentId/mark-no-show",
      {
        schema: {
          tags: ["appointments"],
          summary: "Mark appointment no-show",
          description: "Transitions CONFIRMED to NO_SHOW when the appointment start is not in the future.",
          params: appointmentIdParamsSchema,
          response: {
            200: markStatusResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request): Promise<MarkStatusResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, appointmentId } = appointmentIdParamsSchema.parse(request.params);
        return service.markNoShow(user.id, establishmentId, appointmentId);
      },
    );

    done();
  };
}
