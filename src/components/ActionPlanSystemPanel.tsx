"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import ActionPlanSystemSelector from "@/components/ActionPlanSystemSelector";
import SystemDetailContent from "@/components/SystemDetailContent";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import type { SystemeDetail } from "@/lib/systeme-catalog";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
import type { System } from "@/lib/types";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

type SystemPayload = {
  system: System;
  systeme: SystemeDetail | null;
  intro: string;
  solutionSections: RenderableSolutionSectionDto[];
};

const systemPayloadCache = new Map<string, SystemPayload>();

export default function ActionPlanSystemPanel({
  options,
  selectedSystemId,
  onSystemChange,
  workspace,
  onWorkspaceChange,
  demoMode = false,
}: {
  options: readonly ActionPlanSystemOption[];
  selectedSystemId: string;
  onSystemChange: (systemId: string) => void;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  demoMode?: boolean;
}) {
  const [payload, setPayload] = useState<SystemPayload | null>(null);
  const [error, setError] = useState<{ slug: string; message: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const cacheKey = `${demoMode ? "demo" : "live"}:${selectedSystemId}`;

  useEffect(() => {
    if (!selectedSystemId) {
      return;
    }

    if (systemPayloadCache.has(cacheKey)) return;

    const controller = new AbortController();
    const demoQuery = demoMode ? "?demo=1" : "";

    void fetch(`/api/action-plan/system/${encodeURIComponent(selectedSystemId)}${demoQuery}`, {
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
        systemPayloadCache.set(cacheKey, body);
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
  }, [cacheKey, demoMode, reloadKey, selectedSystemId]);

  const currentPayload =
    systemPayloadCache.get(cacheKey) ??
    (payload?.system.slug === selectedSystemId ? payload : null);
  const currentError = currentPayload
    ? null
    : error?.slug === selectedSystemId
      ? error.message
      : null;

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

      {!selectedSystemId ? (
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper px-6 py-12 text-center">
          <h2 id="action-plan-system-title" className="text-2xl font-light tracking-[-0.03em] text-brand-blue">
            Choisissez votre système métier
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-dema-muted">
            Sélectionnez votre activité parmi les 115 systèmes pour afficher ses processus, ses solutions et ses ressources.
          </p>
        </div>
      ) : null}

      {selectedSystemId && !currentPayload && !currentError ? (
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
        <SystemDetailContent
          embedded
          checkableProcess
          selectableSolutions
          headingAs="h3"
          headingId="action-plan-system-title"
          headerActions={(
            <ActionPlanSystemSelector
              options={options}
              value={selectedSystemId}
              onChange={onSystemChange}
            />
          )}
          intro={currentPayload.intro}
          solutionSections={currentPayload.solutionSections}
          system={currentPayload.system}
          systeme={currentPayload.systeme}
          checkedProcessStepIds={
            workspace.checkedProcessStepIdsBySystem[selectedSystemId] || []
          }
          onCheckedProcessStepIdsChange={(stepIds) => onWorkspaceChange((current) => ({
            ...current,
            checkedProcessStepIdsBySystem: {
              ...current.checkedProcessStepIdsBySystem,
              [selectedSystemId]: [...stepIds],
            },
          }))}
          selectedSolutionPlacementIds={
            workspace.selectedSolutionPlacementIdsBySystem[selectedSystemId] || []
          }
          onSelectedSolutionPlacementIdsChange={(placementIds) => onWorkspaceChange((current) => ({
            ...current,
            selectedSolutionPlacementIdsBySystem: {
              ...current.selectedSolutionPlacementIdsBySystem,
              [selectedSystemId]: [...placementIds],
            },
          }))}
        />
      ) : null}
    </section>
  );
}
