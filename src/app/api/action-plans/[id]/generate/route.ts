import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomerIdentity, noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { executeClaimedActionPlanGeneration } from "@/lib/action-plan-generation-execution.server";
import {
  ActionPlanGenerationRequestConflictError,
  ActionPlanRevisionConflictError,
  beginExistingBlankActionPlanGeneration,
  InvalidActionPlanMutationError,
  type ActionPlanGenerationState,
} from "@/lib/action-plan-storage.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z.object({
  expectedRevision: z.number().int().min(1),
  situation: z.string().trim().min(20).max(4_000),
}).strict();

function isPlanId(id: string) {
  return /^[A-Za-z0-9_-]{1,80}$/.test(id);
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
      error: state.canRetry
        ? "La génération a été interrompue. Réessayez."
        : "Le plan n’a pas pu être généré. Contactez l’équipe Demaa.",
    },
    { status: state.canRetry ? 502 : 503, headers: noStoreHeaders() },
  );
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
  if (!isPlanId(id)) return responseForState(null);

  const limited = await enforceRateLimit(request, {
    keyPrefix: "action-plan-generate-existing",
    limit: 6,
    windowMs: 10 * 60 * 1_000,
  }, identity.uid);
  if (limited) return withNoStore(limited);

  const { data, response: invalidBody } = await readJsonBody<unknown>(request, 20 * 1_024);
  if (invalidBody) return withNoStore(invalidBody);
  const parsed = requestSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La demande de génération est invalide." },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  let started: Awaited<ReturnType<typeof beginExistingBlankActionPlanGeneration>>;
  try {
    started = await beginExistingBlankActionPlanGeneration({
      identity,
      id,
      expectedRevision: parsed.data.expectedRevision,
      situation: parsed.data.situation,
    });
  } catch (error) {
    if (error instanceof ActionPlanRevisionConflictError) {
      return NextResponse.json(
        { error: "Ce plan a changé. Rechargez-le avant de relancer la génération." },
        { status: 409, headers: noStoreHeaders() },
      );
    }
    if (
      error instanceof InvalidActionPlanMutationError
      || error instanceof ActionPlanGenerationRequestConflictError
    ) {
      return NextResponse.json(
        { error: "Seul un plan vierge peut être généré depuis cet écran." },
        { status: 409, headers: noStoreHeaders() },
      );
    }
    throw error;
  }

  if (!started || started.kind === "existing") {
    return responseForState(started?.state ?? null);
  }

  const state = await executeClaimedActionPlanGeneration({
    claim: started.claim,
    identity,
    request,
  });
  return responseForState(state, 201);
}
