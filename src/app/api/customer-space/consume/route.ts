import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import {
  CUSTOMER_SPACE_COOKIE,
  createCustomerSession,
  getCustomerCookieOptions,
  hashToken,
} from "@/lib/customer-space-auth";
import { consumeCustomerMagicLink } from "@/lib/generations-db";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const requestUrl = new URL(request.url);
  const landingUrl = new URL("/connexion", request.url);
  const token = normalizeText(requestUrl.searchParams.get("token"), 80);
  const returnTo = getSafeCustomerReturnTo(requestUrl.searchParams.get("returnTo"));

  if (token) landingUrl.searchParams.set("token", token);
  landingUrl.searchParams.set("returnTo", returnTo);

  return NextResponse.redirect(landingUrl);
}

type ConsumeMagicLinkBody = {
  returnTo?: unknown;
  token?: unknown;
};

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "customer-magic-consume",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response: invalidBodyResponse } =
    await readJsonBody<ConsumeMagicLinkBody>(request, 2 * 1024);
  if (invalidBodyResponse) return invalidBodyResponse;

  const token = normalizeText(body?.token, 80);
  const returnTo = getSafeCustomerReturnTo(normalizeText(body?.returnTo, 200));
  const email = token ? await consumeCustomerMagicLink(hashToken(token)) : null;

  if (!email) {
    return NextResponse.json(
      { error: "lien-expire" },
      { status: 401, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  const sessionToken = await createCustomerSession(email);
  const response = NextResponse.json(
    { redirectTo: returnTo },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );

  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    sessionToken,
    getCustomerCookieOptions()
  );

  return response;
}
