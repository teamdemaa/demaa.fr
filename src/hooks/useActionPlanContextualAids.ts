"use client";

import { useEffect, useMemo, useState } from "react";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  buildActionPlanContextualAids,
  getEffectiveActionPlanActionsForContextualAids,
  type ActionPlanContextualAidsByActionId,
} from "@/lib/action-plan-contextual-aids";
import type { ActionPlanViewAction } from "@/lib/action-plan-view-model";
import {
  getActionPlanSystemPayloadCacheKey,
  loadActionPlanSystemPayload,
} from "@/lib/action-plan-system-payload.client";
import { getSystemResourcesForSystem } from "@/lib/system-resource-catalog";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

type ContextualAidState = Readonly<{
  aids: ActionPlanContextualAidsByActionId;
  requestKey: string;
}>;

const EMPTY_AIDS: ActionPlanContextualAidsByActionId = Object.freeze({});

export function useActionPlanContextualAids(input: {
  demoMode?: boolean;
  plan: PersistableActionPlan;
  sourceText?: string | null;
  systemId: string;
  workspace: ActionPlanWorkspaceState;
}) {
  const actions = useMemo(
    () => getEffectiveActionPlanActionsForContextualAids(
      input.plan,
      input.workspace,
    ),
    [input.plan, input.workspace],
  );
  const serializedActions = JSON.stringify(actions.map((action) => ({
    channelOrTool: action.channelOrTool,
    id: action.id,
    objective: action.objective,
    steps: action.steps,
    support: action.support,
    title: action.title,
  })));
  const demoMode = input.demoMode ?? false;
  const selectedPlacementIds = JSON.stringify(
    input.workspace.selectedSolutionPlacementIdsBySystem[input.systemId] ?? [],
  );
  const requestKey = `${demoMode ? "demo" : "live"}:${input.systemId}:${input.sourceText ?? ""}:${selectedPlacementIds}:${serializedActions}`;
  const [state, setState] = useState<ContextualAidState>({
    aids: EMPTY_AIDS,
    requestKey: "",
  });

  useEffect(() => {
    if (!input.systemId || serializedActions === "[]") return;
    let active = true;
    const contextualActions = JSON.parse(
      serializedActions,
    ) as ActionPlanViewAction[];
    const cacheKey = getActionPlanSystemPayloadCacheKey(
      input.systemId,
      demoMode,
    );

    void loadActionPlanSystemPayload({
      cacheKey,
      demoMode,
      systemId: input.systemId,
    }).then((payload) => {
      if (!active) return;
      const aids = buildActionPlanContextualAids({
        actions: contextualActions,
        resources: getSystemResourcesForSystem(input.systemId),
        selectedSolutionPlacementIds: new Set(
          JSON.parse(selectedPlacementIds) as string[],
        ),
        solutionSections: payload.solutionSections,
        sourceText: input.sourceText,
        systemId: input.systemId,
        systeme: payload.systeme,
      });
      setState({ aids, requestKey });
    }).catch(() => {
      if (active) setState({ aids: EMPTY_AIDS, requestKey });
    });

    return () => {
      active = false;
    };
  }, [demoMode, input.sourceText, input.systemId, requestKey, selectedPlacementIds, serializedActions]);

  return state.requestKey === requestKey ? state.aids : EMPTY_AIDS;
}
