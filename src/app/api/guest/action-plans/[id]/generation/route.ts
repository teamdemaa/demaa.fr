import { NextResponse } from "next/server";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import {
  failGuestActionPlanGeneration,
  resumeGuestActionPlanGeneration,
} from "@/lib/guest-action-plan-generation.server";
import { executeClaimedGuestActionPlanGeneration } from "@/lib/guest-action-plan-generation-execution.server";
import {
  guestActionPlanStateResponse,
  guestCapacityUnavailableResponse,
  guestProductUnavailableResponse,
} from "@/lib/guest-action-plan-api.server";
import {
  enforceGuestActionPlanRateLimit,
  isGuestProductEnabled,
  readGuestAccessKey,
  reserveGuestAiGenerationBudget,
} from "@/lib/guest-action-plan-security.server";

export const runtime = "nodejs";
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isGuestProductEnabled()) return guestProductUnavailableResponse();
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const limited = await enforceGuestActionPlanRateLimit(request);
  if (limited) return withNoStore(limited);

  const { id } = await context.params;
  const accessKey = readGuestAccessKey(request);
  if (!/^gpl_[A-Za-z0-9_-]{40}$/.test(id) || !accessKey) {
    return NextResponse.json(
      { error: "Accès au plan invalide." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const started = await resumeGuestActionPlanGeneration({ id, accessKey });
  if (!started) return guestActionPlanStateResponse(null);
  if (started.kind === "existing") return guestActionPlanStateResponse(started.state);

  const budget = await reserveGuestAiGenerationBudget(
    `${started.claim.id}:${started.claim.leaseOwner}`,
  );
  if (!budget.allowed) {
    await failGuestActionPlanGeneration({
      claim: started.claim,
      errorCode: `capacity_${budget.reason}`,
    }).catch(() => null);
    return guestCapacityUnavailableResponse();
  }

  const state = await executeClaimedGuestActionPlanGeneration({
    accessKey,
    claim: started.claim,
    request,
  });
  return guestActionPlanStateResponse(state);
}
