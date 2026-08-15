import { describe, expect, it } from "vitest";
import { ACTION_PLAN_DEMO } from "@/lib/action-plan-demo";
import {
  actionPlanWorkspaceStateSchema,
  compatibleActionPlanWorkspaceStateSchema,
  compactActionPlanSteps,
  createActionPlanWorkspaceState,
  createGeneratedActionPlanWorkspaceState,
  normalizeActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";

describe("action plan workspace state", () => {
  it("creates a separate editable state without mutating the generated plan", () => {
    const workspace = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);

    expect(actionPlanWorkspaceStateSchema.safeParse(workspace).success).toBe(true);
    expect(Object.keys(workspace.tasks)).toEqual(
      ACTION_PLAN_DEMO.actions.map(({ id }) => id),
    );
    expect(workspace.tasks["action-1"]?.status).toBe("todo");
    expect(workspace.deletedActionIds).toEqual([]);
    expect(workspace.addedActions).toEqual([]);
    expect(workspace.savedSystemIds).toEqual([ACTION_PLAN_DEMO.systemId]);
    expect(ACTION_PLAN_DEMO.actions[0]?.title).toBeTruthy();
  });

  it("opens a generated plan on its generated system while preserving earlier catalogue choices", () => {
    const previous = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    previous.selectedSolutionPlacementIdsBySystem.restaurant = ["restaurant-solution"];
    const generatedPlan = {
      ...ACTION_PLAN_DEMO,
      systemId: "cabinet-de-conseil" as const,
    };

    const workspace = createGeneratedActionPlanWorkspaceState(
      generatedPlan,
      previous,
    );

    expect(workspace.selectedSystemId).toBe("cabinet-de-conseil");
    expect(workspace.savedSystemIds).toEqual([
      "restaurant",
      "cabinet-de-conseil",
    ]);
    expect(workspace.selectedSolutionPlacementIdsBySystem.restaurant).toEqual([
      "restaurant-solution",
    ]);
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
            support: {
              type: "checklist",
              label: "Contrôle de réservation",
              content: "Vérifier le téléphone et le formulaire.",
            },
          },
        },
      },
    });

    expect(parsed.tasks["action-1"]?.overrides.objective).toBe(
      "Une personne trouve le bon créneau et réserve sans aide.",
    );
    expect(parsed.tasks["action-1"]?.overrides.support?.type).toBe("checklist");
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
    expect(normalized.tasks["action-1"]?.overrides).toEqual({ title: "Titre historique" });
  });

  it("falls back to a clean workspace when persisted state is invalid", () => {
    const normalized = normalizeActionPlanWorkspaceState(ACTION_PLAN_DEMO, {
      version: "inconnue",
    });

    expect(normalized.version).toBe("2");
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

  it("migrates V1 in memory and keeps its historical support content", () => {
    const base = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    const legacy = {
      version: "1",
      selectedSystemId: base.selectedSystemId,
      deletedActionIds: [],
      tasks: Object.fromEntries(Object.entries(base.tasks).map(([id, task]) => [id, {
        ...task,
        overrides: id === "action-1"
          ? { readyToUse: { label: "Support historique", content: "Contenu historique" } }
          : {},
      }])),
      strategyOverrides: {},
      checkedProcessStepIdsBySystem: {},
      selectedSolutionPlacementIdsBySystem: {},
    };
    const migrated = compatibleActionPlanWorkspaceStateSchema.parse(legacy);
    expect(migrated.version).toBe("2");
    expect(migrated.addedActions).toEqual([]);
    expect(migrated.tasks["action-1"]?.overrides.support).toEqual({
      type: null,
      label: "Support historique",
      content: "Contenu historique",
    });
  });

  it("keeps up to 50 custom actions and normalizes their task state", () => {
    const base = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    const custom = {
      id: "custom-user-1",
      title: "Action ajoutée",
      objective: "",
      channelOrTool: "",
      steps: [],
      support: null,
      strategyPillar: "alignement" as const,
    };
    const normalized = normalizeActionPlanWorkspaceState(ACTION_PLAN_DEMO, {
      ...base,
      addedActions: [custom],
      deletedActionIds: ["custom-user-1"],
    });
    expect(normalized.addedActions).toEqual([custom]);
    expect(normalized.tasks["custom-user-1"]?.status).toBe("todo");
    expect(normalized.deletedActionIds).toEqual(["custom-user-1"]);
  });

  it("rejects duplicate saved systems and duplicate custom IDs", () => {
    const base = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    expect(actionPlanWorkspaceStateSchema.safeParse({
      ...base,
      savedSystemIds: [ACTION_PLAN_DEMO.systemId, ACTION_PLAN_DEMO.systemId],
    }).success).toBe(false);
    const custom = {
      id: "custom-duplicate",
      title: "Action ajoutée",
      objective: "",
      channelOrTool: "",
      steps: [],
      support: null,
      strategyPillar: "alignement",
    };
    expect(actionPlanWorkspaceStateSchema.safeParse({
      ...base,
      addedActions: [custom, custom],
    }).success).toBe(false);
  });
});
