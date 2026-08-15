import "server-only";

import { cookies } from "next/headers";
import {
  CUSTOMER_SPACE_COOKIE,
  getIdentityFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

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
