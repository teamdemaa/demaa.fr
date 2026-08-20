import { beforeEach, describe, expect, it, vi } from "vitest";
import { createManualActionPlan, createManualActionPlanWorkspaceState } from "@/lib/action-plan-manual";
import {
  clearActionPlanSaveRecovery,
  readActionPlanSaveRecovery,
  writeActionPlanSaveRecovery,
} from "@/lib/action-plan-save-recovery.client";

describe("action plan save recovery", () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T10:00:00.000Z"));
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  it("restores a validated unsaved plan after a reauthentication redirect", () => {
    const value = {
      authenticationRequired: true,
      plan: createManualActionPlan(),
      title: "Plan relance commerciale",
      workspace: createManualActionPlanWorkspaceState(),
    };
    writeActionPlanSaveRecovery("plan-1", value);
    expect(readActionPlanSaveRecovery("plan-1")).toMatchObject(value);
  });

  it("expires and removes abandoned recovery data", () => {
    writeActionPlanSaveRecovery("plan-1", {
      authenticationRequired: false,
      plan: createManualActionPlan(),
      title: "Plan relance commerciale",
      workspace: createManualActionPlanWorkspaceState(),
    });
    vi.advanceTimersByTime(2 * 60 * 60 * 1_000 + 1);
    expect(readActionPlanSaveRecovery("plan-1")).toBeNull();
    expect(values.size).toBe(0);
  });

  it("clears recovery data after a successful save", () => {
    writeActionPlanSaveRecovery("plan-1", {
      authenticationRequired: false,
      plan: createManualActionPlan(),
      title: "Plan relance commerciale",
      workspace: createManualActionPlanWorkspaceState(),
    });
    clearActionPlanSaveRecovery("plan-1");
    expect(readActionPlanSaveRecovery("plan-1")).toBeNull();
  });
});
