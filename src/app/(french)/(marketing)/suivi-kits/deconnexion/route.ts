import { NextResponse } from "next/server";
import {
  getKitAnalyticsCookieOptions,
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

  const response = NextResponse.redirect(new URL("/suivi-kits", request.url), 303);
  response.cookies.set(
    KIT_ANALYTICS_SESSION_COOKIE,
    "",
    getKitAnalyticsCookieOptions(0),
  );

  return response;
}
