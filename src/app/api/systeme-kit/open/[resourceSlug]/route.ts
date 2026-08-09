import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api-security";
import { enforceAllowedHost } from "@/lib/request-guard";
import {
  getSystemResourceAssetSnapshot,
  resolveSystemResourceDelivery,
} from "@/lib/system-resource-assets.server";
import { getSystemResourceForHistoricalDelivery } from "@/lib/system-resource-catalog";

export const runtime = "nodejs";

function fallbackRedirect(request: Request) {
  return NextResponse.redirect(new URL("/systemes", request.url), { status: 302 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resourceSlug: string }> },
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "system-resource-open",
    limit: 60,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { resourceSlug } = await params;
  const resource = getSystemResourceForHistoricalDelivery(resourceSlug);
  if (!resource || resource.availability !== "available") {
    return fallbackRedirect(request);
  }

  const snapshot = getSystemResourceAssetSnapshot(resourceSlug);
  const delivery = snapshot ? resolveSystemResourceDelivery(snapshot) : null;
  if (!delivery) {
    return fallbackRedirect(request);
  }

  const response = NextResponse.redirect(delivery.destination, { status: 302 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
