import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/content-security-policy";
import { isVercelPreviewHost } from "@/lib/site-url";
import { getExplicitInterfaceLocaleFromPathname } from "@/lib/international-context";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import { buildDefaultHomeSolutionsHref } from "@/lib/action-plan-home-routing";

const CANONICAL_HOST = "demaa.fr";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
const LEGACY_HOSTS = new Set(["demaa.co", "www.demaa.co", "www.demaa.fr"]);
const RETIRED_EXACT_PATHS = new Set([
  "/annuaire-services",
  "/cockpit-preview",
  "/logo-preview",
  "/miniature-preview",
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
  "/ressources/",
];
const CONTENT_SECURITY_POLICY = buildContentSecurityPolicy({
  allowUnsafeEval: process.env.NODE_ENV === "development",
});
const FIREBASE_AUTH_HELPER_CONTENT_SECURITY_POLICY = buildContentSecurityPolicy({
  allowSameOriginFraming: true,
  allowUnsafeEval: process.env.NODE_ENV === "development",
});

function withContentSecurityPolicy(
  response: NextResponse,
  localeCode?: "fr" | "en",
) {
  response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  if (localeCode) response.headers.set("Content-Language", localeCode);
  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host")?.toLowerCase();
  const localeCode = getExplicitInterfaceLocaleFromPathname(pathname) ?? "fr";

  if (host) {
    const isVercelProductionCronRequest =
      process.env.VERCEL_ENV === "production"
      && host.endsWith(".vercel.app")
      && pathname.startsWith("/api/cron/");
    const shouldRedirect =
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
        localeCode,
      );
    }
  }

  if (pathname === "/") {
    const solutionsHref = buildDefaultHomeSolutionsHref(request.nextUrl.searchParams);
    if (solutionsHref) {
      return withContentSecurityPolicy(
        NextResponse.redirect(new URL(solutionsHref, request.url), 308),
        localeCode,
      );
    }
  }

  if (
    localeCode === "en"
    && process.env.DEMAA_ENGLISH_BETA_ENABLED !== "true"
  ) {
    return withContentSecurityPolicy(
      new NextResponse(null, {
        status: 404,
        headers: { "X-Robots-Tag": "noindex, nofollow" },
      }),
      localeCode,
    );
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

  if (pathname.startsWith("/modeles/")) {
    const modelSlug = pathname.slice("/modeles/".length);
    if (!/^[a-z0-9-]{2,120}$/.test(modelSlug) || !getPublishedCopyableModelBySlug(modelSlug)) {
      return withContentSecurityPolicy(
        new NextResponse(null, {
          status: 404,
          headers: { "X-Robots-Tag": "noindex, nofollow" },
        }),
        localeCode,
      );
    }
  }

  if (pathname.startsWith("/__/auth/")) {
    const response = NextResponse.next();
    response.headers.set(
      "Content-Security-Policy",
      FIREBASE_AUTH_HELPER_CONTENT_SECURITY_POLICY,
    );
    response.headers.set("Content-Language", localeCode);
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-demaa-locale", localeCode);
  return withContentSecurityPolicy(
    NextResponse.next({ request: { headers: requestHeaders } }),
    localeCode,
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
