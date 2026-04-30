import type { FastifyPluginAsync } from "fastify";

import { requireSession } from "~/shared/middlewares/requireSession.js";

import { AvailabilityRepository } from "./availability.repository.js";
import { AvailabilityService } from "./availability.service.js";
import { createBlocksRoutesPlugin } from "./plugins/blocks.plugin.js";
import { createBusinessHoursRoutesPlugin } from "./plugins/business-hours.plugin.js";
import { createHolidaysRoutesPlugin } from "./plugins/holidays.plugin.js";
import { createProfessionalAvailabilitiesRoutesPlugin } from "./plugins/professional-availabilities.plugin.js";

/**
 * Encapsulated availability module: session is required for all nested route plugins.
 * Child plugins are registered with path prefixes so each sub-domain stays isolated (Fastify best practices).
 */
export const availabilityModulePlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.addHook("preHandler", requireSession);

  const repository = new AvailabilityRepository();
  const service = new AvailabilityService(repository);

  await fastify.register(createBusinessHoursRoutesPlugin(service), {
    prefix: "/:establishmentId/availability/business-hours",
  });

  await fastify.register(createHolidaysRoutesPlugin(service), {
    prefix: "/:establishmentId/availability/holidays",
  });

  await fastify.register(createBlocksRoutesPlugin(service), {
    prefix: "/:establishmentId/availability/blocks",
  });

  await fastify.register(createProfessionalAvailabilitiesRoutesPlugin(service), {
    prefix: "/:establishmentId/availability/professionals/:professionalId/availabilities",
  });
};
