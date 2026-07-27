"use client";

import {
  ArrowDown,
  ChevronDown,
  Euro,
  Flag,
  HeartHandshake,
  ListChecks,
  Megaphone,
  MessageCircleWarning,
  PackageSearch,
  Settings2,
  ShieldCheck,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import type {
  SystemeDetail,
  SystemeProcessItem,
} from "@/lib/systeme-catalog";

type SystemeTabContentProps = {
  systemName: string;
  systeme: SystemeDetail | null | undefined;
};

const pillarIcons: Record<string, LucideIcon> = {
  Direction: Flag,
  "Marketing et Vente": Megaphone,
  Opérations: Settings2,
  Équipe: UsersRound,
  "Finance et Admin": Euro,
  "Sécurité & Conformité Chantier": ShieldCheck,
  "Matériel & Approvisionnement": PackageSearch,
};

function getProcessIcon(process: string): LucideIcon {
  if (/acquérir|qualifier|conclure/i.test(process)) {
    return Target;
  }

  if (/fidéliser|relances/i.test(process)) {
    return HeartHandshake;
  }

  if (/réclamation|litige/i.test(process)) {
    return MessageCircleWarning;
  }

  return ListChecks;
}

function ProcessDocument({ item }: { item: SystemeProcessItem }) {
  return (
    <div className="mt-4 rounded-[0.9rem] border border-dema-forest/10 bg-dema-sage/45 px-4 py-3">
      <p className="min-w-0 text-sm font-semibold leading-snug text-brand-blue">
        {item.document}
      </p>
      <p className="mt-1 text-[11px] font-medium text-dema-muted/65">
        Support associé indiqué dans le système
      </p>
    </div>
  );
}

function ProcessList({ items }: { items: SystemeProcessItem[] }) {
  return (
    <div className="space-y-0 px-5 pb-6 pt-2 sm:px-7 sm:pb-7">
      {items.map((item, index) => {
        const ProcessIcon = getProcessIcon(item.process);
        const isLast = index === items.length - 1;
        const processSteps = item.steps.map((step) => step.step);

        return (
          <article
            key={item.processId}
            className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4 pb-8 last:pb-0"
          >
            {!isLast ? (
              <span
                className="absolute bottom-0 left-6 top-12 flex -translate-x-1/2 flex-col items-center"
                aria-hidden="true"
              >
                <span className="h-full w-px bg-dema-forest/55" />
                <ArrowDown className="-mt-1 h-4 w-4 shrink-0 text-dema-forest" />
              </span>
            ) : null}

            <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <ProcessIcon className="h-5 w-5" aria-hidden="true" />
            </span>

            <div className="min-w-0 pt-1">
              <h4 className="text-[15px] font-semibold leading-snug tracking-[-0.015em] text-brand-blue sm:text-base">
                {index + 1}. {item.process}
              </h4>

              {processSteps.length ? (
                <ul className="mt-3 space-y-2">
                  {processSteps.map((step, stepIndex) => (
                    <li
                      key={`${item.processId}-${stepIndex}`}
                      className="grid grid-cols-[0.65rem_minmax(0,1fr)] gap-2 text-[13px] leading-relaxed text-dema-muted sm:text-sm"
                    >
                      <span
                        className="mt-[0.55rem] h-1.5 w-1.5 rounded-full bg-dema-forest"
                        aria-hidden="true"
                      />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  Les étapes de ce process sont en cours de préparation.
                </p>
              )}

              <ProcessDocument item={item} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function OperationalProcessAccordion({ systeme }: { systeme: SystemeDetail }) {
  const initialPillar = systeme.cards.some(
    (card) => card.pillar === "Marketing et Vente",
  )
    ? "Marketing et Vente"
    : systeme.cards[0]?.pillar ?? null;
  const [openPillar, setOpenPillar] = useState<string | null>(initialPillar);

  return (
    <div className="space-y-3">
      {systeme.cards.map((card, index) => {
        const PillarIcon = pillarIcons[card.pillar] ?? ListChecks;
        const isOpen = openPillar === card.pillar;
        const panelId = `system-process-panel-${index}`;

        return (
          <section
            key={card.pillar}
            className={`overflow-hidden rounded-[1.25rem] border bg-dema-paper shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition ${
              isOpen ? "border-dema-forest/20" : "border-dema-line"
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() =>
                setOpenPillar((current) =>
                  current === card.pillar ? null : card.pillar,
                )
              }
              className="flex min-h-[5.35rem] w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-dema-sage/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dema-forest/35 sm:px-6"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <PillarIcon className="h-5 w-5" aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold leading-snug tracking-[-0.015em] text-brand-blue">
                  {card.pillar}
                </span>
                <span className="mt-1 block text-xs text-dema-muted">
                  {card.items.length} processus
                </span>
              </span>

              <ChevronDown
                className={`h-4 w-4 shrink-0 text-dema-muted transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isOpen ? (
              <div
                id={panelId}
                className="border-t border-dema-line/80"
              >
                <ProcessList items={card.items} />
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

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

  return <OperationalProcessAccordion systeme={systeme} />;
}
