import { NextResponse } from "next/server";
import {
  actionPlanWriteRequestSchema,
  getCurrentCustomerIdentity,
  noStoreHeaders,
  withNoStore,
} from "@/lib/action-plan-api.server";
import {
  createOwnedActionPlanForIdentity,
  getOwnedActionPlansForIdentity,
} from "@/lib/action-plan-storage.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import {
  authorizeActionPlanGenerationContext,
  InvalidActionPlanLocaleContextError,
  UnavailableActionPlanLocaleError,
} from "@/lib/action-plan-localization.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);

  const identity = await getCurrentCustomerIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const plans = await getOwnedActionPlansForIdentity(identity);
  return NextResponse.json({ plans }, { headers: noStoreHeaders() });
}

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const limited = await enforceRateLimit(request, {
    keyPrefix: "action-plan-create",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return withNoStore(limited);

  const { data, response } = await readJsonBody<unknown>(request, 64 * 1024);
  if (response) return withNoStore(response);

  const parsed = actionPlanWriteRequestSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Le plan à sauvegarder est invalide." },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  const identity = await getCurrentCustomerIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  let generationContext;
  try {
    generationContext = authorizeActionPlanGenerationContext(parsed.data);
  } catch (error) {
    if (error instanceof InvalidActionPlanLocaleContextError) {
      return NextResponse.json(
        { error: "Le contexte de langue et de marché est invalide." },
        { status: 400, headers: noStoreHeaders() },
      );
    }
    if (error instanceof UnavailableActionPlanLocaleError) {
      return NextResponse.json(
        { error: "Cette langue n’est pas disponible pour le moment." },
        { status: 404, headers: noStoreHeaders() },
      );
    }
    throw error;
  }
  const actionPlan = await createOwnedActionPlanForIdentity(identity, {
    ...parsed.data,
    ...generationContext,
  });
  return NextResponse.json(
    { status: "saved", actionPlan },
    { status: 201, headers: noStoreHeaders() },
  );
}
