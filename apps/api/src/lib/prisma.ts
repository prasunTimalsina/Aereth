import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config as loadEnv } from "dotenv";

const localEnvPath = resolve(process.cwd(), ".env");
const workspaceEnvPath = resolve(process.cwd(), "../../.env");

if (existsSync(localEnvPath)) {
  loadEnv({ path: localEnvPath });
} else if (existsSync(workspaceEnvPath)) {
  loadEnv({ path: workspaceEnvPath });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize Prisma");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
