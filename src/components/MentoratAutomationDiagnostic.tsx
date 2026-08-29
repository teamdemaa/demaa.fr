"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { createActionPlanGenerationDraft } from "@/lib/action-plan-generation-draft.client";
import {
  clearGuestAccess,
  createGuestGenerationAccess,
  startGuestActionPlanGeneration,
  writeGuestAccess,
} from "@/lib/guest-action-plan.client";

export default function MentoratAutomationDiagnostic() {
  const [situation, setSituation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  async function startDiagnostic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSituation = situation.trim();
    if (normalizedSituation.length < 20 || isStarting) {
      setError("Décrivez votre situation en quelques mots pour commencer.");
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsStarting(true);
    setError(null);
    clearGuestAccess();

    try {
      const draft = createActionPlanGenerationDraft(normalizedSituation, {
        contentLocaleCode: "fr",
        marketCodeAtCreation: "fr-fr",
      });
      const { accessKey } = createGuestGenerationAccess();
      const state = await startGuestActionPlanGeneration(
        draft,
        accessKey,
        controller.signal,
      );
      writeGuestAccess({
        accessKey,
        expiresAt: state.status === "active"
          ? state.actionPlan.expiresAt
          : state.expiresAt,
        generationId: state.generationId,
      });
      window.location.assign("/diagnostic-organisation?source=automatisation");
    } catch (startError) {
      if (startError instanceof DOMException && startError.name === "AbortError") return;
      setError(
        startError instanceof Error
          ? startError.message
          : "Le diagnostic ne peut pas démarrer pour le moment.",
      );
      setIsStarting(false);
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }

  return (
    <section
      id="diagnostic"
      aria-labelledby="diagnostic-heading"
      className="scroll-mt-24 bg-dema-sage px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <h2
            id="diagnostic-heading"
            className="demaa-marketing-section-title"
          >
            Qu’est-ce qui vous prend le plus de temps aujourd’hui&nbsp;?
          </h2>
          <p className="mt-5 text-base leading-7 text-dema-muted">
            Décrivez une tâche répétitive ou un point de blocage. Le diagnostic vous aidera à identifier ce qui mérite réellement d’être automatisé.
          </p>
        </div>
        <form onSubmit={startDiagnostic} className="min-w-0">
          <label htmlFor="mentorat-diagnostic-situation" className="sr-only">
            Votre situation
          </label>
          <div className="rounded-[1.45rem] border border-dema-line bg-dema-paper p-2 shadow-[0_14px_38px_rgba(23,35,29,0.055)] focus-within:border-dema-forest/20">
            <textarea
              id="mentorat-diagnostic-situation"
              value={situation}
              onChange={(event) => setSituation(event.target.value)}
              maxLength={4_000}
              rows={5}
              placeholder="Ex. Je passe trop de temps à relancer mes clients et à mettre mes tableaux à jour…"
              className="min-h-[6.75rem] w-full resize-none rounded-[1.1rem] bg-transparent px-5 py-4 text-base font-light leading-relaxed text-brand-blue outline-none placeholder:text-brand-blue/28 sm:min-h-[7.875rem] sm:px-[1.125rem] sm:py-[1.125rem]"
            />
            <div className="flex justify-end px-2 pb-1 sm:px-3">
              <button
                type="submit"
                disabled={isStarting || situation.trim().length < 20}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-dema-forest px-[1.125rem] text-[0.8125rem] font-semibold text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none"
              >
                {isStarting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                Identifier mon point de départ
                {!isStarting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
              </button>
            </div>
          </div>
          <p aria-live="polite" className="min-h-7 px-3 pt-3 text-center text-sm text-dema-forest">
            {error}
          </p>
        </form>
      </div>
    </section>
  );
}
