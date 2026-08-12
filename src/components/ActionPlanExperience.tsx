"use client";

import { ArrowRight, LoaderCircle, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ActionPlanAcademyPanel from "@/components/ActionPlanAcademyPanel";
import ActionPlanCoachingControl from "@/components/ActionPlanCoachingControl";
import ActionPlanNavbar, { type ActionPlanView } from "@/components/ActionPlanNavbar";
import ActionPlanResult from "@/components/ActionPlanResult";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import ActionPlanUtilityActions from "@/components/ActionPlanUtilityActions";
import OpportunitiesPanel from "@/components/OpportunitiesPanel";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import type { ActionPlan } from "@/lib/action-plan-contract";
import type { AiGenerationMetadata } from "@/lib/ai-generation-metadata";
import {
  ACTION_PLAN_DEMO,
  ACTION_PLAN_DEMO_SITUATION,
} from "@/lib/action-plan-demo";
import {
  readGuestSelectedSystemId,
  writeGuestSelectedSystemId,
} from "@/lib/action-plan-guest-preferences";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import {
  addActionToManualPlan,
  createManualActionPlan,
  createManualActionPlanWorkspaceState,
  type EditableActionPlan,
  isManualActionPlan,
} from "@/lib/action-plan-manual";
import {
  addActionPlanWorkspaceAction,
  createActionPlanWorkspaceState,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";

const EXAMPLES = [
  "Je dirige un cabinet comptable de 6 personnes. Les dossiers avancent, mais tout remonte encore vers moi et les échéances sont suivies dans plusieurs fichiers.",
  "Mon restaurant fonctionne bien le midi, mais la marge baisse. Les achats, les plannings et les pertes ne sont pas suivis de façon régulière.",
  "Je développe une entreprise de plomberie avec 4 techniciens. Je veux mieux organiser les interventions, les devis et les relances sans ajouter un outil compliqué.",
  "Je suis consultante indépendante. J’ai des missions, mais mon offre manque de clarté et je veux trouver des clients de manière plus régulière sans démarchage de masse.",
];

const GENERATION_QUESTIONS = [
  {
    question: "Quelle décision devez-vous pouvoir prendre plus facilement ?",
  },
  {
    question: "Qu’est-ce qui vous fait perdre le plus de temps aujourd’hui ?",
  },
  {
    question: "Quel signe concret montrerait que la situation s’améliore ?",
  },
  {
    question: "Quelle action simple pouvez-vous réellement commencer cette semaine ?",
  },
] as const;

export default function ActionPlanExperience({
  systemOptions,
  initialEmail = "",
  initialView = "plan",
}: {
  systemOptions: readonly ActionPlanSystemOption[];
  initialEmail?: string;
  initialView?: ActionPlanView;
}) {
  const [situation, setSituation] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [plan, setPlan] = useState<EditableActionPlan | null>(null);
  const [generation, setGeneration] = useState<AiGenerationMetadata | null>(null);
  const [workspace, setWorkspace] = useState<ActionPlanWorkspaceState | null>(null);
  const [prePlanWorkspace, setPrePlanWorkspace] = useState<ActionPlanWorkspaceState>(
    () => createManualActionPlanWorkspaceState(),
  );
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [pendingSolutionResourceSlug, setPendingSolutionResourceSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActionPlanView>(initialView);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const resultTitleRef = useRef<HTMLHeadingElement | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const accessIntentHandledRef = useRef(false);
  const guestSystemPreferenceHydratedRef = useRef(false);
  const situationDictation = useSpeechDictation({
    value: situation,
    onChange: setSituation,
    continuous: false,
    interimResults: true,
    maxLength: 4_000,
  });

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
      setPendingSolutionResourceSlug(resourceSlug);
      setPrePlanWorkspace((current) => ({ ...current, selectedSystemId: systemSlug }));
      setActiveTab("system");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [systemOptions]);

  useEffect(() => {
    if (situation) return;

    const example = EXAMPLES[exampleIndex];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timeout: number;

    if (prefersReducedMotion) {
      setAnimatedPlaceholder(example);
      timeout = window.setTimeout(() => {
        setExampleIndex((current) => (current + 1) % EXAMPLES.length);
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
          : () => setExampleIndex((current) => (current + 1) % EXAMPLES.length),
        cursor < example.length ? 34 : 2_600,
      );
    };

    timeout = window.setTimeout(typeNextCharacter, 180);
    return () => window.clearTimeout(timeout);
  }, [exampleIndex, situation]);

  useEffect(
    () => () => {
      requestControllerRef.current?.abort();
    },
    [],
  );

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
      setActiveTab("plan");
      return;
    }

    if (demo !== "plan") return;

    setIsDemoMode(true);
    setSituation(ACTION_PLAN_DEMO_SITUATION);
    setPlan(ACTION_PLAN_DEMO);
    setGeneration(null);
    setWorkspace(createActionPlanWorkspaceState(ACTION_PLAN_DEMO));
    setSelectedSystemId(ACTION_PLAN_DEMO.systemId);
    setActiveTab("plan");
  }, []);

  useEffect(() => {
    if (!isGenerating) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    setQuoteIndex(0);
    const interval = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % GENERATION_QUESTIONS.length);
    }, 4_800);

    return () => {
      window.clearInterval(interval);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [isGenerating]);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSituation = situation.trim();
    if (normalizedSituation.length < 20 || isGenerating) {
      setError(
        normalizedSituation.length < 20
          ? "Décrivez votre situation en quelques phrases pour obtenir un plan utile."
          : null,
      );
      return;
    }

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsGenerating(true);
    setError(null);

    if (isDemoMode) {
      setPlan(ACTION_PLAN_DEMO);
      setGeneration(null);
      setWorkspace(createActionPlanWorkspaceState(ACTION_PLAN_DEMO));
      setSelectedSystemId(ACTION_PLAN_DEMO.systemId);
      setActiveTab("plan");
      setIsGenerating(false);
      window.requestAnimationFrame(() => resultTitleRef.current?.focus());
      return;
    }

    try {
      const response = await fetch("/api/action-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: normalizedSituation }),
        signal: controller.signal,
      });
      const body = (await response.json().catch(() => null)) as
        | {
            plan?: ActionPlan;
            generation?: AiGenerationMetadata;
            error?: string;
          }
        | null;

      if (!response.ok || !body?.plan) {
        throw new Error(body?.error || "Impossible de générer le plan pour le moment.");
      }

      const generatedWorkspace = createActionPlanWorkspaceState(body.plan);
      const nextSelectedSystemId =
        prePlanWorkspace.selectedSystemId || body.plan.systemId;
      setPlan(body.plan);
      setGeneration(body.generation ?? null);
      setWorkspace({
        ...generatedWorkspace,
        selectedSystemId: nextSelectedSystemId,
        checkedProcessStepIdsBySystem:
          prePlanWorkspace.checkedProcessStepIdsBySystem,
        selectedSolutionPlacementIdsBySystem:
          prePlanWorkspace.selectedSolutionPlacementIdsBySystem,
      });
      setSelectedSystemId(nextSelectedSystemId);
      setActiveTab("plan");
      window.requestAnimationFrame(() => resultTitleRef.current?.focus());
    } catch (submitError) {
      if (submitError instanceof DOMException && submitError.name === "AbortError") return;
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible de générer le plan pour le moment.",
      );
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsGenerating(false);
      }
    }
  }

  function handleStartBlankPlan() {
    requestControllerRef.current?.abort();
    setSituation("");
    setPlan({
      ...createManualActionPlan(),
      systemId: prePlanWorkspace.selectedSystemId,
    });
    setGeneration(null);
    setWorkspace(prePlanWorkspace);
    setSelectedSystemId(prePlanWorkspace.selectedSystemId || "");
    setActiveTab("plan");
    setError(null);
    window.requestAnimationFrame(() => resultTitleRef.current?.focus());
  }

  function handleAddManualAction() {
    if (!plan || !workspace || !isManualActionPlan(plan)) return;
    const next = addActionToManualPlan(plan, workspace);
    if (!next) return;
    setPlan(next.plan);
    setWorkspace(next.workspace);
  }

  function handleAddAction() {
    if (!plan || !workspace) return;
    if (isManualActionPlan(plan)) {
      handleAddManualAction();
      return;
    }
    setWorkspace(addActionPlanWorkspaceAction(workspace));
  }

  function handleDeleteAction(actionId: string) {
    setWorkspace((current) => current ? {
      ...current,
      deletedActionIds: Array.from(
        new Set([...current.deletedActionIds, actionId]),
      ),
    } : current);
  }

  if (isGenerating && !plan) {
    const currentQuestion = GENERATION_QUESTIONS[quoteIndex];

    return (
      <main className="fixed inset-0 z-[100] flex min-h-dvh flex-col overflow-hidden overscroll-contain bg-dema-forest px-6 py-8 text-dema-paper sm:px-10 sm:py-10 lg:px-14">
        <p className="demaa-hero-title text-3xl text-dema-paper sm:text-4xl">Demaa</p>
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-16 text-center">
          <p
            key={quoteIndex}
            className="demaa-generation-quote w-full text-balance text-[clamp(2.25rem,6.5vw,5.7rem)] font-light leading-[1.02] tracking-[-0.045em] text-dema-paper"
          >
            {currentQuestion.question}
          </p>
        </section>
        <div className="flex items-center justify-center gap-2 text-sm text-dema-paper/70" role="status" aria-live="polite">
          <span>Génération de votre plan d’action</span>
          <span className="inline-flex items-center gap-1" aria-hidden="true">
            <span className="demaa-generation-dot h-1 w-1 rounded-full bg-current" />
            <span className="demaa-generation-dot h-1 w-1 rounded-full bg-current [animation-delay:180ms]" />
            <span className="demaa-generation-dot h-1 w-1 rounded-full bg-current [animation-delay:360ms]" />
          </span>
        </div>
      </main>
    );
  }

  if (!plan) {
    return (
      <main data-action-plan-workspace className="min-h-screen bg-dema-cream px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <ActionPlanNavbar activeView={activeTab} onViewChange={setActiveTab} />
        <div className="mx-auto max-w-[68rem] pt-1">
          {activeTab === "plan" ? (
            <section className="mx-auto max-w-5xl pt-12 text-center sm:pt-16 lg:pt-20">
              <h1 className="text-balance text-[clamp(2.45rem,7vw,5.2rem)] font-light leading-[0.98] tracking-[-0.055em] text-brand-blue/62">
                Qu’est-ce qui{" "}
                <span className="demaa-hero-title text-dema-forest">
                  freine votre entreprise
                </span>
                &nbsp;?
              </h1>
              <form onSubmit={handleGenerate} className="mx-auto mt-9 max-w-4xl text-left sm:mt-11">
                <div className="rounded-[1.7rem] border border-dema-line bg-dema-paper p-2 shadow-[0_18px_50px_rgba(23,35,29,0.055)] focus-within:border-dema-forest/20">
                  <label htmlFor="business-situation" className="sr-only">Décrivez la situation de votre entreprise</label>
                  <div className="relative">
                    {!situation ? (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 px-5 py-5 text-base font-light leading-relaxed text-brand-blue/28 sm:px-6 sm:py-6 sm:text-lg"
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
                      className="relative min-h-[9rem] w-full resize-none rounded-[1.25rem] bg-transparent px-5 py-5 text-base font-light leading-relaxed text-brand-blue outline-none sm:min-h-[10.5rem] sm:px-6 sm:py-6 sm:text-lg"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 px-3 pb-2 sm:px-4">
                    <button
                      type="button"
                      aria-label={situationDictation.isListening ? "Arrêter la dictée" : "Dicter ma situation"}
                      aria-pressed={situationDictation.isListening}
                      onClick={situationDictation.toggle}
                      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition ${situationDictation.isListening ? "border-dema-forest bg-dema-sage text-dema-forest" : "border-dema-line bg-dema-paper text-dema-muted hover:border-dema-forest/25 hover:text-dema-forest"}`}
                    >
                      <Mic className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="submit"
                      disabled={isGenerating || situation.trim().length < 20}
                      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-dema-forest px-6 text-sm font-semibold text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none"
                    >
                      {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                      {isGenerating ? "Création du plan…" : "Créer mon plan d’action"}
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
                    Commencer avec un plan vierge
                  </button>
                </div>
              </form>
            </section>
          ) : null}
          {activeTab === "system" ? (
            <ActionPlanSystemPanel
              options={systemOptions}
              selectedSystemId={selectedSystemId}
              onSystemChange={(systemId) => {
                setSelectedSystemId(systemId);
                setPendingSolutionResourceSlug(null);
                setPrePlanWorkspace((current) => ({
                  ...current,
                  selectedSystemId: systemId,
                }));
              }}
              workspace={prePlanWorkspace}
              onWorkspaceChange={setPrePlanWorkspace}
              demoMode={isDemoMode}
              initialActiveTab={pendingSolutionResourceSlug ? "solutions" : undefined}
              initialResourceSlug={pendingSolutionResourceSlug ?? undefined}
            />
          ) : null}
          {activeTab === "academy" ? <ActionPlanAcademyPanel /> : null}
          {activeTab === "opportunities" ? (
            <OpportunitiesPanel initialEmail={initialEmail} />
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
      <ActionPlanNavbar activeView={activeTab} onViewChange={setActiveTab} />
      <ActionPlanCoachingControl
        accessPlan={{
          plan,
          sourceText: situation.trim(),
          workspace,
          generation,
        }}
        demoMode={isDemoMode}
        initialEmail={initialEmail}
      />
      <div className="mx-auto max-w-[68rem]">
        <h1 ref={resultTitleRef} tabIndex={-1} className="sr-only outline-none">
          Votre plan d’action
        </h1>
        <div className="pt-1">
          <div hidden={activeTab !== "plan"}>
            <ActionPlanResult
              plan={plan}
              workspace={workspace}
              onWorkspaceChange={updateWorkspace}
              manualMode={isManualActionPlan(plan)}
              onAddAction={handleAddAction}
              onDeleteAction={handleDeleteAction}
              onGenerateLater={isManualActionPlan(plan) ? () => {
                setPlan(null);
                setGeneration(null);
                setWorkspace(null);
                setSelectedSystemId("");
                setActiveTab("plan");
              } : undefined}
              headerActions={(
                <ActionPlanUtilityActions
                  plan={plan}
                  sourceText={situation.trim()}
                  workspace={workspace}
                  generation={generation}
                  demoMode={isDemoMode}
                  onReset={() => {
                    setPlan(null);
                    setGeneration(null);
                    setWorkspace(null);
                    setError(null);
                  }}
                />
              )}
            />
          </div>
          <div hidden={activeTab !== "system"}>
            <ActionPlanSystemPanel
              options={systemOptions}
              selectedSystemId={selectedSystemId}
              onSystemChange={(systemId) => {
                setSelectedSystemId(systemId);
                setPendingSolutionResourceSlug(null);
                setWorkspace((current) => current ? { ...current, selectedSystemId: systemId } : current);
              }}
              workspace={workspace}
              onWorkspaceChange={updateWorkspace}
              demoMode={isDemoMode}
              initialActiveTab={pendingSolutionResourceSlug ? "solutions" : undefined}
              initialResourceSlug={pendingSolutionResourceSlug ?? undefined}
            />
          </div>
          {activeTab === "academy" ? <ActionPlanAcademyPanel /> : null}
          {activeTab === "opportunities" ? (
            <OpportunitiesPanel initialEmail={initialEmail} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
