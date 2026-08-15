import { describe, expect, it } from "vitest";
import {
  actionPlanSchema,
  compatibleActionPlanSchema,
} from "@/lib/action-plan-contract";
import {
  addActionToManualPlan,
  createManualAction,
  createManualActionPlan,
  createManualActionPlanWorkspaceState,
  isBlankManualActionPlan,
  isManualActionPlan,
} from "@/lib/action-plan-manual";
import { actionPlanWorkspaceStateSchema } from "@/lib/action-plan-workspace";

describe("manual action plan", () => {
  it("starts with no action, no selected system and four empty editable pillars", () => {
    const plan = createManualActionPlan();

    expect(isManualActionPlan(plan)).toBe(true);
    expect(plan.weeklyActions).toEqual([]);
    expect(plan.systemId).toBeNull();
    expect(plan.strategy).toEqual({
      alignment: {
        headline: "",
        desiredCompany: "",
        boundariesAndValues: "",
        prioritiesAndTradeoffs: "",
      },
      positioning: {
        headline: "",
        preciseCustomer: "",
        importantProblem: "",
        evidenceAndAlternatives: "",
      },
      offer: {
        headline: "",
        promisedOutcome: "",
        scope: "",
        priceCommitmentAndRisk: "",
      },
      promotion: {
        headline: "",
        attract: "",
        facilitatePurchase: "",
        retainAndStrengthen: "",
      },
    });
  });

  it("keeps the AI contract strict while allowing the blank state to persist", () => {
    const plan = createManualActionPlan();
    const workspace = createManualActionPlanWorkspaceState();

    expect(actionPlanSchema.safeParse(plan).success).toBe(false);
    expect(compatibleActionPlanSchema.safeParse(plan).success).toBe(true);
    expect(actionPlanWorkspaceStateSchema.safeParse(workspace).success).toBe(true);
    expect(workspace.selectedSystemId).toBeNull();
    expect(isBlankManualActionPlan(plan, workspace)).toBe(true);
  });

  it("distinguishes a pristine manual plan from user-authored content", () => {
    const blankPlan = createManualActionPlan();
    const blankWorkspace = createManualActionPlanWorkspaceState();
    const planWithAction = {
      ...blankPlan,
      weeklyActions: [createManualAction(1)],
    };
    const workspaceWithStrategy = {
      ...blankWorkspace,
      strategyOverrides: {
        alignement: { answerOne: "Construire une entreprise autonome." },
      },
    };
    const workspaceWithSystem = {
      ...blankWorkspace,
      selectedSystemId: "restaurant" as const,
      savedSystemIds: ["restaurant" as const],
    };
    const workspaceWithSelection = {
      ...workspaceWithSystem,
      selectedSolutionPlacementIdsBySystem: {
        restaurant: ["family:restaurant:outil:software:1"],
      },
    };

    expect(isBlankManualActionPlan(planWithAction, blankWorkspace)).toBe(false);
    expect(isBlankManualActionPlan(blankPlan, workspaceWithStrategy)).toBe(false);
    expect(isBlankManualActionPlan(blankPlan, workspaceWithSystem)).toBe(true);
    expect(isBlankManualActionPlan(blankPlan, workspaceWithSelection)).toBe(false);
  });

  it("creates editable actions with consecutive identifiers", () => {
    expect(createManualAction(1)).toMatchObject({
      id: "action-1",
      title: "Nouvelle action",
      objective: "",
      steps: [""],
    });
    expect(createManualAction(2).id).toBe("action-2");
  });

  it("reuses a deleted slot when a new manual action is added", () => {
    const plan = {
      ...createManualActionPlan(),
      weeklyActions: [createManualAction(1), createManualAction(2)],
    };
    const workspace = {
      ...createManualActionPlanWorkspaceState(),
      deletedActionIds: ["action-1"],
      tasks: {
        "action-1": {
          status: "done" as const,
          dueDate: null,
          completedStepIndexes: [0],
          notes: "Ancienne action",
          overrides: {},
        },
      },
    };

    const next = addActionToManualPlan(plan, workspace);

    expect(next?.actionId).toBe("action-1");
    expect(next?.plan.weeklyActions).toHaveLength(2);
    expect(next?.plan.weeklyActions[0]?.title).toBe("Nouvelle action");
    expect(next?.workspace.deletedActionIds).toEqual([]);
    expect(next?.workspace.tasks["action-1"]?.status).toBe("todo");
  });
});
