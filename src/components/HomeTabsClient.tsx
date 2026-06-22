"use client";

import { useMemo, useState } from "react";
import SearchFilterControls from "@/components/SearchFilterControls";
import SystemsCatalogClient from "@/components/SystemsCatalogClient";
import { ALL_SECTORS_LABEL } from "@/lib/public-sectors";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { System } from "@/lib/types";

type HomeTabsClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
};

const SEARCH_PLACEHOLDER =
  "Recherchez votre activité pour trouver les bons systèmes";

export default function HomeTabsClient({
  systems,
  detailsBySlug,
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

  const effectiveActiveSector = sectorFilters.includes(activeSector)
    ? activeSector
    : ALL_SECTORS_LABEL;

  function selectSector(sector: string) {
    setActiveSector(sector);
    setIsFilterPanelOpen(false);
  }

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-6 pt-8 text-center md:px-8 md:pb-8 md:pt-14">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-[clamp(2.4rem,8vw,4.4rem)] leading-[0.96] tracking-tight">
              <span className="demaa-hero-title text-brand-blue/88">
                La Boîte à Outils
              </span>
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/56">
                du Dirigeant
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[13px] leading-relaxed text-dema-muted sm:text-sm md:text-base">
              Tout ce qu&apos;il vous faut pour prendre le contrôle de votre entreprise et croitre sur des bases solides
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <SearchFilterControls
              value={searchQuery}
              placeholder={SEARCH_PLACEHOLDER}
              activeFilter={effectiveActiveSector}
              defaultFilter={ALL_SECTORS_LABEL}
              isFilterOpen={isFilterPanelOpen}
              filters={sectorFilters}
              onChange={setSearchQuery}
              onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
              onFilterSelect={selectSector}
            />
          </div>
        </div>
      </section>

      <SystemsCatalogClient
        systems={systems}
        detailsBySlug={detailsBySlug}
        showIntro={false}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        activeSector={effectiveActiveSector}
        onActiveSectorChange={selectSector}
        showSearchBar={false}
      />
    </>
  );
}
