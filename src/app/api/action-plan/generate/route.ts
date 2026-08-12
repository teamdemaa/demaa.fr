import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { generateActionPlanWithMetadata } from "@/lib/action-plan-generation.server";
import {
  getAiUsageSubjectHash,
  recordAiUsage,
} from "@/lib/ai-usage-ledger.server";
import { getCurrentCustomerEmailFromSession } from "@/lib/customer-space-session.server";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z
  .object({
    situation: z.string().trim().min(20).max(4_000),
  })
  .strict();

function json(data: unknown, status = 200) {
  const response = NextResponse.json(data, { status });
  return noStore(response);
}

function noStore<T extends Response>(response: T) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function getGenerationErrorMetadata(error: unknown) {
  if (!error || typeof error !== "object") {
    return { providerErrorName: "unknown", providerStatusCode: null };
  }

  const candidate = error as { name?: unknown; statusCode?: unknown };
  return {
    providerErrorName:
      typeof candidate.name === "string"
        ? candidate.name.slice(0, 80)
        : "unknown",
    providerStatusCode:
      typeof candidate.statusCode === "number" ? candidate.statusCode : null,
  };
}

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return noStore(blockedHost);

  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return noStore(blockedOrigin);

  const limited = await enforceRateLimit(request, {
    keyPrefix: "action-plan-generate",
    limit: 6,
    windowMs: 10 * 60 * 1_000,
  });
  if (limited) return noStore(limited);

  const { data, response: invalidBody } = await readJsonBody<unknown>(
    request,
    20 * 1_024,
  );
  if (invalidBody) return noStore(invalidBody);

  const parsed = requestSchema.safeParse(data);
  if (!parsed.success) {
    return json(
      {
        error:
          "Décrivez votre situation en quelques phrases (entre 20 et 4 000 caractères).",
      },
      400,
    );
  }

  try {
    const { plan, generation } = await generateActionPlanWithMetadata(
      parsed.data.situation,
      { abortSignal: request.signal },
    );

    try {
      const accountEmail = await getCurrentCustomerEmailFromSession();
      const subjectHash = getAiUsageSubjectHash(request, accountEmail);
      await recordAiUsage({
        operation: "action_plan_generation",
        subjectHash,
        ...generation,
      });
    } catch (ledgerError) {
      logOperationalError(
        "ai_usage.record.failed",
        new Error("ai_usage_ledger_unavailable"),
        {
          operation: "action_plan_generation",
          providerErrorName: getGenerationErrorMetadata(ledgerError).providerErrorName,
        },
      );
    }

    return json({ plan, generation });
  } catch (error) {
    // Le texte du dirigeant et l'erreur fournisseur ne sont jamais journalises.
    logOperationalError(
      "action_plan.generate.failed",
      new Error("action_plan_generation_failed"),
      {
        requestType: "action_plan_generation",
        ...getGenerationErrorMetadata(error),
      },
    );

    return json(
      {
        error:
          "Le plan n’a pas pu être généré pour le moment. Merci de réessayer.",
      },
      502,
    );
  }
}
