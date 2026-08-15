import { NextResponse } from "next/server";
import { getCurrentCustomerIdentityFromSession } from "@/lib/customer-space-session.server";

export const runtime = "nodejs";

export async function GET() {
  const identity = await getCurrentCustomerIdentityFromSession();
  const response = NextResponse.json({
    authenticated: Boolean(identity),
    email: identity?.email ?? null,
    provider: identity?.provider ?? null,
    uid: identity?.uid ?? null,
  });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Vary", "Cookie");
  return response;
}
