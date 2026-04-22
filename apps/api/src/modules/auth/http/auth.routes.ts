import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";

import { env } from "../../../config/env.js";
import type { AuthService } from "../service/auth.service.js";
import { authService } from "../service/auth.service.js";
import { AuthError } from "../service/auth-errors.js";

const signupSchema = z.object({
  displayName: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function applySessionCookie(response: Response, token: string, expiresAt: string) {
  response.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: new Date(expiresAt),
  });
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return undefined;
  }

  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : undefined;
}

function validationError(message: string) {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message,
    },
  };
}

function authError(error: AuthError) {
  return {
    error: {
      code: error.code,
      message: error.message,
    },
  };
}

export function createAuthRouter(service: AuthService) {
  const router = Router();

  router.post("/signup", async (request, response, next) => {
    const parsedInput = signupSchema.safeParse(request.body);

    if (!parsedInput.success) {
      return response.status(400).json(validationError("Invalid signup payload"));
    }

    try {
      const session = await service.signup(parsedInput.data);
      applySessionCookie(response, session.token, session.expiresAt);
      return response.status(201).json({ user: session.user, expiresAt: session.expiresAt });
    } catch (error) {
      if (error instanceof AuthError) {
        return response.status(409).json(authError(error));
      }

      return next(error);
    }
  });

  router.post("/login", async (request, response, next) => {
    const parsedInput = loginSchema.safeParse(request.body);

    if (!parsedInput.success) {
      return response.status(400).json(validationError("Invalid login payload"));
    }

    try {
      const session = await service.login(parsedInput.data);
      applySessionCookie(response, session.token, session.expiresAt);
      return response.status(200).json({ user: session.user, expiresAt: session.expiresAt });
    } catch (error) {
      if (error instanceof AuthError) {
        return response.status(401).json(authError(error));
      }

      return next(error);
    }
  });

  router.post("/logout", (_request, response) => {
    response.clearCookie("session");
    return response.status(204).send();
  });

  router.get("/session", async (request, response, next) => {
    try {
      const user = await service.getCurrentUser(readCookie(request, "session"));

      if (!user) {
        return response.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "No active session",
          },
        });
      }

      return response.status(200).json({ user });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

export const authRouter = createAuthRouter(authService);
