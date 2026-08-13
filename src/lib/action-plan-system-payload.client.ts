"use client";

import type { SystemeDetail } from "@/lib/systeme-catalog";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
import type { System } from "@/lib/types";

export type ActionPlanSystemPayload = Readonly<{
  intro: string;
  solutionSections: readonly RenderableSolutionSectionDto[];
  system: System;
  systeme: SystemeDetail | null;
}>;

const payloadCache = new Map<string, ActionPlanSystemPayload>();
const pendingPayloads = new Map<string, Promise<ActionPlanSystemPayload>>();

export function getActionPlanSystemPayloadCacheKey(
  systemId: string,
  demoMode: boolean,
) {
  return `${demoMode ? "demo" : "live"}:${systemId}`;
}

export function readCachedActionPlanSystemPayload(cacheKey: string) {
  return payloadCache.get(cacheKey) ?? null;
}

export function invalidateActionPlanSystemPayload(cacheKey: string) {
  payloadCache.delete(cacheKey);
  pendingPayloads.delete(cacheKey);
}

export async function loadActionPlanSystemPayload(input: {
  cacheKey: string;
  demoMode: boolean;
  systemId: string;
}) {
  const cached = payloadCache.get(input.cacheKey);
  if (cached) return cached;

  const pending = pendingPayloads.get(input.cacheKey);
  if (pending) return pending;

  const demoQuery = input.demoMode ? "?demo=1" : "";
  const request = fetch(
    `/api/action-plan/system/${encodeURIComponent(input.systemId)}${demoQuery}`,
  ).then(async (response) => {
    const body = (await response.json().catch(() => null)) as
      | ActionPlanSystemPayload
      | { error?: string }
      | null;
    if (!response.ok || !body || !("system" in body)) {
      throw new Error(
        body && "error" in body && body.error
          ? body.error
          : "Impossible de charger ce système métier.",
      );
    }
    payloadCache.set(input.cacheKey, body);
    return body;
  }).finally(() => {
    pendingPayloads.delete(input.cacheKey);
  });

  pendingPayloads.set(input.cacheKey, request);
  return request;
}
