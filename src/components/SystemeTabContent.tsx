"use client";

import { ChevronDown, ListChecks, Mail } from "lucide-react";
import type { SystemeDetail } from "@/lib/systeme-catalog";

type SystemeTabContentProps = {
  systemName: string;
  systemSlug: string;
  systeme: SystemeDetail | null | undefined;
  includePilotingDocument?: boolean;
  onRequestSystemComplete?: () => void;
};

export default function SystemeTabContent({
  systemName,
  systeme,
  onRequestSystemComplete,
}: SystemeTabContentProps) {
  if (!systeme?.cards.length) {
    return (
      <div className="demaa-surface rounded-[1.35rem] px-5 py-6 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted">
          Process
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-brand-blue">
          Référentiel en cours de préparation
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dema-muted">
          Les process opérationnels de {systemName} sont en cours de structuration.
        </p>
      </div>
    );
  }

  const processCount = systeme.cards.reduce(
    (total, card) => total + card.items.length,
    0,
  );

  return (
    <div className="space-y-5">
      <div className="demaa-surface rounded-[1.35rem] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <ListChecks className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              {processCount} process opérationnels
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-dema-muted">
              Retrouvez ici les process classés par catégorie. Les tâches détaillées,
              le responsable et la récurrence sont regroupés dans un seul Google Sheet
              prêt à copier et à compléter.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systeme.cards.map((card) => (
          <details
            key={card.pillar}
            className="demaa-accordion h-fit rounded-[1.25rem] px-5 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-brand-blue">
                  {card.pillar}
                </h3>
                <p className="mt-1 text-xs text-dema-muted">
                  {card.items.length} process
                </p>
              </div>
              <ChevronDown
                className="demaa-accordion-chevron h-4 w-4 shrink-0 text-dema-muted transition-transform"
                aria-hidden="true"
              />
            </summary>

            <div className="demaa-accordion-content mt-4 space-y-0">
              {card.items.map((item) => (
                <p
                  key={`${card.pillar}-${item.process}`}
                  className="border-t border-dema-line/80 py-3 text-sm font-medium leading-relaxed text-brand-blue first:border-t-0 first:pt-0 last:pb-0"
                >
                  {item.process}
                </p>
              ))}
            </div>
          </details>
        ))}
      </div>

      {onRequestSystemComplete ? (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onRequestSystemComplete}
            className="demaa-primary-button inline-flex items-center gap-2"
            aria-label={`Recevoir le kit opérationnel ${systemName}`}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Recevoir le Google Sheet
          </button>
        </div>
      ) : null}
    </div>
  );
}
