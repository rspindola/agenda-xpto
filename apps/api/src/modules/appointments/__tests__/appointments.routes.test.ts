import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildServer } from "~/server.js";

describe("Appointments routes (HTTP)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 401 for POST bulk-cancel-confirmed without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/establishments/some-establishment-id/appointments/bulk-cancel-confirmed",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ appointmentIds: ["appt_1"] }),
    });
    expect(res.statusCode).toBe(401);
  });
});
