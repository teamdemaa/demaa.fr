import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api-security";
import { enforceAllowedHost } from "@/lib/request-guard";
import { getSystemResourceAssetSnapshot, resolveSystemResourceDelivery } from "@/lib/system-resource-assets.server";
import { getSystemResource } from "@/lib/system-resource-catalog";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ resourceSlug: string }> }) {
  const blocked = enforceAllowedHost(request); if (blocked) return blocked;
  const limited = await enforceRateLimit(request, { keyPrefix: "system-resource-open", limit: 60, windowMs: 10 * 60 * 1000 }); if (limited) return limited;
  const { resourceSlug } = await params; const resource = getSystemResource(resourceSlug);
  if (!resource || resource.availability !== "available") return NextResponse.redirect(new URL("/systemes", request.url), { status: 302 });
  const snapshot = getSystemResourceAssetSnapshot(resourceSlug); const delivery = snapshot ? resolveSystemResourceDelivery(snapshot) : null;
  return delivery ? NextResponse.redirect(delivery.destination, { status: 302 }) : NextResponse.redirect(new URL("/systemes", request.url), { status: 302 });
}
