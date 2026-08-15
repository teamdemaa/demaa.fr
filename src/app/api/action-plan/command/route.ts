import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { compatibleActionPlanSchema } from "@/lib/action-plan-contract";
import {
  actionPlanCommandRequestSchema,
  applyActionPlanCommandOperations,
} from "@/lib/action-plan-command-contract";
import {
  ACTION_PLAN_COMMAND_EXTERNAL_GENERATION_ENABLED,
  generateActionPlanCommand,
} from "@/lib/action-plan-command.server";
import {
  compatibleActionPlanWorkspaceStateSchema,
  normalizeActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import {
  getAiUsageSubjectHash,
  recordAiUsage,
} from "@/lib/ai-usage-ledger.server";
import { getCurrentCustomerIdentityFromSession } from "@/lib/customer-space-session.server";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const maxDuration = 35;

function noStore<T extends Response>(response: T) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function json(data: unknown, status = 200) {
  return noStore(NextResponse.json(data, { status }));
}

function hashAccountIdentity(uid: string) {
  return createHash("sha256")
    .update(`action-plan-command:${uid}`)
    .digest("hex");
}

async function enforceCommandRateLimits(request: Request) {
  const identity = await getCurrentCustomerIdentityFromSession();

  if (identity) {
    const accountLimit = await enforceRateLimit(
      request,
      {
        keyPrefix: "action-plan-command-account",
        limit: 30,
        windowMs: 10 * 60 * 1_000,
      },
      hashAccountIdentity(identity.uid),
    );
    if (accountLimit) return accountLimit;
  }

  return enforceRateLimit(request, {
    keyPrefix: "action-plan-command-ip",
    limit: identity ? 60 : 8,
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
  const workspace = normalizeActionPlanWorkspaceState(
    planResult.data,
    workspaceResult.data,
  );

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

  try {
    const { operations, generation } = await generateActionPlanCommand(
      requestResult.data.command,
      planResult.data,
      workspace,
      { abortSignal: request.signal },
    );

    // A model response is never trusted directly. Applying it here verifies
    // every target ID and every allowlisted mutation before it reaches the UI.
    applyActionPlanCommandOperations(planResult.data, workspace, operations);

    try {
      const identity = await getCurrentCustomerIdentityFromSession();
      await recordAiUsage({
        operation: "action_plan_command",
        subjectHash: getAiUsageSubjectHash(request, identity?.uid ?? null),
        ...generation,
      });
    } catch {
      logOperationalError(
        "ai_usage.record.failed",
        new Error("ai_usage_ledger_unavailable"),
        { operation: "action_plan_command" },
      );
    }

    return json({ operations, generation });
  } catch (error) {
    // Neither the command nor plan content is logged.
    logOperationalError(
      "action_plan.command.failed",
      new Error("action_plan_command_failed"),
      {
        requestType: "action_plan_command",
        failureType: error instanceof Error ? error.name : "unknown",
        failureMessage:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
    );
    return json(
      {
        error:
          "La modification n’a pas pu être appliquée. Réessayez dans quelques instants.",
      },
      502,
    );
  }
}
