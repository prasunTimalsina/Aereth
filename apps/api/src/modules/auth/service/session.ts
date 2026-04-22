import { createHmac, randomUUID } from "node:crypto";

import { env } from "../../../config/env.js";
import type { AuthUser } from "../auth.types.js";

const sessionTtlMs = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

export function createSession(user: AuthUser): SessionPayload {
  const issuedAt = Date.now();
  const expiresAt = new Date(issuedAt + sessionTtlMs).toISOString();
  const nonce = randomUUID();
  const token = signSessionToken({
    userId: user.id,
    issuedAt,
    expiresAt,
    nonce,
  });

  return {
    token,
    expiresAt,
    user,
  };
}

export function signSessionToken(payload: {
  userId: string;
  issuedAt: number;
  expiresAt: string;
  nonce: string;
}) {
  const rawPayload = JSON.stringify(payload);
  const signature = createHmac("sha256", env.SESSION_SECRET).update(rawPayload).digest("hex");

  return `${Buffer.from(rawPayload).toString("base64url")}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const rawPayload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const expectedSignature = createHmac("sha256", env.SESSION_SECRET)
    .update(rawPayload)
    .digest("hex");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(rawPayload) as {
      userId: string;
      expiresAt: number;
    };

    if (!parsedPayload.userId || !parsedPayload.expiresAt) {
      return null;
    }

    if (Date.now() > parsedPayload.expiresAt) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}
