import "server-only";

import { cookies } from "next/headers";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  Pragma: "no-cache",
  Vary: "Cookie",
} as const;

export async function getCurrentCustomerEmailFromSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  return getEmailFromCustomerSessionToken(sessionToken);
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

export async function requireCurrentCustomerEmail() {
  const email = await getCurrentCustomerEmailFromSession();

  if (email) {
    return { email, response: null } as const;
  }

  return {
    email: null,
    response: customerAuthenticationRequiredResponse(),
  } as const;
}
