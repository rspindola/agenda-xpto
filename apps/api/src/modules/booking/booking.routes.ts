import type { FastifyInstance } from "fastify";

import { bookingModulePlugin } from "~/modules/booking/booking.plugin.js";

export async function registerBookingModule(app: FastifyInstance): Promise<void> {
  await app.register(bookingModulePlugin, { prefix: "/api/v1/public/booking" });
}
