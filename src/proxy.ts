import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/content-security-policy";
import { isVercelPreviewHost } from "@/lib/site-url";

const CANONICAL_HOST = "demaa.co";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
const LEGACY_HOSTS = new Set(["demaa.fr", "www.demaa.fr"]);
const RETIRED_EXACT_PATHS = new Set([
  "/annuaire-services",
  "/cockpit-preview",
  "/logo-preview",
  "/miniature-preview",
  "/modeles-de-documents",
  "/offline",
  "/organisation",
  "/organisation-automatisation",
  "/opportunites-b2b",
  "/opportunites/0034",
  "/ressources",
  "/structuration",
  "/sw.js",
]);
const RETIRED_PATH_PREFIXES = [
  "/academy/",
  "/annuaire-services/",
  "/modeles-de-documents/",
  "/ressources/",
];
const CONTENT_SECURITY_POLICY = buildContentSecurityPolicy({
  allowUnsafeEval: process.env.NODE_ENV === "development",
});
const FIREBASE_AUTH_HELPER_CONTENT_SECURITY_POLICY = buildContentSecurityPolicy({
  allowSameOriginFraming: true,
  allowUnsafeEval: process.env.NODE_ENV === "development",
});

function withContentSecurityPolicy(response: NextResponse) {
  response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host")?.toLowerCase();

  if (host) {
    const isVercelProductionCronRequest =
      process.env.VERCEL_ENV === "production"
      && host.endsWith(".vercel.app")
      && pathname.startsWith("/api/cron/");
    const shouldRedirect =
      host === "www.demaa.co" ||
      LEGACY_HOSTS.has(host) ||
      (
        host.endsWith(".vercel.app")
        && !isVercelPreviewHost(host)
        && !isVercelProductionCronRequest
      );

    if (shouldRedirect) {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      url.host = CANONICAL_HOST;

      return withContentSecurityPolicy(
        NextResponse.redirect(
          `${CANONICAL_ORIGIN}${url.pathname}${url.search}`,
          308,
        ),
      );
    }
  }

  if (
    RETIRED_EXACT_PATHS.has(pathname) ||
    RETIRED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return withContentSecurityPolicy(
      new NextResponse(null, {
        status: 404,
        headers: {
          "X-Robots-Tag": "noindex, nofollow",
        },
      }),
    );
  }

  if (pathname.startsWith("/__/auth/")) {
    const response = NextResponse.next();
    response.headers.set(
      "Content-Security-Policy",
      FIREBASE_AUTH_HELPER_CONTENT_SECURITY_POLICY,
    );
    return response;
  }

  return withContentSecurityPolicy(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
