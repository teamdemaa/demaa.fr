import "server-only";

import {
  completeGuestActionPlanGeneration,
  failGuestActionPlanGeneration,
  getGuestActionPlanGenerationForAccess,
  type GuestActionPlanGenerationClaim,
  type GuestActionPlanGenerationState,
} from "@/lib/guest-action-plan-generation.server";
import { generateActionPlanWithMetadata } from "@/lib/action-plan-generation.server";
import { getAiUsageSubjectHash, recordAiUsage } from "@/lib/ai-usage-ledger.server";
import { logOperationalError } from "@/lib/operational-log";

async function persistGeneratedPlan(
  input: Parameters<typeof completeGuestActionPlanGeneration>[0],
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await completeGuestActionPlanGeneration(input);
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function executeClaimedGuestActionPlanGeneration(input: {
  accessKey: string;
  claim: GuestActionPlanGenerationClaim;
  request: Request;
}): Promise<GuestActionPlanGenerationState | null> {
  try {
    const { title, plan, generation } = await generateActionPlanWithMetadata(
      input.claim.situation,
      {
        contentLocaleCode: input.claim.contentLocaleCode,
        marketCodeAtCreation: input.claim.marketCodeAtCreation,
      },
    );

    try {
      await recordAiUsage({
        operation: "action_plan_generation",
        subjectHash: getAiUsageSubjectHash(input.request, null),
        ...generation,
      });
    } catch (ledgerError) {
      logOperationalError("ai_usage.record.failed", new Error("ai_usage_ledger_unavailable"), {
        operation: "guest_action_plan_generation",
        providerErrorName: ledgerError instanceof Error ? ledgerError.name : "unknown",
      });
    }

    const stored = await persistGeneratedPlan({
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
        expiresAt: stored.expiresAt,
      };
    }
    return getGuestActionPlanGenerationForAccess({
      accessKey: input.accessKey,
      id: input.claim.id,
    });
  } catch (error) {
    logOperationalError(
      "guest_action_plan.generate.failed",
      new Error("guest_action_plan_generation_failed"),
      {
        requestType: "guest_action_plan_generation",
        providerErrorName: error instanceof Error ? error.name.slice(0, 80) : "unknown",
      },
    );
    return failGuestActionPlanGeneration({
      claim: input.claim,
      errorCode: "generation_failed",
    }).catch(() => null);
  }
}
