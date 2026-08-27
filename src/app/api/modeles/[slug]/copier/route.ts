import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api-security";
import { getCopyableModelDestination } from "@/lib/copyable-model-assets.server";
import { enforceAllowedHost } from "@/lib/request-guard";
import { getCanonicalOrigin } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "copyable-model-open",
    limit: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const { slug } = await params;
  const destination = getCopyableModelDestination(slug);
  if (!destination) {
    return NextResponse.redirect(`${getCanonicalOrigin()}/modeles`, {
      status: 302,
      headers: NO_STORE_HEADERS,
    });
  }

  return NextResponse.redirect(destination, {
    status: 302,
    headers: NO_STORE_HEADERS,
  });
}
