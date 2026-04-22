import express from "express";
import { authRouter } from "./modules/auth/index.js";
import { healthRouter } from "./modules/health/index.js";

export function createApp(options?: { authRouter?: typeof authRouter }) {
  const app = express();
  const router = options?.authRouter ?? authRouter;

  app.disable("x-powered-by");
  app.use(express.json());
  app.use("/api/auth", router);
  app.use("/api", healthRouter);

  return app;
}
