import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api-security";
import {
  createKitAnalyticsSessionToken,
  getKitAnalyticsCookieOptions,
  isKitAnalyticsPasswordValid,
  KIT_ANALYTICS_SESSION_COOKIE,
} from "@/lib/kit-analytics-auth.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "kit-analytics-login",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const formData = await request.formData().catch(() => null);
  const passwordValue = formData?.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!isKitAnalyticsPasswordValid(password)) {
    return NextResponse.redirect(new URL("/suivi-kits?erreur=acces", request.url), 303);
  }

  const sessionToken = createKitAnalyticsSessionToken();

  if (!sessionToken) {
    return NextResponse.redirect(
      new URL("/suivi-kits?erreur=configuration", request.url),
      303,
    );
  }

  const response = NextResponse.redirect(new URL("/suivi-kits", request.url), 303);
  response.cookies.set(
    KIT_ANALYTICS_SESSION_COOKIE,
    sessionToken,
    getKitAnalyticsCookieOptions(),
  );

  return response;
}
