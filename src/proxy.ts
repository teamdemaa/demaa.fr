import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "demaa.fr";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
const HIDDEN_ORGANISATION_PATHS = new Set([
  "/organisation",
  "/organisation-automatisation",
  "/annuaire-services",
  "/annuaire-services/organisation",
  "/annuaire-services/organisation-automatisation",
  "/services/organisation",
  "/services/organisation-automatisation",
  "/services/structuration-automatisation",
]);
const INTERCEPTED_ORGANISATION_PATHS = new Set([
  "/annuaire-services/organisation",
  "/annuaire-services/organisation-automatisation",
]);

function isSameOriginClientTransition(request: NextRequest) {
  return (
    request.headers.get("sec-fetch-dest") === "empty" &&
    request.headers.get("sec-fetch-mode") === "cors" &&
    request.headers.get("sec-fetch-site") === "same-origin"
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const canOpenInterceptedModal =
    INTERCEPTED_ORGANISATION_PATHS.has(pathname) &&
    isSameOriginClientTransition(request);

  if (HIDDEN_ORGANISATION_PATHS.has(pathname) && !canOpenInterceptedModal) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const host = request.headers.get("host")?.toLowerCase();

  if (!host) {
    return NextResponse.next();
  }

  const shouldRedirect =
    host === "www.demaa.fr" ||
    host.endsWith(".vercel.app");

  if (!shouldRedirect) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = CANONICAL_HOST;

  return NextResponse.redirect(`${CANONICAL_ORIGIN}${url.pathname}${url.search}`, 308);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
