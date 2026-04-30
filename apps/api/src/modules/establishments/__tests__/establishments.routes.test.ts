import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildServer } from "~/server.js";

describe("Establishments routes (HTTP)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 401 for POST /api/v1/establishments without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/establishments",
      headers: { "content-type": "application/json" },
      payload: {
        name: "Downtown Barber Shop",
        email: "owner@example.com",
        timezone: "America/Sao_Paulo",
      },
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for GET /api/v1/establishments without session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/establishments",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for DELETE /api/v1/establishments/:id without session", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/v1/establishments/some-establishment-id",
    });
    expect(res.statusCode).toBe(401);
  });
});
