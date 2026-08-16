import "server-only";

import { cookies } from "next/headers";
import {
  CUSTOMER_SPACE_COOKIE,
  getIdentityFromCustomerSessionToken,
} from "@/lib/customer-space-auth";
import { ensureDefaultCompanyForIdentity } from "@/lib/company-membership.server";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  Pragma: "no-cache",
  Vary: "Cookie",
} as const;

export async function getCurrentCustomerIdentityFromSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  return getIdentityFromCustomerSessionToken(sessionToken);
}

export async function getCurrentCustomerAppIdentityFromSession() {
  const identity = await getCurrentCustomerIdentityFromSession();
  if (!identity) return null;

  // A session cookie can outlive the deployment that introduced company
  // scoping. Repair only a missing deterministic company context here;
  // ensureDefaultCompanyForIdentity deliberately refuses archived companies
  // and suspended memberships.
  await ensureDefaultCompanyForIdentity(identity);
  return identity;
}

export function customerAuthenticationRequiredResponse() {
  return new Response(
    JSON.stringify({
      error: "authentication_required",
      message: "Connectez-vous pour continuer.",
    }),
    { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
  );
}

export async function requireCurrentCustomerIdentity() {
  const identity = await getCurrentCustomerIdentityFromSession();
  if (identity) return { identity, response: null } as const;

  return {
    identity: null,
    response: customerAuthenticationRequiredResponse(),
  } as const;
}
