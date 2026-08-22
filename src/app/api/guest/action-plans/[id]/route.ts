import { NextResponse } from "next/server";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { enforceAllowedHost } from "@/lib/request-guard";
import { getGuestActionPlanGenerationForAccess } from "@/lib/guest-action-plan-generation.server";
import {
  guestActionPlanStateResponse,
  guestProductUnavailableResponse,
} from "@/lib/guest-action-plan-api.server";
import { isGuestProductEnabled, readGuestAccessKey } from "@/lib/guest-action-plan-security.server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!isGuestProductEnabled()) return guestProductUnavailableResponse();
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);

  const { id } = await context.params;
  const accessKey = readGuestAccessKey(request);
  if (!/^gpl_[A-Za-z0-9_-]{40}$/.test(id) || !accessKey) {
    return NextResponse.json(
      { error: "Accès au plan invalide." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const state = await getGuestActionPlanGenerationForAccess({ id, accessKey });
  return guestActionPlanStateResponse(state);
}
