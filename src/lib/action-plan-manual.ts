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

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

/**
 * A manual plan is considered blank only while it contains no user-authored
 * action or strategy answer. Selecting and checking a System does not make the
 * plan non-blank: those choices must survive a later generation.
 */
export function isBlankManualActionPlan(
  plan: EditableActionPlan,
  workspace?: ActionPlanWorkspaceState,
): plan is ManualActionPlan {
  if (!isManualActionPlan(plan) || plan.weeklyActions.length > 0) return false;

  const strategyHasContent = Object.values(plan.strategy).some((pillar) =>
    Object.values(pillar).some((value) => hasText(value)),
  );
  if (
    hasText(plan.summary)
    || hasText(plan.systemReason)
    || plan.assumptions.some(hasText)
    || strategyHasContent
  ) {
    return false;
  }

  if (!workspace) return true;
  if (workspace.addedActions.length > 0 || Object.keys(workspace.tasks).length > 0) {
    return false;
  }

  return !Object.values(workspace.strategyOverrides).some((override) =>
    override
      ? Object.values(override).some((value) => hasText(value))
      : false,
  );
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
    actionId: action.id,
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
