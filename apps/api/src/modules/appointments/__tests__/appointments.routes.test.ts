import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildServer } from "~/server.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

  it("should return 401 for GET appointments list without session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/establishments/some-establishment-id/appointments?from=2026-01-01&page=1&pageSize=20",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for POST appointment cancel without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/establishments/some-establishment-id/appointments/appt_1/cancel",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should expose dashboard appointments operations in OpenAPI", async () => {
    const res = await app.inject({ method: "GET", url: "/docs/json" });
    expect(res.statusCode).toBe(200);
    const specUnknown: unknown = JSON.parse(res.payload);
    if (!isRecord(specUnknown) || !("paths" in specUnknown)) {
      throw new Error("Invalid OpenAPI document.");
    }
    if (!isRecord(specUnknown.paths)) {
      throw new Error("Invalid OpenAPI paths.");
    }
    const pathKeys = Object.keys(specUnknown.paths);
    const listPath = "/api/v1/establishments/{establishmentId}/appointments/";
    const detailPath = "/api/v1/establishments/{establishmentId}/appointments/{appointmentId}";
    expect(pathKeys).toContain(listPath);
    expect(pathKeys).toContain(detailPath);
    expect(pathKeys).toContain(`${detailPath}/cancel`);
    expect(pathKeys).toContain(`${detailPath}/mark-completed`);
    expect(pathKeys).toContain(`${detailPath}/mark-no-show`);
    expect(pathKeys).toContain("/api/v1/establishments/{establishmentId}/notifications");

    const listEntry = specUnknown.paths[listPath];
    const detailEntry = specUnknown.paths[detailPath];
    if (!isRecord(listEntry) || !isRecord(detailEntry)) {
      throw new Error("OpenAPI list or detail path is not an object.");
    }
    expect(Object.keys(listEntry)).toEqual(expect.arrayContaining(["get", "post"]));
    expect(Object.keys(detailEntry)).toEqual(expect.arrayContaining(["get", "patch"]));
  });
});
