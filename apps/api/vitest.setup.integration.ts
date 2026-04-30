import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeAll } from "vitest";

/**
 * Loads `.env` into `process.env` for keys that are still undefined.
 * Vitest `envDir` does not reliably apply to nested `projects[]`; monorepo `.env` lives at repo root.
 */
function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }
  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnvFile(path.resolve(dirname, "../../.env"));
loadEnvFile(path.resolve(dirname, ".env"));

beforeAll(() => {
  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    throw new Error(
      "DATABASE_URL_TEST is required for integration tests. Set it in the repo root `.env` or `apps/api/.env` (see .env.example).",
    );
  }
  process.env.DATABASE_URL = testUrl;
});
