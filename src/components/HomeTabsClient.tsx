"use client";

import { useMemo, useState } from "react";
import PrimaryMobileNav, { type PrimaryNavTab } from "@/components/PrimaryMobileNav";
import SearchFilterControls from "@/components/SearchFilterControls";
import SystemsCatalogClient from "@/components/SystemsCatalogClient";
import { ALL_SECTORS_LABEL } from "@/lib/public-sectors";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { System } from "@/lib/types";

type HomeTabsClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  initialSystem?: string;
  initialSystemTab?: string;
};

export default function HomeTabsClient({
  systems,
  detailsBySlug,
  initialSystem,
  initialSystemTab,
}: HomeTabsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState(ALL_SECTORS_LABEL);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const sectorFilters = useMemo(() => {
    const visibleSectors = systems
      .map((system) => detailsBySlug[system.slug]?.sectorLabel)
      .filter((sector): sector is string => Boolean(sector));

    return [ALL_SECTORS_LABEL, ...Array.from(new Set(visibleSectors))];
  }, [detailsBySlug, systems]);

  const effectiveActiveSector = sectorFilters.includes(activeSector) ? activeSector : ALL_SECTORS_LABEL;

  function selectPrimaryMobileTab(tab: PrimaryNavTab) {
    if (tab === "analyser") {
      window.history.replaceState(null, "", "/");
      setSearchQuery("");
      setActiveSector(ALL_SECTORS_LABEL);
    }
  }

  function selectSector(sector: string) {
    setActiveSector(sector);
    setIsFilterPanelOpen(false);
  }

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-3 pt-5 text-center md:px-8 md:pb-3 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <PrimaryMobileNav activeTab="analyser" onSelect={selectPrimaryMobileTab} />

          <div className="mx-auto max-w-5xl">
            <h1 className="text-[clamp(3rem,14.5vw,3.36rem)] tracking-tight leading-[0.92] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              <span className="demaa-hero-title text-brand-blue/86">
                Analysez
              </span>{" "}
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/44">
                votre organisation
              </span>
            </h1>
          </div>

          <SearchFilterControls
            value={searchQuery}
            placeholder="Rechercher votre activité"
            activeFilter={effectiveActiveSector}
            defaultFilter={ALL_SECTORS_LABEL}
            isFilterOpen={isFilterPanelOpen}
            filters={sectorFilters}
            onChange={setSearchQuery}
            onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
            onFilterSelect={selectSector}
          />
        </div>
      </section>

      <SystemsCatalogClient
        key={`systems-${initialSystem ?? "none"}-${initialSystemTab ?? "processus"}`}
        systems={systems}
        detailsBySlug={detailsBySlug}
        showIntro={false}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        activeSector={effectiveActiveSector}
        onActiveSectorChange={selectSector}
        showSearchBar={false}
        initialSelectedSlug={initialSystem}
        initialActiveTab={initialSystemTab}
      />
    </>
  );
}
