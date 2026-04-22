import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthService } from "../service/auth.service.js";

const sessionUser = {
  id: "user_123",
  displayName: "Ada Lovelace",
  email: "ada@example.com",
};

async function createTestApp(authService: AuthService) {
  const { createApp } = await import("../../../app.js");
  const { createAuthRouter } = await import("./auth.routes.js");
  return createApp({ authRouter: createAuthRouter(authService) });
}

async function startServer(authService: AuthService) {
  const app = await createTestApp(authService);
  const server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });

  const address = server.address();

  if (typeof address !== "object" || !address || !address.port) {
    throw new Error("Unable to resolve test server port");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

describe("auth HTTP routes", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.HOST = "127.0.0.1";
    process.env.PORT = "3001";
    process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/aereth";
    process.env.SESSION_SECRET = "a-very-long-session-secret-that-is-safe-for-tests";
    process.env.SESSION_TTL_DAYS = "7";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("signs up a user and sets a session cookie", async () => {
    const signup = vi.fn(async () => ({
      token: "signed-token",
      expiresAt: "2026-04-26T00:00:00.000Z",
      user: sessionUser,
    }));

    const { baseUrl, close } = await startServer({
      signup,
      login: vi.fn(),
      getCurrentUser: vi.fn(),
    });

    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        displayName: "Ada Lovelace",
        email: "Ada@Example.com",
        password: "supersecret",
      }),
    });

    await close();

    expect(response.status).toBe(201);
    expect(signup).toHaveBeenCalledWith({
      displayName: "Ada Lovelace",
      email: "Ada@Example.com",
      password: "supersecret",
    });

    expect(response.headers.get("set-cookie")).toContain("session=signed-token");

    await expect(response.json()).resolves.toEqual({
      user: sessionUser,
      expiresAt: "2026-04-26T00:00:00.000Z",
    });
  });

  it("restores the current session from the session cookie", async () => {
    const getCurrentUser = vi.fn(async (sessionToken: string | undefined) => {
      expect(sessionToken).toBe("signed-token");
      return sessionUser;
    });

    const { baseUrl, close } = await startServer({
      signup: vi.fn(),
      login: vi.fn(),
      getCurrentUser,
    });

    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        cookie: "session=signed-token",
      },
    });

    await close();

    expect(response.status).toBe(200);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({
      user: sessionUser,
    });
  });
});
