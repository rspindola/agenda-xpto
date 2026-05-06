import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { FastifyBaseLogger } from "fastify";

import { sendAuthTransactionalEmail } from "~/lib/auth-mail.js";
import { onUserCreated } from "~/modules/auth/auth.service.js";

import { prisma } from "~/lib/prisma.js";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function initializeAuth(logger: FastifyBaseLogger): ReturnType<typeof betterAuth> {
  // Same-origin Swagger UI (/docs) sends Origin: http://localhost:PORT — must be trusted or sign-in fails (403 / browser "Failed to fetch").
  const port = process.env.PORT ?? "3001";
  const webUrl = process.env.WEB_URL ?? "http://localhost:5173";
  const authBaseUrl = process.env.AUTH_URL ?? `http://localhost:${port}`;
  const apiBaseUrl = process.env.API_URL;

  const trustedOrigins = Array.from(
    new Set(
      [webUrl, authBaseUrl, apiBaseUrl, `http://localhost:${port}`, `http://127.0.0.1:${port}`].filter(
        (o): o is string => typeof o === "string" && o.length > 0,
      ),
    ),
  );

  const instance = betterAuth({
    basePath: "/api/auth",
    secret: process.env.AUTH_SECRET ?? "",
    baseURL: authBaseUrl,
    trustedOrigins,
    // usePlural must stay false: Prisma delegates are `user`, `session`, `account` (singular), even when @@map("users") etc.
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    databaseHooks: {
      user: {
        create: {
          after: async (user, _ctx) => {
            await onUserCreated(user.id);
          },
        },
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthTransactionalEmail({
          logger,
          kind: "verification",
          to: user.email,
          url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: true,
      autoSignIn: false,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthTransactionalEmail({
          logger,
          kind: "password_reset",
          to: user.email,
          url,
        });
      },
      resetPasswordTokenExpiresIn: 3600,
    },
  // Better Auth infers a plugin-specific Auth<TOptions>; double assertion is the supported way to store a singleton instance.
  }) as unknown as ReturnType<typeof betterAuth>;

  authInstance = instance;
  return instance;
}

export function getAuth(): ReturnType<typeof betterAuth> {
  if (!authInstance) {
    throw new Error("Auth is not initialized. Call initializeAuth() before getAuth().");
  }
  return authInstance;
}
