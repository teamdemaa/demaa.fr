"use client";

import { ArrowUp, LoaderCircle, Mic } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";

export default function ActionPlanGenerationBar({
  onGeneratePlan,
}: {
  onGeneratePlan: (situation: string) => Promise<void>;
}) {
  const [situation, setSituation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const situationDictation = useSpeechDictation({
    value: situation,
    onChange: setSituation,
    continuous: true,
    interimResults: true,
    maxLength: 4_000,
  });

  async function submitSituation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    situationDictation.cancel();
    const normalizedSituation = situation.trim();
    if (isSubmitting || normalizedSituation.length < 20) return;

    setIsSubmitting(true);
    setError("");
    try {
      await onGeneratePlan(normalizedSituation);
      setSituation("");
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Le plan n’a pas pu être créé.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-40 mx-auto w-auto max-w-3xl xl:inset-x-auto xl:bottom-4 xl:left-1/2 xl:w-full xl:-translate-x-1/2">
      <form
        onSubmit={submitSituation}
        className="flex min-h-14 items-center gap-2 rounded-full border border-dema-line bg-white/95 p-1.5 pl-5 shadow-[0_16px_40px_rgba(23,35,29,0.12)] backdrop-blur"
      >
        <label htmlFor="action-plan-generation-situation" className="sr-only">
          Qu’est-ce qui freine votre entreprise ?
        </label>
        <input
          id="action-plan-generation-situation"
          value={situation}
          onChange={(event) => situationDictation.handleValueChange(event.target.value)}
          disabled={isSubmitting}
          maxLength={4_000}
          placeholder="Qu’est-ce qui freine votre entreprise ?"
          className="min-w-0 flex-1 bg-transparent text-sm text-brand-blue outline-none placeholder:text-dema-muted disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={situationDictation.toggle}
          disabled={isSubmitting}
          aria-label={situationDictation.isListening ? "Arrêter la dictée" : "Dicter ma demande"}
          aria-pressed={situationDictation.isListening}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-45 ${
            situationDictation.isListening
              ? "border-dema-forest bg-dema-forest text-white"
              : "border-dema-line bg-white text-dema-forest hover:border-dema-forest/30 hover:bg-dema-soft"
          }`}
        >
          <Mic className={`h-4 w-4 ${situationDictation.isListening ? "animate-pulse" : ""}`} aria-hidden="true" />
        </button>
        <button
          type="submit"
          disabled={isSubmitting || situation.trim().length < 20}
          aria-label="Générer le plan"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-forest text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:bg-dema-muted/45"
        >
          {isSubmitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </form>
      {error || situationDictation.error ? (
        <p className="mt-1 min-h-6 px-4 text-center text-xs leading-relaxed text-red-700" role="alert">
          {situationDictation.error || error}
        </p>
      ) : null}
    </div>
  );
}
