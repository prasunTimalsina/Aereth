import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config as loadEnv } from "dotenv";
import { z } from "zod";

const localEnvPath = resolve(process.cwd(), ".env");
const workspaceEnvPath = resolve(process.cwd(), "../../.env");

if (existsSync(localEnvPath)) {
  loadEnv({ path: localEnvPath });
} else if (existsSync(workspaceEnvPath)) {
  loadEnv({ path: workspaceEnvPath });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid database URL"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;
