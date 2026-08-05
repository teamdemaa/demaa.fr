"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { type KeyboardEvent, useCallback, useState } from "react";
import OperationalSystemCopyRequestModal from "@/components/OperationalSystemCopyRequestModal";
import SystemCustomOfferCta from "@/components/SystemCustomOfferCta";
import SystemSolutionsTab from "@/components/SystemSolutionsTab";
import SystemeTabContent from "@/components/SystemeTabContent";
import type { SystemeDetail } from "@/lib/systeme-catalog";
import {
  getVisibleSystemDetailTabs,
  getNextSystemDetailTab,
  isVisibleSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import type { SystemResource } from "@/lib/system-resource-catalog";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  systeme: SystemeDetail | null;
  intro: string;
  initialActiveTab?: string;
  headingAs?: "h1" | "h2";
  headingId?: string;
  solutionSections?: readonly RenderableSolutionSectionDto[];
};

const systemTabDefinitions: ReadonlyArray<{
  slug: SystemDetailTab;
  label: string;
}> = [
  { slug: "process", label: "Process" },
  { slug: "solutions", label: "Solutions" },
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
}: SystemDetailContentProps) {
  const router = useRouter();
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
  const [selectedResource, setSelectedResource] = useState<SystemResource | null>(null);
  const closeDeliveryModal = useCallback(() => {
    setSelectedResource(null);
  }, []);

  function selectTab(tab: SystemDetailTab) {
    setActiveTab(tab);
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
    <>
      <article className="w-full max-w-[55.2rem]">
        <Link
          href="/systemes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux systèmes
        </Link>

        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
            Système opérationnel
          </p>
          <Heading
            id={headingId}
            className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-4xl"
          >
            {system.name}
          </Heading>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-dema-muted">
            {intro}
          </p>
        </div>

        <div className="mt-8 flex justify-start sm:mt-9">
          <div
            className="grid w-full grid-cols-2 border-b border-dema-line"
            role="tablist"
            aria-label="Contenu du système opérationnel"
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
            />
          ) : null}

          {activeTab === "solutions" ? (
            <SystemSolutionsTab
              onOpenResource={setSelectedResource}
              sections={solutionSections}
            />
          ) : null}
        </section>
        <SystemCustomOfferCta context={activeTab} systemSlug={system.slug} />
      </article>
      {selectedResource ? (
        <OperationalSystemCopyRequestModal
          resource={selectedResource}
          systemSlug={system.slug}
          onClose={closeDeliveryModal}
        />
      ) : null}
    </>
  );
}
