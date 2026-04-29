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
