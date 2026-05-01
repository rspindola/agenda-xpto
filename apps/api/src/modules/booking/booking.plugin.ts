import type { FastifyPluginCallback } from "fastify";

import { BookingRepository } from "./booking.repository.js";
import { BookingService } from "./booking.service.js";
import {
  cancelAppointmentParamsSchema,
  cancelPublicAppointmentErrorResponses,
  cancelPublicAppointmentResponseSchema,
  createPublicAppointmentBodySchema,
  createPublicAppointmentErrorResponses,
  createPublicAppointmentResponseSchema,
  establishmentSlugParamSchema,
  getAvailableSlotsErrorResponses,
  getAvailableSlotsQuerySchema,
  getAvailableSlotsResponseSchema,
  getPublicEstablishmentErrorResponses,
  getPublicEstablishmentResponseSchema,
} from "./booking.schema.js";

export const bookingModulePlugin: FastifyPluginCallback = (fastify, _opts, done): void => {
  const repository = new BookingRepository();
  const service = new BookingService(repository);

  fastify.get(
    "/establishments/:slug",
    {
      schema: {
        tags: ["booking"],
        summary: "Get public establishment by slug",
        description:
          "Returns public booking page data: establishment name, address, phone, timezone, minimum advance, active services, and active professionals. No authentication.",
        params: establishmentSlugParamSchema,
        response: {
          200: getPublicEstablishmentResponseSchema,
          404: getPublicEstablishmentErrorResponses[404],
        },
      },
    },
    async (request, reply) => {
      const { slug } = establishmentSlugParamSchema.parse(request.params);
      const data = await service.getEstablishmentBySlug(slug);
      return reply.status(200).send(data);
    },
  );

  fastify.get(
    "/establishments/:slug/slots",
    {
      schema: {
        tags: ["booking"],
        summary: "List available booking slots",
        description:
          "Computes 15-minute slot starts for the selected services total duration, applying business hours, professional availability, holidays, blocks, confirmed appointments, and minimum advance. Without professionalId, returns one entry per (slot, professional) pair.",
        params: establishmentSlugParamSchema,
        querystring: getAvailableSlotsQuerySchema,
        response: {
          200: getAvailableSlotsResponseSchema,
          400: getAvailableSlotsErrorResponses[400],
          404: getAvailableSlotsErrorResponses[404],
        },
      },
    },
    async (request, reply) => {
      const { slug } = establishmentSlugParamSchema.parse(request.params);
      const query = getAvailableSlotsQuerySchema.parse(request.query);
      const slots = await service.getAvailableSlots(
        slug,
        {
          date: query.date,
          serviceIds: query.serviceIds,
          professionalId: query.professionalId,
        },
        new Date(),
      );
      return reply.status(200).send({ slots });
    },
  );

  fastify.post(
    "/establishments/:slug/appointments",
    {
      schema: {
        tags: ["booking", "booking-write"],
        summary: "Create confirmed public appointment",
        description:
          "Creates a CONFIRMED appointment with service snapshots and a cancel token. Re-validates slot availability under a pessimistic lock. Starter plan enforces monthly quota.",
        params: establishmentSlugParamSchema,
        body: createPublicAppointmentBodySchema,
        response: {
          201: createPublicAppointmentResponseSchema,
          400: createPublicAppointmentErrorResponses[400],
          404: createPublicAppointmentErrorResponses[404],
          409: createPublicAppointmentErrorResponses[409],
          422: createPublicAppointmentErrorResponses[422],
        },
      },
    },
    async (request, reply) => {
      const { slug } = establishmentSlugParamSchema.parse(request.params);
      const body = createPublicAppointmentBodySchema.parse(request.body);
      const result = await service.createAppointment(slug, body, new Date());
      request.log.info(
        { module: "booking", event: "notifications_enqueue_placeholder", appointmentId: result.id },
        "TODO enqueue appointment confirmation email (module 07).",
      );
      return reply.status(201).send(result);
    },
  );

  fastify.post(
    "/appointments/cancel/:cancelToken",
    {
      schema: {
        tags: ["booking"],
        summary: "Cancel appointment using cancel token",
        description:
          "Cancels a CONFIRMED appointment when the cancel token is unused. Invalidates the token. No authentication.",
        params: cancelAppointmentParamsSchema,
        response: {
          200: cancelPublicAppointmentResponseSchema,
          404: cancelPublicAppointmentErrorResponses[404],
          422: cancelPublicAppointmentErrorResponses[422],
        },
      },
    },
    async (request, reply) => {
      const { cancelToken } = cancelAppointmentParamsSchema.parse(request.params);
      const result = await service.cancelAppointment(cancelToken);
      request.log.info(
        { module: "booking", event: "notifications_enqueue_placeholder", appointmentId: result.appointmentId },
        "TODO enqueue cancellation emails (module 07).",
      );
      return reply.status(200).send(result);
    },
  );

  done();
};
