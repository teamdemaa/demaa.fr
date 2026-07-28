"use client";

import { Suspense } from "react";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";

export default function SystemDiagnosticCta({
  systemSlug,
}: {
  systemSlug: string;
}) {
  return (
    <aside
      className="mt-7 flex flex-col gap-4 rounded-[1.15rem] border border-dema-line bg-dema-paper px-5 py-5 shadow-[0_8px_24px_rgba(23,35,29,0.03)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
      aria-labelledby="system-diagnostic-heading"
    >
      <div className="min-w-0">
        <h2
          id="system-diagnostic-heading"
          className="text-base font-semibold tracking-[-0.015em] text-brand-blue"
        >
          Diagnostic offert
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-dema-muted">
          Faites le point sur vos priorités avec un spécialiste Demaa.
        </p>
      </div>

      <Suspense
        fallback={
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper opacity-60"
          >
            Demander mon diagnostic
          </button>
        }
      >
        <OrganisationSessionBookingButton
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
          label="Demander mon diagnostic"
          source="Système opérationnel"
          systemSlug={systemSlug}
        />
      </Suspense>
    </aside>
  );
}
