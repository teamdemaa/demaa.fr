"use client";

import { CalendarDays } from "lucide-react";
import type { PublicLiveTraining } from "@/lib/live-session-catalog";

export default function AcademyLiveTrainingSection({
  trainings,
}: {
  trainings: readonly PublicLiveTraining[];
}) {
  if (trainings.length === 0) return null;

  return (
    <section className="mt-12 border-t border-dema-line/75 pt-9 md:mt-14 md:pt-10" aria-labelledby="academy-live-title">
      <h2 id="academy-live-title" className="text-2xl font-semibold text-brand-blue md:text-[2rem]">
        Webinaires
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
        Des sessions de 2 h en petit groupe, à 250 € HT. Les créneaux seront publiés après leur validation par Demaa.
      </p>
      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {trainings.map((training) => (
          <article key={training.slug} className="flex min-h-[20rem] flex-col rounded-[1.25rem] border border-[#E7EBE8] bg-[#F1F3F0] p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-dema-forest">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-semibold leading-snug text-brand-blue">{training.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">{training.description}</p>
            <p className="mt-4 text-xs font-medium text-dema-forest">Dates à venir</p>
            <div className="mt-auto pt-6">
              <p className="text-sm font-semibold text-brand-blue">2 h · 250 € HT</p>
              <span className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-dema-line bg-white px-5 py-3 text-sm font-semibold text-dema-muted" aria-disabled="true">
                Inscriptions bientôt ouvertes
              </span>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-dema-muted">
        Demaa coordonne les inscriptions et la facturation. Aucun paiement en ligne n’est demandé.
      </p>
    </section>
  );
}
