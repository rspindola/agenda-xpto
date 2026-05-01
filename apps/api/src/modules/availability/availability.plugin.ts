import type { FastifyPluginAsync } from "fastify";

import { AppointmentsRepository } from "~/modules/appointments/appointments.repository.js";
import { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { findSubscriptionByUserId } from "~/modules/plans/subscription.repository.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";

import { AvailabilityRepository } from "~/modules/availability/availability.repository.js";
import { AvailabilityService } from "~/modules/availability/availability.service.js";
import { createBlocksRoutesPlugin } from "~/modules/availability/plugins/blocks.plugin.js";
import { createBusinessHoursRoutesPlugin } from "~/modules/availability/plugins/business-hours.plugin.js";
import { createProfessionalAvailabilitiesRoutesPlugin } from "~/modules/availability/plugins/professional-availabilities.plugin.js";
import { createProfessionalsRoutesPlugin } from "~/modules/availability/plugins/professionals.plugin.js";
import { ProfessionalsRepository } from "~/modules/availability/professionals.repository.js";
import { ProfessionalsService } from "~/modules/availability/professionals.service.js";

/**
 * Encapsulated availability module: session is required for all nested route plugins.
 * Child plugins are registered with path prefixes so each sub-domain stays isolated (Fastify best practices).
 */
export const availabilityModulePlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.addHook("preHandler", requireSession);

  const repository = new AvailabilityRepository();
  const establishmentsRepository = new EstablishmentsRepository();
  const appointmentsRepository = new AppointmentsRepository();
  const service = new AvailabilityService(repository, establishmentsRepository, appointmentsRepository);
  const professionalsRepository = new ProfessionalsRepository();
  const professionalsService = new ProfessionalsService(
    establishmentsRepository,
    professionalsRepository,
    findSubscriptionByUserId,
  );

  await fastify.register(createProfessionalsRoutesPlugin(professionalsService), {
    prefix: "/:establishmentId/professionals",
  });

  await fastify.register(createBusinessHoursRoutesPlugin(service), {
    prefix: "/:establishmentId/availability/business-hours",
  });

  await fastify.register(createBlocksRoutesPlugin(service), {
    prefix: "/:establishmentId/availability/blocks",
  });

  await fastify.register(createProfessionalAvailabilitiesRoutesPlugin(service), {
    prefix: "/:establishmentId/availability/professionals/:professionalId/availabilities",
  });
};
