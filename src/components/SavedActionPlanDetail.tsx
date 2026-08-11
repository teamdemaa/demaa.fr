"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ActionPlanAcademyPanel from "@/components/ActionPlanAcademyPanel";
import ActionPlanCoachingControl from "@/components/ActionPlanCoachingControl";
import ActionPlanNavbar, { type ActionPlanView } from "@/components/ActionPlanNavbar";
import ActionPlanResult from "@/components/ActionPlanResult";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import OpportunitiesPanel from "@/components/OpportunitiesPanel";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  addActionToManualPlan,
  isManualActionPlan,
} from "@/lib/action-plan-manual";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

export default function SavedActionPlanDetail({
  plan,
  planId,
  initialRevision,
  initialWorkspace,
  systemOptions,
  initialEmail = "",
}: {
  plan: PersistableActionPlan;
  planId: string;
  initialRevision: number;
  initialWorkspace: ActionPlanWorkspaceState;
  systemOptions: readonly ActionPlanSystemOption[];
  initialEmail?: string;
}) {
  const [activeTab, setActiveTab] = useState<ActionPlanView>("plan");
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const revisionRef = useRef(initialRevision);
  const firstRenderRef = useRef(true);
  const pendingSaveRef = useRef<{
    plan: PersistableActionPlan;
    workspace: ActionPlanWorkspaceState;
  } | null>(null);
  const saveRunningRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const flushWorkspaceSave = useCallback(async () => {
    if (saveRunningRef.current) return;
    saveRunningRef.current = true;

    while (pendingSaveRef.current) {
      const nextSave = pendingSaveRef.current;
      pendingSaveRef.current = null;
      if (mountedRef.current) {
        setSaveState("saving");
        setSaveError(null);
      }

      try {
        const response = await fetch(`/api/action-plans/${encodeURIComponent(planId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            expectedRevision: revisionRef.current,
            plan: isManualActionPlan(nextSave.plan) ? nextSave.plan : undefined,
            workspaceState: nextSave.workspace,
          }),
        });
        const body = (await response.json().catch(() => null)) as
          | { revision?: number; error?: string }
          | null;
        if (!response.ok || !body?.revision) {
          throw new Error(body?.error || "Impossible d’enregistrer les modifications.");
        }
        revisionRef.current = body.revision;
      } catch (error) {
        pendingSaveRef.current = null;
        if (mountedRef.current) {
          setSaveState("error");
          setSaveError(error instanceof Error ? error.message : "Impossible d’enregistrer les modifications.");
        }
        saveRunningRef.current = false;
        return;
      }
    }

    saveRunningRef.current = false;
    if (mountedRef.current) setSaveState("saved");
  }, [planId]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    pendingSaveRef.current = { plan: currentPlan, workspace };
    if (mountedRef.current) {
      setSaveState("saving");
      setSaveError(null);
    }
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      saveTimeoutRef.current = null;
      void flushWorkspaceSave();
    }, 700);

    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [currentPlan, flushWorkspaceSave, workspace]);

  useEffect(() => {
    function flushBeforeLeaving() {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      void flushWorkspaceSave();
    }

    window.addEventListener("pagehide", flushBeforeLeaving);
    return () => {
      mountedRef.current = false;
      window.removeEventListener("pagehide", flushBeforeLeaving);
      flushBeforeLeaving();
    };
  }, [flushWorkspaceSave]);

  function addManualAction() {
    if (!isManualActionPlan(currentPlan)) return;
    const next = addActionToManualPlan(currentPlan, workspace);
    if (!next) return;
    setCurrentPlan(next.plan);
    setWorkspace(next.workspace);
  }

  function deleteAction(actionId: string) {
    setWorkspace((current) => ({
      ...current,
      deletedActionIds: Array.from(
        new Set([...current.deletedActionIds, actionId]),
      ),
    }));
  }

  return (
    <div className="contents">
      <ActionPlanNavbar activeView={activeTab} onViewChange={setActiveTab} />
      <ActionPlanCoachingControl initialEmail={initialEmail} />
      <div className="pt-1">
        <div hidden={activeTab !== "plan"}>
          <div className="sr-only" role="status" aria-live="polite">
            <span className={saveState === "error" ? "text-red-700" : "text-dema-muted"}>
              {saveState === "saving" ? "Enregistrement…" : saveState === "error" ? saveError : "Modifications enregistrées"}
            </span>
          </div>
          <ActionPlanResult
            plan={currentPlan}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
            manualMode={isManualActionPlan(currentPlan)}
            onAddAction={isManualActionPlan(currentPlan) ? addManualAction : undefined}
            onDeleteAction={deleteAction}
          />
        </div>
        <div hidden={activeTab !== "system"}>
          <ActionPlanSystemPanel
            options={systemOptions}
            selectedSystemId={workspace.selectedSystemId || ""}
            onSystemChange={(systemId) => setWorkspace((current) => ({ ...current, selectedSystemId: systemId }))}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
          />
        </div>
        {activeTab === "academy" ? <ActionPlanAcademyPanel /> : null}
        {activeTab === "opportunities" ? (
          <OpportunitiesPanel initialEmail={initialEmail} />
        ) : null}
      </div>
    </div>
  );
}
