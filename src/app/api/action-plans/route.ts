import { NextResponse } from "next/server";
import {
  actionPlanWriteRequestSchema,
  getCurrentCustomerEmail,
  noStoreHeaders,
  withNoStore,
} from "@/lib/action-plan-api.server";
import {
  ACTION_PLAN_ACCESS_COOKIE,
  createOwnedActionPlan,
  createPendingActionPlan,
  getActionPlanAccessCookieOptions,
  getOwnedActionPlans,
} from "@/lib/action-plan-storage.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);

  const email = await getCurrentCustomerEmail();
  if (!email) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const plans = await getOwnedActionPlans(email);
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

  const email = await getCurrentCustomerEmail();
  if (email) {
    const actionPlan = await createOwnedActionPlan(email, parsed.data);
    const result = NextResponse.json(
      { status: "saved", actionPlan },
      { status: 201, headers: noStoreHeaders() },
    );
    result.cookies.delete(ACTION_PLAN_ACCESS_COOKIE);
    return result;
  }

  const pending = await createPendingActionPlan(parsed.data);
  const result = NextResponse.json(
    {
      status: "pending_claim",
      actionPlanId: pending.id,
      revision: pending.revision,
    },
    { status: 201, headers: noStoreHeaders() },
  );
  result.cookies.set(
    ACTION_PLAN_ACCESS_COOKIE,
    pending.temporaryAccessToken,
    getActionPlanAccessCookieOptions(),
  );
  return result;
}
