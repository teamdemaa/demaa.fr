"use client";

import { ArrowRight, LoaderCircle, Mic, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ActionPlanAcademyPanel from "@/components/ActionPlanAcademyPanel";
import ActionPlanCoachingControl from "@/components/ActionPlanCoachingControl";
import ActionPlanGenerationScreen from "@/components/ActionPlanGenerationScreen";
import CustomerSpaceAccessForm, {
  type CustomerSpaceAccessDraft,
} from "@/components/CustomerSpaceAccessForm";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import ActionPlanNavbar, { type ActionPlanView } from "@/components/ActionPlanNavbar";
import ActionPlanResult from "@/components/ActionPlanResult";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import ActionPlanUtilityActions from "@/components/ActionPlanUtilityActions";
import OpportunitiesPanel from "@/components/OpportunitiesPanel";
import CompanyPilotagePanel from "@/components/CompanyPilotagePanel";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { useActionPlanAppContext } from "@/hooks/useActionPlanAppContext";
import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";
import type { AiGenerationMetadata } from "@/lib/ai-generation-metadata";
import { toPersistedAiGenerationMetadata } from "@/lib/ai-generation-metadata";
import {
  ActionPlanAuthenticationRequiredError,
  runAuthenticatedActionPlanGeneration,
} from "@/lib/action-plan-generation.client";
import {
  clearActionPlanGenerationDraft,
  createActionPlanGenerationDraft,
  readActionPlanGenerationDraft,
  writeActionPlanGenerationDraft,
  type ActionPlanGenerationDraft,
} from "@/lib/action-plan-generation-draft.client";
import {
  ACTION_PLAN_DEMO,
  ACTION_PLAN_DEMO_SITUATION,
} from "@/lib/action-plan-demo";
import {
  readGuestSelectedSystemId,
  writeGuestSelectedSystemId,
} from "@/lib/action-plan-guest-preferences";
import { scheduleActionPlanAcademyPayloadPreload } from "@/lib/action-plan-academy-preload.client";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import {
  addActionToManualPlan,
  createManualActionPlan,
  createManualActionPlanWorkspaceState,
  type EditableActionPlan,
  isBlankManualActionPlan,
  isManualActionPlan,
} from "@/lib/action-plan-manual";
import {
  addActionPlanWorkspaceAction,
  createActionPlanWorkspaceState,
  createGeneratedActionPlanWorkspaceState,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import {
  getLocalizedActionPlanPath,
  type ActionPlanContentLocaleCode,
  type ActionPlanCreationMarketCode,
} from "@/lib/action-plan-localization";
import { getActionPlanUiCopy } from "@/lib/action-plan-ui-copy";

type PendingSolutionSelection = {
  createdPlan: boolean;
  placementId: string;
  selected: boolean;
  systemId: string;
};

function updateSolutionSelection(
  workspace: ActionPlanWorkspaceState,
  pending: Pick<PendingSolutionSelection, "placementId" | "selected" | "systemId">,
) {
  const selected = new Set(
    workspace.selectedSolutionPlacementIdsBySystem[pending.systemId] ?? [],
  );
  if (pending.selected) selected.add(pending.placementId);
  else selected.delete(pending.placementId);
  return {
    ...workspace,
    selectedSystemId: pending.systemId,
    savedSystemIds: workspace.savedSystemIds.includes(pending.systemId)
      ? workspace.savedSystemIds
      : [...workspace.savedSystemIds, pending.systemId],
    selectedSolutionPlacementIdsBySystem: {
      ...workspace.selectedSolutionPlacementIdsBySystem,
      [pending.systemId]: [...selected],
    },
  };
}

export default function ActionPlanExperience({
  systemOptions,
  initialEmail = "",
  initialIsAuthenticated = false,
  initialAppContext = { view: "plan", planSection: "actions" },
  initialGenerationIntent = false,
  initialStructureIntent = false,
  contentLocaleCode = "fr",
  marketCodeAtCreation = "fr-fr",
  visibleViews,
  showCoaching = true,
}: {
  systemOptions: readonly ActionPlanSystemOption[];
  initialEmail?: string;
  initialIsAuthenticated?: boolean;
  initialAppContext?: ActionPlanAppContext;
  initialGenerationIntent?: boolean;
  initialStructureIntent?: boolean;
  contentLocaleCode?: ActionPlanContentLocaleCode;
  marketCodeAtCreation?: ActionPlanCreationMarketCode;
  visibleViews?: readonly ActionPlanView[];
  showCoaching?: boolean;
}) {
  const uiCopy = getActionPlanUiCopy(contentLocaleCode);
  const newPlanPath = getLocalizedActionPlanPath(contentLocaleCode, "/plans/new");
  const plansPath = getLocalizedActionPlanPath(contentLocaleCode, "/plans");
  const [situation, setSituation] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [plan, setPlan] = useState<EditableActionPlan | null>(null);
  const [generation, setGeneration] = useState<AiGenerationMetadata | null>(null);
  const [workspace, setWorkspace] = useState<ActionPlanWorkspaceState | null>(null);
  const [prePlanWorkspace, setPrePlanWorkspace] = useState<ActionPlanWorkspaceState>(
    () => ({
      ...createManualActionPlanWorkspaceState(),
      selectedSystemId: initialAppContext.systemId ?? null,
      savedSystemIds: initialAppContext.systemId
        ? [initialAppContext.systemId]
        : [],
    }),
  );
  const [selectedSystemId, setSelectedSystemId] = useState(
    initialAppContext.systemId ?? "",
  );
  const { context: appContext, navigate: navigateAppContext } =
    useActionPlanAppContext(initialAppContext);
  const activeTab = appContext.view;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [accessPromptOpen, setAccessPromptOpen] = useState(false);
  const [pendingSolutionSelection, setPendingSolutionSelection] =
    useState<PendingSolutionSelection | null>(null);
  const [generationDraft, setGenerationDraft] =
    useState<ActionPlanGenerationDraft | null>(null);
  const [queuedGenerationDraft, setQueuedGenerationDraft] =
    useState<ActionPlanGenerationDraft | null>(null);
  const [accessDraft, setAccessDraft] = useState<CustomerSpaceAccessDraft>({
    email: "",
    mode: "create",
    password: "",
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "error">("idle");
  const [autoSaveRevision, setAutoSaveRevision] = useState(0);
  const [isActionEditorOpen, setIsActionEditorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const resultTitleRef = useRef<HTMLHeadingElement | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const autoSaveControllerRef = useRef<AbortController | null>(null);
  const autoSaveRunningRef = useRef(false);
  const accessIntentHandledRef = useRef(false);
  const guestSystemPreferenceHydratedRef = useRef(false);
  const autoSaveAttemptRef = useRef("");
  const manualAccessPromptHandledRef = useRef(false);
  const generationIntentHandledRef = useRef(false);

  useEffect(() => {
    if (!visibleViews || visibleViews.includes("academy")) {
      return scheduleActionPlanAcademyPayloadPreload({
        localeCode: contentLocaleCode,
        marketCode: marketCodeAtCreation,
      });
    }
  }, [contentLocaleCode, marketCodeAtCreation, visibleViews]);

  function closeAccessPrompt() {
    if (pendingSolutionSelection?.createdPlan) {
      setPlan(null);
      setGeneration(null);
      setWorkspace(null);
      setAutoSaveStatus("idle");
      autoSaveAttemptRef.current = "";
      navigateAppContext({
        ...appContext,
        view: "solutions",
        systemId: pendingSolutionSelection.systemId,
        systemTab: "solutions",
        solutionResourceSlug: undefined,
      }, "replace");
    }
    if (generationDraft && !pendingSolutionSelection) {
      clearActionPlanGenerationDraft();
      setGenerationDraft(null);
    }
    setPendingSolutionSelection(null);
    setAccessPromptOpen(false);
  }
  const accessDialogRef = useAccessibleDialog({
    isOpen: accessPromptOpen && !isGenerating && !isAuthenticated && !isDemoMode,
    onClose: closeAccessPrompt,
  });

  function requestAutoSaveRetry() {
    autoSaveControllerRef.current?.abort();
    autoSaveControllerRef.current = null;
    autoSaveRunningRef.current = false;
    autoSaveAttemptRef.current = "";
    setAutoSaveStatus("idle");
    setAutoSaveRevision((current) => current + 1);
  }

  function handleAccessAuthenticated() {
    if (generationDraft) {
      window.location.assign(`${newPlanPath}?resume=generation`);
      return;
    }
    if (pendingSolutionSelection) {
      setWorkspace((current) =>
        current ? updateSolutionSelection(current, pendingSolutionSelection) : current,
      );
      setPrePlanWorkspace((current) =>
        updateSolutionSelection(current, pendingSolutionSelection),
      );
      setPendingSolutionSelection(null);
    }
    setIsAuthenticated(true);
    setAccessPromptOpen(false);
    setAccessDraft((current) => ({ ...current, password: "" }));
    requestAutoSaveRetry();
  }
  const situationDictation = useSpeechDictation({
    value: situation,
    onChange: setSituation,
    continuous: true,
    interimResults: true,
    language: contentLocaleCode === "en" ? "en-GB" : "fr-FR",
    maxLength: 4_000,
  });

  function selectAppView(view: ActionPlanView) {
    navigateAppContext({
      ...appContext,
      view,
      systemId: view === "solutions"
        ? selectedSystemId || workspace?.selectedSystemId || prePlanWorkspace.selectedSystemId || undefined
        : appContext.systemId,
      systemTab: view === "solutions" ? "solutions" : appContext.systemTab,
      solutionResourceSlug: undefined,
      solutionEntrySource: undefined,
    });
  }

  function selectAppSystem(systemId: string) {
    navigateAppContext({
      ...appContext,
      view: "solutions",
      systemId,
      systemTab: "solutions",
      solutionResourceSlug: undefined,
      solutionEntrySource: undefined,
    });
  }

  function handleSolutionSelection(placementId: string) {
    const systemId = selectedSystemId
      || workspace?.selectedSystemId
      || prePlanWorkspace.selectedSystemId;
    if (!systemId) return;

    const sourceWorkspace = workspace ?? prePlanWorkspace;
    const currentSelections = new Set(
      sourceWorkspace.selectedSolutionPlacementIdsBySystem[systemId] ?? [],
    );
    const pending: PendingSolutionSelection = {
      createdPlan: !plan,
      placementId,
      selected: !currentSelections.has(placementId),
      systemId,
    };

    if (isAuthenticated || isDemoMode) {
      const nextWorkspace = updateSolutionSelection(sourceWorkspace, pending);
      setPrePlanWorkspace(nextWorkspace);
      if (!plan) {
        setSituation("");
        setPlan({ ...createManualActionPlan(), systemId });
        setGeneration(null);
        setWorkspace(nextWorkspace);
        setSelectedSystemId(systemId);
        navigateAppContext({
          ...appContext,
          view: "solutions",
          systemId,
          systemTab: "solutions",
          solutionResourceSlug: undefined,
        }, "replace");
      } else {
        setWorkspace(nextWorkspace);
      }
      return;
    }

    if (!plan) {
      setSituation("");
      setPlan({ ...createManualActionPlan(), systemId });
      setGeneration(null);
      setWorkspace(sourceWorkspace);
      setSelectedSystemId(systemId);
      navigateAppContext({
        ...appContext,
        view: "solutions",
        systemId,
        systemTab: "solutions",
        solutionResourceSlug: undefined,
      }, "replace");
    }
    setPendingSolutionSelection(pending);
    setAccessPromptOpen(true);
  }

  useEffect(() => {
    if (guestSystemPreferenceHydratedRef.current) return;
    guestSystemPreferenceHydratedRef.current = true;

    const storedSystemId = readGuestSelectedSystemId();
    if (
      !storedSystemId
      || !systemOptions.some((option) => option.id === storedSystemId)
    ) return;

    setSelectedSystemId((current) => current || storedSystemId);
    setPrePlanWorkspace((current) => current.selectedSystemId
      ? current
      : { ...current, selectedSystemId: storedSystemId });
  }, [systemOptions]);

  useEffect(() => {
    if (
      !selectedSystemId
      || !systemOptions.some((option) => option.id === selectedSystemId)
    ) return;

    writeGuestSelectedSystemId(selectedSystemId);
  }, [selectedSystemId, systemOptions]);

  useEffect(() => {
    const systemId = appContext.systemId;
    if (!systemId || !systemOptions.some((option) => option.id === systemId)) return;
    setSelectedSystemId(systemId);
    setPrePlanWorkspace((current) => ({
      ...current,
      selectedSystemId: systemId,
      savedSystemIds: current.savedSystemIds.includes(systemId)
        ? current.savedSystemIds
        : [...current.savedSystemIds, systemId],
    }));
    setWorkspace((current) => current ? {
      ...current,
      selectedSystemId: systemId,
      savedSystemIds: current.savedSystemIds.includes(systemId)
        ? current.savedSystemIds
        : [...current.savedSystemIds, systemId],
    } : current);
  }, [appContext.systemId, systemOptions]);

  useEffect(() => {
    if (accessIntentHandledRef.current) return;
    accessIntentHandledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get("intent") !== "solution-referral") return;
    const systemSlug = params.get("systemSlug");
    const resourceSlug = params.get("resourceSlug");
    if (
      !systemSlug
      || !resourceSlug
      || !systemOptions.some((option) => option.id === systemSlug)
    ) return;

    const timeout = window.setTimeout(() => {
      setSelectedSystemId(systemSlug);
      setPrePlanWorkspace((current) => ({ ...current, selectedSystemId: systemSlug }));
      navigateAppContext({
        ...appContext,
        view: "solutions",
        systemId: systemSlug,
        systemTab: "solutions",
        solutionResourceSlug: resourceSlug,
      }, "replace");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [appContext, navigateAppContext, systemOptions]);

  useEffect(() => {
    if (situation) return;

    const example = uiCopy.examples[exampleIndex];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timeout: number;

    if (prefersReducedMotion) {
      setAnimatedPlaceholder(example);
      timeout = window.setTimeout(() => {
        setExampleIndex((current) => (current + 1) % uiCopy.examples.length);
      }, 5_500);
      return () => window.clearTimeout(timeout);
    }

    let cursor = 0;
    setAnimatedPlaceholder("");

    const typeNextCharacter = () => {
      cursor += 1;
      setAnimatedPlaceholder(example.slice(0, cursor));
      timeout = window.setTimeout(
        cursor < example.length
          ? typeNextCharacter
          : () => setExampleIndex((current) => (current + 1) % uiCopy.examples.length),
        cursor < example.length ? 34 : 2_600,
      );
    };

    timeout = window.setTimeout(typeNextCharacter, 180);
    return () => window.clearTimeout(timeout);
  }, [exampleIndex, situation, uiCopy.examples]);

  useEffect(
    () => () => {
      requestControllerRef.current?.abort();
      autoSaveControllerRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (
      isAuthenticated
      || !plan
      || !workspace
      || isDemoMode
      || isActionEditorOpen
      || !isManualActionPlan(plan)
      || isBlankManualActionPlan(plan, workspace)
      || manualAccessPromptHandledRef.current
    ) return;

    manualAccessPromptHandledRef.current = true;
    setAccessPromptOpen(true);
  }, [isActionEditorOpen, isAuthenticated, isDemoMode, plan, workspace]);

  useEffect(() => {
    if (
      !isAuthenticated
      || !plan
      || !workspace
      || isDemoMode
      || isActionEditorOpen
      || isBlankManualActionPlan(plan, workspace)
    ) return;
    const saveKey = `${plan.version}:${situation.trim()}:${workspace.selectedSystemId}`;
    if (autoSaveRunningRef.current || autoSaveAttemptRef.current === saveKey) return;
    autoSaveRunningRef.current = true;
    autoSaveAttemptRef.current = saveKey;
    setAutoSaveStatus("saving");

    const controller = new AbortController();
    autoSaveControllerRef.current = controller;
    void (async () => {
      try {
        const response = await fetch("/api/action-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan,
            sourceText: situation.trim(),
            workspaceState: workspace,
            generation: toPersistedAiGenerationMetadata(generation),
            contentLocaleCode,
            marketCodeAtCreation,
          }),
          signal: controller.signal,
        });
        const body = await response.json().catch(() => null) as {
          actionPlan?: { id?: string };
          error?: string;
          status?: string;
        } | null;
        const id = body?.actionPlan?.id;
        if (!response.ok || body?.status !== "saved" || !id) {
          if (response.status === 401) {
            autoSaveAttemptRef.current = "";
            setIsAuthenticated(false);
            setAccessDraft((current) => ({ ...current, mode: "signin", password: "" }));
            setAccessPromptOpen(true);
          }
          throw new Error(body?.error || uiCopy.autoSaveFailed);
        }
        window.location.assign(getLocalizedActionPlanPath(
          contentLocaleCode,
          `/plans/${encodeURIComponent(id)}`,
        ));
      } catch (saveError) {
        autoSaveRunningRef.current = false;
        autoSaveControllerRef.current = null;
        if (saveError instanceof DOMException && saveError.name === "AbortError") return;
        setAutoSaveStatus("error");
      }
    })();
  }, [
    autoSaveRevision,
    generation,
    isActionEditorOpen,
    isAuthenticated,
    isDemoMode,
    plan,
    situation,
    contentLocaleCode,
    marketCodeAtCreation,
    uiCopy.autoSaveFailed,
    workspace,
  ]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const demo = new URLSearchParams(window.location.search).get("demo");

    if (demo === "blank") {
      const storedSystemId = readGuestSelectedSystemId() ?? "";
      setIsDemoMode(true);
      setSituation("");
      setPlan(createManualActionPlan());
      setGeneration(null);
      setWorkspace({
        ...createManualActionPlanWorkspaceState(),
        selectedSystemId: storedSystemId,
        savedSystemIds: storedSystemId ? [storedSystemId] : [],
      });
      setSelectedSystemId(storedSystemId);
      navigateAppContext({ view: "plan", planSection: "actions" }, "replace");
      return;
    }

    if (demo !== "plan") return;

    setIsDemoMode(true);
    setSituation(ACTION_PLAN_DEMO_SITUATION);
    setPlan(ACTION_PLAN_DEMO);
    setGeneration(null);
    setWorkspace(createActionPlanWorkspaceState(ACTION_PLAN_DEMO));
    setSelectedSystemId(ACTION_PLAN_DEMO.systemId);
    navigateAppContext({ view: "plan", planSection: "actions" }, "replace");
  }, [navigateAppContext]);

  useEffect(() => {
    if (!initialGenerationIntent || generationIntentHandledRef.current) return;
    generationIntentHandledRef.current = true;
    const draft = readActionPlanGenerationDraft();
    if (!draft) {
      setError(uiCopy.expired);
      return;
    }
    setSituation(draft.situation);
    setGenerationDraft(draft);
    if (isAuthenticated) {
      setQueuedGenerationDraft(draft);
    } else {
      setAccessDraft((current) => ({ ...current, mode: "signin", password: "" }));
      setAccessPromptOpen(true);
    }
  }, [initialGenerationIntent, isAuthenticated, uiCopy.expired]);

  useEffect(() => {
    if (!queuedGenerationDraft || !isAuthenticated || isDemoMode) return;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsGenerating(true);
    setError(null);

    void runAuthenticatedActionPlanGeneration(
      queuedGenerationDraft,
      controller.signal,
    ).then((id) => {
      clearActionPlanGenerationDraft();
      setGenerationDraft(null);
      window.location.assign(getLocalizedActionPlanPath(
        contentLocaleCode,
        `/plans/${encodeURIComponent(id)}`,
      ));
    }).catch((generationError) => {
      if (generationError instanceof DOMException && generationError.name === "AbortError") {
        return;
      }
      if (generationError instanceof ActionPlanAuthenticationRequiredError) {
        setIsAuthenticated(false);
        setAccessDraft((current) => ({ ...current, mode: "signin", password: "" }));
        setAccessPromptOpen(true);
        return;
      }
      setError(
        generationError instanceof Error
          ? generationError.message
          : uiCopy.generationFailed,
      );
    }).finally(() => {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setQueuedGenerationDraft(null);
        setIsGenerating(false);
      }
    });

    return () => controller.abort();
  }, [contentLocaleCode, isAuthenticated, isDemoMode, queuedGenerationDraft, uiCopy.generationFailed]);

  async function generatePlanFromSituation(
    rawSituation: string,
    previousWorkspace: ActionPlanWorkspaceState,
  ) {
    const normalizedSituation = rawSituation.trim();
    if (normalizedSituation.length < 20 || queuedGenerationDraft || isGenerating) {
      setError(
        normalizedSituation.length < 20
          ? uiCopy.tooShort
          : null,
      );
      throw new Error(
        normalizedSituation.length < 20
          ? uiCopy.tooShort
          : uiCopy.alreadyGenerating,
      );
    }

    setError(null);

    if (isDemoMode) {
      const nextWorkspace = createGeneratedActionPlanWorkspaceState(
        ACTION_PLAN_DEMO,
        previousWorkspace,
      );
      setSituation(normalizedSituation);
      setPlan(ACTION_PLAN_DEMO);
      setGeneration(null);
      setWorkspace(nextWorkspace);
      setSelectedSystemId(nextWorkspace.selectedSystemId || ACTION_PLAN_DEMO.systemId);
      navigateAppContext({ view: "plan", planSection: "actions" }, "replace");
      window.requestAnimationFrame(() => resultTitleRef.current?.focus());
      return;
    }

    const cachedDraft = generationDraft ?? readActionPlanGenerationDraft();
    const draft = cachedDraft?.situation === normalizedSituation
      ? cachedDraft
      : createActionPlanGenerationDraft(normalizedSituation, {
          contentLocaleCode,
          marketCodeAtCreation,
        });
    writeActionPlanGenerationDraft(draft);
    setSituation(normalizedSituation);
    setGenerationDraft(draft);

    if (!isAuthenticated) {
      setAccessDraft((current) => ({ ...current, mode: "create", password: "" }));
      setAccessPromptOpen(true);
      return;
    }

    setQueuedGenerationDraft(draft);
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await generatePlanFromSituation(situation, prePlanWorkspace);
    } catch {
      // The field-level error is already displayed by generatePlanFromSituation.
    }
  }

  function handleStartBlankPlan() {
    requestControllerRef.current?.abort();
    manualAccessPromptHandledRef.current = false;
    setSituation("");
    setPlan({
      ...createManualActionPlan(),
      systemId: prePlanWorkspace.selectedSystemId,
    });
    setGeneration(null);
    setWorkspace(prePlanWorkspace);
    setSelectedSystemId(prePlanWorkspace.selectedSystemId || "");
    navigateAppContext({ view: "plan", planSection: "actions" }, "replace");
    setError(null);
    window.requestAnimationFrame(() => resultTitleRef.current?.focus());
  }

  function handleAddManualAction(): string | undefined {
    if (!plan || !workspace || !isManualActionPlan(plan)) return undefined;
    const next = addActionToManualPlan(plan, workspace);
    if (!next) return undefined;
    setPlan(next.plan);
    setWorkspace(next.workspace);
    return next.actionId;
  }

  function handleAddAction(): string | undefined {
    if (!plan || !workspace) return undefined;
    if (isManualActionPlan(plan)) {
      return handleAddManualAction();
    }
    const nextWorkspace = addActionPlanWorkspaceAction(workspace);
    setWorkspace(nextWorkspace);
    return nextWorkspace.addedActions.at(-1)?.id;
  }

  function handleDeleteAction(actionId: string) {
    setWorkspace((current) => current ? {
      ...current,
      deletedActionIds: Array.from(
        new Set([...current.deletedActionIds, actionId]),
      ),
    } : current);
  }

  const accessPromptDialog = accessPromptOpen && !isAuthenticated && !isDemoMode ? (
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center overflow-y-auto bg-brand-blue/25 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={closeAccessPrompt}
      role="presentation"
    >
      <section
        ref={accessDialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-plan-access-title"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        className="relative w-full max-w-[430px] rounded-t-[1.5rem] bg-dema-paper p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:rounded-[1.5rem] sm:p-7"
      >
        <button
          type="button"
          data-dialog-initial-focus
          onClick={closeAccessPrompt}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:bg-dema-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
          aria-label={uiCopy.close}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <div>
          <CustomerSpaceAccessForm
            choiceTitle={uiCopy.savePlan}
            draft={accessDraft}
            initialMode="create"
            onDraftChange={setAccessDraft}
            onAuthenticated={handleAccessAuthenticated}
            returnTo={generationDraft ? `${newPlanPath}?resume=generation` : plansPath}
            localeCode={contentLocaleCode}
          />
        </div>
      </section>
    </div>
  ) : null;

  if (isGenerating) {
    return <ActionPlanGenerationScreen localeCode={contentLocaleCode} />;
  }

  if (!plan) {
    return (
      <main data-action-plan-workspace className="min-h-screen bg-dema-cream px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <ActionPlanNavbar activeView={activeTab} onViewChange={selectAppView} localeCode={contentLocaleCode} visibleViews={visibleViews} />
        {showCoaching ? (
          <ActionPlanCoachingControl
            localeCode={contentLocaleCode}
            marketCode={marketCodeAtCreation}
            demoMode={isDemoMode}
            initialEmail={initialEmail}
            isAuthenticated={isAuthenticated}
          />
        ) : null}
        {accessPromptDialog}
        <div className="mx-auto max-w-[68rem] pt-1">
          {activeTab === "plan" ? (
            <section className="mx-auto max-w-5xl pt-5 text-center sm:pt-7 lg:pt-10">
                  <h1 className="text-balance text-[clamp(2.1rem,5.25vw,3.9rem)] font-light leading-[0.98] tracking-[-0.055em] text-brand-blue/62">
                    {uiCopy.heroLead}
                    <br />
                    <span className="demaa-hero-title text-dema-forest">
                      {uiCopy.heroEmphasis}
                    </span>
                    {uiCopy.heroQuestionMark}
                  </h1>
                  <p className="mx-auto mt-6 max-w-[760px] text-balance text-[15px] font-normal leading-[1.5] text-dema-muted sm:text-lg">
                    {uiCopy.heroDescription}
                  </p>
                  <form onSubmit={handleGenerate} className="mx-auto mt-7 max-w-[42rem] text-left sm:mt-8">
                    <div className="rounded-[1.45rem] border border-dema-line bg-dema-paper p-2 shadow-[0_14px_38px_rgba(23,35,29,0.055)] focus-within:border-dema-forest/20">
                      <label htmlFor="business-situation" className="sr-only">{uiCopy.situationLabel}</label>
                      <div className="relative">
                        {!situation ? (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 px-5 py-4 text-base font-light leading-relaxed text-brand-blue/28 sm:px-[1.125rem] sm:py-[1.125rem]"
                          >
                            {animatedPlaceholder}
                          </div>
                        ) : null}
                        <textarea
                          id="business-situation"
                          value={situation}
                          onChange={(event) => situationDictation.handleValueChange(event.target.value)}
                          maxLength={4_000}
                          rows={5}
                          className="relative min-h-[6.75rem] w-full resize-none rounded-[1.1rem] bg-transparent px-5 py-4 text-base font-light leading-relaxed text-brand-blue outline-none sm:min-h-[7.875rem] sm:px-[1.125rem] sm:py-[1.125rem]"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 px-2 pb-1 sm:px-3">
                        <button
                          type="button"
                          aria-label={situationDictation.isListening ? uiCopy.stopDictation : uiCopy.dictate}
                          aria-pressed={situationDictation.isListening}
                          onClick={situationDictation.toggle}
                          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${situationDictation.isListening ? "border-dema-forest bg-dema-sage text-dema-forest" : "border-dema-line bg-dema-paper text-dema-muted hover:border-dema-forest/25 hover:text-dema-forest"}`}
                        >
                          <Mic className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="submit"
                          disabled={isGenerating || situation.trim().length < 20}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-dema-forest px-[1.125rem] text-[0.8125rem] font-semibold text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none"
                        >
                          {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                          {isGenerating ? uiCopy.creatingPlan : uiCopy.createPlan}
                          {!isGenerating ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                        </button>
                      </div>
                    </div>
                    <div aria-live="polite" className="min-h-7 px-3 pt-3 text-center text-sm text-dema-forest">
                      {situationDictation.error ?? error}
                    </div>
                    <div className="mt-1 text-center">
                      <button
                        type="button"
                        onClick={handleStartBlankPlan}
                        className="text-sm font-medium text-dema-muted underline decoration-dema-line underline-offset-4 transition hover:text-dema-forest"
                      >
                        {uiCopy.blankPlan}
                      </button>
                    </div>
                  </form>
            </section>
          ) : null}
          {activeTab === "solutions" ? (
            <ActionPlanSystemPanel
              localeCode={contentLocaleCode}
              marketCode={marketCodeAtCreation}
              options={systemOptions}
              selectedSystemId={selectedSystemId}
              onSystemChange={(systemId) => {
                setSelectedSystemId(systemId);
                selectAppSystem(systemId);
              }}
              workspace={prePlanWorkspace}
              onWorkspaceChange={setPrePlanWorkspace}
              onToggleSolutionSelection={handleSolutionSelection}
              demoMode={isDemoMode}
              toolOutboundSurface="solutions"
              initialResourceSlug={appContext.solutionResourceSlug}
              onResourceSlugChange={(solutionResourceSlug) => navigateAppContext({
                ...appContext,
                view: "solutions",
                systemId: selectedSystemId || appContext.systemId,
                systemTab: "solutions",
                solutionResourceSlug,
              })}
            />
          ) : null}
          {activeTab === "academy" ? (
            <ActionPlanAcademyPanel
              initialContentSlug={appContext.academyContentSlug}
              localeCode={contentLocaleCode}
              marketCode={marketCodeAtCreation}
              showStructureNewsletter={initialStructureIntent}
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
              demoMode={isDemoMode}
              localeCode={contentLocaleCode}
              initialOpportunityId={appContext.opportunityId}
              onOpportunityChange={(opportunityId) => navigateAppContext({
                ...appContext,
                view: "opportunities",
                opportunityId,
              })}
            />
          ) : null}
        </div>
      </main>
    );
  }

  if (!workspace) return null;

  const updateWorkspace: React.Dispatch<React.SetStateAction<ActionPlanWorkspaceState>> = (update) => {
    setWorkspace((current) => {
      if (!current) return current;
      return typeof update === "function" ? update(current) : update;
    });
  };

  return (
    <main data-action-plan-workspace className="min-h-screen bg-dema-cream px-4 pb-24 pt-2 sm:px-6 lg:px-8">
      <ActionPlanNavbar activeView={activeTab} onViewChange={selectAppView} localeCode={contentLocaleCode} visibleViews={visibleViews} />
      {showCoaching ? <ActionPlanCoachingControl
        localeCode={contentLocaleCode}
        marketCode={marketCodeAtCreation}
        accessPlan={{
          plan,
          sourceText: situation.trim(),
          workspace,
          generation,
        }}
        demoMode={isDemoMode}
        initialEmail={initialEmail}
        isAuthenticated={isAuthenticated}
      /> : null}
      {accessPromptDialog}
      {autoSaveStatus === "saving" ? (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-dema-cream/82 px-6 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-full bg-dema-paper px-5 py-3 text-sm font-medium text-dema-forest shadow-lg">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            {contentLocaleCode === "en" ? "Saving your plan…" : "Sauvegarde de votre plan…"}
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-[68rem]">
        <h1 ref={resultTitleRef} tabIndex={-1} className="sr-only outline-none">
          {contentLocaleCode === "en" ? "Your action plan" : "Votre plan d’action"}
        </h1>
        <div className="pt-1">
          {activeTab === "plan" ? (
            <CompanyPilotagePanel
              available={false}
              localeCode={contentLocaleCode}
              section="actions"
              onSectionChange={() => undefined}
            >
              <ActionPlanResult
              plan={plan}
              workspace={workspace}
              onWorkspaceChange={updateWorkspace}
              manualMode={isManualActionPlan(plan)}
              onAddAction={handleAddAction}
              onActionEditorOpenChange={setIsActionEditorOpen}
              onDeleteAction={handleDeleteAction}
              onGeneratePlan={isBlankManualActionPlan(plan, workspace)
                ? (nextSituation) => generatePlanFromSituation(nextSituation, workspace)
                : undefined}
              commandDemoMode={isDemoMode}
              sourceText={situation.trim()}
              contextualSystemId={
                selectedSystemId || workspace.selectedSystemId || plan.systemId || ""
              }
              onOpenSolution={({ resourceSlug, systemId }) => {
                setSelectedSystemId(systemId);
                navigateAppContext({
                  ...appContext,
                  view: "solutions",
                  systemId,
                  systemTab: "solutions",
                  solutionResourceSlug: resourceSlug,
                  solutionEntrySource: "action_recommendation",
                });
              }}
              headerActions={(
                <ActionPlanUtilityActions
                  plan={plan}
                  workspace={workspace}
                  saveStatus={autoSaveStatus}
                  onRetrySave={requestAutoSaveRetry}
                  onReset={() => {
                    autoSaveControllerRef.current?.abort();
                    autoSaveControllerRef.current = null;
                    autoSaveRunningRef.current = false;
                    autoSaveAttemptRef.current = "";
                    manualAccessPromptHandledRef.current = false;
                    setAutoSaveStatus("idle");
                    setPlan(null);
                    setGeneration(null);
                    setWorkspace(null);
                    setError(null);
                  }}
                  localeCode={contentLocaleCode}
                />
              )}
              localeCode={contentLocaleCode}
              contentLocaleCode={contentLocaleCode}
              />
            </CompanyPilotagePanel>
          ) : null}
          {activeTab === "solutions" ? (
            <ActionPlanSystemPanel
              localeCode={contentLocaleCode}
              marketCode={marketCodeAtCreation}
              options={systemOptions}
              selectedSystemId={selectedSystemId}
              onSystemChange={(systemId) => {
                setSelectedSystemId(systemId);
                selectAppSystem(systemId);
              }}
              workspace={workspace}
              onWorkspaceChange={updateWorkspace}
              onToggleSolutionSelection={
                isAuthenticated || isDemoMode
                  ? undefined
                  : handleSolutionSelection
              }
              demoMode={isDemoMode}
              toolOutboundSurface={
                appContext.solutionEntrySource === "action_recommendation"
                  ? "action_recommendation"
                  : "solutions"
              }
              initialResourceSlug={appContext.solutionResourceSlug}
              onResourceSlugChange={(solutionResourceSlug) => navigateAppContext({
                ...appContext,
                view: "solutions",
                systemId: selectedSystemId || appContext.systemId,
                systemTab: "solutions",
                solutionResourceSlug,
              })}
            />
          ) : null}
          {activeTab === "academy" ? (
            <ActionPlanAcademyPanel
              initialContentSlug={appContext.academyContentSlug}
              localeCode={contentLocaleCode}
              marketCode={marketCodeAtCreation}
              showStructureNewsletter={initialStructureIntent}
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
              demoMode={isDemoMode}
              localeCode={contentLocaleCode}
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
    </main>
  );
}
