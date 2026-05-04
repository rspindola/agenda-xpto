import type { FastifyInstance } from "fastify";

import { reportsModulePlugin } from "~/modules/reports/reports.plugin.js";

export async function registerReportsModule(app: FastifyInstance): Promise<void> {
  await app.register(reportsModulePlugin(), { prefix: "/api/v1/establishments" });
}
