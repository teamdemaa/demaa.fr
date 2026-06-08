import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText } from "@/lib/api-security";
import {
  CUSTOMER_SPACE_COOKIE,
  createCustomerSession,
  getCustomerCookieOptions,
  hashToken,
} from "@/lib/customer-space-auth";
import { consumeCustomerMagicLink } from "@/lib/generations-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, {
    keyPrefix: "customer-magic-consume",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const url = new URL(request.url);
  const token = normalizeText(url.searchParams.get("token"), 80);
  const email = token ? await consumeCustomerMagicLink(hashToken(token)) : null;

  if (!email) {
    return NextResponse.redirect(new URL("/mon-espace?error=lien-expire", request.url));
  }

  const sessionToken = await createCustomerSession(email);
  const response = NextResponse.redirect(new URL("/mon-espace", request.url));

  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    sessionToken,
    getCustomerCookieOptions()
  );

  return response;
}
