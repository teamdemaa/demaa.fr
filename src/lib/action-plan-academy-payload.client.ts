"use client";

import type { AcademyContentDefinition } from "@/lib/academy-course-content";
import type { PublicLiveTraining } from "@/lib/live-session-catalog";

export type ActionPlanAcademyPayload = Readonly<{
  contents: AcademyContentDefinition[];
  liveTrainings: PublicLiveTraining[];
}>;

let payloadCache: ActionPlanAcademyPayload | null = null;
let pendingPayload: Promise<ActionPlanAcademyPayload> | null = null;
let cacheVersion = 0;

function isActionPlanAcademyPayload(
  value: unknown,
): value is ActionPlanAcademyPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ActionPlanAcademyPayload>;
  return Array.isArray(candidate.contents)
    && Array.isArray(candidate.liveTrainings);
}

export function readCachedActionPlanAcademyPayload() {
  return payloadCache;
}

export function invalidateActionPlanAcademyPayload() {
  cacheVersion += 1;
  payloadCache = null;
  pendingPayload = null;
}

export function loadActionPlanAcademyPayload(): Promise<ActionPlanAcademyPayload> {
  if (payloadCache) return Promise.resolve(payloadCache);
  if (pendingPayload) return pendingPayload;

  const requestVersion = cacheVersion;
  const request = fetch("/api/action-plan/academy")
    .then(async (response) => {
      const body = await response.json().catch(() => null) as unknown;
      if (!response.ok || !isActionPlanAcademyPayload(body)) {
        throw new Error("Impossible de charger l’Académie.");
      }
      if (cacheVersion === requestVersion) payloadCache = body;
      return body;
    })
    .finally(() => {
      if (pendingPayload === request) pendingPayload = null;
    });

  pendingPayload = request;
  return request;
}
