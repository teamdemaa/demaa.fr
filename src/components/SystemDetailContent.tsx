"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import LeaderDailyRail from "@/components/LeaderDailyRail";
import SystemSolutionsTab from "@/components/SystemSolutionsTab";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
import type { ToolOutboundSurface } from "@/lib/tool-outbound-attribution";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  intro: string;
  initialResourceSlug?: string;
  headingAs?: "h1" | "h2" | "h3";
  headingId?: string;
  solutionSections?: readonly RenderableSolutionSectionDto[];
  toolOutboundSurface?: Extract<ToolOutboundSurface, "action_recommendation" | "solutions">;
  embedded?: boolean;
  selectableSolutions?: boolean;
  selectedSolutionPlacementIds?: readonly string[];
  onSelectedSolutionPlacementIdsChange?: (placementIds: readonly string[]) => void;
  onResourceSlugChange?: (resourceSlug: string | undefined) => void;
  headerActions?: ReactNode;
  comparisonHref?: string;
};

const EMPTY_SOLUTION_SECTIONS: readonly RenderableSolutionSectionDto[] = [];

export default function SystemDetailContent({
  system,
  intro,
  initialResourceSlug,
  headingAs: Heading = "h2",
  headingId,
  solutionSections = EMPTY_SOLUTION_SECTIONS,
  toolOutboundSurface = "solutions",
  embedded = false,
  selectableSolutions = false,
  selectedSolutionPlacementIds,
  onSelectedSolutionPlacementIdsChange,
  onResourceSlugChange,
  headerActions,
  comparisonHref,
}: SystemDetailContentProps) {
  const [localSelectedSolutionIds, setLocalSelectedSolutionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const selectedSolutionIds = selectedSolutionPlacementIds
    ? new Set(selectedSolutionPlacementIds)
    : localSelectedSolutionIds;

  function toggleSolution(placementId: string) {
    const next = new Set(selectedSolutionIds);
    if (next.has(placementId)) next.delete(placementId);
    else next.add(placementId);
    if (onSelectedSolutionPlacementIdsChange) onSelectedSolutionPlacementIdsChange([...next]);
    else setLocalSelectedSolutionIds(next);
  }

  return (
    <article
      className={`w-full ${
        embedded ? "mx-auto max-w-[55.2rem]" : "max-w-[67.5rem]"
      }`}
    >
      {!embedded ? (
        <Link
          href="/solutions"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux solutions
        </Link>
      ) : null}

      <div className="max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Heading
            id={headingId}
            className={embedded
              ? "sr-only"
              : "text-3xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-4xl"}
          >
            {system.name}
          </Heading>
          {headerActions ? <div className="w-full sm:max-w-xs">{headerActions}</div> : null}
        </div>
        {!embedded ? (
          <>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-dema-muted">
              {intro}
            </p>
            <Link
              href={`/systemes/${system.slug}/processus`}
              className="demaa-primary-button mt-5 min-h-10 px-5"
            >
              Voir les processus du métier
            </Link>
          </>
        ) : null}
      </div>

      <div className={`space-y-10 ${embedded ? "mt-1" : "mt-8 sm:mt-9"}`}>
        <h2 className="sr-only">Solutions pour {system.name}</h2>
        <SystemSolutionsTab
          sections={solutionSections}
          initialResourceSlug={initialResourceSlug}
          onResourceSlugChange={onResourceSlugChange}
          selectedPlacementIds={selectableSolutions ? selectedSolutionIds : undefined}
          onToggleSelection={selectableSolutions ? toggleSolution : undefined}
          toolOutboundSurface={toolOutboundSurface}
          comparisonHref={comparisonHref}
        />
        {!embedded ? <LeaderDailyRail /> : null}
      </div>
    </article>
  );
}
