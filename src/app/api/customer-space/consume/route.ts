import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText } from "@/lib/api-security";
import {
  CUSTOMER_SPACE_COOKIE,
  createCustomerSession,
  getCustomerCookieOptions,
  hashToken,
} from "@/lib/customer-space-auth";
import { consumeCustomerMagicLink } from "@/lib/generations-db";
import { enforceAllowedHost } from "@/lib/request-guard";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "customer-magic-consume",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const url = new URL(request.url);
  const token = normalizeText(url.searchParams.get("token"), 80);
  const returnTo = getSafeCustomerReturnTo(url.searchParams.get("returnTo"));
  const email = token ? await consumeCustomerMagicLink(hashToken(token)) : null;

  if (!email) {
    const errorUrl = new URL(returnTo, request.url);
    errorUrl.searchParams.set("error", "lien-expire");
    return NextResponse.redirect(errorUrl);
  }

  const sessionToken = await createCustomerSession(email);
  const response = NextResponse.redirect(new URL(returnTo, request.url));

  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    sessionToken,
    getCustomerCookieOptions()
  );

  return response;
}
