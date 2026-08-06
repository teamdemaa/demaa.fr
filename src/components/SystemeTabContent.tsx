"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { SystemeDetail, SystemeRoutine } from "@/lib/systeme-catalog";

type SystemeTabContentProps = {
  systemName: string;
  systeme: SystemeDetail | null | undefined;
};

function RoutineItem({
  index,
  routine,
}: {
  index: number;
  routine: SystemeRoutine;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `system-routine-detail-${index}`;
  const routineNumber = String(index + 1).padStart(2, "0");

  return (
    <article className="border-b border-dema-line/80 last:border-b-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-[5.25rem] w-full items-center gap-4 py-4 text-left transition hover:bg-dema-sage/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dema-forest/35 sm:gap-5 sm:py-5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-forest/20 bg-dema-sage/45 font-mono text-xs font-semibold tabular-nums text-dema-forest">
          {routineNumber}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium leading-snug tracking-[-0.015em] text-brand-blue sm:text-base">
            {routine.title}
          </span>
          <span
            data-process-cadence={routine.cadence}
            className="mt-1 block text-xs text-dema-muted"
          >
            {routine.cadence}
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
          className="mb-5 ml-5 border-l-2 border-dema-forest/35 pl-8 pr-1 sm:mb-6 sm:ml-5 sm:pl-10"
        >
          <ul className="space-y-2.5">
            {routine.bullets.map((bullet, bulletIndex) => (
              <li
                key={`${routine.routineId}-${bulletIndex}`}
                className="relative pl-4 text-[13px] leading-relaxed text-dema-muted before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-1 before:rounded-full before:bg-dema-forest/65 sm:text-sm"
              >
                {bullet}
              </li>
            ))}
          </ul>

          {routine.support ? (
            <p className="mt-4 text-[11px] font-medium text-dema-muted/65">
              Dans le système · {routine.support.name}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function OperationalRoutineAccordion({
  routines,
}: {
  routines: SystemeRoutine[];
}) {
  return (
    <section aria-label="Routines du système">
      <div>
        {routines.map((routine, index) => (
          <RoutineItem
            key={routine.routineId}
            index={index}
            routine={routine}
          />
        ))}
      </div>
    </section>
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

  return <OperationalRoutineAccordion routines={systeme.routines} />;
}
