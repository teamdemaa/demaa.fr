import "server-only";

import type { CustomerSessionIdentity } from "@/lib/customer-space-auth";
import {
  completeActionPlanGeneration,
  failActionPlanGeneration,
  getActionPlanGenerationForAccess,
  type ActionPlanGenerationClaim,
  type ActionPlanGenerationState,
} from "@/lib/action-plan-storage.server";
import { generateActionPlanWithMetadata } from "@/lib/action-plan-generation.server";
import { getAiUsageSubjectHash, recordAiUsage } from "@/lib/ai-usage-ledger.server";
import { logOperationalError } from "@/lib/operational-log";

async function persistGeneratedPlan(
  input: Parameters<typeof completeActionPlanGeneration>[0],
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await completeActionPlanGeneration(input);
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function executeClaimedActionPlanGeneration(input: {
  claim: ActionPlanGenerationClaim;
  identity: CustomerSessionIdentity;
  request: Request;
}): Promise<ActionPlanGenerationState | null> {
  try {
    const { title, plan, generation } = await generateActionPlanWithMetadata(
      input.claim.situation,
    );

    try {
      await recordAiUsage({
        operation: "action_plan_generation",
        subjectHash: getAiUsageSubjectHash(input.request, input.identity.email),
        ...generation,
      });
    } catch (ledgerError) {
      logOperationalError("ai_usage.record.failed", new Error("ai_usage_ledger_unavailable"), {
        operation: "action_plan_generation",
        providerErrorName: ledgerError instanceof Error ? ledgerError.name : "unknown",
      });
    }

    const stored = await persistGeneratedPlan({
      identity: input.identity,
      claim: input.claim,
      title,
      plan,
      generation,
    });
    if (stored) {
      return {
        status: "active",
        id: stored.id,
        actionPlan: stored,
      };
    }

    return getActionPlanGenerationForAccess({
      id: input.claim.id,
      uid: input.identity.uid,
    });
  } catch (error) {
    logOperationalError(
      "action_plan.generate.failed",
      new Error("action_plan_generation_failed"),
      {
        requestType: "action_plan_generation",
        providerErrorName: error instanceof Error ? error.name.slice(0, 80) : "unknown",
      },
    );
    return failActionPlanGeneration({
      identity: input.identity,
      claim: input.claim,
      errorCode: "generation_failed",
    }).catch(() => null);
  }
}
