import { createHash, randomBytes } from "node:crypto";
import { normalizeEmail } from "@/lib/email";
import {
  getCustomerSessionEmail,
  saveCustomerMagicLink,
  saveCustomerSession,
} from "@/lib/generations-db";

export const CUSTOMER_SPACE_COOKIE = "demaa_customer_session";

const MAGIC_LINK_TTL_MS = 30 * 60 * 1000;
const CUSTOMER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export function getCustomerCookieOptions(maxAge = CUSTOMER_SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createMagicLinkToken(email: string) {
  const token = createRawToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS).toISOString();

  await saveCustomerMagicLink({
    email: normalizeEmail(email),
    expiresAt,
    tokenHash: hashToken(token),
  });

  return token;
}

export async function createCustomerSession(email: string) {
  const token = createRawToken();
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_TTL_MS).toISOString();

  await saveCustomerSession({
    email: normalizeEmail(email),
    expiresAt,
    sessionHash: hashToken(token),
  });

  return token;
}

export async function getEmailFromCustomerSessionToken(token?: string | null) {
  if (!token) return null;

  return getCustomerSessionEmail(hashToken(token));
}
