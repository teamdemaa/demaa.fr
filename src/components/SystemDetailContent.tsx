"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useMemo, useState } from "react";
import SystemGuidesRail from "@/components/SystemGuidesRail";
import SystemContextualCaseStudy from "@/components/SystemContextualCaseStudy";
import SystemResourcesTab from "@/components/SystemResourcesTab";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import SystemSolutionsTab from "@/components/SystemSolutionsTab";
import SystemeTabContent from "@/components/SystemeTabContent";
import { getSystemResourcesForSystem } from "@/lib/system-resource-catalog";
import { getVisibleContextualAcademyCaseStudy } from "@/lib/academy-case-study-placement";
import type { SystemeDetail } from "@/lib/systeme-catalog";
import {
  getVisibleSystemDetailTabs,
  getNextSystemDetailTab,
  isVisibleSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  systeme: SystemeDetail | null;
  intro: string;
  initialActiveTab?: string;
  headingAs?: "h1" | "h2" | "h3";
  headingId?: string;
  solutionSections?: readonly RenderableSolutionSectionDto[];
  embedded?: boolean;
  checkableProcess?: boolean;
  selectableSolutions?: boolean;
  checkedProcessStepIds?: readonly string[];
  onCheckedProcessStepIdsChange?: (stepIds: readonly string[]) => void;
  selectedSolutionPlacementIds?: readonly string[];
  onSelectedSolutionPlacementIdsChange?: (placementIds: readonly string[]) => void;
  headerActions?: ReactNode;
};

const systemTabDefinitions: ReadonlyArray<{
  slug: SystemDetailTab;
  label: string;
}> = [
  { slug: "process", label: "Process" },
  { slug: "solutions", label: "Solutions" },
  { slug: "resources", label: "Ressources" },
];

const EMPTY_SOLUTION_SECTIONS: readonly RenderableSolutionSectionDto[] = [];

export default function SystemDetailContent({
  system,
  systeme,
  intro,
  initialActiveTab,
  headingAs: Heading = "h2",
  headingId,
  solutionSections = EMPTY_SOLUTION_SECTIONS,
  embedded = false,
  checkableProcess = false,
  selectableSolutions = false,
  checkedProcessStepIds,
  onCheckedProcessStepIdsChange,
  selectedSolutionPlacementIds,
  onSelectedSolutionPlacementIdsChange,
  headerActions,
}: SystemDetailContentProps) {
  const router = useRouter();
  const scopedResources = useMemo(
    () => getSystemResourcesForSystem(system.slug),
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
  const [activeTab, setActiveTab] = useState<SystemDetailTab>(
    isVisibleSystemDetailTab(initialActiveTab) &&
      tabs.some((tab) => tab.slug === initialActiveTab)
      ? initialActiveTab
      : "process",
  );
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
    setActiveTab(tab);
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
    <article className="w-full max-w-[55.2rem]">
      {!embedded ? <Link
        href="/systemes"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux systèmes
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
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-dema-muted">
          {intro}
        </p>
      </div>

      <div className="mt-8 flex justify-start sm:mt-9">
        <div
          className="grid w-full grid-cols-3 border-b border-dema-line"
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
          <SystemSolutionsTab
            sections={solutionSections}
            selectedPlacementIds={selectableSolutions ? selectedSolutionIds : undefined}
            onToggleSelection={selectableSolutions ? toggleSolution : undefined}
          />
        ) : null}

        {activeTab === "resources" ? (
          <div className="space-y-10">
            <SystemResourcesTab
              resources={scopedResources.filter((resource) => resource.format === "template")}
              systemSlug={system.slug}
            />
            {contextualCaseStudy ? (
              <SystemContextualCaseStudy content={contextualCaseStudy} />
            ) : null}
            <SystemGuidesRail
              resources={scopedResources.filter((resource) => resource.format === "guide")}
              systemSlug={system.slug}
            />
            {!embedded ? <StructureNewsletterBlock /> : null}
          </div>
        ) : null}
      </section>
    </article>
  );
}
