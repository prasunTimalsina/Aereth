import { parsePort } from "@aereth/shared";

export const runtimeConfig = {
  host: process.env.HOST ?? "127.0.0.1",
  port: parsePort(process.env.PORT, 3001),
};

