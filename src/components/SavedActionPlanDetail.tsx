"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ActionPlanAcademyPanel from "@/components/ActionPlanAcademyPanel";
import ActionPlanCoachingControl from "@/components/ActionPlanCoachingControl";
import ActionPlanGenerationScreen from "@/components/ActionPlanGenerationScreen";
import ActionPlanNavbar, { type ActionPlanView } from "@/components/ActionPlanNavbar";
import ActionPlanResult from "@/components/ActionPlanResult";
import {
  SavedActionPlanMenu,
  type SavedActionPlanOption,
  SavedActionPlanSelector,
} from "@/components/SavedActionPlanControls";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import OpportunitiesPanel from "@/components/OpportunitiesPanel";
import { useActionPlanAppContext } from "@/hooks/useActionPlanAppContext";
import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import { runExistingBlankActionPlanGeneration } from "@/lib/action-plan-generation.client";
import {
  addActionToManualPlan,
  isBlankManualActionPlan,
  isManualActionPlan,
} from "@/lib/action-plan-manual";
import { scheduleActionPlanAcademyPayloadPreload } from "@/lib/action-plan-academy-preload.client";
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
  initialSourceText = null,
  initialAppContext,
  systemOptions,
  availablePlans,
  initialEmail = "",
  initialIsAuthenticated = true,
}: {
  plan: PersistableActionPlan;
  planId: string;
  initialTitle: string;
  initialRevision: number;
  initialWorkspace: ActionPlanWorkspaceState;
  initialSourceText?: string | null;
  initialAppContext: ActionPlanAppContext;
  systemOptions: readonly ActionPlanSystemOption[];
  availablePlans: readonly SavedActionPlanOption[];
  initialEmail?: string;
  initialIsAuthenticated?: boolean;
}) {
  const router = useRouter();
  const { context: appContext, navigate: navigateAppContext } =
    useActionPlanAppContext(initialAppContext);
  const activeTab = appContext.view;
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [planTitle, setPlanTitle] = useState(initialTitle);
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
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

  useEffect(() => scheduleActionPlanAcademyPayloadPreload(), []);

  function selectAppView(view: ActionPlanView) {
    navigateAppContext({
      ...appContext,
      view,
      systemId: view === "solutions"
        ? appContext.systemId || workspace.selectedSystemId || currentPlan.systemId || undefined
        : appContext.systemId,
      systemTab: view === "solutions" ? "solutions" : appContext.systemTab,
      solutionResourceSlug: undefined,
    });
  }

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

  function addManualAction(): string | undefined {
    if (!isManualActionPlan(currentPlan)) return undefined;
    const next = addActionToManualPlan(currentPlan, workspace);
    if (!next) return undefined;
    setCurrentPlan(next.plan);
    setWorkspace(next.workspace);
    return next.actionId;
  }

  function addAction(): string | undefined {
    if (isManualActionPlan(currentPlan)) {
      return addManualAction();
    }
    const nextWorkspace = addActionPlanWorkspaceAction(workspace);
    setWorkspace(nextWorkspace);
    return nextWorkspace.addedActions.at(-1)?.id;
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

  async function generateBlankPlan(sourceText: string) {
    if (!isBlankManualActionPlan(currentPlan, workspace)) {
      throw new Error("Ce plan contient déjà des informations à conserver.");
    }

    const existingSaved = await flushWorkspaceSave();
    if (!existingSaved) {
      throw new Error("Enregistrez les dernières modifications avant de générer le plan.");
    }

    setIsGeneratingPlan(true);
    try {
      const generatedPlanId = await runExistingBlankActionPlanGeneration({
        expectedRevision: revisionRef.current,
        id: planId,
        situation: sourceText,
      }, new AbortController().signal);
      window.location.replace(`/plans/${encodeURIComponent(generatedPlanId)}`);
    } catch (error) {
      setIsGeneratingPlan(false);
      throw error;
    }
  }

  if (isGeneratingPlan) return <ActionPlanGenerationScreen />;

  return (
    <div className="contents">
      <ActionPlanNavbar activeView={activeTab} onViewChange={selectAppView} />
      <ActionPlanCoachingControl
        existingPlanId={planId}
        initialEmail={initialEmail}
        isAuthenticated={initialIsAuthenticated}
      />
      <div className="pt-1">
        {activeTab === "plan" ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <SavedActionPlanSelector
                inputRef={titleInputRef}
                onResetTitle={() => setPlanTitle(confirmedTitleRef.current)}
                onTitleChange={setPlanTitle}
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
              onGeneratePlan={isBlankManualActionPlan(currentPlan, workspace)
                ? generateBlankPlan
                : undefined}
              contextualSystemId={
                appContext.systemId || workspace.selectedSystemId || currentPlan.systemId || ""
              }
              sourceText={initialSourceText}
              onOpenSolution={({ resourceSlug, systemId }) => navigateAppContext({
                ...appContext,
                view: "solutions",
                systemId,
                systemTab: "solutions",
                solutionResourceSlug: resourceSlug,
              })}
              headerActions={(
                <SavedActionPlanMenu
                  availablePlans={availablePlans}
                  deleting={isDeleting}
                  onDelete={() => { void deletePlan(); }}
                  onRename={() => {
                    titleInputRef.current?.focus();
                    titleInputRef.current?.select();
                  }}
                  plan={currentPlan}
                  planId={planId}
                  title={planTitle}
                  workspace={workspace}
                />
              )}
            />
          </>
        ) : null}
        {activeTab === "solutions" ? (
          <ActionPlanSystemPanel
            options={systemOptions}
            selectedSystemId={
              appContext.systemId || workspace.selectedSystemId || currentPlan.systemId || ""
            }
            onSystemChange={(systemId) => navigateAppContext({
              ...appContext,
              view: "solutions",
              systemId,
              systemTab: "solutions",
              solutionResourceSlug: undefined,
            })}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
            initialResourceSlug={appContext.solutionResourceSlug}
            onResourceSlugChange={(solutionResourceSlug) => navigateAppContext({
              ...appContext,
              view: "solutions",
              systemId: appContext.systemId || workspace.selectedSystemId || undefined,
              systemTab: "solutions",
              solutionResourceSlug,
            })}
          />
        ) : null}
        {activeTab === "academy" ? (
          <ActionPlanAcademyPanel
            initialContentSlug={appContext.academyContentSlug}
            onContentChange={(academyContentSlug) => navigateAppContext({
              ...appContext,
              view: "academy",
              academyContentSlug,
            })}
          />
        ) : null}
        {activeTab === "opportunities" ? (
          <OpportunitiesPanel
            initialEmail={initialEmail}
            initialOpportunityId={appContext.opportunityId}
            onOpportunityChange={(opportunityId) => navigateAppContext({
              ...appContext,
              view: "opportunities",
              opportunityId,
            })}
          />
        ) : null}
      </div>
    </div>
  );
}
