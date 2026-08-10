"use client";

import dynamic from "next/dynamic";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { AcademyContentDefinition } from "@/lib/academy-course-content";
import type { PublicLiveTraining } from "@/lib/live-session-catalog";

const AcademyIndexClient = dynamic(
  () => import("@/components/AcademyIndexClient"),
  {
    loading: () => (
      <div className="flex min-h-64 items-center justify-center text-sm text-dema-muted">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        Chargement de l’Académie…
      </div>
    ),
  },
);

type AcademyPayload = {
  contents: AcademyContentDefinition[];
  liveTrainings: PublicLiveTraining[];
};

export default function ActionPlanAcademyPanel() {
  const [payload, setPayload] = useState<AcademyPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/action-plan/academy", { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as
          | AcademyPayload
          | { error?: string }
          | null;

        if (!response.ok || !body || !("contents" in body)) {
          throw new Error("Impossible de charger l’Académie.");
        }

        setPayload(body);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Impossible de charger l’Académie.",
        );
      });

    return () => controller.abort();
  }, [reloadKey]);

  if (error) {
    return (
      <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-8 text-center">
        <p className="text-sm text-dema-muted">{error}</p>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="demaa-secondary-button mt-4 min-h-11 gap-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-dema-muted">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        Chargement de l’Académie…
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <AcademyIndexClient
        contents={payload.contents}
        liveTrainings={payload.liveTrainings}
        embedded
      />
    </div>
  );
}
