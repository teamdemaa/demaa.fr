import { describe, expect, it } from "vitest";
import { ACTION_PLAN_DEMO } from "@/lib/action-plan-demo";
import {
  actionPlanWorkspaceStateSchema,
  compactActionPlanSteps,
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
    expect(workspace.deletedActionIds).toEqual([]);
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

  it("accepts a user-edited action title and expected result", () => {
    const base = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    const parsed = actionPlanWorkspaceStateSchema.parse({
      ...base,
      tasks: {
        ...base.tasks,
        "action-1": {
          ...base.tasks["action-1"],
          overrides: {
            title: "Vérifier le parcours de réservation",
            objective: "Une personne trouve le bon créneau et réserve sans aide.",
          },
        },
      },
    });

    expect(parsed.tasks["action-1"]?.overrides.objective).toBe(
      "Une personne trouve le bon créneau et réserve sans aide.",
    );
  });

  it("keeps legacy progress while dropping the retired duration override", () => {
    const base = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    const normalized = normalizeActionPlanWorkspaceState(ACTION_PLAN_DEMO, {
      ...base,
      tasks: {
        ...base.tasks,
        "action-1": {
          ...base.tasks["action-1"],
          status: "done",
          notes: "Conserver cette progression",
          overrides: {
            title: "Titre historique",
            estimatedMinutes: 60,
          },
        },
      },
    });

    expect(normalized.tasks["action-1"]?.status).toBe("done");
    expect(normalized.tasks["action-1"]?.notes).toBe(
      "Conserver cette progression",
    );
    expect(normalized.tasks["action-1"]?.overrides).toEqual({
      title: "Titre historique",
    });
  });

  it("falls back to a clean workspace when persisted state is invalid", () => {
    const normalized = normalizeActionPlanWorkspaceState(ACTION_PLAN_DEMO, {
      version: "2",
    });

    expect(normalized.version).toBe("1");
    expect(normalized.selectedSystemId).toBe(ACTION_PLAN_DEMO.systemId);
  });

  it("remaps checked steps when an earlier step is deleted", () => {
    const compacted = compactActionPlanSteps(
      ["Première étape", "", "Troisième étape", "Quatrième étape"],
      [0, 2, 3],
    );

    expect(compacted).toEqual({
      steps: ["Première étape", "Troisième étape", "Quatrième étape"],
      completedStepIndexes: [0, 1, 2],
    });
  });

  it("keeps deleted actions compatible while dropping unknown identifiers", () => {
    const base = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    const normalized = normalizeActionPlanWorkspaceState(ACTION_PLAN_DEMO, {
      ...base,
      deletedActionIds: ["action-1", "action-7"],
    });

    expect(normalized.deletedActionIds).toEqual(["action-1"]);
  });
});
