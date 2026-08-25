"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useMemo, useState } from "react";
import LeaderDailyRail from "@/components/LeaderDailyRail";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import SystemContextualCaseStudy from "@/components/SystemContextualCaseStudy";
import SystemResourcesTab from "@/components/SystemResourcesTab";
import SystemSolutionNextSteps from "@/components/SystemSolutionNextSteps";
import SystemSolutionsTab from "@/components/SystemSolutionsTab";
import SystemeTabContent from "@/components/SystemeTabContent";
import { getVisibleContextualAcademyCaseStudy } from "@/lib/academy-case-study-placement";
import { getAvailableSystemTemplatesForSystem } from "@/lib/system-resource-catalog";
import type { SystemeDetail } from "@/lib/systeme-catalog";
import {
  getVisibleSystemDetailTabs,
  getNextSystemDetailTab,
  isVisibleSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
import type { ToolOutboundSurface } from "@/lib/tool-outbound-attribution";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  systeme: SystemeDetail | null;
  intro: string;
  activeTab?: SystemDetailTab;
  initialActiveTab?: string;
  initialResourceSlug?: string;
  headingAs?: "h1" | "h2" | "h3";
  headingId?: string;
  solutionSections?: readonly RenderableSolutionSectionDto[];
  toolOutboundSurface?: Extract<ToolOutboundSurface, "action_recommendation" | "solutions">;
  embedded?: boolean;
  checkableProcess?: boolean;
  selectableSolutions?: boolean;
  checkedProcessStepIds?: readonly string[];
  onCheckedProcessStepIdsChange?: (stepIds: readonly string[]) => void;
  selectedSolutionPlacementIds?: readonly string[];
  onSelectedSolutionPlacementIdsChange?: (placementIds: readonly string[]) => void;
  onActiveTabChange?: (tab: SystemDetailTab) => void;
  onResourceSlugChange?: (resourceSlug: string | undefined) => void;
  headerActions?: ReactNode;
};

const systemTabDefinitions: ReadonlyArray<{
  slug: SystemDetailTab;
  label: string;
}> = [
  { slug: "solutions", label: "Solutions" },
  { slug: "process", label: "Organisation" },
];

const EMPTY_SOLUTION_SECTIONS: readonly RenderableSolutionSectionDto[] = [];

export default function SystemDetailContent({
  system,
  systeme,
  intro,
  activeTab: controlledActiveTab,
  initialActiveTab,
  initialResourceSlug,
  headingAs: Heading = "h2",
  headingId,
  solutionSections = EMPTY_SOLUTION_SECTIONS,
  toolOutboundSurface = "solutions",
  embedded = false,
  checkableProcess = false,
  selectableSolutions = false,
  checkedProcessStepIds,
  onCheckedProcessStepIdsChange,
  selectedSolutionPlacementIds,
  onSelectedSolutionPlacementIdsChange,
  onActiveTabChange,
  onResourceSlugChange,
  headerActions,
}: SystemDetailContentProps) {
  const router = useRouter();
  const scopedResources = useMemo(
    () => getAvailableSystemTemplatesForSystem(system.slug),
    [system.slug],
  );
  const contextualCaseStudy = useMemo(
    () => getVisibleContextualAcademyCaseStudy(system.slug),
    [system.slug],
  );
  const visibleTabSlugs = getVisibleSystemDetailTabs();
  const tabs = systemTabDefinitions.filter((tab) =>
    visibleTabSlugs.includes(tab.slug),
  );
  const [localActiveTab, setLocalActiveTab] = useState<SystemDetailTab>(
    isVisibleSystemDetailTab(initialActiveTab) &&
      tabs.some((tab) => tab.slug === initialActiveTab)
      ? initialActiveTab
      : embedded ? "process" : "solutions",
  );
  const activeTab = controlledActiveTab && tabs.some((tab) => tab.slug === controlledActiveTab)
    ? controlledActiveTab
    : localActiveTab;
  const [localCheckedProcessSteps, setLocalCheckedProcessSteps] = useState<Set<string>>(
    () => new Set(),
  );
  const [localSelectedSolutionIds, setLocalSelectedSolutionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const checkedProcessSteps = checkedProcessStepIds
    ? new Set(checkedProcessStepIds)
    : localCheckedProcessSteps;
  const selectedSolutionIds = selectedSolutionPlacementIds
    ? new Set(selectedSolutionPlacementIds)
    : localSelectedSolutionIds;

  function toggleProcessStep(stepId: string) {
    const next = new Set(checkedProcessSteps);
    if (next.has(stepId)) next.delete(stepId);
    else next.add(stepId);
    if (onCheckedProcessStepIdsChange) onCheckedProcessStepIdsChange([...next]);
    else setLocalCheckedProcessSteps(next);
  }

  function toggleSolution(placementId: string) {
    const next = new Set(selectedSolutionIds);
    if (next.has(placementId)) next.delete(placementId);
    else next.add(placementId);
    if (onSelectedSolutionPlacementIdsChange) onSelectedSolutionPlacementIdsChange([...next]);
    else setLocalSelectedSolutionIds(next);
  }
  function selectTab(tab: SystemDetailTab) {
    if (!controlledActiveTab) setLocalActiveTab(tab);
    onActiveTabChange?.(tab);
    if (embedded) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.searchParams.delete("service");
    router.replace(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentTab: SystemDetailTab,
  ) {
    const nextTab = getNextSystemDetailTab(
      currentTab,
      event.key,
    );
    if (!nextTab) return;

    event.preventDefault();
    selectTab(nextTab);
    requestAnimationFrame(() => {
      document.getElementById(`tab-${nextTab}`)?.focus();
    });
  }

  return (
    <article className={`w-full max-w-[55.2rem] ${embedded ? "mx-auto" : ""}`}>
      {!embedded ? <Link
        href="/solutions"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux solutions
      </Link> : null}

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
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-dema-muted">
            {intro}
          </p>
        ) : null}
      </div>

      <div className={`flex justify-start ${embedded ? "mt-1" : "mt-8 sm:mt-9"}`}>
        <div
          className="grid w-full grid-cols-2 border-b border-dema-line"
          role="tablist"
          aria-label="Contenu du système métier"
          aria-orientation="horizontal"
        >
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              id={`tab-${tab.slug}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.slug}
              aria-controls="kit-content-panel"
              tabIndex={activeTab === tab.slug ? 0 : -1}
              onClick={() => selectTab(tab.slug)}
              onKeyDown={(event) => handleTabKeyDown(event, tab.slug)}
              className={`-mb-px min-h-11 min-w-0 whitespace-nowrap border-b-2 px-2 py-2.5 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:px-4 sm:text-sm ${
                activeTab === tab.slug
                  ? "border-dema-forest font-semibold text-dema-forest"
                  : "border-transparent font-medium text-dema-muted hover:border-dema-forest/25 hover:text-brand-blue"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section
        id="kit-content-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="mt-7"
      >
        {activeTab === "process" ? (
          <SystemeTabContent
            systemName={system.name}
            systeme={systeme}
            checkedStepIds={checkableProcess ? checkedProcessSteps : undefined}
            onToggleStep={checkableProcess ? toggleProcessStep : undefined}
          />
        ) : null}

        {activeTab === "solutions" ? (
          <div className="space-y-10">
            <h2 className="sr-only">Solutions pour {system.name}</h2>
            <SystemSolutionsTab
              sections={solutionSections}
              initialResourceSlug={initialResourceSlug}
              onResourceSlugChange={onResourceSlugChange}
              selectedPlacementIds={selectableSolutions ? selectedSolutionIds : undefined}
              onToggleSelection={selectableSolutions ? toggleSolution : undefined}
              toolOutboundSurface={toolOutboundSurface}
            />
            <SystemResourcesTab
              layout="rail"
              resources={scopedResources}
              systemSlug={system.slug}
            />
            {contextualCaseStudy ? (
              <SystemContextualCaseStudy content={contextualCaseStudy} />
            ) : null}
            {!embedded ? <StructureNewsletterBlock /> : null}
            {!embedded ? <LeaderDailyRail /> : null}
            {!embedded ? (
              <SystemSolutionNextSteps systemId={system.slug} systemName={system.name} />
            ) : null}
          </div>
        ) : null}
      </section>
    </article>
  );
}
