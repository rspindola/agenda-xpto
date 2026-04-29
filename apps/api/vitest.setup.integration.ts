import { beforeAll } from "vitest";

beforeAll(() => {
  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    throw new Error(
      "DATABASE_URL_TEST is required for integration tests. Copy from .env.example and ensure the database exists.",
    );
  }
  process.env.DATABASE_URL = testUrl;
});
