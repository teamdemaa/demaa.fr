"use client";

import { compatibleActionPlanSchema, type PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  compatibleActionPlanWorkspaceStateSchema,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";

const PREFIX = "demaa:action-plan-save-recovery:v1:";
const RECOVERY_TTL_MS = 2 * 60 * 60 * 1_000;

export type ActionPlanSaveRecovery = Readonly<{
  authenticationRequired: boolean;
  createdAt: string;
  plan: PersistableActionPlan;
  title: string;
  workspace: ActionPlanWorkspaceState;
}>;

function storage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function key(planId: string) {
  return `${PREFIX}${planId}`;
}

export function writeActionPlanSaveRecovery(
  planId: string,
  value: Omit<ActionPlanSaveRecovery, "createdAt">,
) {
  try {
    storage()?.setItem(key(planId), JSON.stringify({
      ...value,
      createdAt: new Date().toISOString(),
    }));
  } catch {
    // The in-memory save queue remains the primary recovery path.
  }
}

export function readActionPlanSaveRecovery(planId: string): ActionPlanSaveRecovery | null {
  try {
    const serialized = storage()?.getItem(key(planId));
    if (!serialized) return null;
    const value = JSON.parse(serialized) as Record<string, unknown>;
    const createdAt = typeof value.createdAt === "string"
      ? Date.parse(value.createdAt)
      : Number.NaN;
    const parsedPlan = compatibleActionPlanSchema.safeParse(value.plan);
    const parsedWorkspace = compatibleActionPlanWorkspaceStateSchema.safeParse(value.workspace);
    const title = typeof value.title === "string" ? value.title.trim().slice(0, 120) : "";
    if (
      !Number.isFinite(createdAt)
      || Date.now() - createdAt > RECOVERY_TTL_MS
      || createdAt > Date.now() + 60_000
      || !parsedPlan.success
      || !parsedWorkspace.success
      || !title
    ) {
      clearActionPlanSaveRecovery(planId);
      return null;
    }
    return {
      authenticationRequired: value.authenticationRequired === true,
      createdAt: new Date(createdAt).toISOString(),
      plan: parsedPlan.data,
      title,
      workspace: parsedWorkspace.data,
    };
  } catch {
    clearActionPlanSaveRecovery(planId);
    return null;
  }
}

export function clearActionPlanSaveRecovery(planId: string) {
  try {
    storage()?.removeItem(key(planId));
  } catch {
    // Nothing else to clear.
  }
}
