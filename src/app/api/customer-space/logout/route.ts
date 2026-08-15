import { NextResponse } from "next/server";
import { CUSTOMER_SPACE_COOKIE, getCustomerCookieOptions } from "@/lib/customer-space-auth";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const url = new URL(request.url);
  const returnTo = getSafeCustomerReturnTo(url.searchParams.get("returnTo"));
  const response = NextResponse.redirect(new URL(returnTo, request.url), 303);

  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    "",
    getCustomerCookieOptions(0),
  );

  return response;
}
