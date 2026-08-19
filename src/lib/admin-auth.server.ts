import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CUSTOMER_SPACE_COOKIE,
  getIdentityFromCustomerSessionToken,
  type CustomerSessionIdentity,
} from "@/lib/customer-space-auth";

function getAdminEmails() {
  return (process.env.DEMAA_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getCurrentAdminIdentity(): Promise<CustomerSessionIdentity | null> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return null;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const identity = await getIdentityFromCustomerSessionToken(sessionToken);
  if (!identity || !adminEmails.includes(identity.email.toLowerCase())) {
    return null;
  }
  return identity;
}

export async function requireAdminIdentity(returnPath: string) {
  const identity = await getCurrentAdminIdentity();
  if (!identity) {
    redirect(`/connexion?returnTo=${encodeURIComponent(returnPath)}`);
  }
  return identity;
}
