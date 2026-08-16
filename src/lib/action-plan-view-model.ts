import type { ActionPlanSupportType, PersistableActionPlan } from "@/lib/action-plan-contract";

export type ActionPlanViewAction = {
  id: string;
  title: string;
  objective: string;
  channelOrTool: string;
  steps: string[];
  support: {
    type: ActionPlanSupportType | null;
    label: string;
    content: string;
  } | null;
};

export function getActionPlanActions(
  plan: PersistableActionPlan,
): ActionPlanViewAction[] {
  if (plan.version === "4") {
    return plan.actions.map((action) => ({ ...action }));
  }

  if (plan.version === "3") {
    return plan.actions.map((action) => ({
      id: action.id,
      title: action.title,
      objective: action.objective,
      channelOrTool: action.channelOrTool,
      steps: action.steps,
      support: action.support,
    }));
  }

  return plan.weeklyActions.map((action) => ({
    id: action.id,
    title: action.title,
    objective: action.objective,
    channelOrTool: action.channelOrTool,
    steps: [...action.steps],
    support: action.readyToUse
      ? { type: null, label: action.readyToUse.label, content: action.readyToUse.content }
      : null,
  }));
}

/** Stable IDs for generated/manual actions plus workspace additions. */
export function getAllActionPlanActionIds(
  plan: PersistableActionPlan,
  addedActions: readonly { id: string }[] = [],
) {
  return [...new Set([
    ...getActionPlanActions(plan).map(({ id }) => id),
    ...addedActions.map(({ id }) => id),
  ])];
}
