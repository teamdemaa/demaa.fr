"use client";

import { Suspense } from "react";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";

export default function SystemProcessCallCta({
  systemSlug,
}: {
  systemSlug: string;
}) {
  return (
    <aside
      className="mt-7 flex flex-col gap-4 rounded-[1.15rem] border border-dema-line bg-dema-paper px-5 py-5 shadow-[0_8px_24px_rgba(23,35,29,0.03)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
      aria-labelledby="system-process-call-heading"
    >
      <div className="min-w-0">
        <h2
          id="system-process-call-heading"
          className="text-base font-semibold tracking-[-0.015em] text-brand-blue"
        >
          Un appel gratuit de 30 minutes
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-dema-muted">
          Faites le point avec un spécialiste pour que votre entreprise ne
          dépende pas uniquement de vous au quotidien.
        </p>
      </div>

      <Suspense
        fallback={
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper opacity-60"
          >
            Réserver mon appel gratuit
          </button>
        }
      >
        <OrganisationSessionBookingButton
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
          label="Réserver mon appel gratuit"
          source="Système opérationnel - Process"
          systemSlug={systemSlug}
        />
      </Suspense>
    </aside>
  );
}
