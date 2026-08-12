"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ActionPlanAcademyPanel from "@/components/ActionPlanAcademyPanel";
import ActionPlanCoachingControl from "@/components/ActionPlanCoachingControl";
import ActionPlanNavbar, { type ActionPlanView } from "@/components/ActionPlanNavbar";
import ActionPlanResult from "@/components/ActionPlanResult";
import {
  SavedActionPlanMenu,
  type SavedActionPlanOption,
  SavedActionPlanSelector,
} from "@/components/SavedActionPlanControls";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import OpportunitiesPanel from "@/components/OpportunitiesPanel";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  addActionToManualPlan,
  isManualActionPlan,
} from "@/lib/action-plan-manual";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import {
  addActionPlanWorkspaceAction,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";

export default function SavedActionPlanDetail({
  plan,
  planId,
  initialTitle,
  initialRevision,
  initialWorkspace,
  systemOptions,
  availablePlans,
  initialEmail = "",
}: {
  plan: PersistableActionPlan;
  planId: string;
  initialTitle: string;
  initialRevision: number;
  initialWorkspace: ActionPlanWorkspaceState;
  systemOptions: readonly ActionPlanSystemOption[];
  availablePlans: readonly SavedActionPlanOption[];
  initialEmail?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActionPlanView>("plan");
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [planTitle, setPlanTitle] = useState(initialTitle);
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const revisionRef = useRef(initialRevision);
  const confirmedTitleRef = useRef(initialTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const firstRenderRef = useRef(true);
  const pendingSaveRef = useRef<{
    plan: PersistableActionPlan;
    title: string;
    workspace: ActionPlanWorkspaceState;
  } | null>(null);
  const savePromiseRef = useRef<Promise<boolean> | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const flushWorkspaceSave = useCallback(() => {
    if (savePromiseRef.current) return savePromiseRef.current;

    const savePromise = (async () => {
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
              title: nextSave.title,
              workspaceState: nextSave.workspace,
            }),
          });
          const body = (await response.json().catch(() => null)) as
            | { revision?: number; title?: string; error?: string }
            | null;
          if (!response.ok || !body?.revision) {
            throw new Error(body?.error || "Impossible d’enregistrer les modifications.");
          }
          revisionRef.current = body.revision;
          confirmedTitleRef.current = body.title || nextSave.title;
        } catch (error) {
          pendingSaveRef.current = null;
          if (mountedRef.current) {
            setSaveState("error");
            setSaveError(error instanceof Error ? error.message : "Impossible d’enregistrer les modifications.");
          }
          return false;
        }
      }

      if (mountedRef.current) setSaveState("saved");
      return true;
    })();

    savePromiseRef.current = savePromise;
    void savePromise.finally(() => {
      if (savePromiseRef.current === savePromise) savePromiseRef.current = null;
    });
    return savePromise;
  }, [planId]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    pendingSaveRef.current = {
      plan: currentPlan,
      title: planTitle.trim() || confirmedTitleRef.current,
      workspace,
    };
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
  }, [currentPlan, flushWorkspaceSave, planTitle, workspace]);

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

  function addAction() {
    if (isManualActionPlan(currentPlan)) {
      addManualAction();
      return;
    }
    setWorkspace((current) => addActionPlanWorkspaceAction(current));
  }

  function deleteAction(actionId: string) {
    setWorkspace((current) => ({
      ...current,
      deletedActionIds: Array.from(
        new Set([...current.deletedActionIds, actionId]),
      ),
    }));
  }

  async function deletePlan() {
    if (
      isDeleting
      || !window.confirm("Supprimer ce plan ? Cette action est définitive dans l’application.")
    ) return;

    setIsDeleting(true);
    setSaveError(null);
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const saved = await flushWorkspaceSave();
    if (!saved) {
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(`/api/action-plans/${encodeURIComponent(planId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedRevision: revisionRef.current }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(body?.error || "Impossible de supprimer ce plan.");
      }
      router.replace("/plans");
      router.refresh();
    } catch (error) {
      setSaveState("error");
      setSaveError(
        error instanceof Error ? error.message : "Impossible de supprimer ce plan.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="contents">
      <ActionPlanNavbar activeView={activeTab} onViewChange={setActiveTab} />
      <ActionPlanCoachingControl
        existingPlanId={planId}
        initialEmail={initialEmail}
      />
      <div className="pt-1">
        <div hidden={activeTab !== "plan"}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <SavedActionPlanSelector
              availablePlans={availablePlans}
              inputRef={titleInputRef}
              onResetTitle={() => setPlanTitle(confirmedTitleRef.current)}
              onTitleChange={setPlanTitle}
              planId={planId}
              title={planTitle}
            />
          </div>
          <div className="sr-only" role="status" aria-live="polite">
            <span className={saveState === "error" ? "text-red-700" : "text-dema-muted"}>
              {saveState === "saving" ? "Enregistrement…" : saveState === "error" ? saveError : "Modifications enregistrées"}
            </span>
          </div>
          {saveState === "error" ? (
            <p className="mb-3 text-sm text-red-700" role="alert">{saveError}</p>
          ) : null}
          <ActionPlanResult
            plan={currentPlan}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
            manualMode={isManualActionPlan(currentPlan)}
            onAddAction={addAction}
            onDeleteAction={deleteAction}
            headerActions={(
              <SavedActionPlanMenu
                deleting={isDeleting}
                onDelete={() => { void deletePlan(); }}
                onRename={() => {
                  titleInputRef.current?.focus();
                  titleInputRef.current?.select();
                }}
                plan={currentPlan}
                workspace={workspace}
              />
            )}
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
