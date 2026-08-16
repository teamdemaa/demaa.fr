import { NextResponse } from "next/server";
import { getCurrentCustomerIdentity, noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { executeClaimedActionPlanGeneration } from "@/lib/action-plan-generation-execution.server";
import {
  getActionPlanGenerationForAccess,
  resumeActionPlanGenerationForAccess,
  type ActionPlanGenerationState,
} from "@/lib/action-plan-storage.server";
import { enforceRateLimit } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isGenerationId(id: string) {
  return /^apl_[A-Za-z0-9_-]{40}$/.test(id);
}

function responseForState(state: ActionPlanGenerationState | null, activeStatus = 200) {
  if (!state) {
    return NextResponse.json(
      { error: "Plan introuvable." },
      { status: 404, headers: noStoreHeaders() },
    );
  }
  if (state.status === "active") {
    return NextResponse.json(
      { status: "active", actionPlanId: state.id },
      { status: activeStatus, headers: noStoreHeaders() },
    );
  }
  if (state.status === "generating") {
    return NextResponse.json(
      {
        status: "generating",
        actionPlanId: state.id,
        leaseExpiresAt: state.leaseExpiresAt,
      },
      { status: 202, headers: noStoreHeaders() },
    );
  }
  return NextResponse.json(
    {
      status: "failed",
      actionPlanId: state.id,
      canRetry: state.canRetry,
    },
    { status: state.canRetry ? 502 : 503, headers: noStoreHeaders() },
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);

  const identity = await getCurrentCustomerIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const { id } = await params;
  if (!isGenerationId(id)) {
    return NextResponse.json(
      { error: "Plan introuvable." },
      { status: 404, headers: noStoreHeaders() },
    );
  }

  const state = await getActionPlanGenerationForAccess({ id, uid: identity.uid });
  if (!state) {
    return NextResponse.json(
      { error: "Plan introuvable." },
      { status: 404, headers: noStoreHeaders() },
    );
  }

  return responseForState(state);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const identity = await getCurrentCustomerIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const { id } = await params;
  if (!isGenerationId(id)) {
    return NextResponse.json(
      { error: "Plan introuvable." },
      { status: 404, headers: noStoreHeaders() },
    );
  }

  const limited = await enforceRateLimit(request, {
    keyPrefix: "action-plan-resume-authenticated",
    limit: 6,
    windowMs: 10 * 60 * 1_000,
  }, identity.uid);
  if (limited) return withNoStore(limited);

  const resumed = await resumeActionPlanGenerationForAccess({ identity, id });
  if (!resumed || resumed.kind === "existing") {
    return responseForState(resumed?.state ?? null);
  }

  const state = await executeClaimedActionPlanGeneration({
    claim: resumed.claim,
    identity,
    request,
  });
  return responseForState(state, 201);
}
