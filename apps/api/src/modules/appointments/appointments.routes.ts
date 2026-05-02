import type { FastifyInstance } from "fastify";

import { appointmentsModulePlugin } from "~/modules/appointments/appointments.plugin.js";
import type { NotificationsService } from "~/modules/notifications/notifications.service.js";

export async function registerAppointmentsModule(
  app: FastifyInstance,
  options: { notificationsService: NotificationsService },
): Promise<void> {
  await app.register(appointmentsModulePlugin(options.notificationsService), { prefix: "/api/v1/establishments" });
}
