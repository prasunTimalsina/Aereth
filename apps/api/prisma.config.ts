import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

const localEnvPath = resolve(process.cwd(), ".env");
const workspaceEnvPath = resolve(process.cwd(), "../../.env");

if (existsSync(localEnvPath)) {
  loadEnv({ path: localEnvPath });
} else if (existsSync(workspaceEnvPath)) {
  loadEnv({ path: workspaceEnvPath });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
