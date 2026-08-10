import { describe, expect, it } from "vitest";
import { ACTION_PLAN_DEMO } from "@/lib/action-plan-demo";
import {
  actionPlanWorkspaceStateSchema,
  createActionPlanWorkspaceState,
  normalizeActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";

describe("action plan workspace state", () => {
  it("creates a separate editable state without mutating the generated plan", () => {
    const workspace = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);

    expect(actionPlanWorkspaceStateSchema.safeParse(workspace).success).toBe(true);
    expect(Object.keys(workspace.tasks)).toEqual(
      ACTION_PLAN_DEMO.weeklyActions.map(({ id }) => id),
    );
    expect(workspace.tasks["action-1"]?.status).toBe("todo");
    expect(ACTION_PLAN_DEMO.weeklyActions[0]?.title).toBeTruthy();
  });

  it("keeps valid user progress while dropping tasks that do not belong to the plan", () => {
    const base = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    const normalized = normalizeActionPlanWorkspaceState(ACTION_PLAN_DEMO, {
      ...base,
      tasks: {
        ...base.tasks,
        "action-1": { ...base.tasks["action-1"], status: "done" },
        "action-7": { ...base.tasks["action-1"], status: "in_progress" },
      },
    });

    expect(normalized.tasks["action-1"]?.status).toBe("done");
    expect(normalized.tasks["action-7"]).toBeUndefined();
  });

  it("falls back to a clean workspace when persisted state is invalid", () => {
    const normalized = normalizeActionPlanWorkspaceState(ACTION_PLAN_DEMO, {
      version: "2",
    });

    expect(normalized.version).toBe("1");
    expect(normalized.selectedSystemId).toBe(ACTION_PLAN_DEMO.systemId);
  });
});
