"use client";

import { ArrowRight, LoaderCircle, Mic } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import ActionPlanAcademyPanel from "@/components/ActionPlanAcademyPanel";
import ActionPlanGenerationScreen from "@/components/ActionPlanGenerationScreen";
import ActionPlanHeroTitle from "@/components/ActionPlanHeroTitle";
import ActionPlanNavbar, { type ActionPlanView } from "@/components/ActionPlanNavbar";
import ActionPlanServicesPanel from "@/components/ActionPlanServicesPanel";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import GuestActionPlanDelivery from "@/components/GuestActionPlanDelivery";
import GuestActionPlanResult from "@/components/GuestActionPlanResult";
import GuestDiagnosticControl from "@/components/GuestDiagnosticControl";
import OpportunitiesPanel from "@/components/OpportunitiesPanel";
import { useActionPlanAppContext } from "@/hooks/useActionPlanAppContext";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";
import { scheduleActionPlanAcademyPayloadPreload } from "@/lib/action-plan-academy-preload.client";
import { createActionPlanGenerationDraft } from "@/lib/action-plan-generation-draft.client";
import {
  readGuestSelectedSystemId,
  writeGuestSelectedSystemId,
} from "@/lib/action-plan-guest-preferences";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import {
  clearGuestAccess,
  createGuestGenerationAccess,
  type GuestAccess,
  type GuestActionPlan,
  GuestActionPlanRequestError,
  type GuestGenerationState,
  readGuestAccess,
  readGuestActionPlan,
  resumeGuestActionPlanGeneration,
  startGuestActionPlanGeneration,
  writeGuestAccess,
} from "@/lib/guest-action-plan.client";
import { createManualActionPlanWorkspaceState } from "@/lib/action-plan-manual";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import type {
  ActionPlanContentLocaleCode,
  ActionPlanCreationMarketCode,
} from "@/lib/action-plan-localization";
import { getActionPlanUiCopy } from "@/lib/action-plan-ui-copy";
import type { CanonicalService } from "@/lib/canonical-service-catalog";

const POLL_DELAY_MS = 1_500;
const POLL_TIMEOUT_MS = 2 * 60_000;

function updateSolutionSelection(
  workspace: ActionPlanWorkspaceState,
  input: { placementId: string; systemId: string },
) {
  const selected = new Set(
    workspace.selectedSolutionPlacementIdsBySystem[input.systemId] ?? [],
  );
  if (selected.has(input.placementId)) selected.delete(input.placementId);
  else selected.add(input.placementId);
  return {
    ...workspace,
    selectedSystemId: input.systemId,
    savedSystemIds: workspace.savedSystemIds.includes(input.systemId)
      ? workspace.savedSystemIds
      : [...workspace.savedSystemIds, input.systemId],
    selectedSolutionPlacementIdsBySystem: {
      ...workspace.selectedSolutionPlacementIdsBySystem,
      [input.systemId]: [...selected],
    },
  };
}

function normalizeGuestContext(context: ActionPlanAppContext): ActionPlanAppContext {
  if (context.view !== "plan") return context;
  return {
    ...context,
    planSection: context.planSection === "solutions" ? "solutions" : "actions",
  };
}

function delay(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, POLL_DELAY_MS);
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
}

async function waitForGuestGeneration(
  initialState: GuestGenerationState,
  guestAccess: GuestAccess,
  signal: AbortSignal,
) {
  let state = initialState;
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (state.status === "generating" && Date.now() < deadline) {
    await delay(signal);
    state = await readGuestActionPlan(guestAccess, signal);
  }
  if (state.status === "generating") {
    throw new Error("La génération prend plus de temps que prévu. Vous pouvez réessayer dans un instant.");
  }
  return state;
}

export default function GuestActionPlanExperience({
  contentLocaleCode,
  initialAppContext,
  initialStructureIntent,
  marketCodeAtCreation,
  services,
  systemOptions,
  visibleViews,
}: {
  contentLocaleCode: ActionPlanContentLocaleCode;
  initialAppContext: ActionPlanAppContext;
  initialStructureIntent: boolean;
  marketCodeAtCreation: ActionPlanCreationMarketCode;
  services: readonly CanonicalService[];
  systemOptions: readonly ActionPlanSystemOption[];
  visibleViews: readonly ActionPlanView[];
}) {
  const uiCopy = getActionPlanUiCopy(contentLocaleCode);
  const { context: rawAppContext, navigate: navigateAppContext } =
    useActionPlanAppContext(normalizeGuestContext(initialAppContext));
  const appContext = normalizeGuestContext(rawAppContext);
  const [situation, setSituation] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [actionPlan, setActionPlan] = useState<GuestActionPlan | null>(null);
  const [access, setAccess] = useState<GuestAccess | null>(null);
  const [generationState, setGenerationState] = useState<GuestGenerationState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [workspace, setWorkspace] = useState<ActionPlanWorkspaceState>(() => ({
    ...createManualActionPlanWorkspaceState(),
    selectedSystemId: initialAppContext.systemId ?? null,
    savedSystemIds: initialAppContext.systemId ? [initialAppContext.systemId] : [],
  }));
  const [selectedSystemId, setSelectedSystemId] = useState(initialAppContext.systemId ?? "");
  const requestControllerRef = useRef<AbortController | null>(null);
  const guestSystemPreferenceHydratedRef = useRef(false);

  const situationDictation = useSpeechDictation({
    continuous: true,
    interimResults: true,
    language: contentLocaleCode === "en" ? "en-GB" : "fr-FR",
    maxLength: 4_000,
    onChange: setSituation,
    value: situation,
  });

  useEffect(() => scheduleActionPlanAcademyPayloadPreload({
    localeCode: contentLocaleCode,
    marketCode: marketCodeAtCreation,
  }), [contentLocaleCode, marketCodeAtCreation]);

  useEffect(() => {
    if (guestSystemPreferenceHydratedRef.current) return;
    guestSystemPreferenceHydratedRef.current = true;
    const storedSystemId = readGuestSelectedSystemId();
    if (!storedSystemId || !systemOptions.some(({ id }) => id === storedSystemId)) return;
    setSelectedSystemId((current) => current || storedSystemId);
    setWorkspace((current) => current.selectedSystemId ? current : {
      ...current,
      selectedSystemId: storedSystemId,
      savedSystemIds: [storedSystemId],
    });
  }, [systemOptions]);

  useEffect(() => {
    if (!selectedSystemId || !systemOptions.some(({ id }) => id === selectedSystemId)) return;
    writeGuestSelectedSystemId(selectedSystemId);
  }, [selectedSystemId, systemOptions]);

  useEffect(() => {
    const systemId = appContext.systemId;
    if (!systemId || !systemOptions.some(({ id }) => id === systemId)) return;
    setSelectedSystemId(systemId);
    setWorkspace((current) => ({
      ...current,
      selectedSystemId: systemId,
      savedSystemIds: current.savedSystemIds.includes(systemId)
        ? current.savedSystemIds
        : [...current.savedSystemIds, systemId],
    }));
  }, [appContext.systemId, systemOptions]);

  useEffect(() => {
    if (situation) return;
    const example = uiCopy.examples[exampleIndex];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timeout = 0;
    if (reducedMotion) {
      setAnimatedPlaceholder(example);
      timeout = window.setTimeout(
        () => setExampleIndex((current) => (current + 1) % uiCopy.examples.length),
        5_500,
      );
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

  useEffect(() => {
    const storedAccess = readGuestAccess();
    if (!storedAccess) {
      setIsRestoring(false);
      return;
    }
    setAccess(storedAccess);
    const controller = new AbortController();
    requestControllerRef.current = controller;
    void readGuestActionPlan(storedAccess, controller.signal)
      .then(async (initialState) => {
        if (initialState.status === "generating") setIsGenerating(true);
        return waitForGuestGeneration(initialState, storedAccess, controller.signal);
      })
      .then((state) => {
        setAccess(storedAccess);
        setGenerationState(state);
        if (state.status === "active") {
          setActionPlan(state.actionPlan);
          setWorkspace(state.actionPlan.workspaceState);
          setSelectedSystemId(state.actionPlan.workspaceState.selectedSystemId ?? "");
        } else {
          setError(state.error);
        }
      })
      .catch((restoreError) => {
        if (restoreError instanceof DOMException && restoreError.name === "AbortError") return;
        if (
          restoreError instanceof GuestActionPlanRequestError
          && [401, 404, 410].includes(restoreError.status)
        ) {
          clearGuestAccess();
          setAccess(null);
        }
        setError(restoreError instanceof Error ? restoreError.message : uiCopy.generationFailed);
      })
      .finally(() => {
        if (requestControllerRef.current === controller) requestControllerRef.current = null;
        setIsRestoring(false);
        setIsGenerating(false);
      });
    return () => controller.abort();
  }, [uiCopy.generationFailed]);

  useEffect(() => () => requestControllerRef.current?.abort(), []);

  async function resolveGeneration(
    initialState: GuestGenerationState,
    guestAccess: GuestAccess,
    signal: AbortSignal,
  ) {
    const state = await waitForGuestGeneration(initialState, guestAccess, signal);
    setGenerationState(state);
    if (state.status === "failed") throw new Error(state.error);
    setActionPlan(state.actionPlan);
    setWorkspace(state.actionPlan.workspaceState);
    setSelectedSystemId(state.actionPlan.workspaceState.selectedSystemId ?? "");
    navigateAppContext({ view: "plan", planSection: "actions" }, "replace");
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSituation = situation.trim();
    if (normalizedSituation.length < 20 || isGenerating) {
      setError(normalizedSituation.length < 20 ? uiCopy.tooShort : uiCopy.alreadyGenerating);
      return;
    }
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsGenerating(true);
    setError(null);
    clearGuestAccess();
    setActionPlan(null);
    try {
      const draft = createActionPlanGenerationDraft(normalizedSituation, {
        contentLocaleCode,
        marketCodeAtCreation,
      });
      const { accessKey } = createGuestGenerationAccess();
      const state = await startGuestActionPlanGeneration(draft, accessKey, controller.signal);
      const guestAccess = {
        accessKey,
        expiresAt: state.status === "active" ? state.actionPlan.expiresAt : state.expiresAt,
        generationId: state.generationId,
      };
      setAccess(guestAccess);
      setGenerationState(state);
      writeGuestAccess(guestAccess);
      await resolveGeneration(state, guestAccess, controller.signal);
    } catch (generationError) {
      if (generationError instanceof DOMException && generationError.name === "AbortError") return;
      setError(generationError instanceof Error ? generationError.message : uiCopy.generationFailed);
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
      setIsGenerating(false);
    }
  }

  async function retryGeneration() {
    if (!access || isGenerating) return;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsGenerating(true);
    setError(null);
    try {
      const state = await resumeGuestActionPlanGeneration(access, controller.signal);
      setGenerationState(state);
      await resolveGeneration(state, access, controller.signal);
    } catch (generationError) {
      if (generationError instanceof DOMException && generationError.name === "AbortError") return;
      setError(generationError instanceof Error ? generationError.message : uiCopy.generationFailed);
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
      setIsGenerating(false);
    }
  }

  function selectAppView(view: ActionPlanView) {
    navigateAppContext({
      view,
      planSection: "actions",
      ...(view === "services" ? { serviceSlug: appContext.serviceSlug } : {}),
    });
  }

  function selectSystem(systemId: string) {
    setSelectedSystemId(systemId);
    navigateAppContext({
      view: "plan",
      planSection: "solutions",
      systemId,
      systemTab: "solutions",
    });
  }

  function resetPlan() {
    requestControllerRef.current?.abort();
    clearGuestAccess();
    setAccess(null);
    setActionPlan(null);
    setGenerationState(null);
    setSituation("");
    setError(null);
    setDiagnosticOpen(false);
    navigateAppContext({ view: "plan", planSection: "actions" }, "replace");
  }

  if (isGenerating) return <ActionPlanGenerationScreen localeCode={contentLocaleCode} />;

  return (
    <main data-action-plan-workspace className="min-h-screen bg-dema-cream px-4 pb-24 pt-2 sm:px-6 lg:px-8">
      <ActionPlanNavbar
        activeView={appContext.view}
        localeCode={contentLocaleCode}
        onViewChange={selectAppView}
        visibleViews={visibleViews}
      />
      <GuestDiagnosticControl
        access={actionPlan ? access : null}
        key={actionPlan && access ? access.generationId : "without-plan"}
        onClose={() => setDiagnosticOpen(false)}
        onOpen={() => setDiagnosticOpen(true)}
        open={diagnosticOpen}
        situation={situation}
      />
      <div className="mx-auto max-w-[68rem] pt-1">
        {appContext.view === "plan" ? (
          <nav className="mx-auto flex w-fit items-center gap-1 rounded-full border border-dema-line/70 bg-dema-sage/25 p-1" aria-label="Contenu du plan">
            <button
              type="button"
              aria-current={appContext.planSection === "actions" ? "page" : undefined}
              onClick={() => navigateAppContext({ view: "plan", planSection: "actions" })}
              className={`min-h-10 rounded-full px-5 text-sm transition ${appContext.planSection === "actions" ? "bg-dema-paper text-dema-forest" : "text-dema-muted hover:text-brand-blue"}`}
            >
              Plan
            </button>
            <button
              type="button"
              aria-current={appContext.planSection === "solutions" ? "page" : undefined}
              onClick={() => navigateAppContext({
                view: "plan",
                planSection: "solutions",
                ...(selectedSystemId ? { systemId: selectedSystemId, systemTab: "solutions" } : {}),
              })}
              className={`min-h-10 rounded-full px-5 text-sm transition ${appContext.planSection === "solutions" ? "bg-dema-paper text-dema-forest" : "text-dema-muted hover:text-brand-blue"}`}
            >
              Solutions
            </button>
          </nav>
        ) : null}
        {appContext.view === "plan" && appContext.planSection === "actions" ? (
          actionPlan && access ? (
            <div className="mx-auto max-w-5xl pt-6 sm:pt-9">
              <GuestActionPlanResult actionPlan={actionPlan} />
              <GuestActionPlanDelivery
                access={access}
                onOpenDiagnostic={() => setDiagnosticOpen(true)}
              />
              <div className="text-center">
                <button type="button" onClick={resetPlan} className="min-h-11 px-4 text-sm text-dema-muted underline decoration-dema-line underline-offset-4 hover:text-dema-forest">
                  Créer un autre plan
                </button>
              </div>
            </div>
          ) : (
            <section className="mx-auto max-w-5xl pt-5 text-center sm:pt-7 lg:pt-10">
              <ActionPlanHeroTitle localeCode={contentLocaleCode} />
              <form onSubmit={generate} className="mx-auto mt-7 max-w-[42rem] text-left sm:mt-8">
                <div className="rounded-[1.45rem] border border-dema-line bg-dema-paper p-2 shadow-[0_14px_38px_rgba(23,35,29,0.055)] focus-within:border-dema-forest/20">
                  <label htmlFor="guest-business-situation" className="sr-only">{uiCopy.situationLabel}</label>
                  <div className="relative">
                    {!situation ? <div aria-hidden="true" className="pointer-events-none absolute inset-0 px-5 py-4 text-[0.8rem] font-light leading-relaxed text-brand-blue/28 sm:px-[1.125rem] sm:py-[1.125rem]">{animatedPlaceholder}</div> : null}
                    <textarea
                      id="guest-business-situation"
                      value={situation}
                      onChange={(event) => situationDictation.handleValueChange(event.target.value)}
                      maxLength={4_000}
                      rows={5}
                      className="relative min-h-[6.75rem] w-full resize-none rounded-[1.1rem] bg-transparent px-5 py-4 text-base font-light leading-relaxed text-brand-blue outline-none sm:min-h-[7.875rem] sm:px-[1.125rem] sm:py-[1.125rem]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 px-2 pb-1 sm:px-3">
                    <button type="button" aria-label={situationDictation.isListening ? uiCopy.stopDictation : uiCopy.dictate} aria-pressed={situationDictation.isListening} onClick={situationDictation.toggle} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${situationDictation.isListening ? "border-dema-forest bg-dema-sage text-dema-forest" : "border-dema-line bg-dema-paper text-dema-muted hover:border-dema-forest/25 hover:text-dema-forest"}`}>
                      <Mic className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="submit" disabled={situation.trim().length < 20 || isRestoring} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-dema-forest px-[1.125rem] text-[0.8125rem] font-semibold text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none">
                      {isRestoring ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                      {uiCopy.createPlan}
                      {!isRestoring ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                    </button>
                  </div>
                </div>
                <div aria-live="polite" className="min-h-7 px-3 pt-3 text-center text-sm text-dema-forest">
                  {situationDictation.error ?? error}
                </div>
                {generationState?.status === "failed" && generationState.canRetry ? (
                  <div className="text-center">
                    <button type="button" onClick={retryGeneration} className="min-h-11 px-4 text-sm font-medium text-dema-forest underline decoration-dema-line underline-offset-4">Réessayer</button>
                  </div>
                ) : null}
                {access && !generationState && error ? (
                  <div className="text-center">
                    <button type="button" onClick={() => window.location.reload()} className="min-h-11 px-4 text-sm font-medium text-dema-forest underline decoration-dema-line underline-offset-4">Reprendre mon plan</button>
                  </div>
                ) : null}
              </form>
            </section>
          )
        ) : null}

        {appContext.view === "plan" && appContext.planSection === "solutions" ? (
          <ActionPlanSystemPanel
            initialResourceSlug={appContext.solutionResourceSlug}
            localeCode={contentLocaleCode}
            marketCode={marketCodeAtCreation}
            onResourceSlugChange={(solutionResourceSlug) => navigateAppContext({
              ...appContext,
              solutionResourceSlug,
            })}
            onSystemChange={selectSystem}
            onToggleSolutionSelection={(placementId) => {
              const systemId = selectedSystemId || workspace.selectedSystemId;
              if (!systemId) return;
              setWorkspace((current) => updateSolutionSelection(current, { placementId, systemId }));
            }}
            options={systemOptions}
            selectedSystemId={selectedSystemId}
            toolOutboundSurface="solutions"
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
          />
        ) : null}

        {appContext.view === "services" ? (
          <ActionPlanServicesPanel
            services={services}
            selectedServiceSlug={appContext.serviceSlug}
            onServiceSlugChange={(serviceSlug) => navigateAppContext({
              ...appContext,
              serviceSlug,
            })}
          />
        ) : null}

        {appContext.view === "academy" ? (
          <ActionPlanAcademyPanel
            initialContentSlug={appContext.academyContentSlug}
            localeCode={contentLocaleCode}
            marketCode={marketCodeAtCreation}
            onContentChange={(academyContentSlug) => navigateAppContext({
              ...appContext,
              academyContentSlug,
            })}
            showStructureNewsletter={initialStructureIntent}
          />
        ) : null}

        {appContext.view === "opportunities" ? (
          <OpportunitiesPanel
            initialOpportunityId={appContext.opportunityId}
            localeCode={contentLocaleCode}
            onOpportunityChange={(opportunityId) => navigateAppContext({
              ...appContext,
              opportunityId,
            })}
          />
        ) : null}
      </div>
    </main>
  );
}
