import { z } from "zod";

/** OpenAPI-only examples; not used at runtime. */

const meResponseExample = {
  user: {
    id: "k8h2m5n9p1q4r7s0t3v6w9x2y5za",
    email: "jane.doe@example.com",
    emailVerified: true,
    name: "Jane Doe",
  },
} as const;

export const meResponseSchema = z
  .object({
    user: z.object({
      id: z.string(),
      email: z.email(),
      emailVerified: z.boolean(),
      name: z.string().nullable(),
    }),
  })
  .meta({ examples: [meResponseExample] });

export type MeResponse = z.infer<typeof meResponseSchema>;

const betterAuthErrorExample = {
  message: "Invalid email or password",
  code: "INVALID_CREDENTIALS",
} as const;

/** Better Auth JSON errors (not AppError shape). */
export const betterAuthErrorBodySchema = z
  .object({
    message: z.string(),
    code: z.string().optional(),
  })
  .meta({ examples: [betterAuthErrorExample] });

/**
 * Illustrative success payload; Better Auth may return additional fields depending on version/plugins.
 * OpenAPI only — actual shape follows Better Auth.
 */
const betterAuthJsonSuccessExample = {
  user: {
    id: "k8h2m5n9p1q4r7s0t3v6w9x2y5za",
    email: "jane.doe@example.com",
    emailVerified: true,
    name: "Jane Doe",
    image: null,
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
  },
} as const;

/** Loose JSON for Better Auth success payloads that vary by version/plugins. */
export const betterAuthJsonBodySchema = z
  .record(z.string(), z.unknown())
  .meta({ examples: [betterAuthJsonSuccessExample] });

export const authUserPublicSchema = z.object({
  id: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  name: z.string().nullable(),
  image: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const signUpEmailBodyExample = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  password: "DevSignUpPassword123",
  image: "https://www.example.com/static/avatar-placeholder.png",
  callbackURL: "http://localhost:5173/dashboard",
} as const;

export const signUpEmailBodySchema = z
  .object({
    name: z.string().min(1).max(200),
    email: z.email(),
    password: z.string().min(8).max(128),
    image: z.url().optional(),
    callbackURL: z.string().optional(),
  })
  .meta({ examples: [signUpEmailBodyExample] });

export type SignUpEmailBody = z.infer<typeof signUpEmailBodySchema>;

const signUpEmailResponseExample = {
  token: null,
  user: {
    id: "k8h2m5n9p1q4r7s0t3v6w9x2y5za",
    email: "jane.doe@example.com",
    emailVerified: false,
    name: "Jane Doe",
    image: null,
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
  },
} as const;

export const signUpEmailResponseSchema = z
  .object({
    token: z.string().nullable(),
    user: authUserPublicSchema,
  })
  .meta({ examples: [signUpEmailResponseExample] });

const signInEmailBodyExample = {
  email: "jane.doe@example.com",
  password: "DevSignInPassword123",
  rememberMe: true,
  callbackURL: "http://localhost:5173/dashboard",
} as const;

export const signInEmailBodySchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(128),
    rememberMe: z.boolean().optional(),
    callbackURL: z.string().optional(),
  })
  .meta({ examples: [signInEmailBodyExample] });

export type SignInEmailBody = z.infer<typeof signInEmailBodySchema>;

export const signOutBodySchema = z.looseObject({}).optional();

const verifyEmailQueryExample = {
  token: "opaque-verification-token-from-email",
  callbackURL: "http://localhost:5173/dashboard",
} as const;

export const verifyEmailQuerySchema = z
  .object({
    token: z.string().min(1),
    callbackURL: z.string().optional(),
  })
  .meta({ examples: [verifyEmailQueryExample] });

export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>;

const requestPasswordResetBodyExample = {
  email: "jane.doe@example.com",
  redirectTo: "http://localhost:5173/reset-password",
} as const;

export const requestPasswordResetBodySchema = z
  .object({
    email: z.email(),
    redirectTo: z.string().optional(),
  })
  .meta({ examples: [requestPasswordResetBodyExample] });

export type RequestPasswordResetBody = z.infer<typeof requestPasswordResetBodySchema>;

const resetPasswordBodyExample = {
  newPassword: "NewSecurePassword456",
  token: "opaque-reset-token-from-email",
} as const;

export const resetPasswordBodySchema = z
  .object({
    newPassword: z.string().min(8).max(128),
    token: z.string().min(1),
  })
  .meta({ examples: [resetPasswordBodyExample] });

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

const changePasswordBodyExample = {
  newPassword: "NewSecurePassword456",
  currentPassword: "CurrentPassword123",
  revokeOtherSessions: true,
} as const;

export const changePasswordBodySchema = z
  .object({
    newPassword: z.string().min(8).max(128),
    currentPassword: z.string().min(8).max(128),
    revokeOtherSessions: z.boolean().optional(),
  })
  .meta({ examples: [changePasswordBodyExample] });

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
