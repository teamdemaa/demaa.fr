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

export function proxy(request: NextRequest) {
  if (HIDDEN_ORGANISATION_PATHS.has(request.nextUrl.pathname)) {
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
