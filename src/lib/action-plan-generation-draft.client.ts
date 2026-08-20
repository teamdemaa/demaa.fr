"use client";

import {
  normalizeActionPlanLocaleContext,
  type ActionPlanContentLocaleCode,
  type ActionPlanCreationMarketCode,
} from "@/lib/action-plan-localization";

const STORAGE_KEY = "demaa:action-plan-generation:v1";
const DRAFT_TTL_MS = 2 * 60 * 60 * 1_000;

export type ActionPlanGenerationDraft = Readonly<{
  createdAt: string;
  requestId: string;
  situation: string;
  contentLocaleCode?: ActionPlanContentLocaleCode;
  marketCodeAtCreation?: ActionPlanCreationMarketCode;
}>;

function normalizeSituation(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  return normalized.length >= 20 && normalized.length <= 4_000
    ? normalized
    : null;
}

function isRequestId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9:_-]{16,160}$/.test(value);
}

function sessionStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function persistentStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function createActionPlanGenerationDraft(
  situation: string,
  context?: {
    contentLocaleCode?: ActionPlanContentLocaleCode;
    marketCodeAtCreation?: ActionPlanCreationMarketCode;
  },
): ActionPlanGenerationDraft {
  const normalizedSituation = normalizeSituation(situation);
  if (!normalizedSituation) throw new Error("La situation à générer est invalide.");
  return {
    createdAt: new Date().toISOString(),
    requestId: `plan:${crypto.randomUUID()}`,
    situation: normalizedSituation,
    ...normalizeActionPlanLocaleContext(context),
  };
}

export function writeActionPlanGenerationDraft(draft: ActionPlanGenerationDraft) {
  const serialized = JSON.stringify(draft);
  try {
    sessionStorage()?.setItem(STORAGE_KEY, serialized);
  } catch {
    // The persistent fallback below can still preserve a Google redirect.
  }
  try {
    persistentStorage()?.setItem(STORAGE_KEY, serialized);
  } catch {
    // The in-memory React state remains available when browser storage is blocked.
  }
}

export function readActionPlanGenerationDraft(): ActionPlanGenerationDraft | null {
  try {
    const value = sessionStorage()?.getItem(STORAGE_KEY)
      ?? persistentStorage()?.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<ActionPlanGenerationDraft>;
    const situation = normalizeSituation(parsed.situation);
    const createdAt = typeof parsed.createdAt === "string"
      ? Date.parse(parsed.createdAt)
      : Number.NaN;
    if (
      !situation
      || !isRequestId(parsed.requestId)
      || !Number.isFinite(createdAt)
      || Date.now() - createdAt > DRAFT_TTL_MS
      || createdAt > Date.now() + 60_000
    ) {
      clearActionPlanGenerationDraft();
      return null;
    }
    return {
      createdAt: new Date(createdAt).toISOString(),
      requestId: parsed.requestId,
      situation,
      ...normalizeActionPlanLocaleContext(parsed),
    };
  } catch {
    clearActionPlanGenerationDraft();
    return null;
  }
}

export function clearActionPlanGenerationDraft() {
  try {
    sessionStorage()?.removeItem(STORAGE_KEY);
  } catch {
    // Continue with the persistent fallback.
  }
  try {
    persistentStorage()?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing else to clear.
  }
}
