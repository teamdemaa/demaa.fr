"use client";

import type { ActionPlanGenerationDraft } from "@/lib/action-plan-generation-draft.client";

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

async function readResponse(response: Response) {
  const body = await response.json().catch(() => null) as GenerationResponse | null;
  if (response.status === 401) throw new ActionPlanAuthenticationRequiredError();
  if (!body) throw new Error("La génération n’a pas renvoyé de réponse valide.");
  if (body.status === "failed") {
    throw new ActionPlanGenerationFailedError(
      body.error
      || (body.canRetry
        ? "La génération a été interrompue. Réessayez."
        : "Le plan n’a pas pu être généré. Contactez l’équipe Demaa."),
      body.canRetry === true,
    );
  }
  if (!response.ok && response.status !== 202) {
    throw new Error(body.error || "Impossible de générer le plan pour le moment.");
  }
  if (!body.status || !body.actionPlanId) {
    throw new Error(body.error || "La génération n’a pas renvoyé de plan.");
  }
  return body as Required<Pick<GenerationResponse, "status" | "actionPlanId">>
    & GenerationResponse;
}

async function startGeneration(
  draft: ActionPlanGenerationDraft,
  signal: AbortSignal,
) {
  const response = await fetch("/api/action-plans/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId: draft.requestId,
      situation: draft.situation,
    }),
    signal,
  });
  return readResponse(response);
}

async function startExistingPlanGeneration(
  input: { expectedRevision: number; id: string; situation: string },
  signal: AbortSignal,
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
  return readResponse(response);
}

async function readGenerationStatus(id: string, signal: AbortSignal) {
  const response = await fetch(
    `/api/action-plans/${encodeURIComponent(id)}/generation`,
    { cache: "no-store", signal },
  );
  return readResponse(response);
}

async function resumeGeneration(id: string, signal: AbortSignal) {
  const response = await fetch(
    `/api/action-plans/${encodeURIComponent(id)}/generation`,
    { method: "POST", signal },
  );
  return readResponse(response);
}

async function waitForActiveGeneration(
  initialState: Awaited<ReturnType<typeof readResponse>>,
  signal: AbortSignal,
  resume: () => Promise<Awaited<ReturnType<typeof readResponse>>>,
) {
  let state = initialState;
  const deadline = Date.now() + 8 * 60 * 1_000;

  while (state.status === "generating") {
    if (Date.now() >= deadline) {
      throw new Error("La génération prend plus de temps que prévu. Réessayez.");
    }
    await wait(1_500, signal);
    const leaseExpiresAt = Date.parse(state.leaseExpiresAt ?? "");
    state = Number.isFinite(leaseExpiresAt) && Date.now() >= leaseExpiresAt
      ? await resume()
      : await readGenerationStatus(state.actionPlanId, signal);
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
  );
}

export async function runExistingBlankActionPlanGeneration(
  input: { expectedRevision: number; id: string; situation: string },
  signal: AbortSignal,
) {
  const state = await startExistingPlanGeneration(input, signal);
  return waitForActiveGeneration(
    state,
    signal,
    () => resumeGeneration(input.id, signal),
  );
}

export async function resumeAuthenticatedActionPlanGeneration(
  id: string,
  signal: AbortSignal,
) {
  const state = await resumeGeneration(id, signal);
  return waitForActiveGeneration(
    state,
    signal,
    () => resumeGeneration(id, signal),
  );
}

export async function watchAuthenticatedActionPlanGeneration(
  id: string,
  signal: AbortSignal,
) {
  const state = await readGenerationStatus(id, signal);
  return waitForActiveGeneration(
    state,
    signal,
    () => resumeGeneration(id, signal),
  );
}
