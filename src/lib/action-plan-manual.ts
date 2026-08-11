import type {
  ManualActionPlan,
  ManualActionPlanAction,
  PersistableActionPlan,
} from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

export type EditableActionPlan = PersistableActionPlan;

export function isManualActionPlan(
  plan: EditableActionPlan,
): plan is ManualActionPlan {
  return plan.version === "manual";
}

export function createManualActionPlan(): ManualActionPlan {
  return {
    version: "manual",
    summary: "",
    systemId: null,
    systemReason: "",
    weeklyActions: [],
    strategy: {
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
    },
    assumptions: [],
  };
}

export function createManualAction(index: number): ManualActionPlanAction {
  return {
    id: `action-${index}`,
    title: "Nouvelle action",
    objective: "",
    channelOrTool: "",
    steps: [""],
    readyToUse: null,
    strategyPillar: "alignement",
  };
}

export function createManualActionPlanWorkspaceState(): ActionPlanWorkspaceState {
  return {
    version: "1",
    selectedSystemId: null,
    tasks: {},
    strategyOverrides: {},
    checkedProcessStepIdsBySystem: {},
    selectedSolutionPlacementIdsBySystem: {},
  };
}
