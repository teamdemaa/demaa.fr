"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ActionPlanAuthenticationRequiredError,
  ActionPlanGenerationFailedError,
  resumeAuthenticatedActionPlanGeneration,
  watchAuthenticatedActionPlanGeneration,
} from "@/lib/action-plan-generation.client";

export default function SavedActionPlanGenerationState({
  canRetry,
  planId,
  status: initialStatus,
}: {
  canRetry: boolean;
  planId: string;
  status: "failed" | "generating";
}) {
  const status = initialStatus;
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (status !== "generating") return;
    const controller = new AbortController();
    void watchAuthenticatedActionPlanGeneration(planId, controller.signal)
      .then((id) => window.location.replace(`/plans/${encodeURIComponent(id)}`))
      .catch((resumeError) => {
        if (resumeError instanceof DOMException && resumeError.name === "AbortError") return;
        if (resumeError instanceof ActionPlanAuthenticationRequiredError) {
          window.location.replace(
            `/connexion?returnTo=${encodeURIComponent(`/plans/${planId}`)}`,
          );
          return;
        }
        if (resumeError instanceof ActionPlanGenerationFailedError) {
          // Reload once so the server renders the persisted failed state and its
          // authoritative canRetry value. A failed page does not re-enter this effect.
          window.location.replace(`/plans/${encodeURIComponent(planId)}`);
          return;
        }
        setError("Impossible de vérifier la génération pour le moment.");
      });
    return () => {
      controller.abort();
    };
  }, [planId, status]);

  async function retry() {
    setIsRetrying(true);
    setError(null);
    const controller = new AbortController();
    try {
      const id = await resumeAuthenticatedActionPlanGeneration(planId, controller.signal);
      window.location.replace(`/plans/${encodeURIComponent(id)}`);
    } catch (retryError) {
      if (retryError instanceof ActionPlanAuthenticationRequiredError) {
        window.location.replace(
          `/connexion?returnTo=${encodeURIComponent(`/plans/${planId}`)}`,
        );
        return;
      }
      setError(retryError instanceof Error
        ? retryError.message
        : "La génération n’a pas pu redémarrer.");
      setIsRetrying(false);
    }
  }

  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg rounded-[1.4rem] border border-dema-line bg-dema-paper p-7 text-center shadow-[0_18px_50px_rgba(23,35,29,0.06)] sm:p-9">
        {status === "generating" ? (
          <>
            <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-dema-forest" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-light tracking-[-0.04em]">Génération en cours</h1>
            <p className="mt-3 text-sm leading-relaxed text-dema-muted">
              Votre plan est enregistré et continue d’être préparé.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-light tracking-[-0.04em]">Génération interrompue</h1>
            <p className="mt-3 text-sm leading-relaxed text-dema-muted">
              Votre demande est conservée. Vous pouvez reprendre la génération sans créer de doublon.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              {canRetry ? (
                <button
                  type="button"
                  onClick={() => void retry()}
                  disabled={isRetrying}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isRetrying ? "Nouvelle tentative…" : "Réessayer"}
                </button>
              ) : null}
              <Link
                href="/plans/new"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-dema-line px-5 text-sm font-medium text-brand-blue"
              >
                Nouveau plan
              </Link>
            </div>
          </>
        )}
        {error ? <p className="mt-4 text-sm text-dema-forest">{error}</p> : null}
      </section>
    </main>
  );
}
