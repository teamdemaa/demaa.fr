import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ActionPlanGenerationRequestConflictError,
  beginActionPlanGeneration,
  getActionPlanGenerationForAccess,
} from "@/lib/action-plan-storage.server";
import { executeClaimedActionPlanGeneration } from "@/lib/action-plan-generation-execution.server";
import { getCurrentCustomerIdentity, noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z.object({
  requestId: z.string().trim().regex(/^[A-Za-z0-9:_-]{16,160}$/),
  situation: z.string().trim().min(20).max(4_000),
}).strict();

function responseForState(state: Awaited<ReturnType<typeof getActionPlanGenerationForAccess>>) {
  if (!state) {
    return NextResponse.json(
      { error: "Plan introuvable." },
      { status: 404, headers: noStoreHeaders() },
    );
  }
  if (state.status === "active") {
    return NextResponse.json(
      { status: "active", actionPlanId: state.id },
      { headers: noStoreHeaders() },
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

export async function POST(request: Request) {
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

  const limited = await enforceRateLimit(request, {
    keyPrefix: "action-plan-generate-authenticated",
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

  let started: Awaited<ReturnType<typeof beginActionPlanGeneration>>;
  try {
    started = await beginActionPlanGeneration({
      identity,
      requestId: parsed.data.requestId,
      situation: parsed.data.situation,
    });
  } catch (error) {
    if (error instanceof ActionPlanGenerationRequestConflictError) {
      return NextResponse.json(
        { error: "Cette demande de génération a déjà été utilisée avec un autre contenu." },
        { status: 409, headers: noStoreHeaders() },
      );
    }
    throw error;
  }

  if (started.kind === "existing") return responseForState(started.state);

  // Do not couple the durable generation to the browser request signal. If the
  // page closes, the server still owns the generation and persists its result.
  const state = await executeClaimedActionPlanGeneration({
    claim: started.claim,
    identity,
    request,
  });
  if (state?.status === "active") {
    return NextResponse.json(
      { status: "active", actionPlanId: state.id },
      { status: 201, headers: noStoreHeaders() },
    );
  }
  return responseForState(state);
}
