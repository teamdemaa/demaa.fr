"use client";

import type { AcademyContentDefinition } from "@/lib/academy-course-content";
import type { PublicLiveTraining } from "@/lib/live-session-catalog";

export type ActionPlanAcademyPayload = Readonly<{
  contents: AcademyContentDefinition[];
  liveTrainings: PublicLiveTraining[];
}>;

const payloadCache = new Map<string, ActionPlanAcademyPayload>();
const pendingPayloads = new Map<string, Promise<ActionPlanAcademyPayload>>();
const cacheVersions = new Map<string, number>();

export function getActionPlanAcademyPayloadCacheKey(
  localeCode: "fr" | "en" = "fr",
  marketCode = localeCode === "en" ? "global-en-beta" : "fr-fr",
) {
  return `${localeCode}:${marketCode}`;
}

function isActionPlanAcademyPayload(
  value: unknown,
): value is ActionPlanAcademyPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ActionPlanAcademyPayload>;
  return Array.isArray(candidate.contents)
    && Array.isArray(candidate.liveTrainings);
}

export function readCachedActionPlanAcademyPayload(
  cacheKey = getActionPlanAcademyPayloadCacheKey(),
) {
  return payloadCache.get(cacheKey) ?? null;
}

export function invalidateActionPlanAcademyPayload(
  cacheKey = getActionPlanAcademyPayloadCacheKey(),
) {
  cacheVersions.set(cacheKey, (cacheVersions.get(cacheKey) ?? 0) + 1);
  payloadCache.delete(cacheKey);
  pendingPayloads.delete(cacheKey);
}

export function loadActionPlanAcademyPayload(input: {
  localeCode?: "fr" | "en";
  marketCode?: string;
} = {}): Promise<ActionPlanAcademyPayload> {
  const localeCode = input.localeCode ?? "fr";
  const marketCode = input.marketCode
    ?? (localeCode === "en" ? "global-en-beta" : "fr-fr");
  const cacheKey = getActionPlanAcademyPayloadCacheKey(localeCode, marketCode);
  const cached = payloadCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);
  const pending = pendingPayloads.get(cacheKey);
  if (pending) return pending;

  const requestVersion = cacheVersions.get(cacheKey) ?? 0;
  const query = new URLSearchParams({ locale: localeCode, market: marketCode });
  const request = fetch(`/api/action-plan/academy?${query.toString()}`)
    .then(async (response) => {
      const body = await response.json().catch(() => null) as unknown;
      if (!response.ok || !isActionPlanAcademyPayload(body)) {
        throw new Error(
          localeCode === "en"
            ? "Unable to load the Academy."
            : "Impossible de charger les contenus.",
        );
      }
      if ((cacheVersions.get(cacheKey) ?? 0) === requestVersion) {
        payloadCache.set(cacheKey, body);
      }
      return body;
    })
    .finally(() => {
      if (pendingPayloads.get(cacheKey) === request) {
        pendingPayloads.delete(cacheKey);
      }
    });

  pendingPayloads.set(cacheKey, request);
  return request;
}
