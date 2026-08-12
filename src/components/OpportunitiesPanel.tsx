"use client";

import { useEffect, useState } from "react";
import PublicOpportunitiesClient from "@/components/PublicOpportunitiesClient";
import {
  publicOpportunitiesSnapshot,
  type PublicOpportunitiesPayload,
} from "@/lib/public-opportunities-snapshot";

export default function OpportunitiesPanel({
  initialEmail = "",
  demoMode = false,
}: {
  initialEmail?: string;
  demoMode?: boolean;
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
          throw new Error("Les opportunités ne sont pas disponibles pour le moment.");
        }
        setPayload(nextPayload);
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
  }, [demoMode]);

  return (
    <section aria-labelledby="opportunities-panel-title">
      <h2 id="opportunities-panel-title" className="sr-only">
        Opportunités
      </h2>

      <PublicOpportunitiesClient
        expertises={payload.expertises}
        initialEmail={initialEmail}
        opportunities={payload.opportunities}
      />
    </section>
  );
}
