import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

/**
 * Better Auth instance (schema + adapter). HTTP routes `/api/auth/*` belong in `modules/auth`.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    usePlural: true,
  }),
  emailAndPassword: { enabled: true },
  secret: process.env.AUTH_SECRET ?? "",
  baseURL: process.env.AUTH_URL ?? "http://localhost:3001",
});
