import "server-only";

import { NextResponse } from "next/server";
import type { CustomerSessionIdentity } from "@/lib/customer-space-auth";
import { getCurrentCustomerIdentity, noStoreHeaders } from "@/lib/action-plan-api.server";

export async function requireCompanyPilotageIdentity(): Promise<
  | { identity: CustomerSessionIdentity; response: null }
  | { identity: null; response: NextResponse }
> {
  const identity = await getCurrentCustomerIdentity();
  if (identity) return { identity, response: null };
  return {
    identity: null,
    response: NextResponse.json(
      { error: "Authentification requise." },
      { status: 401, headers: noStoreHeaders() },
    ),
  };
}

export function companyPilotageAccessDeniedResponse() {
  return NextResponse.json(
    { error: "Entreprise active introuvable." },
    { status: 403, headers: noStoreHeaders() },
  );
}
