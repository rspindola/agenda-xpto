import type { FastifyPluginAsync } from "fastify";

import { BookingRepository } from "~/modules/booking/booking.repository.js";
import { BookingService } from "~/modules/booking/booking.service.js";
import { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import type { NotificationsService } from "~/modules/notifications/notifications.service.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";

import { AppointmentsRepository } from "~/modules/appointments/appointments.repository.js";
import { AppointmentsService } from "~/modules/appointments/appointments.service.js";
import { createBulkCancelAppointmentsRoutesPlugin } from "~/modules/appointments/plugins/bulk-cancel.plugin.js";
import { createDashboardAppointmentsRoutesPlugin } from "~/modules/appointments/plugins/dashboard-appointments.plugin.js";

export function appointmentsModulePlugin(notificationsService: NotificationsService): FastifyPluginAsync {
  return async (fastify): Promise<void> => {
    fastify.addHook("preHandler", requireSession);

    const repository = new AppointmentsRepository();
    const establishmentsRepository = new EstablishmentsRepository();
    const bookingRepository = new BookingRepository();
    const bookingService = new BookingService(bookingRepository);
    const service = new AppointmentsService(
      repository,
      establishmentsRepository,
      bookingService,
      notificationsService,
    );

    await fastify.register(createDashboardAppointmentsRoutesPlugin(service), {
      prefix: "/:establishmentId/appointments",
    });
    await fastify.register(createBulkCancelAppointmentsRoutesPlugin(service), {
      prefix: "/:establishmentId/appointments",
    });
  };
}
