"use client";

import { useEffect, useState } from "react";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const GENERATION_QUESTIONS = [
  "Si vous étiez absent un mois, votre entreprise tournerait-elle aussi bien ?",
  "Quelles tâches reviennent chaque semaine ?",
  "Où les informations sont-elles ressaisies ou recherchées ?",
  "Qu’est-ce qui attend encore votre validation ?",
  "Que peut-on supprimer, simplifier, déléguer ou automatiser ?",
  "Quel résultat permettrait de vérifier que cela fonctionne mieux ?",
] as const;

const GENERATION_QUESTIONS_EN = [
  "If you were away for a month, would your business run just as well?",
  "Which tasks come back every week?",
  "Where is information re-entered or searched for?",
  "What is still waiting for your approval?",
  "What can be removed, simplified, delegated or automated?",
  "What result would show that it is working better?",
] as const;

export default function ActionPlanGenerationScreen({
  localeCode = "fr",
}: {
  localeCode?: InterfaceLocaleCode;
}) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const questions = localeCode === "en" ? GENERATION_QUESTIONS_EN : GENERATION_QUESTIONS;

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const interval = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % questions.length);
    }, 4_800);

    return () => {
      window.clearInterval(interval);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [questions.length]);

  return (
    <main className="fixed inset-0 z-[180] flex min-h-dvh flex-col overflow-y-auto overscroll-contain bg-dema-forest px-6 py-8 text-dema-paper sm:px-10 sm:py-10 lg:px-14">
      <div className="flex items-center justify-between gap-4">
        <p className="demaa-hero-title text-3xl text-dema-paper sm:text-4xl">Demaa</p>
        <div className="flex items-center justify-center gap-2 text-sm text-dema-paper/70" role="status" aria-live="polite">
          <span>{localeCode === "en" ? "Generating your action plan" : "Génération de votre plan d’action"}</span>
          <span className="inline-flex items-center gap-1" aria-hidden="true">
            <span className="demaa-generation-dot h-1 w-1 rounded-full bg-current" />
            <span className="demaa-generation-dot h-1 w-1 rounded-full bg-current [animation-delay:180ms]" />
            <span className="demaa-generation-dot h-1 w-1 rounded-full bg-current [animation-delay:360ms]" />
          </span>
        </div>
      </div>
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-10 text-center sm:py-12">
        <p
          key={quoteIndex}
          className="demaa-generation-quote w-full text-balance text-[clamp(1.6rem,4.55vw,4rem)] font-light leading-[1.06] tracking-[-0.04em] text-dema-paper"
        >
          {questions[quoteIndex]}
        </p>
      </section>
    </main>
  );
}
