import type { ConnectionOptions } from "bullmq";

function parseRedisUrl(url: string): ConnectionOptions {
  try {
    const u = new URL(url);
    const dbPath = u.pathname?.replace("/", "") ?? "";
    const db = dbPath ? Number.parseInt(dbPath, 10) : undefined;
    return {
      host: u.hostname,
      port: u.port ? Number.parseInt(u.port, 10) : 6379,
      username: u.username || undefined,
      password: u.password || undefined,
      db: Number.isFinite(db) ? db : undefined,
    };
  } catch {
    return { host: "127.0.0.1", port: 6379 };
  }
}

const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

/** BullMQ / ioredis connection options (no `maxRetriesPerRequest` — workers set their own). */
export const bullmqConnection: ConnectionOptions = parseRedisUrl(url);
