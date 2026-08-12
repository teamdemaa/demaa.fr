import "server-only";

import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import {
  getActionPlanActions,
  getActionPlanStrategyFields,
  type ActionPlanViewAction,
} from "@/lib/action-plan-view-model";

/**
 * Deliberately disabled until the user explicitly authorizes sending the
 * minimal envelope described below to Vercel AI Gateway and its provider.
 */
export const ACTION_PLAN_COMMAND_EXTERNAL_GENERATION_ENABLED = false;

function getEffectiveActions(
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
) {
  const generated = getActionPlanActions(plan);
  const added: ActionPlanViewAction[] = workspace.addedActions.map((action) => ({
    ...action,
    support: action.support,
  }));
  const deleted = new Set(workspace.deletedActionIds);

  return [...generated, ...added]
    .filter(({ id }) => !deleted.has(id))
    .map((action) => {
      const overrides = workspace.tasks[action.id]?.overrides;
      return {
        id: action.id,
        title: overrides?.title ?? action.title,
        objective: overrides?.objective ?? action.objective,
        channelOrTool: action.channelOrTool,
        steps: overrides?.steps ?? action.steps,
        support:
          overrides && Object.hasOwn(overrides, "support")
            ? overrides.support ?? null
            : action.support,
        strategyPillar: action.strategyPillar,
      };
    });
}

function getEffectiveStrategy(
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
) {
  const positions = ["answerOne", "answerTwo", "answerThree"] as const;
  return getActionPlanStrategyFields(plan).map((section) => {
    const overrides = workspace.strategyOverrides[section.overrideKey];
    return {
      pillar: section.overrideKey,
      answers: section.fields.map((field, index) => {
        const position = positions[index];
        if (!position) throw new Error("Unsupported strategy field position.");
        return {
          position,
          label: field.label,
          value: overrides?.[position] ?? field.value,
        };
      }),
    };
  });
}

/**
 * Exact future external payload, kept pure and inspectable for consent review.
 *
 * Included: the command, effective visible actions and effective Strategy.
 * Excluded: notes, email, account/session identity, source situation, history,
 * selected systems, process checks, solution choices and the 115-system catalog.
 */
export function buildActionPlanCommandMinimalEnvelope(
  command: string,
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
) {
  return {
    command,
    currentPlan: {
      actions: getEffectiveActions(plan, workspace),
      strategy: getEffectiveStrategy(plan, workspace),
    },
  };
}
