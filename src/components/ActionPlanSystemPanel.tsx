"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import ActionPlanSystemSelector from "@/components/ActionPlanSystemSelector";
import SystemShareControl from "@/components/SystemShareControl";
import SystemResourcesTab from "@/components/SystemResourcesTab";
import SystemSolutionsTab from "@/components/SystemSolutionsTab";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import {
  getActionPlanSystemPayloadCacheKey,
  invalidateActionPlanSystemPayload,
  loadActionPlanSystemPayload,
  readCachedActionPlanSystemPayload,
  type ActionPlanSystemPayload,
} from "@/lib/action-plan-system-payload.client";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

export default function ActionPlanSystemPanel({
  options,
  selectedSystemId,
  onSystemChange,
  workspace,
  onWorkspaceChange,
  demoMode = false,
  initialResourceSlug,
  onResourceSlugChange,
  onToggleSolutionSelection,
}: {
  options: readonly ActionPlanSystemOption[];
  selectedSystemId: string;
  onSystemChange: (systemId: string) => void;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  demoMode?: boolean;
  initialResourceSlug?: string;
  onResourceSlugChange?: (resourceSlug: string | undefined) => void;
  onToggleSolutionSelection?: (placementId: string) => void;
}) {
  const [payload, setPayload] = useState<ActionPlanSystemPayload | null>(null);
  const [error, setError] = useState<{ slug: string; message: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const cacheKey = getActionPlanSystemPayloadCacheKey(
    selectedSystemId,
    demoMode,
  );
  const savedSystems = workspace.savedSystemIds
    .map((id) => options.find((option) => option.id === id))
    .filter((option): option is ActionPlanSystemOption => Boolean(option));

  function selectSystem(systemId: string) {
    onSystemChange(systemId);
    onWorkspaceChange((current) => ({
      ...current,
      selectedSystemId: systemId,
      savedSystemIds: current.savedSystemIds.includes(systemId)
        ? current.savedSystemIds
        : [...current.savedSystemIds, systemId],
    }));
  }

  useEffect(() => {
    if (!selectedSystemId) {
      return;
    }

    const cached = readCachedActionPlanSystemPayload(cacheKey);
    if (cached) return;

    let active = true;
    void loadActionPlanSystemPayload({
      cacheKey,
      demoMode,
      systemId: selectedSystemId,
    })
      .then((body) => {
        if (!active) return;
        setPayload(body);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        setError({
          slug: selectedSystemId,
          message:
            fetchError instanceof Error
              ? fetchError.message
              : "Impossible de charger ce système métier.",
        });
      });

    return () => {
      active = false;
    };
  }, [cacheKey, demoMode, reloadKey, selectedSystemId]);

  const currentPayload =
    readCachedActionPlanSystemPayload(cacheKey) ??
    (payload?.system.slug === selectedSystemId ? payload : null);
  const currentError = currentPayload
    ? null
    : error?.slug === selectedSystemId
      ? error.message
      : null;

  return (
    <section aria-label="Système" className="pt-3">
      <div className="mx-auto mb-6 w-full max-w-xl xl:w-[min(40vw,36rem)]">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <ActionPlanSystemSelector
              options={options}
              value={selectedSystemId}
              onChange={selectSystem}
            />
          </div>
          {currentPayload ? (
            <SystemShareControl
              systemName={currentPayload.system.name}
              systemSlug={currentPayload.system.slug}
            />
          ) : null}
        </div>
        {savedSystems.length > 1 ? (
          <div className="mt-2 flex flex-wrap justify-center gap-1.5" aria-label="Systèmes enregistrés">
            {savedSystems.map((system) => (
              <button
                key={system.id}
                type="button"
                onClick={() => selectSystem(system.id)}
                aria-pressed={system.id === selectedSystemId}
                className={`rounded-full px-3 py-1 text-xs transition ${system.id === selectedSystemId ? "bg-dema-sage text-dema-forest" : "text-dema-muted hover:text-dema-forest"}`}
              >
                {system.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {!selectedSystemId ? (
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper px-6 py-12 text-center">
          <h2 id="action-plan-system-title" className="text-2xl font-light tracking-[-0.03em] text-brand-blue">
            Choisissez votre système métier
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-dema-muted">
            Sélectionnez votre activité parmi les 115 systèmes pour afficher ses solutions.
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
            onClick={() => {
              invalidateActionPlanSystemPayload(cacheKey);
              setReloadKey((value) => value + 1);
            }}
            className="demaa-secondary-button mt-4 min-h-11 gap-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réessayer
          </button>
        </div>
      ) : null}

      {currentPayload ? (
        <div className="space-y-10">
          <SystemSolutionsTab
            sections={currentPayload.solutionSections}
            initialResourceSlug={initialResourceSlug}
            onResourceSlugChange={onResourceSlugChange}
            selectedPlacementIds={
              new Set(workspace.selectedSolutionPlacementIdsBySystem[selectedSystemId] || [])
            }
            onToggleSelection={onToggleSolutionSelection ?? ((placementId) => onWorkspaceChange((current) => {
              const selected = new Set(
                current.selectedSolutionPlacementIdsBySystem[selectedSystemId] || [],
              );
              if (selected.has(placementId)) selected.delete(placementId);
              else selected.add(placementId);
              return {
                ...current,
                selectedSolutionPlacementIdsBySystem: {
                  ...current.selectedSolutionPlacementIdsBySystem,
                  [selectedSystemId]: [...selected],
                },
              };
            }))}
          />
          <SystemResourcesTab
            initialResourceSlug={initialResourceSlug}
            layout="rail"
            onResourceSlugChange={onResourceSlugChange}
            resources={currentPayload.resources}
            systemSlug={currentPayload.system.slug}
          />
        </div>
      ) : null}
    </section>
  );
}
