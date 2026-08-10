"use client";

import { ExternalLink, LoaderCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ActionPlanSystemSelector from "@/components/ActionPlanSystemSelector";
import SystemDetailContent from "@/components/SystemDetailContent";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import type { SystemeDetail } from "@/lib/systeme-catalog";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
import type { System } from "@/lib/types";

type SystemPayload = {
  system: System;
  systeme: SystemeDetail | null;
  intro: string;
  solutionSections: RenderableSolutionSectionDto[];
};

export default function ActionPlanSystemPanel({
  options,
  selectedSystemId,
  onSystemChange,
}: {
  options: readonly ActionPlanSystemOption[];
  selectedSystemId: string;
  onSystemChange: (systemId: string) => void;
}) {
  const [payload, setPayload] = useState<SystemPayload | null>(null);
  const [error, setError] = useState<{ slug: string; message: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/action-plan/system/${encodeURIComponent(selectedSystemId)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as
          | SystemPayload
          | { error?: string }
          | null;
        if (!response.ok || !body || !("system" in body)) {
          throw new Error(
            body && "error" in body && body.error
              ? body.error
              : "Impossible de charger ce système métier.",
          );
        }
        setPayload(body);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError({
          slug: selectedSystemId,
          message:
            fetchError instanceof Error
              ? fetchError.message
              : "Impossible de charger ce système métier.",
        });
      });

    return () => controller.abort();
  }, [reloadKey, selectedSystemId]);

  const currentPayload = payload?.system.slug === selectedSystemId ? payload : null;
  const currentError = error?.slug === selectedSystemId ? error.message : null;

  return (
    <section aria-labelledby="action-plan-system-title">
      {!currentPayload ? (
        <div className="mb-5 flex justify-end">
          <ActionPlanSystemSelector
            options={options}
            value={selectedSystemId}
            onChange={onSystemChange}
          />
        </div>
      ) : null}

      {!currentPayload && !currentError ? (
        <div className="flex min-h-48 items-center justify-center rounded-[1.25rem] border border-dema-line bg-dema-paper text-sm text-dema-muted">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Chargement du système métier…
        </div>
      ) : null}

      {currentError ? (
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 text-center">
          <p className="text-sm text-dema-muted">{currentError}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="demaa-secondary-button mt-4 min-h-11 gap-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réessayer
          </button>
        </div>
      ) : null}

      {currentPayload ? (
        <>
          <SystemDetailContent
            embedded
            checkableProcess
            selectableSolutions
            headingAs="h3"
            headingId="action-plan-system-title"
            headerActions={
              <ActionPlanSystemSelector
                options={options}
                value={selectedSystemId}
                onChange={onSystemChange}
              />
            }
            intro={currentPayload.intro}
            solutionSections={currentPayload.solutionSections}
            system={currentPayload.system}
            systeme={currentPayload.systeme}
          />
          <Link
            href={`/systemes/${currentPayload.system.slug}`}
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-dema-forest underline decoration-dema-forest/25 underline-offset-4"
          >
            Ouvrir la fiche complète
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </>
      ) : null}
    </section>
  );
}
