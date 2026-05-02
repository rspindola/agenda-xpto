import type { FastifyInstance } from "fastify";

import { createBookingModulePlugin } from "~/modules/booking/booking.plugin.js";
import type { NotificationsService } from "~/modules/notifications/notifications.service.js";

export async function registerBookingModule(
  app: FastifyInstance,
  options: { notificationsService: NotificationsService },
): Promise<void> {
  await app.register(createBookingModulePlugin(options.notificationsService), {
    prefix: "/api/v1/public/booking",
  });
}
