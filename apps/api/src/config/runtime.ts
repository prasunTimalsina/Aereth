import { env } from "./env.js";

export const runtimeConfig = {
  host: env.HOST,
  port: env.PORT,
};
