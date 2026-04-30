import type { FastifyReply, FastifyRequest } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();

vi.mock("~/lib/auth.js", () => ({
  getAuth: (): { api: { getSession: typeof getSession } } => ({
    api: { getSession },
  }),
}));

vi.mock("better-auth/node", () => ({
  fromNodeHeaders: vi.fn(() => ({})),
}));

import { requireSession } from "../requireSession.js";

describe("requireSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw UNAUTHORIZED when session has no user", async () => {
    getSession.mockResolvedValue(null);

    const request = { headers: {} } as FastifyRequest;
    const reply = {} as FastifyReply;

    await expect(requireSession(request, reply)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("should attach authUser when session is valid", async () => {
    getSession.mockResolvedValue({
      user: {
        id: "user_1",
        email: "a@b.com",
        emailVerified: true,
        name: "Test",
      },
    });

    const request = { headers: {} } as FastifyRequest & { authUser?: unknown };
    const reply = {} as FastifyReply;

    await requireSession(request, reply);

    expect(request.authUser).toEqual({
      id: "user_1",
      email: "a@b.com",
      emailVerified: true,
      name: "Test",
    });
  });
});
