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
