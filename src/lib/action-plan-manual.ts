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
    version: "2",
    selectedSystemId: null,
    savedSystemIds: [],
    addedActions: [],
    deletedActionIds: [],
    tasks: {},
    strategyOverrides: {},
    checkedProcessStepIdsBySystem: {},
    selectedSolutionPlacementIdsBySystem: {},
  };
}

export function addActionToManualPlan(
  plan: ManualActionPlan,
  workspace: ActionPlanWorkspaceState,
) {
  const reusableIndex = plan.weeklyActions.findIndex((action) =>
    workspace.deletedActionIds.includes(action.id),
  );
  const nextIndex = reusableIndex >= 0
    ? reusableIndex
    : plan.weeklyActions.length;

  if (nextIndex >= 7) return null;

  const action = createManualAction(nextIndex + 1);
  const weeklyActions = reusableIndex >= 0
    ? plan.weeklyActions.map((current, index) =>
        index === reusableIndex ? action : current,
      )
    : [...plan.weeklyActions, action];

  return {
    plan: { ...plan, weeklyActions },
    workspace: {
      ...workspace,
      deletedActionIds: workspace.deletedActionIds.filter(
        (actionId) => actionId !== action.id,
      ),
      tasks: {
        ...workspace.tasks,
        [action.id]: {
          status: "todo" as const,
          dueDate: null,
          completedStepIndexes: [],
          notes: "",
          overrides: {},
        },
      },
    },
  };
}
