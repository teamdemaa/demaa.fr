"use client";

import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanGenerationDraft } from "@/lib/action-plan-generation-draft.client";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import type {
  ActionPlanContentLocaleCode,
  ActionPlanCreationMarketCode,
} from "@/lib/action-plan-localization";

const ACCESS_STORAGE_KEY = "demaa:guest-action-plan-access:v1";

export type GuestActionPlan = {
  id: string;
  title: string;
  plan: PersistableActionPlan;
  workspaceState: ActionPlanWorkspaceState;
  contentLocaleCode: ActionPlanContentLocaleCode;
  marketCodeAtCreation: ActionPlanCreationMarketCode;
  expiresAt: string;
};

export type GuestGenerationState =
  | { status: "active"; generationId: string; actionPlan: GuestActionPlan }
  | { status: "generating"; generationId: string; expiresAt: string }
  | { status: "failed"; generationId: string; expiresAt: string; canRetry: boolean; error: string };

export type GuestAccess = { accessKey: string; generationId: string; expiresAt: string };

export class GuestActionPlanRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GuestActionPlanRequestError";
    this.status = status;
  }
}

function randomAccessKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const binary = Array.from(bytes, (value) => String.fromCharCode(value)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function isState(value: unknown): value is GuestGenerationState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  return ["active", "generating", "failed"].includes(String(state.status))
    && typeof state.generationId === "string";
}

async function readResponse(response: Response) {
  const payload = await response.json().catch(() => null) as unknown;
  if (response.ok && isState(payload)) return payload;
  const error = payload && typeof payload === "object" && !Array.isArray(payload)
    && typeof Reflect.get(payload, "error") === "string"
    ? String(Reflect.get(payload, "error"))
    : "Le plan n’a pas pu être généré pour le moment.";
  throw new GuestActionPlanRequestError(error, response.status);
}

export function createGuestGenerationAccess() {
  return { accessKey: randomAccessKey() };
}

export async function startGuestActionPlanGeneration(
  draft: ActionPlanGenerationDraft,
  accessKey: string,
  signal?: AbortSignal,
) {
  const response = await fetch("/api/guest/action-plans/generate", {
    body: JSON.stringify({
      accessKey,
      contentLocaleCode: draft.contentLocaleCode,
      marketCodeAtCreation: draft.marketCodeAtCreation,
      requestId: draft.requestId,
      situation: draft.situation,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    signal,
  });
  return readResponse(response);
}

export async function readGuestActionPlan(access: GuestAccess, signal?: AbortSignal) {
  const response = await fetch(`/api/guest/action-plans/${encodeURIComponent(access.generationId)}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${access.accessKey}` },
    signal,
  });
  return readResponse(response);
}

export async function resumeGuestActionPlanGeneration(access: GuestAccess, signal?: AbortSignal) {
  const response = await fetch(
    `/api/guest/action-plans/${encodeURIComponent(access.generationId)}/generation`,
    {
      headers: { Authorization: `Bearer ${access.accessKey}` },
      method: "POST",
      signal,
    },
  );
  return readResponse(response);
}

export function writeGuestAccess(access: GuestAccess) {
  try {
    window.sessionStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(access));
  } catch {
    // The current in-memory session still works when browser storage is blocked.
  }
}

export function readGuestAccess(): GuestAccess | null {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(ACCESS_STORAGE_KEY) ?? "null") as Partial<GuestAccess> | null;
    if (
      !parsed
      || typeof parsed.accessKey !== "string"
      || !/^[A-Za-z0-9_-]{43,86}$/.test(parsed.accessKey)
      || typeof parsed.generationId !== "string"
      || !/^gpl_[A-Za-z0-9_-]{40}$/.test(parsed.generationId)
      || typeof parsed.expiresAt !== "string"
      || Date.parse(parsed.expiresAt) <= Date.now()
    ) {
      clearGuestAccess();
      return null;
    }
    return parsed as GuestAccess;
  } catch {
    clearGuestAccess();
    return null;
  }
}

export function clearGuestAccess() {
  try {
    window.sessionStorage.removeItem(ACCESS_STORAGE_KEY);
  } catch {
    // Nothing else to clear.
  }
}
