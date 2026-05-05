import type { FastifyInstance, FastifyPluginCallback } from "fastify";

import { registerPlansRoutes } from "~/modules/plans/plans.routes.js";

function createPlansRoutesPlugin(): FastifyPluginCallback {
  return (fastify, _opts, done) => {
    registerPlansRoutes(fastify);
    done();
  };
}

export async function registerPlansModule(app: FastifyInstance): Promise<void> {
  await app.register(createPlansRoutesPlugin(), { prefix: "/api/v1" });
}
