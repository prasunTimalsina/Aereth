import type { HealthResponse } from "@aereth/shared";

export function getHealth(): HealthResponse {
  return {
    status: "ok",
    service: "api",
    message: "Aereth API is running.",
    timestamp: new Date().toISOString(),
  };
}

