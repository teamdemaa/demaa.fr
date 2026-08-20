"use client";

import type { ActionPlanGenerationDraft } from "@/lib/action-plan-generation-draft.client";
import { normalizeActionPlanLocaleContext } from "@/lib/action-plan-localization";

type GenerationResponse = {
  actionPlanId?: string;
  canRetry?: boolean;
  error?: string;
  leaseExpiresAt?: string;
  status?: "active" | "generating" | "failed";
};

export class ActionPlanAuthenticationRequiredError extends Error {
  constructor() {
    super("authentication_required");
    this.name = "ActionPlanAuthenticationRequiredError";
  }
}

export class ActionPlanGenerationFailedError extends Error {
  readonly canRetry: boolean;

  constructor(message: string, canRetry: boolean) {
    super(message);
    this.name = "ActionPlanGenerationFailedError";
    this.canRetry = canRetry;
  }
}

function wait(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function generationMessages(localeCode: "en" | "fr") {
  return localeCode === "en" ? {
    invalidResponse: "The generation did not return a valid response.",
    interrupted: "The generation was interrupted. Try again.",
    failed: "The plan could not be generated. Contact the Demaa team.",
    unavailable: "The plan cannot be generated right now.",
    missingPlan: "The generation did not return a plan.",
    timeout: "The generation is taking longer than expected. Try again.",
  } : {
    invalidResponse: "La génération n’a pas renvoyé de réponse valide.",
    interrupted: "La génération a été interrompue. Réessayez.",
    failed: "Le plan n’a pas pu être généré. Contactez l’équipe Demaa.",
    unavailable: "Impossible de générer le plan pour le moment.",
    missingPlan: "La génération n’a pas renvoyé de plan.",
    timeout: "La génération prend plus de temps que prévu. Réessayez.",
  };
}

async function readResponse(response: Response, localeCode: "en" | "fr" = "fr") {
  const messages = generationMessages(localeCode);
  const body = await response.json().catch(() => null) as GenerationResponse | null;
  const serverError = localeCode === "fr" ? body?.error : undefined;
  if (response.status === 401) throw new ActionPlanAuthenticationRequiredError();
  if (!body) throw new Error(messages.invalidResponse);
  if (body.status === "failed") {
    throw new ActionPlanGenerationFailedError(
      serverError
      || (body.canRetry ? messages.interrupted : messages.failed),
      body.canRetry === true,
    );
  }
  if (!response.ok && response.status !== 202) {
    throw new Error(serverError || messages.unavailable);
  }
  if (!body.status || !body.actionPlanId) {
    throw new Error(serverError || messages.missingPlan);
  }
  return body as Required<Pick<GenerationResponse, "status" | "actionPlanId">>
    & GenerationResponse;
}

async function startGeneration(
  draft: ActionPlanGenerationDraft,
  signal: AbortSignal,
) {
  const context = normalizeActionPlanLocaleContext(draft);
  const response = await fetch("/api/action-plans/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId: draft.requestId,
      situation: draft.situation,
      ...context,
    }),
    signal,
  });
  return readResponse(response, context.contentLocaleCode);
}

async function startExistingPlanGeneration(
  input: { expectedRevision: number; id: string; situation: string },
  signal: AbortSignal,
  localeCode: "en" | "fr" = "fr",
) {
  const response = await fetch(
    `/api/action-plans/${encodeURIComponent(input.id)}/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expectedRevision: input.expectedRevision,
        situation: input.situation,
      }),
      signal,
    },
  );
  return readResponse(response, localeCode);
}

async function readGenerationStatus(
  id: string,
  signal: AbortSignal,
  localeCode: "en" | "fr" = "fr",
) {
  const response = await fetch(
    `/api/action-plans/${encodeURIComponent(id)}/generation`,
    { cache: "no-store", signal },
  );
  return readResponse(response, localeCode);
}

async function resumeGeneration(
  id: string,
  signal: AbortSignal,
  localeCode: "en" | "fr" = "fr",
) {
  const response = await fetch(
    `/api/action-plans/${encodeURIComponent(id)}/generation`,
    { method: "POST", signal },
  );
  return readResponse(response, localeCode);
}

async function waitForActiveGeneration(
  initialState: Awaited<ReturnType<typeof readResponse>>,
  signal: AbortSignal,
  resume: () => Promise<Awaited<ReturnType<typeof readResponse>>>,
  localeCode: "en" | "fr" = "fr",
) {
  let state = initialState;
  const deadline = Date.now() + 8 * 60 * 1_000;

  while (state.status === "generating") {
    if (Date.now() >= deadline) {
      throw new Error(generationMessages(localeCode).timeout);
    }
    await wait(1_500, signal);
    const leaseExpiresAt = Date.parse(state.leaseExpiresAt ?? "");
    state = Number.isFinite(leaseExpiresAt) && Date.now() >= leaseExpiresAt
      ? await resume()
      : await readGenerationStatus(state.actionPlanId, signal, localeCode);
  }

  return state.actionPlanId;
}

export async function runAuthenticatedActionPlanGeneration(
  draft: ActionPlanGenerationDraft,
  signal: AbortSignal,
) {
  const state = await startGeneration(draft, signal);
  return waitForActiveGeneration(
    state,
    signal,
    () => startGeneration(draft, signal),
    draft.contentLocaleCode === "en" ? "en" : "fr",
  );
}

export async function runExistingBlankActionPlanGeneration(
  input: { expectedRevision: number; id: string; situation: string },
  signal: AbortSignal,
  localeCode: "en" | "fr" = "fr",
) {
  const state = await startExistingPlanGeneration(input, signal, localeCode);
  return waitForActiveGeneration(
    state,
    signal,
    () => resumeGeneration(input.id, signal, localeCode),
    localeCode,
  );
}

export async function resumeAuthenticatedActionPlanGeneration(
  id: string,
  signal: AbortSignal,
  localeCode: "en" | "fr" = "fr",
) {
  const state = await resumeGeneration(id, signal, localeCode);
  return waitForActiveGeneration(
    state,
    signal,
    () => resumeGeneration(id, signal, localeCode),
    localeCode,
  );
}

export async function watchAuthenticatedActionPlanGeneration(
  id: string,
  signal: AbortSignal,
  localeCode: "en" | "fr" = "fr",
) {
  const state = await readGenerationStatus(id, signal, localeCode);
  return waitForActiveGeneration(
    state,
    signal,
    () => resumeGeneration(id, signal, localeCode),
    localeCode,
  );
}
