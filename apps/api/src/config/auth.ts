import { z } from "zod";

export const authConfigSchema = z.object({
  sessionSecret: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  sessionTtlMs: z.number().int().positive(),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;
