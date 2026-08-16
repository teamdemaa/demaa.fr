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

/**
 * A manual plan is considered blank only while it contains no user-authored
 * action or saved Solution. Selecting a System alone does not
 * make the plan non-blank: that navigation choice must survive a later
 * generation without forcing a save.
 */
export function isBlankManualActionPlan(
  plan: EditableActionPlan,
  workspace?: ActionPlanWorkspaceState,
): plan is ManualActionPlan {
  if (!isManualActionPlan(plan) || plan.weeklyActions.length > 0) return false;

  if (plan.summary.trim() || plan.systemReason.trim() || plan.assumptions.some((value) => value.trim())) {
    return false;
  }

  if (!workspace) return true;
  if (workspace.addedActions.length > 0 || Object.keys(workspace.tasks).length > 0) {
    return false;
  }

  if (
    Object.values(workspace.selectedSolutionPlacementIdsBySystem).some(
      (placementIds) => (placementIds?.length ?? 0) > 0,
    )
  ) {
    return false;
  }

  return true;
}

export function createManualActionPlan(): ManualActionPlan {
  return {
    version: "manual",
    summary: "",
    systemId: null,
    systemReason: "",
    weeklyActions: [],
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
