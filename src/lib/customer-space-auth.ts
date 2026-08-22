import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { normalizeEmail } from "@/lib/email";
import { getAdminAuth } from "@/lib/firebase-admin";

export const CUSTOMER_SPACE_COOKIE = "demaa_session";

export const CUSTOMER_SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const CUSTOMER_SESSION_MAX_AUTH_AGE_SECONDS = 5 * 60;

export function getCustomerCookieOptions(maxAge = CUSTOMER_SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL_ENV === "preview" ||
      process.env.VERCEL_ENV === "production",
  };
}

export type CustomerSessionIdentity = Readonly<{
  email: string;
  emailVerified?: boolean;
  provider: "google" | "password";
  uid: string;
}>;

function toCustomerIdentity(decoded: DecodedIdToken): CustomerSessionIdentity | null {
  const provider = decoded.firebase?.sign_in_provider;
  if (
    !decoded.uid
    || !decoded.email
    || (provider !== "password" && provider !== "google.com")
  ) return null;

  return {
    email: normalizeEmail(decoded.email),
    emailVerified: decoded.email_verified === true,
    provider: provider === "google.com" ? "google" : "password",
    uid: decoded.uid,
  };
}

export async function verifyFreshFirebaseIdentity(idToken: string) {
  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken, true);
  const identity = toCustomerIdentity(decoded);
  if (!identity) return null;

  const authAgeSeconds = Math.floor(Date.now() / 1000) - decoded.auth_time;
  if (
    !Number.isFinite(authAgeSeconds)
    || authAgeSeconds < 0
    || authAgeSeconds > CUSTOMER_SESSION_MAX_AUTH_AGE_SECONDS
  ) {
    return null;
  }

  return identity;
}

export async function createFirebaseSessionCookie(
  idToken: string,
  expiresIn = CUSTOMER_SESSION_TTL_MS,
) {
  return getAdminAuth().createSessionCookie(idToken, { expiresIn });
}

export async function createCustomerSession(
  idToken: string,
  expiresIn = CUSTOMER_SESSION_TTL_MS,
) {
  const identity = await verifyFreshFirebaseIdentity(idToken);
  if (!identity) return null;

  const sessionCookie = await createFirebaseSessionCookie(idToken, expiresIn);
  return { identity, sessionCookie } as const;
}

export async function getIdentityFromCustomerSessionToken(
  token?: string | null,
) {
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(token, true);
    return toCustomerIdentity(decoded);
  } catch {
    return null;
  }
}
