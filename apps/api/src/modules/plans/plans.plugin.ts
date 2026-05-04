import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import { registerPlansRoutes } from "~/modules/plans/plans.routes.js";

function createPlansRoutesPlugin(): FastifyPluginAsync {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async (fastify): Promise<void> => {
    registerPlansRoutes(fastify);
  };
}

export async function registerPlansModule(app: FastifyInstance): Promise<void> {
  await app.register(createPlansRoutesPlugin(), { prefix: "/api/v1" });
}
