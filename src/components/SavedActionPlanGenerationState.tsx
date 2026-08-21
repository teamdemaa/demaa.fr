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
import { getActionPlanUiCopy } from "@/lib/action-plan-ui-copy";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { getLocalizedActionPlanPath } from "@/lib/action-plan-localization";
import { buildLocalizedConnexionHref } from "@/lib/localized-auth-path";

export default function SavedActionPlanGenerationState({
  canRetry,
  planId,
  status: initialStatus,
  localeCode = "fr",
}: {
  canRetry: boolean;
  planId: string;
  status: "failed" | "generating";
  localeCode?: InterfaceLocaleCode;
}) {
  const copy = getActionPlanUiCopy(localeCode).generationState;
  const status = initialStatus;
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (status !== "generating") return;
    const controller = new AbortController();
    void watchAuthenticatedActionPlanGeneration(planId, controller.signal, localeCode)
      .then((id) => window.location.replace(getLocalizedActionPlanPath(localeCode, `/plans/${encodeURIComponent(id)}`)))
      .catch((resumeError) => {
        if (resumeError instanceof DOMException && resumeError.name === "AbortError") return;
        if (resumeError instanceof ActionPlanAuthenticationRequiredError) {
          window.location.replace(
            buildLocalizedConnexionHref({
              localeCode,
              returnTo: getLocalizedActionPlanPath(localeCode, `/plans/${planId}`),
            }),
          );
          return;
        }
        if (resumeError instanceof ActionPlanGenerationFailedError) {
          // Reload once so the server renders the persisted failed state and its
          // authoritative canRetry value. A failed page does not re-enter this effect.
          window.location.replace(getLocalizedActionPlanPath(localeCode, `/plans/${encodeURIComponent(planId)}`));
          return;
        }
        setError(copy.statusCheckFailed);
      });
    return () => {
      controller.abort();
    };
  }, [copy.statusCheckFailed, localeCode, planId, status]);

  async function retry() {
    setIsRetrying(true);
    setError(null);
    const controller = new AbortController();
    try {
      const id = await resumeAuthenticatedActionPlanGeneration(planId, controller.signal, localeCode);
      window.location.replace(getLocalizedActionPlanPath(localeCode, `/plans/${encodeURIComponent(id)}`));
    } catch (retryError) {
      if (retryError instanceof ActionPlanAuthenticationRequiredError) {
        window.location.replace(
          buildLocalizedConnexionHref({
            localeCode,
            returnTo: getLocalizedActionPlanPath(localeCode, `/plans/${planId}`),
          }),
        );
        return;
      }
      setError(retryError instanceof Error
        ? retryError.message
        : copy.restartFailed);
      setIsRetrying(false);
    }
  }

  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg rounded-[1.4rem] border border-dema-line bg-dema-paper p-7 text-center shadow-[0_18px_50px_rgba(23,35,29,0.06)] sm:p-9">
        {status === "generating" ? (
          <>
            <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-dema-forest" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-light tracking-[-0.04em]">{copy.inProgress}</h1>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-light tracking-[-0.04em]">{copy.interrupted}</h1>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              {canRetry ? (
                <button
                  type="button"
                  onClick={() => void retry()}
                  disabled={isRetrying}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isRetrying ? copy.retrying : copy.retry}
                </button>
              ) : null}
              <Link
                href={getLocalizedActionPlanPath(localeCode, "/plans/new")}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-dema-line px-5 text-sm font-medium text-brand-blue"
              >
                {copy.newPlan}
              </Link>
            </div>
          </>
        )}
        {error ? <p className="mt-4 text-sm text-dema-forest">{error}</p> : null}
      </section>
    </main>
  );
}
