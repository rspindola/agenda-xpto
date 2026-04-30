import { z } from "zod";

export const meResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.email(),
    emailVerified: z.boolean(),
    name: z.string().nullable(),
  }),
});

export type MeResponse = z.infer<typeof meResponseSchema>;

/** Better Auth JSON errors (not AppError shape). */
export const betterAuthErrorBodySchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

/** Loose JSON for Better Auth success payloads that vary by version/plugins. */
export const betterAuthJsonBodySchema = z.record(z.string(), z.unknown());

export const authUserPublicSchema = z.object({
  id: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  name: z.string().nullable(),
  image: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const signUpEmailBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  password: z.string().min(8).max(128),
  image: z.url().optional(),
  callbackURL: z.string().optional(),
});

export type SignUpEmailBody = z.infer<typeof signUpEmailBodySchema>;

export const signUpEmailResponseSchema = z.object({
  token: z.string().nullable(),
  user: authUserPublicSchema,
});

export const signInEmailBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
  callbackURL: z.string().optional(),
});

export type SignInEmailBody = z.infer<typeof signInEmailBodySchema>;

export const signOutBodySchema = z.looseObject({}).optional();

export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1),
  callbackURL: z.string().optional(),
});

export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>;

export const requestPasswordResetBodySchema = z.object({
  email: z.email(),
  redirectTo: z.string().optional(),
});

export type RequestPasswordResetBody = z.infer<typeof requestPasswordResetBodySchema>;

export const resetPasswordBodySchema = z.object({
  newPassword: z.string().min(8).max(128),
  token: z.string().min(1),
});

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

export const changePasswordBodySchema = z.object({
  newPassword: z.string().min(8).max(128),
  currentPassword: z.string().min(8).max(128),
  revokeOtherSessions: z.boolean().optional(),
});

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
