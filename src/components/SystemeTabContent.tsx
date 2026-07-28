"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type {
  SystemeDetail,
  SystemeProcessItem,
} from "@/lib/systeme-catalog";

type SystemeTabContentProps = {
  systemName: string;
  systeme: SystemeDetail | null | undefined;
};

function ProcessDocument({ item }: { item: SystemeProcessItem }) {
  return (
    <div className="mt-4 rounded-[0.9rem] border border-dema-forest/10 bg-dema-sage/45 px-4 py-3">
      <p className="min-w-0 text-sm font-semibold leading-snug text-brand-blue">
        {item.document}
      </p>
      <p className="mt-1 text-[11px] font-medium text-dema-muted/65">
        Dans le système
      </p>
    </div>
  );
}

function ProcessItem({
  familyIndex,
  item,
  processIndex,
}: {
  familyIndex: number;
  item: SystemeProcessItem;
  processIndex: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `system-process-detail-${familyIndex}-${processIndex}`;
  const processNumber = `${String(familyIndex + 1).padStart(2, "0")}.${String(
    processIndex + 1,
  ).padStart(2, "0")}`;
  const processSteps = item.steps.map((step) => step.step);

  return (
    <article className="border-b border-dema-line/80 last:border-b-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-[4.7rem] w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-dema-sage/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dema-forest/35 sm:px-7"
      >
        <span className="w-12 shrink-0 font-mono text-xs font-semibold tabular-nums text-dema-forest">
          {processNumber}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug tracking-[-0.015em] text-brand-blue sm:text-base">
            {item.process}
          </span>
          <span className="mt-1 block text-xs text-dema-muted">
            {processSteps.length
              ? `${processSteps.length} étapes`
              : "Étapes en préparation"}
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
          className="px-5 pb-5 pl-[5.75rem] sm:px-7 sm:pb-6 sm:pl-[6.75rem]"
        >
          {processSteps.length ? (
            <ol className="space-y-2">
              {processSteps.map((step, stepIndex) => (
                <li
                  key={`${item.processId}-${stepIndex}`}
                  className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 text-[13px] leading-relaxed text-dema-muted sm:text-sm"
                >
                  <span
                    className="font-mono text-[11px] font-semibold tabular-nums text-dema-forest/70"
                    aria-hidden="true"
                  >
                    {String(stepIndex + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm leading-relaxed text-dema-muted">
              Les étapes de ce process sont en cours de préparation.
            </p>
          )}

          <ProcessDocument item={item} />
        </div>
      ) : null}
    </article>
  );
}

function ProcessList({
  familyIndex,
  items,
}: {
  familyIndex: number;
  items: SystemeProcessItem[];
}) {
  return (
    <div>
      {items.map((item, processIndex) => (
        <ProcessItem
          key={item.processId}
          familyIndex={familyIndex}
          item={item}
          processIndex={processIndex}
        />
      ))}
    </div>
  );
}

function OperationalProcessAccordion({ systeme }: { systeme: SystemeDetail }) {
  const [openPillar, setOpenPillar] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {systeme.cards.map((card, index) => {
        const isOpen = openPillar === card.pillar;
        const panelId = `system-process-panel-${index}`;
        const familyNumber = String(index + 1).padStart(2, "0");

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
              className="flex min-h-[4.9rem] w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-dema-sage/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dema-forest/35 sm:px-6"
            >
              <span className="w-9 shrink-0 font-mono text-sm font-semibold tabular-nums text-dema-forest">
                {familyNumber}
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

            <div
              id={panelId}
              className="border-t border-dema-line/80"
              hidden={!isOpen}
            >
              <ProcessList familyIndex={index} items={card.items} />
            </div>
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
