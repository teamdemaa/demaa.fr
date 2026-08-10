"use client";

import { ArrowRight, LoaderCircle, Sparkles, Workflow } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ActionPlanResult from "@/components/ActionPlanResult";
import ActionPlanSaveControl from "@/components/ActionPlanSaveControl";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import type { ActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";

const EXAMPLES = [
  "Je dirige un cabinet comptable de 6 personnes. Les dossiers avancent, mais tout remonte encore vers moi et les échéances sont suivies dans plusieurs fichiers.",
  "Mon restaurant fonctionne bien le midi, mais la marge baisse. Les achats, les plannings et les pertes ne sont pas suivis de façon régulière.",
  "Je développe une entreprise de plomberie avec 4 techniciens. Je veux mieux organiser les interventions, les devis et les relances sans ajouter un outil compliqué.",
  "Je suis consultante indépendante. J’ai des missions, mais mon offre manque de clarté et je veux trouver des clients de manière plus régulière sans démarchage de masse.",
];

type ExperienceTab = "plan" | "system";

export default function ActionPlanExperience({
  systemOptions,
}: {
  systemOptions: readonly ActionPlanSystemOption[];
}) {
  const [situation, setSituation] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [activeTab, setActiveTab] = useState<ExperienceTab>("plan");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultTitleRef = useRef<HTMLHeadingElement | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (situation) return;
    const interval = window.setInterval(() => {
      setExampleIndex((current) => (current + 1) % EXAMPLES.length);
    }, 5_500);
    return () => window.clearInterval(interval);
  }, [situation]);

  useEffect(() => () => requestControllerRef.current?.abort(), []);

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

    try {
      const response = await fetch("/api/action-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: normalizedSituation }),
        signal: controller.signal,
      });
      const body = (await response.json().catch(() => null)) as
        | { plan?: ActionPlan; error?: string }
        | null;

      if (!response.ok || !body?.plan) {
        throw new Error(body?.error || "Impossible de générer le plan pour le moment.");
      }

      setPlan(body.plan);
      setSelectedSystemId(body.plan.systemId);
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

  if (!plan) {
    return (
      <main className="min-h-[calc(100dvh-73px)] bg-dema-cream px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <section className="mx-auto max-w-5xl text-center">
          <h1 className="text-balance text-[clamp(2.45rem,7vw,5.2rem)] font-light leading-[0.98] tracking-[-0.055em] text-brand-blue">
            Décrivez votre situation.
            <span className="demaa-hero-title mt-1 block text-dema-forest">Repartez avec un plan d’action concret.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-dema-muted sm:text-lg">
            Expliquez ce qui se passe dans votre entreprise, avec vos mots. Demaa organise la suite en actions concrètes et en choix clairs.
          </p>

          <form onSubmit={handleGenerate} className="mx-auto mt-9 max-w-4xl text-left sm:mt-11">
            <div className="rounded-[1.7rem] border border-dema-line bg-dema-paper p-2 shadow-[0_18px_50px_rgba(23,35,29,0.055)] focus-within:border-dema-forest/20">
              <label htmlFor="business-situation" className="sr-only">Décrivez la situation de votre entreprise</label>
              <textarea
                id="business-situation"
                value={situation}
                onChange={(event) => setSituation(event.target.value)}
                maxLength={4_000}
                rows={7}
                placeholder={EXAMPLES[exampleIndex]}
                className="min-h-[13rem] w-full resize-none rounded-[1.25rem] bg-transparent px-5 py-5 text-base font-light leading-relaxed text-brand-blue outline-none placeholder:text-brand-blue/28 sm:min-h-[15rem] sm:px-6 sm:py-6 sm:text-lg"
              />
              <div className="flex flex-col gap-3 border-t border-dema-line px-3 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <p className="text-xs leading-relaxed text-dema-muted">
                  Vous pourrez relire le résultat avant de créer un compte.
                </p>
                <button
                  type="submit"
                  disabled={isGenerating || situation.trim().length < 20}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dema-forest px-6 text-sm font-semibold text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                  {isGenerating ? "Création du plan…" : "Créer mon plan d’action"}
                  {!isGenerating ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                </button>
              </div>
            </div>
            <div aria-live="polite" className="min-h-7 px-3 pt-3 text-center text-sm text-dema-forest">
              {error}
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dema-cream px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[68rem]">
        <div className="flex flex-col gap-5 border-b border-dema-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Votre plan d’action</p>
            <h1 ref={resultTitleRef} tabIndex={-1} className="mt-2 max-w-3xl text-3xl font-light tracking-[-0.04em] text-brand-blue outline-none sm:text-4xl">
              Une prochaine étape claire, puis un système pour l’exécuter.
            </h1>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <ActionPlanSaveControl plan={plan} sourceText={situation.trim()} />
            <button
              type="button"
              onClick={() => {
                setPlan(null);
                setError(null);
              }}
              className="demaa-secondary-button min-h-11 shrink-0"
            >
              Nouvelle situation
            </button>
          </div>
        </div>

        <div className="sticky top-[73px] z-30 -mx-4 border-b border-dema-line bg-dema-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
          <div className="grid max-w-md grid-cols-2 rounded-full border border-dema-line bg-dema-paper p-1" role="tablist" aria-label="Votre résultat">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "plan"}
              onClick={() => setActiveTab("plan")}
              className={`min-h-11 rounded-full px-4 text-sm transition ${activeTab === "plan" ? "bg-dema-sage font-semibold text-dema-forest" : "text-dema-muted hover:text-brand-blue"}`}
            >
              Plan d’action
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "system"}
              onClick={() => setActiveTab("system")}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm transition ${activeTab === "system" ? "bg-dema-sage font-semibold text-dema-forest" : "text-dema-muted hover:text-brand-blue"}`}
            >
              <Workflow className="h-4 w-4" aria-hidden="true" />
              Système
            </button>
          </div>
        </div>

        <div className="pt-8" role="tabpanel">
          {activeTab === "plan" ? <ActionPlanResult plan={plan} /> : null}
          {activeTab === "system" ? (
            <ActionPlanSystemPanel
              options={systemOptions}
              selectedSystemId={selectedSystemId}
              onSystemChange={setSelectedSystemId}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
