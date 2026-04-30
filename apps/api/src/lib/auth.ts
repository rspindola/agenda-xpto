import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { FastifyBaseLogger } from "fastify";

import { sendAuthTransactionalEmail } from "~/lib/auth-mail.js";
import { onUserCreated } from "~/modules/auth/auth.service.js";

import { prisma } from "./prisma.js";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function initializeAuth(logger: FastifyBaseLogger): ReturnType<typeof betterAuth> {
  const trustedOrigins = [process.env.WEB_URL ?? "http://localhost:5173"].filter(
    (o): o is string => typeof o === "string" && o.length > 0,
  );

  const instance = betterAuth({
    basePath: "/api/auth",
    secret: process.env.AUTH_SECRET ?? "",
    baseURL: process.env.AUTH_URL ?? "http://localhost:3001",
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
