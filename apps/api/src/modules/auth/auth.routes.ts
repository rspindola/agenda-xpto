import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { getAuth, initializeAuth } from "~/lib/auth.js";
import { AppError } from "~/shared/errors/AppError.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import { type MeResponse, meResponseSchema } from "./auth.schema.js";

function buildWebRequest(request: FastifyRequest): Request {
  const host = request.headers.host ?? "localhost:3001";
  const protocol = request.protocol;
  const base = process.env.API_URL ?? `${protocol}://${host}`;
  const url = new URL(request.url, base);
  const headers = fromNodeHeaders(request.headers);
  const method = request.method;

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    if (request.body === undefined || request.body === null) {
      body = undefined;
    } else if (typeof request.body === "string") {
      body = request.body;
    } else if (Buffer.isBuffer(request.body)) {
      body = request.body.toString("utf8");
    } else {
      body = JSON.stringify(request.body);
    }
  }

  return new Request(url.toString(), {
    method,
    headers,
    body,
  });
}

async function forwardAuthResponse(reply: FastifyReply, response: Response): Promise<void> {
  reply.status(response.status);
  const setCookies =
    typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  for (const cookie of setCookies) {
    reply.raw.appendHeader("Set-Cookie", cookie);
  }
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }
    reply.header(key, value);
  });
  const text = await response.text();
  if (text.length === 0) {
    return reply.send();
  }
  try {
    return await reply.send(JSON.parse(text) as unknown);
  } catch {
    return await reply.send(text);
  }
}

export function registerAuthModule(app: FastifyInstance): void {
  initializeAuth(app.log);

  app.all(
    "/api/auth/*",
    {
      schema: {
        tags: ["auth"],
        hide: true,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        const webRequest = buildWebRequest(request);
        const response = await getAuth().handler(webRequest);
        await forwardAuthResponse(reply, response);
      } catch (error: unknown) {
        app.log.error({ err: error }, "Better Auth handler failed");
        throw error;
      }
    },
  );

  app.get(
    "/api/v1/me",
    {
      preHandler: requireSession,
      schema: {
        tags: ["auth"],
        summary: "Get current session user",
        description:
          "Returns the authenticated user from the Better Auth session cookie. Requires a valid session (typically after email verification and sign-in).",
        response: {
          200: meResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    (request: FastifyRequest): MeResponse => {
      const user = request.authUser;
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
      }
      return { user };
    },
  );
}
