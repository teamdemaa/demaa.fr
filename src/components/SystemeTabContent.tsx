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
          Systèmes
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-brand-blue">
          Structure en cours de préparation
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dema-muted">
          Le référentiel système de {systemName} est en cours de structuration. Les onglets existants restent disponibles pendant la montée en qualité lot par lot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
          Systèmes
        </p>
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

            <div className="demaa-accordion-content mt-4 space-y-4">
              {card.items.map((item) => (
                <div
                  key={`${card.pillar}-${item.process}`}
                  className="border-t border-dema-line/80 pt-4 first:border-t-0 first:pt-0"
                >
                  <p className="text-sm font-medium leading-relaxed text-brand-blue">
                    {item.process}
                  </p>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
