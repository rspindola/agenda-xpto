import type { FastifyPluginAsync } from "fastify";

import { BookingRepository } from "~/modules/booking/booking.repository.js";
import { BookingService } from "~/modules/booking/booking.service.js";
import { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";

import { AppointmentsRepository } from "./appointments.repository.js";
import { AppointmentsService } from "./appointments.service.js";
import { createBulkCancelAppointmentsRoutesPlugin } from "./plugins/bulk-cancel.plugin.js";
import { createDashboardAppointmentsRoutesPlugin } from "./plugins/dashboard-appointments.plugin.js";

export const appointmentsModulePlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.addHook("preHandler", requireSession);

  const repository = new AppointmentsRepository();
  const establishmentsRepository = new EstablishmentsRepository();
  const bookingRepository = new BookingRepository();
  const bookingService = new BookingService(bookingRepository);
  const service = new AppointmentsService(repository, establishmentsRepository, bookingService);

  await fastify.register(createDashboardAppointmentsRoutesPlugin(service), {
    prefix: "/:establishmentId/appointments",
  });
  await fastify.register(createBulkCancelAppointmentsRoutesPlugin(service), {
    prefix: "/:establishmentId/appointments",
  });
};
