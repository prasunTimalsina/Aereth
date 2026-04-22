import type { PrismaClient } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import type { AuthSession, AuthUser } from "../auth.types.js";
import { AuthError } from "./auth-errors.js";
import { hashPassword, verifyPassword } from "./password.js";
import { createSession, verifySessionToken } from "./session.js";

export type SignupInput = {
  displayName: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthService = {
  signup(input: SignupInput): Promise<AuthSession>;
  login(input: LoginInput): Promise<AuthSession>;
  getCurrentUser(sessionToken: string | undefined): Promise<AuthUser | null>;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toAuthUser(user: { id: string; displayName: string; email: string }): AuthUser {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
  };
}

function createAuthService(database: PrismaClient): AuthService {
  return {
    async signup(input) {
      const email = normalizeEmail(input.email);
      const existingUser = await database.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        throw new AuthError("EMAIL_ALREADY_EXISTS", "An account with this email already exists");
      }

      const passwordHash = await hashPassword(input.password);
      const user = await database.user.create({
        data: {
          displayName: input.displayName.trim(),
          email,
          passwordHash,
        },
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      });

      return createSession(toAuthUser(user));
    },

    async login(input) {
      const email = normalizeEmail(input.email);
      const user = await database.user.findUnique({
        where: { email },
        select: {
          id: true,
          displayName: true,
          email: true,
          passwordHash: true,
        },
      });

      if (!user) {
        throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
      }

      const passwordMatches = await verifyPassword(input.password, user.passwordHash);

      if (!passwordMatches) {
        throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
      }

      return createSession(toAuthUser(user));
    },

    async getCurrentUser(sessionToken) {
      const session = verifySessionToken(sessionToken);

      if (!session) {
        return null;
      }

      const currentUser = await database.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      });

      return currentUser ? toAuthUser(currentUser) : null;
    },
  };
}

export const authService = createAuthService(prisma);
export { createAuthService, normalizeEmail };
