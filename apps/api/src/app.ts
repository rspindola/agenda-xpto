import cors from "@fastify/cors";
import Fastify from "fastify";

const PORT = Number.parseInt(process.env.PORT ?? "3001", 10);

async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  // @fastify/jwt instalado — registo fica para o módulo de auth / rotas protegidas.

  app.get("/health", async () => ({
    status: "ok" as const,
    timestamp: new Date().toISOString(),
  }));

  return app;
}

async function main() {
  const app = await buildServer();

  await app.listen({ port: PORT, host: "0.0.0.0" });

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutdown");
    await app.close();
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
