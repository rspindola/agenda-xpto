import type { FastifyPluginAsync } from "fastify";

import { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import * as subscriptionRepository from "~/modules/plans/subscription.repository.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";
import { ReportsRepository } from "~/modules/reports/reports.repository.js";
import { ReportsService } from "~/modules/reports/reports.service.js";
import { createReportsRoutesPlugin } from "~/modules/reports/plugins/reports-routes.plugin.js";

export function reportsModulePlugin(): FastifyPluginAsync {
  return async (fastify): Promise<void> => {
    fastify.addHook("preHandler", requireSession);

    const repository = new ReportsRepository();
    const establishmentsRepository = new EstablishmentsRepository();
    const service = new ReportsService(repository, establishmentsRepository, subscriptionRepository);

    await fastify.register(createReportsRoutesPlugin(service), {
      prefix: "/:establishmentId/reports",
    });
  };
}
