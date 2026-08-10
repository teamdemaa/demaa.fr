import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { generateActionPlan } from "@/lib/action-plan-generation.server";
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
    const plan = await generateActionPlan(parsed.data.situation);
    return json({ plan });
  } catch {
    // Le texte du dirigeant et l'erreur fournisseur ne sont jamais journalises.
    logOperationalError(
      "action_plan.generate.failed",
      new Error("action_plan_generation_failed"),
      { requestType: "action_plan_generation" },
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
