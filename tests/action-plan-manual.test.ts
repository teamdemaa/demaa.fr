import { describe, expect, it } from "vitest";
import {
  actionPlanSchema,
  compatibleActionPlanSchema,
} from "@/lib/action-plan-contract";
import {
  createManualAction,
  createManualActionPlan,
  createManualActionPlanWorkspaceState,
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
});
