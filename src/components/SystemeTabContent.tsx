"use client";

import { ChevronDown } from "lucide-react";
import type { SystemeDetail } from "@/lib/systeme-catalog";

type SystemeTabContentProps = {
  systemName: string;
  systeme: SystemeDetail | null | undefined;
};

export default function SystemeTabContent({
  systemName,
  systeme,
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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systeme.cards.map((card) => (
          <details
            key={card.pillar}
            className="demaa-accordion h-24 rounded-[1.25rem] px-5 py-3 open:h-auto"
          >
            <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-start justify-between gap-4">
              <div className="flex min-h-[4.5rem] min-w-0 flex-1 flex-col justify-between">
                <h3 className="line-clamp-2 text-base font-semibold leading-5 tracking-tight text-brand-blue">
                  {card.pillar}
                </h3>
                <p className="text-xs leading-4 text-dema-muted">
                  {card.items.length} processus
                </p>
              </div>
              <ChevronDown
                className="demaa-accordion-chevron mt-0.5 h-4 w-4 shrink-0 text-dema-muted transition-transform"
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
    </div>
  );
}
