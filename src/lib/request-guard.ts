import { NextResponse } from "next/server";
import { getCanonicalSiteUrl, isAllowedRequestHost } from "@/lib/site-url";

export function enforceAllowedHost(request: Request) {
  if (isAllowedRequestHost(request)) {
    return null;
  }

  return NextResponse.json(
    {
      error: `Cette route doit etre appelee depuis ${getCanonicalSiteUrl()}.`,
    },
    { status: 403 }
  );
}

export function enforceSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  try {
    if (
      origin &&
      new URL(origin).origin === new URL(request.url).origin &&
      isAllowedRequestHost(request)
    ) {
      return null;
    }
  } catch {
    // Invalid origins are rejected below.
  }

  return NextResponse.json(
    { error: "Origine de la requête non autorisée." },
    { status: 403 },
  );
}
