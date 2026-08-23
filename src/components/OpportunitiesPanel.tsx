"use client";

import { useEffect, useState } from "react";
import PublicOpportunitiesClient from "@/components/PublicOpportunitiesClient";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import {
  preserveOpportunityEnrichment,
  publicOpportunitiesSnapshot,
  type PublicOpportunitiesPayload,
} from "@/lib/public-opportunities-snapshot";

export default function OpportunitiesPanel({
  initialEmail = "",
  demoMode = false,
  initialOpportunityId,
  localeCode = "fr",
  onOpportunityChange,
}: {
  initialEmail?: string;
  demoMode?: boolean;
  initialOpportunityId?: string;
  localeCode?: InterfaceLocaleCode;
  onOpportunityChange?: (opportunityId?: string) => void;
}) {
  const [payload, setPayload] = useState<PublicOpportunitiesPayload>(
    publicOpportunitiesSnapshot,
  );

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          demoMode ? "/api/opportunities?demo=1" : "/api/opportunities",
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const nextPayload = await response.json().catch(() => null) as
          | PublicOpportunitiesPayload
          | null;
        if (!response.ok || !nextPayload) {
          throw new Error(
            localeCode === "en"
              ? "Opportunities are not available right now."
              : "Les annonces ne sont pas disponibles pour le moment.",
          );
        }
        setPayload({
          ...nextPayload,
          opportunities: preserveOpportunityEnrichment(nextPayload.opportunities),
        });
      } catch (loadError) {
        if (controller.signal.aborted) return;
        // The bundled snapshot remains visible. Firebase will be retried the
        // next time this panel is mounted, without blocking the user.
        if (process.env.NODE_ENV !== "production") {
          console.info("Opportunities background refresh unavailable", loadError);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [demoMode, localeCode]);

  return (
    <section aria-labelledby="opportunities-panel-title">
      <h2 id="opportunities-panel-title" className="sr-only">
        {localeCode === "en" ? "Opportunities" : "Annonces"}
      </h2>

      <PublicOpportunitiesClient
        expertises={payload.expertises}
        initialEmail={initialEmail}
        initialOpportunityId={initialOpportunityId}
        onOpportunityChange={onOpportunityChange}
        opportunities={payload.opportunities}
      />
    </section>
  );
}
