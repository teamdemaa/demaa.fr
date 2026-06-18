"use client";

import Image from "next/image";
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

type DiagnosticAnswer = "yes" | "no" | null;

const responseContent: Record<Exclude<DiagnosticAnswer, null>, { title: string; body: string }> = {
  yes: {
    title: "Bravo. Votre entreprise peut déjà respirer sans vous.",
    body: "",
  },
  no: {
    title: "C'est le signal qu'il faut structurer maintenant.",
    body: "",
  },
};

export default function HomeTabsClient({
  systems,
  detailsBySlug,
}: HomeTabsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState(ALL_SECTORS_LABEL);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [answer, setAnswer] = useState<DiagnosticAnswer>(null);
  const sectorFilters = useMemo(() => {
    const visibleSectors = systems
      .map((system) => detailsBySlug[system.slug]?.sectorLabel)
      .filter((sector): sector is string => Boolean(sector));

    return [ALL_SECTORS_LABEL, ...Array.from(new Set(visibleSectors))];
  }, [detailsBySlug, systems]);

  const effectiveActiveSector = sectorFilters.includes(activeSector) ? activeSector : ALL_SECTORS_LABEL;
  const selectedResponse = answer ? responseContent[answer] : null;
  const searchPlaceholder =
    answer === "yes"
      ? "Entrez votre activité pour renforcer vos systèmes"
      : "Entrez votre activité pour voir les bons systèmes";

  function selectSector(sector: string) {
    setActiveSector(sector);
    setIsFilterPanelOpen(false);
  }

  function handleAnswer(nextAnswer: Exclude<DiagnosticAnswer, null>) {
    setAnswer(nextAnswer);
  }

  const revealDiscovery = Boolean(answer);

  return (
    <>
      <noscript>
        <style>{`
          .demaa-discovery-hidden {
            opacity: 1 !important;
            max-height: none !important;
            overflow: visible !important;
            transform: none !important;
            pointer-events: auto !important;
            margin-top: 0 !important;
          }
        `}</style>
      </noscript>

      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-3 pt-3.5 text-center md:px-8 md:pb-3 md:pt-11">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-[clamp(2.25rem,9vw,4.2rem)] leading-[0.98] tracking-tight">
              <span className="font-sans font-light not-italic text-brand-blue/42">
                Est-ce que votre entreprise tourne
              </span>{" "}
              <span className="demaa-hero-title text-brand-blue/88">
                même quand vous n&apos;êtes pas là ?
              </span>
            </h1>
          </div>

          <div className="flex flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleAnswer("yes")}
              className={`inline-flex min-h-[3.3rem] min-w-0 flex-1 items-center justify-center rounded-full border px-5 text-base font-medium transition sm:min-h-[3.45rem] sm:flex-none sm:px-9 sm:text-lg ${
                answer === "yes"
                  ? "border-dema-forest bg-dema-forest text-dema-paper shadow-[0_10px_24px_rgba(49,95,70,0.18)]"
                  : "border-dema-forest/45 bg-dema-paper text-dema-forest hover:border-dema-forest hover:text-dema-forest"
              }`}
            >
              Oui à peu près
            </button>
            <button
              type="button"
              onClick={() => handleAnswer("no")}
              className={`inline-flex min-h-[3.3rem] min-w-0 flex-1 items-center justify-center rounded-full border px-5 text-base font-medium transition sm:min-h-[3.45rem] sm:flex-none sm:px-9 sm:text-lg ${
                answer === "no"
                  ? "border-dema-forest bg-dema-forest text-dema-paper shadow-[0_10px_24px_rgba(49,95,70,0.18)]"
                  : "border-dema-forest/45 bg-dema-paper text-dema-forest hover:border-dema-forest hover:text-dema-forest"
              }`}
            >
              Non pas encore
            </button>
          </div>

          {selectedResponse ? (
            <div className="mx-auto max-w-3xl">
              <p className="text-base font-semibold text-brand-blue">{selectedResponse.title}</p>
              {selectedResponse.body ? (
                <p className="mt-2 text-sm leading-6 text-brand-blue/62 sm:text-base">
                  {selectedResponse.body}
                </p>
              ) : null}
              <div className="pointer-events-none mt-2 flex justify-center">
                <Image
                  src="/images/home/hand-arrow.png"
                  alt=""
                  aria-hidden="true"
                  width={112}
                  height={70}
                  className="h-12 w-28 object-contain demaa-arrow-nudge"
                />
              </div>
            </div>
          ) : null}

          <div
            className={`demaa-discovery-hidden transition-all duration-500 ease-out ${
              revealDiscovery
                ? "mt-0 max-h-40 translate-y-0 opacity-100"
                : "mt-[-0.75rem] max-h-0 translate-y-2 overflow-hidden opacity-0 pointer-events-none"
            }`}
            aria-hidden={!revealDiscovery}
          >
            <SearchFilterControls
              value={searchQuery}
              placeholder={searchPlaceholder}
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

      <div
        className={`demaa-discovery-hidden transition-all duration-500 ease-out ${
          revealDiscovery
            ? "max-h-[220rem] translate-y-0 opacity-100"
            : "max-h-0 translate-y-3 overflow-hidden opacity-0 pointer-events-none"
        }`}
        aria-hidden={!revealDiscovery}
      >
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
      </div>
    </>
  );
}
