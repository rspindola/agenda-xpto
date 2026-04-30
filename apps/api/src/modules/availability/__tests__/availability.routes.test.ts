import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildServer } from "~/server.js";

describe("Availability routes (HTTP)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 401 for GET business-hours without session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/establishments/some-establishment-id/availability/business-hours",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for GET holidays without session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/establishments/some-establishment-id/availability/holidays",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for GET blocks without session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/establishments/some-establishment-id/availability/blocks",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for GET professional availabilities without session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/establishments/some-establishment-id/availability/professionals/some-professional-id/availabilities",
    });
    expect(res.statusCode).toBe(401);
  });
});
