import type { FastifyPluginAsync } from "fastify";

import { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";

import { AppointmentsRepository } from "./appointments.repository.js";
import { AppointmentsService } from "./appointments.service.js";
import { createBulkCancelAppointmentsRoutesPlugin } from "./plugins/bulk-cancel.plugin.js";

export const appointmentsModulePlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.addHook("preHandler", requireSession);

  const repository = new AppointmentsRepository();
  const establishmentsRepository = new EstablishmentsRepository();
  const service = new AppointmentsService(repository, establishmentsRepository);

  await fastify.register(createBulkCancelAppointmentsRoutesPlugin(service), {
    prefix: "/:establishmentId/appointments",
  });
};
