import { X } from "lucide-react";
import Link from "next/link";
import SystemRecapPrintButton from "@/components/SystemRecapPrintButton";
import type { SystemeRoutine } from "@/lib/systeme-catalog";

export default function SystemProcessesContent({
  routines,
  systemName,
  variant = "page",
  closeHref,
}: {
  routines: readonly SystemeRoutine[];
  systemName: string;
  variant?: "modal" | "page";
  closeHref?: string;
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
          <SystemRecapPrintButton />
        </div>
      </header>

      <section className="py-8" aria-labelledby="processes-title">
        <SectionHeading id="processes-title" className="text-2xl font-semibold tracking-[-0.025em]">
          Liste des processus
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
                  <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-dema-muted">
                    {routine.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span aria-hidden="true">•</span>
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

      <footer className="border-t border-dema-line pt-6 text-xs leading-relaxed text-dema-muted">
        Cette liste reflète les processus actuellement publiés sur Demaa et peut évoluer.
      </footer>
    </article>
  );
}
