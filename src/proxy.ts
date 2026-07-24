import { NextResponse, type NextRequest } from "next/server";
import { isVercelPreviewHost } from "@/lib/site-url";

const CANONICAL_HOST = "demaa.fr";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
const CONSISTENT_RENDER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36";
const RETIRED_EXACT_PATHS = new Set([
  "/annuaire-services",
  "/cockpit-preview",
  "/logo-preview",
  "/manifest.webmanifest",
  "/miniature-preview",
  "/offline",
  "/organisation",
  "/organisation-automatisation",
  "/services",
  "/structuration",
  "/sw.js",
]);
const RETIRED_PATH_PREFIXES = [
  "/services/",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    RETIRED_EXACT_PATHS.has(pathname) ||
    RETIRED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const host = request.headers.get("host")?.toLowerCase();

  if (!host) {
    return nextResponseFor(pathname, request.headers);
  }

  const shouldRedirect =
    host === "www.demaa.fr" ||
    (host.endsWith(".vercel.app") && !isVercelPreviewHost(host));

  if (!shouldRedirect) {
    return nextResponseFor(pathname, request.headers);
  }

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = CANONICAL_HOST;

  return NextResponse.redirect(`${CANONICAL_ORIGIN}${url.pathname}${url.search}`, 308);
}

function nextResponseFor(pathname: string, incomingHeaders: Headers) {
  if (!pathname.startsWith("/kit-operationnel/")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(incomingHeaders);
  requestHeaders.set("user-agent", CONSISTENT_RENDER_USER_AGENT);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
