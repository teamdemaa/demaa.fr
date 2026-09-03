import { X } from "lucide-react";
import Link from "next/link";
import SystemRecapPrintButton from "@/components/SystemRecapPrintButton";
import SystemProcessGuideDetails, {
  SystemProcessGuidePrintDetails,
} from "@/components/SystemProcessGuideDetails";
import type { SystemeRoutine } from "@/lib/systeme-catalog";
import type { SystemProcessGuideDetail } from "@/lib/system-process-guide-details";

export default function SystemProcessesContent({
  routines,
  systemName,
  systemSlug,
  variant = "page",
  closeHref,
  processGuideDetails = [],
}: {
  routines: readonly SystemeRoutine[];
  systemName: string;
  systemSlug: string;
  variant?: "modal" | "page";
  closeHref?: string;
  processGuideDetails?: readonly SystemProcessGuideDetail[];
}) {
  const Heading = variant === "modal" ? "h2" : "h1";
  const SectionHeading = variant === "modal" ? "h3" : "h2";
  const RoutineHeading = variant === "modal" ? "h4" : "h3";

  return (
    <article
      data-system-processes
      data-system-recap
      className={variant === "modal"
        ? "w-full text-brand-blue print:max-w-none print:p-0"
        : "relative mx-auto w-full max-w-4xl rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 text-brand-blue shadow-[0_18px_50px_rgba(23,35,29,0.06)] print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none sm:p-10"}
    >
      {closeHref ? (
        <Link
          href={closeHref}
          aria-label={`Fermer les processus et revenir à ${systemName}`}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 print:hidden sm:right-6 sm:top-6"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
      <header
        className={`border-b border-dema-line pb-8 ${
          variant === "modal" || closeHref ? "pr-12 sm:pr-14" : ""
        }`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              Processus métier
            </p>
            <Heading className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              {systemName}
            </Heading>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-dema-muted sm:text-base">
              Les processus essentiels à structurer pour piloter cette activité au quotidien.
            </p>
          </div>
          <SystemRecapPrintButton
            downloadHref={`/api/system-processes/pdf/${systemSlug}`}
            emailDelivery={{ systemName, systemSlug }}
          />
        </div>
      </header>

      <section className="space-y-4 py-8 print:hidden" aria-label="Processus du métier">
        <SystemProcessGuideDetails details={processGuideDetails} />

        <details
          open={processGuideDetails.length === 0}
          className="group overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:content-none sm:px-6">
            <span className="text-lg font-medium tracking-[-0.02em] text-brand-blue sm:text-xl">
              Vue d’ensemble
            </span>
            <span className="flex items-center gap-3">
              <span className="rounded-full bg-dema-sage px-2.5 py-1 text-xs font-medium text-dema-forest">
                {routines.length}
              </span>
              <span className="text-sm text-dema-forest transition group-open:rotate-180" aria-hidden="true">⌄</span>
            </span>
          </summary>
          <div className="divide-y divide-dema-line border-t border-dema-line px-5 sm:px-6">
            {routines.map((routine, index) => (
              <article key={routine.routineId} className="flex gap-4 py-4">
                <span className="pt-0.5 font-mono text-[0.68rem] font-semibold text-dema-forest/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <RoutineHeading className="text-sm font-medium text-brand-blue sm:text-base">
                    {routine.title}
                  </RoutineHeading>
                  <p className="mt-1 text-xs text-dema-muted">{routine.cadence}</p>
                </div>
              </article>
            ))}
          </div>
        </details>
      </section>

      <section className="hidden py-8 print:block" aria-labelledby="processes-title">
        <SectionHeading id="processes-title" className="text-2xl font-semibold tracking-[-0.025em]">
          Processus complets
        </SectionHeading>
        <div className="mt-5 divide-y divide-dema-line border-y border-dema-line">
          {routines.map((routine, index) => (
            <article
              key={routine.routineId}
              id={routine.routineId}
              className="scroll-mt-28 break-inside-avoid py-5 target:rounded-xl target:bg-dema-sage/35 target:px-3"
            >
              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dema-sage font-mono text-xs font-semibold text-dema-forest">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <RoutineHeading className="text-base font-medium">{routine.title}</RoutineHeading>
                  <p className="mt-1 text-xs text-dema-muted">{routine.cadence}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-dema-muted">
                    {routine.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-1 inline-flex h-4 w-4 shrink-0 rounded-[0.22rem] border border-dema-forest/45 bg-dema-paper print:border-dema-forest"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SystemProcessGuidePrintDetails details={processGuideDetails} />

    </article>
  );
}
