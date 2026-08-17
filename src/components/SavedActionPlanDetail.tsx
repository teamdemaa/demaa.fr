"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import CompanyPilotagePanel from "@/components/CompanyPilotagePanel";
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
import { ActionPlanSaveQueue } from "@/lib/action-plan-save-queue.client";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import {
  addActionPlanWorkspaceAction,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import {
  getLocalizedActionPlanPath,
  type ActionPlanContentLocaleCode,
} from "@/lib/action-plan-localization";

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
  contentLocaleCode = "fr",
  interfaceLocaleCode = "fr",
  visibleViews,
  showCoaching = true,
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
  contentLocaleCode?: ActionPlanContentLocaleCode;
  interfaceLocaleCode?: ActionPlanContentLocaleCode;
  visibleViews?: readonly ActionPlanView[];
  showCoaching?: boolean;
}) {
  const router = useRouter();
  const planHrefPrefix = getLocalizedActionPlanPath(interfaceLocaleCode, "/plans/");
  const newPlanHref = getLocalizedActionPlanPath(interfaceLocaleCode, "/plans/new");
  const messages = useMemo(() => interfaceLocaleCode === "en" ? {
    saveFailed: "Your changes could not be saved.",
    recentLoadFailed: "The latest version of the plan could not be loaded.",
    deleteFailed: "This plan could not be deleted.",
    planNotBlank: "This plan already contains information that must be kept.",
    saveBeforeGenerate: "Save the latest changes before generating the plan.",
  } : {
    saveFailed: "Impossible d’enregistrer les modifications.",
    recentLoadFailed: "Impossible de charger la version récente du plan.",
    deleteFailed: "Impossible de supprimer ce plan.",
    planNotBlank: "Ce plan contient déjà des informations à conserver.",
    saveBeforeGenerate: "Enregistrez les dernières modifications avant de générer le plan.",
  }, [interfaceLocaleCode]);
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
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [saveConflict, setSaveConflict] = useState(false);
  const revisionRef = useRef(initialRevision);
  const confirmedTitleRef = useRef(initialTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const firstRenderRef = useRef(true);
  type PendingSave = {
    plan: PersistableActionPlan;
    title: string;
    workspace: ActionPlanWorkspaceState;
  };
  const saveQueueRef = useRef(new ActionPlanSaveQueue<PendingSave>());
  const saveTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const navigationTargetRef = useRef<string | null>(null);
  const saveConflictRef = useRef(false);

  useEffect(() => {
    if (!visibleViews || visibleViews.includes("academy")) {
      return scheduleActionPlanAcademyPayloadPreload();
    }
  }, [visibleViews]);

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

  const flushWorkspaceSave = useCallback(async () => {
    if (saveConflictRef.current) return false;

    const result = await saveQueueRef.current.drain(async (nextSave) => {
        if (mountedRef.current) {
          setSaveState("saving");
          setSaveError(null);
          setSaveConflict(false);
        }

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
          | { revision?: number; title?: string; error?: string; code?: string }
          | null;
        if (!response.ok || !body?.revision) {
          const error = new Error(
            interfaceLocaleCode === "en" ? messages.saveFailed : body?.error || messages.saveFailed,
          ) as Error & {
            code?: string;
          };
          error.code = body?.code;
          throw error;
        }
        revisionRef.current = body.revision;
        confirmedTitleRef.current = body.title || nextSave.title;
    });

    if (result.ok) {
      if (mountedRef.current) setSaveState("saved");
      return true;
    }
    if (mountedRef.current) {
      const error = result.error as (Error & { code?: string }) | null;
      const conflict = error?.code === "revision_conflict";
      saveConflictRef.current = conflict;
      setSaveState("error");
      setSaveError(error?.message || messages.saveFailed);
      setSaveConflict(conflict);
    }
    return false;
  }, [interfaceLocaleCode, messages.saveFailed, planId]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    saveQueueRef.current.enqueue({
      plan: currentPlan,
      title: planTitle.trim() || confirmedTitleRef.current,
      workspace,
    });
    if (saveConflictRef.current) return;
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
    mountedRef.current = true;

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

  async function navigateAfterSave(href: string) {
    if (navigationTargetRef.current) return;
    navigationTargetRef.current = href;
    setNavigationTarget(href);
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const saved = await flushWorkspaceSave();
    if (!saved) {
      navigationTargetRef.current = null;
      setNavigationTarget(null);
      return;
    }
    router.push(href);
  }

  async function keepLocalChangesAfterConflict() {
    try {
      setSaveState("saving");
      const response = await fetch(`/api/action-plans/${encodeURIComponent(planId)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const body = (await response.json().catch(() => null)) as
        | { revision?: number; error?: string }
        | null;
      if (!response.ok || !body?.revision) {
        throw new Error(interfaceLocaleCode === "en" ? messages.recentLoadFailed : body?.error || messages.recentLoadFailed);
      }
      revisionRef.current = body.revision;
      saveConflictRef.current = false;
      setSaveConflict(false);
      setSaveError(null);
      await flushWorkspaceSave();
    } catch (error) {
      saveConflictRef.current = true;
      setSaveConflict(true);
      setSaveState("error");
      setSaveError(
        error instanceof Error
          ? error.message
          : messages.recentLoadFailed,
      );
    }
  }

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
      || !window.confirm(interfaceLocaleCode === "en"
        ? "Delete this plan? This action cannot be undone in the application."
        : "Supprimer ce plan ? Cette action est définitive dans l’application.")
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
        throw new Error(interfaceLocaleCode === "en" ? messages.deleteFailed : body?.error || messages.deleteFailed);
      }
      router.replace(getLocalizedActionPlanPath(interfaceLocaleCode, "/plans"));
      router.refresh();
    } catch (error) {
      setSaveState("error");
      setSaveError(
        error instanceof Error ? error.message : messages.deleteFailed,
      );
      setIsDeleting(false);
    }
  }

  async function generateBlankPlan(sourceText: string) {
    if (!isBlankManualActionPlan(currentPlan, workspace)) {
      throw new Error(messages.planNotBlank);
    }

    const existingSaved = await flushWorkspaceSave();
    if (!existingSaved) {
      throw new Error(messages.saveBeforeGenerate);
    }

    setIsGeneratingPlan(true);
    try {
      const generatedPlanId = await runExistingBlankActionPlanGeneration({
        expectedRevision: revisionRef.current,
        id: planId,
        situation: sourceText,
      }, new AbortController().signal, contentLocaleCode);
      window.location.replace(getLocalizedActionPlanPath(
        interfaceLocaleCode,
        `/plans/${encodeURIComponent(generatedPlanId)}`,
      ));
    } catch (error) {
      setIsGeneratingPlan(false);
      throw error;
    }
  }

  if (isGeneratingPlan) return <ActionPlanGenerationScreen localeCode={interfaceLocaleCode} />;

  return (
    <div className="contents">
      <ActionPlanNavbar activeView={activeTab} onViewChange={selectAppView} localeCode={interfaceLocaleCode} visibleViews={visibleViews} />
      {showCoaching ? <ActionPlanCoachingControl
        existingPlanId={planId}
        initialEmail={initialEmail}
        isAuthenticated={initialIsAuthenticated}
      /> : null}
      <div className="pt-1">
        {activeTab === "plan" ? (
          <CompanyPilotagePanel
            available={interfaceLocaleCode === "fr"}
            section={appContext.planSection}
            onSectionChange={(planSection) => navigateAppContext({
              ...appContext,
              view: "plan",
              planSection,
              systemId: undefined,
              systemTab: undefined,
              solutionResourceSlug: undefined,
              academyContentSlug: undefined,
            })}
          >
            <div className="mb-3 flex min-w-0 max-w-[40rem] items-center gap-2">
              <SavedActionPlanSelector
                inputRef={titleInputRef}
                onResetTitle={() => setPlanTitle(confirmedTitleRef.current)}
                onTitleChange={setPlanTitle}
                title={planTitle}
                localeCode={interfaceLocaleCode}
              />
              <SavedActionPlanMenu
                availablePlans={availablePlans}
                deleting={isDeleting}
                navigationPending={Boolean(navigationTarget)}
                onNavigate={(href) => { void navigateAfterSave(href); }}
                onDelete={() => { void deletePlan(); }}
                onRename={() => {
                  titleInputRef.current?.focus();
                  titleInputRef.current?.select();
                }}
                plan={currentPlan}
                planId={planId}
                openingPlanId={navigationTarget?.startsWith(planHrefPrefix)
                  && navigationTarget !== newPlanHref
                  ? decodeURIComponent(navigationTarget.slice(planHrefPrefix.length))
                  : null}
                title={planTitle}
                workspace={workspace}
                localeCode={interfaceLocaleCode}
              />
            </div>
            <div className="sr-only" role="status" aria-live="polite">
              <span className={saveState === "error" ? "text-red-700" : "text-dema-muted"}>
                {saveState === "saving"
                  ? interfaceLocaleCode === "en" ? "Saving…" : "Enregistrement…"
                  : saveState === "error"
                    ? saveError
                    : interfaceLocaleCode === "en" ? "Changes saved" : "Modifications enregistrées"}
              </span>
            </div>
            {saveState === "error" ? (
              <div className="mb-3 text-sm text-red-700" role="alert">
                <p>{saveError}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {saveConflict ? (
                    <>
                      <button
                        type="button"
                        className="font-semibold underline underline-offset-4"
                        onClick={() => { void keepLocalChangesAfterConflict(); }}
                      >
                        {interfaceLocaleCode === "en" ? "Keep my changes" : "Garder mes modifications"}
                      </button>
                      <button
                        type="button"
                        className="font-semibold underline underline-offset-4"
                        onClick={() => window.location.reload()}
                      >
                        {interfaceLocaleCode === "en" ? "Use latest version" : "Utiliser la version récente"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="font-semibold underline underline-offset-4"
                      onClick={() => { void flushWorkspaceSave(); }}
                    >
                      {interfaceLocaleCode === "en" ? "Try again" : "Réessayer"}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
            {navigationTarget ? (
              <p className="mb-3 text-sm text-dema-muted" role="status" aria-live="polite">
                {interfaceLocaleCode === "en" ? "Opening…" : "Ouverture…"}
              </p>
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
              localeCode={interfaceLocaleCode}
              contentLocaleCode={contentLocaleCode}
            />
          </CompanyPilotagePanel>
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
      </div>
    </div>
  );
}
