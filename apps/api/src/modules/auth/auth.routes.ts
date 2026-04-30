import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { getAuth, initializeAuth } from "~/lib/auth.js";
import { AppError } from "~/shared/errors/AppError.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import {
  betterAuthErrorBodySchema,
  betterAuthJsonBodySchema,
  changePasswordBodySchema,
  type MeResponse,
  meResponseSchema,
  requestPasswordResetBodySchema,
  resetPasswordBodySchema,
  signInEmailBodySchema,
  signOutBodySchema,
  signUpEmailBodySchema,
  signUpEmailResponseSchema,
  verifyEmailQuerySchema,
} from "./auth.schema.js";

const BETTER_AUTH_EMAIL_PASSWORD_DOCS =
  "https://www.better-auth.com/docs/authentication/email-password";

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

async function handleBetterAuthProxy(
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance,
): Promise<void> {
  try {
    const webRequest = buildWebRequest(request);
    const response = await getAuth().handler(webRequest);
    await forwardAuthResponse(reply, response);
  } catch (error: unknown) {
    app.log.error({ err: error }, "Better Auth handler failed");
    throw error;
  }
}

export function registerAuthModule(app: FastifyInstance): void {
  initializeAuth(app.log);

  const proxy = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await handleBetterAuthProxy(request, reply, app);
  };

  app.post(
    "/api/auth/sign-up/email",
    {
      schema: {
        tags: ["auth"],
        summary: "Better Auth: sign up with email",
        description: `Creates a user and credential account (Better Auth). Full contract: ${BETTER_AUTH_EMAIL_PASSWORD_DOCS}. Use header Origin matching WEB_URL when calling from curl.`,
        body: signUpEmailBodySchema,
        response: {
          200: signUpEmailResponseSchema,
          422: betterAuthErrorBodySchema,
          403: betterAuthErrorBodySchema,
          500: errorResponseSchema,
        },
      },
    },
    proxy,
  );

  app.post(
    "/api/auth/sign-in/email",
    {
      schema: {
        tags: ["auth"],
        summary: "Better Auth: sign in with email",
        description: `Starts a session when credentials are valid and email is verified (if required). Contract: ${BETTER_AUTH_EMAIL_PASSWORD_DOCS}. Send Origin: WEB_URL to avoid CSRF 403.`,
        body: signInEmailBodySchema,
        response: {
          200: betterAuthJsonBodySchema,
          403: betterAuthErrorBodySchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    proxy,
  );

  app.post(
    "/api/auth/sign-out",
    {
      schema: {
        tags: ["auth"],
        summary: "Better Auth: sign out",
        description: `Ends the current session (cookie). Contract: ${BETTER_AUTH_EMAIL_PASSWORD_DOCS}.`,
        body: signOutBodySchema,
        response: {
          200: betterAuthJsonBodySchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    proxy,
  );

  app.get(
    "/api/auth/verify-email",
    {
      schema: {
        tags: ["auth"],
        summary: "Better Auth: verify email (link target)",
        description: `Consumes the verification token from the email link; may set session cookies when autoSignInAfterVerification is enabled. Query params: token (required), callbackURL (optional). See ${BETTER_AUTH_EMAIL_PASSWORD_DOCS}.`,
        querystring: verifyEmailQuerySchema,
        response: {
          302: z.null(),
          200: betterAuthJsonBodySchema,
          400: betterAuthErrorBodySchema,
          500: errorResponseSchema,
        },
      },
    },
    proxy,
  );

  app.post(
    "/api/auth/request-password-reset",
    {
      schema: {
        tags: ["auth"],
        summary: "Better Auth: request password reset",
        description: `Triggers sendResetPassword (email or dev log). Contract: ${BETTER_AUTH_EMAIL_PASSWORD_DOCS}.`,
        body: requestPasswordResetBodySchema,
        response: {
          200: betterAuthJsonBodySchema,
          400: betterAuthErrorBodySchema,
          500: errorResponseSchema,
        },
      },
    },
    proxy,
  );

  app.post(
    "/api/auth/reset-password",
    {
      schema: {
        tags: ["auth"],
        summary: "Better Auth: reset password with token",
        description: `Sets a new password using the token from the reset email. Contract: ${BETTER_AUTH_EMAIL_PASSWORD_DOCS}.`,
        body: resetPasswordBodySchema,
        response: {
          200: betterAuthJsonBodySchema,
          400: betterAuthErrorBodySchema,
          500: errorResponseSchema,
        },
      },
    },
    proxy,
  );

  app.post(
    "/api/auth/change-password",
    {
      schema: {
        tags: ["auth"],
        summary: "Better Auth: change password (authenticated)",
        description: `Changes password for the current session. Requires session cookie. Contract: ${BETTER_AUTH_EMAIL_PASSWORD_DOCS}.`,
        body: changePasswordBodySchema,
        response: {
          200: betterAuthJsonBodySchema,
          401: errorResponseSchema,
          400: betterAuthErrorBodySchema,
          500: errorResponseSchema,
        },
      },
    },
    proxy,
  );

  app.all(
    "/api/auth/*",
    {
      schema: {
        tags: ["auth"],
        summary: "Better Auth: other routes",
        description: `Proxies any other Better Auth HTTP paths (plugins, OAuth callbacks, etc.). Documented email/password routes are listed separately in this tag. Reference: https://www.better-auth.com/docs`,
        hide: true,
      },
    },
    proxy,
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
