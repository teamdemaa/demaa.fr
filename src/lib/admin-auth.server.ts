import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getCustomerCookieOptions,
  getIdentityFromCustomerSessionToken,
  type CustomerSessionIdentity,
} from "@/lib/customer-space-auth";

export const ADMIN_SESSION_COOKIE = "demaa_admin_session";
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function getAdminCookieOptions(maxAge = ADMIN_SESSION_TTL_MS / 1000) {
  return getCustomerCookieOptions(maxAge);
}

function getAdminEmails() {
  return (process.env.DEMAA_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminUids() {
  return (process.env.DEMAA_ADMIN_UIDS ?? "")
    .split(",")
    .map((uid) => uid.trim())
    .filter(Boolean);
}

export function isAdminIdentity(identity: CustomerSessionIdentity | null) {
  if (!identity) return false;

  const adminUids = getAdminUids();
  if (adminUids.includes(identity.uid)) return true;

  const adminEmails = getAdminEmails();
  return identity.emailVerified === true
    && adminEmails.includes(identity.email.toLowerCase());
}

export async function getCurrentAdminIdentity(): Promise<CustomerSessionIdentity | null> {
  if (getAdminUids().length === 0 && getAdminEmails().length === 0) return null;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || null;
  const identity = await getIdentityFromCustomerSessionToken(sessionToken);
  return isAdminIdentity(identity) ? identity : null;
}

export async function requireAdminIdentity(returnPath: string) {
  const identity = await getCurrentAdminIdentity();
  if (!identity) {
    redirect(`/admin/connexion?returnTo=${encodeURIComponent(returnPath)}`);
  }
  return identity;
}
