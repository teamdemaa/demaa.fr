import { NextResponse } from "next/server";
import { z } from "zod";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import {
  authorizeActionPlanGenerationContext,
  InvalidActionPlanLocaleContextError,
  UnavailableActionPlanLocaleError,
} from "@/lib/action-plan-localization.server";
import {
  beginGuestActionPlanGeneration,
  failGuestActionPlanGeneration,
  GuestActionPlanGenerationConflictError,
  GuestActionPlanGenerationExpiredError,
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
  reserveGuestAiGenerationBudget,
} from "@/lib/guest-action-plan-security.server";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z.object({
  requestId: z.string().trim().regex(/^[A-Za-z0-9:_-]{16,160}$/),
  accessKey: z.string().trim().regex(/^[A-Za-z0-9_-]{43,86}$/),
  situation: z.string().trim().min(20).max(4_000),
  contentLocaleCode: z.enum(["fr", "en"]).optional(),
  marketCodeAtCreation: z.enum(["fr-fr", "global-en-beta"]).optional(),
}).strict();

export async function POST(request: Request) {
  if (!isGuestProductEnabled()) return guestProductUnavailableResponse();
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const limited = await enforceGuestActionPlanRateLimit(request);
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

  let started: Awaited<ReturnType<typeof beginGuestActionPlanGeneration>>;
  try {
    const generationContext = authorizeActionPlanGenerationContext(parsed.data);
    started = await beginGuestActionPlanGeneration({
      requestId: parsed.data.requestId,
      accessKey: parsed.data.accessKey,
      situation: parsed.data.situation,
      ...generationContext,
    });
  } catch (error) {
    if (error instanceof InvalidActionPlanLocaleContextError) {
      return NextResponse.json(
        { error: "Le contexte de langue et de marché est invalide." },
        { status: 400, headers: noStoreHeaders() },
      );
    }
    if (error instanceof UnavailableActionPlanLocaleError) {
      return guestProductUnavailableResponse();
    }
    if (error instanceof GuestActionPlanGenerationConflictError) {
      return NextResponse.json(
        { error: "Cette demande a déjà été utilisée avec un autre contenu." },
        { status: 409, headers: noStoreHeaders() },
      );
    }
    if (error instanceof GuestActionPlanGenerationExpiredError) {
      return NextResponse.json(
        { error: "Cette demande a expiré. Créez un nouveau plan." },
        { status: 410, headers: noStoreHeaders() },
      );
    }
    throw error;
  }

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
    accessKey: parsed.data.accessKey,
    claim: started.claim,
    request,
  });
  return guestActionPlanStateResponse(state, { created: state?.status === "active" });
}
