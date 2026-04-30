import type { FastifyInstance } from "fastify";

import { availabilityModulePlugin } from "./availability.plugin.js";

/**
 * Registers availability HTTP routes under `/api/v1/establishments` using a composable plugin tree.
 */
export async function registerAvailabilityModule(app: FastifyInstance): Promise<void> {
  await app.register(availabilityModulePlugin, { prefix: "/api/v1/establishments" });
}
