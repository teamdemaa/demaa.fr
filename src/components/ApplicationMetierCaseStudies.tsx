"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import type { ApplicationMetierCaseStudy } from "@/lib/application-metier-case-studies";

export default function ApplicationMetierCaseStudies({
  caseStudies,
}: {
  caseStudies: readonly ApplicationMetierCaseStudy[];
}) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<ApplicationMetierCaseStudy | null>(null);

  return (
    <>
      <div className="mt-11 grid border-y border-dema-line md:grid-cols-3">
        {caseStudies.map((caseStudy, index) => (
          <button
            key={caseStudy.id}
            type="button"
            onClick={() => setSelectedCaseStudy(caseStudy)}
            className={`group flex min-h-64 flex-col px-5 py-7 text-left transition hover:bg-dema-sage/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dema-forest/30 ${
              index > 0 ? "border-t border-dema-line md:border-l md:border-t-0" : ""
            }`}
            aria-label={`Voir le fonctionnement pour ${caseStudy.sector}`}
          >
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
              Projet réalisé
            </span>
            <strong className="mt-5 text-2xl font-light leading-tight tracking-[-0.035em] text-brand-blue">
              {caseStudy.sector}
            </strong>
            <span className="mt-4 text-sm leading-6 text-dema-muted">
              {caseStudy.cardDescription}
            </span>
            <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-dema-forest">
              Voir le fonctionnement
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      {selectedCaseStudy ? (
        <DirectoryDetailDialogShell
          ariaLabel={selectedCaseStudy.title}
          maxWidthClassName="max-w-4xl"
          onClose={() => setSelectedCaseStudy(null)}
          closeLabel="Fermer le cas concret"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
            {selectedCaseStudy.sector}
          </p>
          <h2 className="max-w-3xl text-[2rem] font-light leading-[1.08] tracking-[-0.04em] text-brand-blue sm:text-[2.65rem]">
            {selectedCaseStudy.title}
          </h2>

          <div className="mt-9 grid gap-8 border-t border-dema-line pt-8 md:grid-cols-2 md:gap-12">
            <section aria-labelledby={`${selectedCaseStudy.id}-problem-heading`}>
              <h3 id={`${selectedCaseStudy.id}-problem-heading`} className="text-base font-medium text-brand-blue">
                Le problème de départ
              </h3>
              <p className="mt-3 text-sm leading-6 text-dema-muted">
                {selectedCaseStudy.problem}
              </p>
            </section>
            <section aria-labelledby={`${selectedCaseStudy.id}-application-heading`}>
              <h3 id={`${selectedCaseStudy.id}-application-heading`} className="text-base font-medium text-brand-blue">
                L’application construite
              </h3>
              <p className="mt-3 text-sm leading-6 text-dema-muted">
                {selectedCaseStudy.application}
              </p>
            </section>
          </div>

          <section className="mt-9 border-t border-dema-line pt-8" aria-labelledby={`${selectedCaseStudy.id}-flow-heading`}>
            <h3 id={`${selectedCaseStudy.id}-flow-heading`} className="text-base font-medium text-brand-blue">
              Le flux de travail
            </h3>
            <ol className="mt-5 grid gap-px overflow-hidden rounded-[1rem] border border-dema-line bg-dema-line sm:grid-cols-2 lg:grid-cols-3">
              {selectedCaseStudy.flow.map((step, index) => (
                <li key={step} className="min-h-24 bg-dema-paper p-4">
                  <span className="demaa-section-title text-xl text-dema-forest">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 text-sm leading-5 text-brand-blue">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </DirectoryDetailDialogShell>
      ) : null}
    </>
  );
}
