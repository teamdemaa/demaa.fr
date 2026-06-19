"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import SearchFilterControls from "@/components/SearchFilterControls";
import SystemsCatalogClient from "@/components/SystemsCatalogClient";
import {
  HOME_DISCOVERY_UNLOCKED_EVENT,
  readHomeDiscoveryState,
  writeHomeDiscoveryState,
  type HomeDiscoveryAnswer,
} from "@/lib/home-discovery";
import { ALL_SECTORS_LABEL } from "@/lib/public-sectors";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { System } from "@/lib/types";

type HomeTabsClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
};

type DiagnosticAnswer = HomeDiscoveryAnswer | null;

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
  const [typedTitle, setTypedTitle] = useState("");
  const [isRestoredFromStorage, setIsRestoredFromStorage] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [showDiscoveryControls, setShowDiscoveryControls] = useState(false);
  const [showSystems, setShowSystems] = useState(false);
  const [isDiscoveryInitialized, setIsDiscoveryInitialized] = useState(false);
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

  useLayoutEffect(() => {
    const storedState = readHomeDiscoveryState();
    const restoreTimer = window.setTimeout(() => {
      if (storedState?.seen) {
        const storedResponse = responseContent[storedState.answer];

        setIsRestoredFromStorage(true);
        setAnswer(storedState.answer);
        setTypedTitle(storedResponse.title);
        setShowArrow(true);
        setShowDiscoveryControls(true);
        setShowSystems(true);
      }

      setIsDiscoveryInitialized(true);
    }, 0);

    return () => {
      window.clearTimeout(restoreTimer);
    };
  }, []);

  useEffect(() => {
    if (
      !selectedResponse ||
      !isDiscoveryInitialized ||
      isRestoredFromStorage ||
      typedTitle === selectedResponse.title
    ) {
      return;
    }

    const fullTitle = selectedResponse.title;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const revealImmediately = window.setTimeout(() => {
        setTypedTitle(fullTitle);
        setShowArrow(true);
      }, 0);

      return () => {
        window.clearTimeout(revealImmediately);
      };
    }

    let titleIndex = 0;
    let typingTimer: number | null = null;
    let arrowTimer: number | null = null;
    const frameDelay = fullTitle.length > 50 ? 34 : 42;
    const typingStart = window.setTimeout(() => {
      typingTimer = window.setInterval(() => {
        titleIndex += 1;
        setTypedTitle(fullTitle.slice(0, titleIndex));

        if (titleIndex >= fullTitle.length) {
          if (typingTimer) {
            window.clearInterval(typingTimer);
          }
          arrowTimer = window.setTimeout(() => {
            setShowArrow(true);
          }, 420);
        }
      }, frameDelay);
    }, 220);

    return () => {
      window.clearTimeout(typingStart);
      if (typingTimer) {
        window.clearInterval(typingTimer);
      }
      if (arrowTimer) {
        window.clearTimeout(arrowTimer);
      }
    };
  }, [isDiscoveryInitialized, isRestoredFromStorage, selectedResponse, typedTitle]);

  useEffect(() => {
    if (!selectedResponse || !showArrow) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const revealImmediately = window.setTimeout(() => {
        setShowDiscoveryControls(true);
        setShowSystems(true);
      }, 0);

      return () => {
        window.clearTimeout(revealImmediately);
      };
    }

    const controlsTimer = window.setTimeout(() => {
      setShowDiscoveryControls(true);
    }, 320);

    const systemsTimer = window.setTimeout(() => {
      setShowSystems(true);
    }, 760);

    return () => {
      window.clearTimeout(controlsTimer);
      window.clearTimeout(systemsTimer);
    };
  }, [selectedResponse, showArrow]);

  function selectSector(sector: string) {
    setActiveSector(sector);
    setIsFilterPanelOpen(false);
  }

  function handleAnswer(nextAnswer: Exclude<DiagnosticAnswer, null>) {
    setIsRestoredFromStorage(false);
    setTypedTitle("");
    setShowArrow(false);
    setShowDiscoveryControls(false);
    setShowSystems(false);
    setAnswer(nextAnswer);
    writeHomeDiscoveryState(nextAnswer);
    window.dispatchEvent(new Event(HOME_DISCOVERY_UNLOCKED_EVENT));
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

      <section
        className={`ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 text-center transition-[padding,opacity] duration-[1200ms] [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] md:px-8 ${
          isDiscoveryInitialized ? "opacity-100" : "opacity-0"
        } ${
          revealDiscovery ? "pb-3 pt-3.5 md:pb-3 md:pt-11" : "pb-10 pt-6 md:pb-14 md:pt-10"
        }`}
      >
        <div
          className={`mx-auto max-w-6xl space-y-6 transition-[padding,transform] duration-[1400ms] [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] md:space-y-7 ${
            revealDiscovery
              ? "translate-y-0 pb-0 pt-0"
              : "translate-y-0 pb-[18vh] pt-[18vh] md:pb-[20vh] md:pt-[19vh]"
          }`}
        >
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
              className={`inline-flex min-h-[2.8rem] min-w-0 flex-1 items-center justify-center rounded-full border px-4 text-[0.95rem] font-medium transition sm:min-h-[2.95rem] sm:flex-none sm:px-7 sm:text-base ${
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
              className={`inline-flex min-h-[2.8rem] min-w-0 flex-1 items-center justify-center rounded-full border px-4 text-[0.95rem] font-medium transition sm:min-h-[2.95rem] sm:flex-none sm:px-7 sm:text-base ${
                answer === "no"
                  ? "border-dema-forest bg-dema-forest text-dema-paper shadow-[0_10px_24px_rgba(49,95,70,0.18)]"
                  : "border-dema-forest/45 bg-dema-paper text-dema-forest hover:border-dema-forest hover:text-dema-forest"
              }`}
            >
              Non pas encore
            </button>
          </div>

          <div
            className={`transition-all duration-[950ms] delay-75 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] ${
              revealDiscovery
                ? "max-h-48 translate-y-0 opacity-100"
                : "max-h-0 translate-y-1 overflow-hidden opacity-0 pointer-events-none"
            }`}
          >
            {selectedResponse ? (
              <div className="mx-auto max-w-3xl">
                <p
                  className="text-base font-semibold text-brand-blue"
                  aria-label={selectedResponse.title}
                >
                  <span>{typedTitle}</span>
                  {!showArrow ? (
                    <span className="ml-0.5 inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-brand-blue/70 align-baseline" />
                  ) : null}
                </p>
                {selectedResponse.body ? (
                  <p className="mt-2 text-sm leading-6 text-brand-blue/62 sm:text-base">
                    {selectedResponse.body}
                  </p>
                ) : null}
                <div
                  className={`pointer-events-none mt-2 flex justify-center transition-all duration-500 ${
                    showArrow ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                  }`}
                >
                  <Image
                    src="/images/home/hand-arrow.png"
                    alt=""
                    aria-hidden="true"
                    width={112}
                    height={70}
                    className={`h-12 w-28 object-contain ${showArrow ? "demaa-arrow-nudge" : ""}`}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div
            className={`demaa-discovery-hidden transition-all duration-[1500ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
              showDiscoveryControls
                ? "mt-0 max-h-40 translate-y-0 opacity-100"
                : "mt-[-0.2rem] max-h-0 translate-y-1 overflow-hidden opacity-0 pointer-events-none"
            }`}
            aria-hidden={!showDiscoveryControls}
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
        className={`demaa-discovery-hidden transition-all duration-[1800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
          showSystems
            ? "max-h-[220rem] translate-y-0 opacity-100"
            : "max-h-0 translate-y-1 overflow-hidden opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showSystems}
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
