import { buildServer } from "./server.js";

const PORT = Number.parseInt(process.env.PORT ?? "3001", 10);

async function main(): Promise<void> {
  const app = await buildServer();

  await app.listen({ port: PORT, host: "0.0.0.0" });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, "shutdown");
    await app.close();
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console -- fatal startup path only
  console.error(err);
  process.exit(1);
});
