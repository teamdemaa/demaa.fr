import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { compatibleActionPlanSchema } from "@/lib/action-plan-contract";
import { actionPlanCommandRequestSchema } from "@/lib/action-plan-command-contract";
import { ACTION_PLAN_COMMAND_EXTERNAL_GENERATION_ENABLED } from "@/lib/action-plan-command.server";
import {
  compatibleActionPlanWorkspaceStateSchema,
  normalizeActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { getCurrentCustomerEmailFromSession } from "@/lib/customer-space-session.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

function noStore<T extends Response>(response: T) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function json(data: unknown, status = 200) {
  return noStore(NextResponse.json(data, { status }));
}

function hashAccountIdentity(email: string) {
  return createHash("sha256")
    .update(`action-plan-command:${email.trim().toLowerCase()}`)
    .digest("hex");
}

async function enforceCommandRateLimits(request: Request) {
  const email = await getCurrentCustomerEmailFromSession();

  if (email) {
    const accountLimit = await enforceRateLimit(
      request,
      {
        keyPrefix: "action-plan-command-account",
        limit: 30,
        windowMs: 10 * 60 * 1_000,
      },
      hashAccountIdentity(email),
    );
    if (accountLimit) return accountLimit;
  }

  return enforceRateLimit(request, {
    keyPrefix: "action-plan-command-ip",
    limit: email ? 60 : 8,
    windowMs: 10 * 60 * 1_000,
  });
}

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return noStore(blockedHost);

  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return noStore(blockedOrigin);

  const limited = await enforceCommandRateLimits(request);
  if (limited) return noStore(limited);

  const { data, response: invalidBody } = await readJsonBody<unknown>(
    request,
    128 * 1_024,
  );
  if (invalidBody) return noStore(invalidBody);

  const requestResult = actionPlanCommandRequestSchema.safeParse(data);
  if (!requestResult.success) {
    return json({ error: "La commande ou le plan est invalide." }, 400);
  }

  const planResult = compatibleActionPlanSchema.safeParse(
    requestResult.data.plan,
  );
  const workspaceResult = compatibleActionPlanWorkspaceStateSchema.safeParse(
    requestResult.data.workspace,
  );
  if (!planResult.success || !workspaceResult.success) {
    return json({ error: "La commande ou le plan est invalide." }, 400);
  }

  // Normalize in memory now so the future implementation cannot target stale
  // action IDs. No plan or workspace data leaves this process in the disabled
  // state.
  normalizeActionPlanWorkspaceState(planResult.data, workspaceResult.data);

  if (!ACTION_PLAN_COMMAND_EXTERNAL_GENERATION_ENABLED) {
    return json(
      {
        error: "feature_not_enabled",
        message:
          "La commande IA sera disponible apres validation explicite de l'envoi des donnees minimales.",
      },
      503,
    );
  }

  // This branch is intentionally unreachable until explicit consent is
  // recorded and the external generation adapter is reviewed.
  return json({ error: "feature_not_enabled" }, 503);
}
