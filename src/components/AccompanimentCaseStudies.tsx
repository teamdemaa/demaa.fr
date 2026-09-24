"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import {
  ACCOMPANIMENT_CASE_STUDIES,
  type AccompanimentCaseStudy,
} from "@/lib/accompaniment-case-studies";

export default function AccompanimentCaseStudies() {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<AccompanimentCaseStudy | null>(null);

  return (
    <>
      <section id="situations-concretes" className="border-b border-dema-line bg-dema-paper px-5 py-24 sm:px-8 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Des situations concrètes.</h2>
            <p className="mt-6 text-lg leading-8 text-dema-muted">On ne transforme pas toute l’entreprise d’un coup. On organise le flux qui bloque le plus.</p>
          </div>

          <div className="mt-14 grid overflow-hidden rounded-[1.75rem] border border-dema-line bg-dema-line md:grid-cols-2 xl:grid-cols-3">
            {ACCOMPANIMENT_CASE_STUDIES.map((caseStudy, index) => (
              <button
                key={caseStudy.id}
                type="button"
                onClick={() => setSelectedCaseStudy(caseStudy)}
                className={`group flex min-h-64 flex-col bg-dema-paper p-8 text-left transition hover:bg-dema-sage/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dema-forest/35 sm:p-10 ${index > 0 ? "border-t border-dema-line md:border-l md:border-t-0" : ""} ${index === 3 ? "xl:border-l-0 xl:border-t" : ""}`}
                aria-label={`Voir la situation concrète pour ${caseStudy.sector}`}
              >
                <span className="text-sm font-medium text-dema-forest">{caseStudy.sector}</span>
                <strong className="mt-5 text-2xl font-light leading-tight tracking-[-0.035em] text-brand-blue">{caseStudy.title}</strong>
                <span className="mt-5 text-sm leading-7 text-dema-muted">{caseStudy.cardDescription}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-dema-forest">Voir le fonctionnement <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedCaseStudy ? (
        <DirectoryDetailDialogShell ariaLabel={`Situation concrète : ${selectedCaseStudy.sector}`} maxWidthClassName="max-w-5xl" onClose={() => setSelectedCaseStudy(null)} closeLabel="Fermer la situation concrète">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Aperçu illustratif · {selectedCaseStudy.sector}</p>
          <h2 className="mt-4 max-w-3xl text-[2rem] font-light leading-[1.08] tracking-[-0.04em] text-brand-blue sm:text-[2.65rem]">{selectedCaseStudy.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-dema-muted">Cette situation illustre un fonctionnement possible ; elle ne constitue pas un témoignage client.</p>

          <Image src={selectedCaseStudy.image.src} alt={selectedCaseStudy.image.alt} width={1400} height={933} sizes="(min-width: 1024px) 56rem, 100vw" className="mt-8 h-auto w-full rounded-[1rem] border border-dema-line" />

          <div className="mt-9 grid gap-8 border-t border-dema-line pt-8 md:grid-cols-2 md:gap-12">
            <section>
              <h3 className="text-base font-medium text-brand-blue">Le problème de départ</h3>
              <p className="mt-3 text-sm leading-6 text-dema-muted">{selectedCaseStudy.problem}</p>
            </section>
            <section>
              <h3 className="text-base font-medium text-brand-blue">Le système à installer</h3>
              <p className="mt-3 text-sm leading-6 text-dema-muted">{selectedCaseStudy.system}</p>
            </section>
          </div>

          <section className="mt-9 border-t border-dema-line pt-8">
            <h3 className="text-base font-medium text-brand-blue">Le flux de travail</h3>
            <ol className="mt-5 grid gap-px overflow-hidden rounded-[1rem] border border-dema-line bg-dema-line sm:grid-cols-2 lg:grid-cols-3">
              {selectedCaseStudy.flow.map((step, index) => (
                <li key={step} className="min-h-28 bg-dema-paper p-5">
                  <span className="text-xl font-light text-dema-forest/65">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-3 text-sm leading-6 text-brand-blue">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </DirectoryDetailDialogShell>
      ) : null}
    </>
  );
}
