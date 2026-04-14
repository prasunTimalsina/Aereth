import { Router } from "express";
import { healthResponseSchema } from "@aereth/shared";
import { getHealth } from "../service/get-health.js";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json(healthResponseSchema.parse(getHealth()));
});

