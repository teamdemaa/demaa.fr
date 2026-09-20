import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/content-security-policy";
import { isVercelPreviewHost } from "@/lib/site-url";
import { getExplicitInterfaceLocaleFromPathname } from "@/lib/international-context";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import { PUBLIC_SPECIALISTS_ENABLED } from "@/lib/public-feature-flags";

const configuredSiniHost = process.env.SINI_CANONICAL_HOST?.trim().toLowerCase();
const CANONICAL_HOST = configuredSiniHost && /^[a-z0-9.-]+$/.test(configuredSiniHost)
  ? configuredSiniHost
  : null;
const LEGACY_HOSTS = new Set(CANONICAL_HOST ? [`www.${CANONICAL_HOST}`] : []);
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
// The old DEMAA pages remain in source control and in the DEMAA worktree, but
// must not become public pages of the separate sini preview deployment.
const SINI_PAGE_PREFIXES = [
  "/a-reprendre",
  "/transmettre",
  "/conseil",
  "/accompagnement",
  "/alertes-reprise",
  "/mentions-legales",
  "/politique-de-confidentialite",
];
const SINI_API_PATHS = new Set([
  "/api/accompaniment-request",
  "/api/business-estimate",
  "/api/reprise-alerts",
  "/api/reprise-interest",
  "/api/reprise-project",
]);
const SINI_DEMAA_FORM_BACKEND_ORIGIN = "https://demaa.fr";
const SINI_INTERNAL_PREFIXES = ["/_next"];
const SINI_BRAND_ASSETS = new Set([
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
  "/manifest.webmanifest",
  "/robots.txt",
]);
const SINI_LEGACY_ROOT_PARAMS = [
  "academy", "intent", "new", "opportunity", "opportunityId", "planTab",
  "resource", "resourceSlug", "section", "system", "systemSlug", "systemTab",
  "toolSource", "view",
];

function isSiniRoute(pathname: string) {
  if (pathname === "/") return true;
  if (pathname === "/sitemap.xml") return false;
  if (pathname === "/api/cron" || pathname.startsWith("/api/cron/")) return false;
  if (SINI_BRAND_ASSETS.has(pathname)) return true;
  if (SINI_PAGE_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return true;
  if (SINI_API_PATHS.has(pathname) || pathname.startsWith("/api/reprise-alerts/")) return true;
  if (SINI_INTERNAL_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return true;
  // Static assets remain available to archived source modules and active pages.
  return /\.[a-z0-9]{2,12}$/i.test(pathname);
}

function isSiniFormApi(pathname: string) {
  return SINI_API_PATHS.has(pathname) || pathname.startsWith("/api/reprise-alerts/");
}

function siniFormsRelayEnabled() {
  return process.env.SINI_DEMAA_FORM_BACKEND_ENABLED === "true";
}
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

    if (shouldRedirect && CANONICAL_HOST) {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      url.host = CANONICAL_HOST;

      return withContentSecurityPolicy(
        NextResponse.redirect(
          `https://${CANONICAL_HOST}${url.pathname}${url.search}`,
          308,
        ),
        localeCode,
      );
    }
  }

  if (pathname === "/a-reprendre" || pathname === "/apercu-sini") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return withContentSecurityPolicy(NextResponse.redirect(url, 308), localeCode);
  }

  if (pathname === "/apercu-sini/conseil" || pathname.startsWith("/apercu-sini/conseil/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/apercu-sini\/conseil/, "/conseil");
    return withContentSecurityPolicy(NextResponse.redirect(url, 308), localeCode);
  }

  if (pathname === "/" && SINI_LEGACY_ROOT_PARAMS.some((key) => request.nextUrl.searchParams.has(key))) {
    const url = request.nextUrl.clone();
    for (const key of SINI_LEGACY_ROOT_PARAMS) url.searchParams.delete(key);
    return withContentSecurityPolicy(NextResponse.redirect(url, 307), localeCode);
  }

  if (!isSiniRoute(pathname)) {
    return withContentSecurityPolicy(
      new NextResponse(null, {
        status: 404,
        headers: { "X-Robots-Tag": "noindex, nofollow" },
      }),
      localeCode,
    );
  }

  if (isSiniFormApi(pathname)) {
    if (siniFormsRelayEnabled()) {
      const target = new URL(`${pathname}${request.nextUrl.search}`, SINI_DEMAA_FORM_BACKEND_ORIGIN);
      const headers = new Headers(request.headers);
      headers.set("host", "demaa.fr");
      headers.set("origin", SINI_DEMAA_FORM_BACKEND_ORIGIN);
      headers.set("x-forwarded-host", "demaa.fr");
      headers.set("x-forwarded-proto", "https");
      headers.set("x-sini-form", "1");
      headers.set("x-sini-site-origin", "https://gosini.fr");
      return withContentSecurityPolicy(
        NextResponse.rewrite(target, { request: { headers } }),
        localeCode,
      );
    }

    return withContentSecurityPolicy(
      NextResponse.json(
        { error: "Les demandes ne sont pas encore ouvertes sur sini." },
        {
          status: 503,
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
            "X-Robots-Tag": "noindex, nofollow",
          },
        },
      ),
      localeCode,
    );
  }

  if (pathname === "/specialistes" && !PUBLIC_SPECIALISTS_ENABLED) {
    return withContentSecurityPolicy(
      new NextResponse(null, {
        status: 404,
        headers: { "X-Robots-Tag": "noindex, nofollow" },
      }),
      localeCode,
    );
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
