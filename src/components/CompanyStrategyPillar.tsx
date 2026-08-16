"use client";

import { ChevronDown } from "lucide-react";
import {
  COMPANY_STRATEGY_ANSWER_MAX_LENGTH,
  type CompanyStrategyAnswerKey,
  type CompanyStrategyAnswers,
  type CompanyStrategyPillar,
} from "@/lib/company-pilotage-contract";

export default function CompanyStrategyPillar({
  pillar,
  open,
  answers,
  conflicts,
  onOpen,
  onAnswerChange,
  onKeepLocal,
  onUseRemote,
}: {
  pillar: {
    key: CompanyStrategyPillar;
    label: string;
    framing: string;
    questions: readonly { key: CompanyStrategyAnswerKey; label: string; placeholder?: string }[];
  };
  open: boolean;
  answers: CompanyStrategyAnswers;
  conflicts: Partial<Record<CompanyStrategyAnswerKey, string>>;
  onOpen: () => void;
  onAnswerChange: (key: CompanyStrategyAnswerKey, value: string) => void;
  onKeepLocal: (key: CompanyStrategyAnswerKey) => void;
  onUseRemote: (key: CompanyStrategyAnswerKey) => void;
}) {
  return (
    <section className="py-5 first:pt-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onOpen}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <span>
          <span className="block font-medium text-dema-forest">{pillar.label}</span>
          <span className="mt-1 block text-sm font-normal leading-relaxed text-dema-muted">{pillar.framing}</span>
        </span>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-dema-muted transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open ? (
        <div className="mt-5 space-y-5">
          {pillar.questions.map((question) => {
            const conflict = conflicts[question.key];
            return (
              <div key={question.key}>
                <label htmlFor={`strategy-${question.key}`} className="block text-left text-sm font-medium leading-relaxed text-dema-ink">
                  {question.label}
                </label>
                <textarea
                  id={`strategy-${question.key}`}
                  value={answers[question.key]}
                  maxLength={COMPANY_STRATEGY_ANSWER_MAX_LENGTH}
                  rows={3}
                  placeholder={question.placeholder}
                  onChange={(event) => onAnswerChange(question.key, event.target.value)}
                  className="mt-2 w-full resize-y rounded-xl border border-dema-line bg-white px-3 py-2.5 text-left text-base font-normal leading-relaxed text-dema-ink outline-none placeholder:text-dema-muted/70 focus:border-dema-forest"
                  aria-describedby={conflict ? `strategy-${question.key}-conflict` : undefined}
                />
                <div className="mt-1 flex justify-end text-xs text-dema-muted">{answers[question.key].length}/{COMPANY_STRATEGY_ANSWER_MAX_LENGTH}</div>
                {conflict !== undefined ? (
                  <div id={`strategy-${question.key}-conflict`} role="alert" className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
                    <p>Cette réponse a aussi été modifiée ailleurs.</p>
                    <p className="mt-1 text-xs">Version récente : {conflict || "Réponse vide"}</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <button type="button" className="font-semibold underline underline-offset-4" onClick={() => onKeepLocal(question.key)}>Garder ma version</button>
                      <button type="button" className="font-semibold underline underline-offset-4" onClick={() => onUseRemote(question.key)}>Utiliser la version récente</button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
