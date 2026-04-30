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

  it("should return 401 for PUT business-hours weekday without session", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/api/v1/establishments/some-establishment-id/availability/business-hours/MON",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ closed: true }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for GET professionals without session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/establishments/some-establishment-id/professionals",
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

  it("should return 401 for POST blocks without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/establishments/some-establishment-id/availability/blocks",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        scope: "ESTABLISHMENT",
        startsAt: "2026-06-01T10:00:00.000Z",
        endsAt: "2026-06-01T12:00:00.000Z",
        reason: "Maintenance",
      }),
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

  it("should return 401 for POST professional availability without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/establishments/some-establishment-id/availability/professionals/some-professional-id/availabilities",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ weekday: "MON", startsAt: "09:00", endsAt: "12:00" }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for PATCH professional availability without session", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/v1/establishments/some-establishment-id/availability/professionals/some-professional-id/availabilities/some-availability-id",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ weekday: "TUE", startsAt: "10:00", endsAt: "14:00" }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for DELETE professional availability without session", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/v1/establishments/some-establishment-id/availability/professionals/some-professional-id/availabilities/some-availability-id",
    });
    expect(res.statusCode).toBe(401);
  });
});
