import type { FastifyInstance } from "fastify";

import { appointmentsModulePlugin } from "~/modules/appointments/appointments.plugin.js";

export async function registerAppointmentsModule(app: FastifyInstance): Promise<void> {
  await app.register(appointmentsModulePlugin, { prefix: "/api/v1/establishments" });
}
