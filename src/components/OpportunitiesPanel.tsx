"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import PublicOpportunitiesClient from "@/components/PublicOpportunitiesClient";
import type { ExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import type { PublicOpportunity } from "@/lib/opportunity-contract";

type OpportunitiesPayload = {
  expertises: ExpertiseCatalogEntry[];
  opportunities: PublicOpportunity[];
};

export default function OpportunitiesPanel({
  initialEmail = "",
}: {
  initialEmail?: string;
}) {
  const [payload, setPayload] = useState<OpportunitiesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/opportunities", {
          cache: "no-store",
          signal: controller.signal,
        });
        const nextPayload = await response.json().catch(() => null) as
          | OpportunitiesPayload
          | null;
        if (!response.ok || !nextPayload) {
          throw new Error("Les opportunités ne sont pas disponibles pour le moment.");
        }
        setPayload(nextPayload);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error
          ? loadError.message
          : "Les opportunités ne sont pas disponibles pour le moment.");
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="opportunities-panel-title">
      <h2 id="opportunities-panel-title" className="sr-only">
        Opportunités
      </h2>

      {!payload && !error ? (
        <div className="mt-8 flex min-h-32 items-center justify-center rounded-[1.2rem] border border-dema-line bg-white text-dema-muted" aria-live="polite">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="ml-3 text-sm">Chargement des opportunités…</span>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-8 rounded-[1.2rem] border border-dema-line bg-white px-5 py-7 text-sm text-dema-muted">
          {error}
        </p>
      ) : null}

      {payload ? (
        <PublicOpportunitiesClient
          expertises={payload.expertises}
          initialEmail={initialEmail}
          opportunities={payload.opportunities}
        />
      ) : null}
    </section>
  );
}
