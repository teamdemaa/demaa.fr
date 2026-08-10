"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  createElement,
  type KeyboardEvent,
} from "react";
import { CornerDownLeft, Search, SlidersHorizontal } from "lucide-react";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";
import { trackSystemJourneyEvent } from "@/lib/kit-analytics-client";
import { ALL_SECTORS_LABEL } from "@/lib/public-sectors";
import { getSystemIcon } from "@/lib/system-icon";
import { getSystemDiscoveryScore } from "@/lib/system-discovery";
import type { System } from "@/lib/types";

type SystemSearchHeroProps = {
  systems: System[];
  sectorLabelsBySlug: Record<string, string>;
};

type SystemSuggestion = {
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  sectorLabel: string;
  score: number;
};

const MAX_SUGGESTIONS = 6;

export default function SystemSearchHero({
  systems,
  sectorLabelsBySlug,
}: SystemSearchHeroProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSector, setActiveSector] = useState(ALL_SECTORS_LABEL);
  const [areSectorTagsVisible, setAreSectorTagsVisible] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const sectors = useMemo(() => {
    const labels = systems
      .map((system) => sectorLabelsBySlug[system.slug])
      .filter((label): label is string => Boolean(label));

    return [ALL_SECTORS_LABEL, ...Array.from(new Set(labels))];
  }, [sectorLabelsBySlug, systems]);

  const suggestions = useMemo(() => {
    const visibleSystems = systems.map<SystemSuggestion>((system) => {
      const sectorLabel =
        sectorLabelsBySlug[system.slug] ?? "Conseil & services aux entreprises";

      return {
        slug: system.slug,
        name: system.name,
        description: system.description,
        shortDescription: system.shortDescription,
        sectorLabel,
        score:
          getSystemDiscoveryScore({ ...system, sectorLabel }, deferredQuery) ??
          Number.POSITIVE_INFINITY,
      };
    });

    if (!deferredQuery.trim()) {
      return visibleSystems.slice(0, MAX_SUGGESTIONS);
    }

    return visibleSystems
      .filter((system) => Number.isFinite(system.score))
      .sort((left, right) => {
        const byScore = left.score - right.score;

        if (byScore !== 0) {
          return byScore;
        }

        return left.name.localeCompare(right.name, "fr");
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [deferredQuery, sectorLabelsBySlug, systems]);

  const filteredSystems = useMemo(() => {
    return systems.filter((system) => {
      const sectorLabel =
        sectorLabelsBySlug[system.slug] ?? "Conseil & services aux entreprises";
      const matchesSector =
        activeSector === ALL_SECTORS_LABEL || sectorLabel === activeSector;
      const matchesQuery =
        getSystemDiscoveryScore({ ...system, sectorLabel }, deferredQuery) !== null;

      return matchesSector && matchesQuery;
    });
  }, [activeSector, deferredQuery, sectorLabelsBySlug, systems]);

  const systemSections = useMemo(() => {
    const groupedSystems = new Map<string, System[]>();

    filteredSystems.forEach((system) => {
      const sectorLabel =
        sectorLabelsBySlug[system.slug] ?? "Conseil & services aux entreprises";
      const sectionSystems = groupedSystems.get(sectorLabel);

      if (sectionSystems) {
        sectionSystems.push(system);
      } else {
        groupedSystems.set(sectorLabel, [system]);
      }
    });

    return sectors.flatMap((sector) => {
      if (sector === ALL_SECTORS_LABEL) return [];
      const sectionSystems = groupedSystems.get(sector);
      return sectionSystems ? [{ title: sector, systems: sectionSystems }] : [];
    });
  }, [filteredSystems, sectorLabelsBySlug, sectors]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function trackSelection(index: number, method: "click" | "keyboard") {
    const suggestion = suggestions[index];

    if (!suggestion) {
      return;
    }

    trackSystemJourneyEvent("system_search_selected", {
      method,
      position: index + 1,
      queryLength: query.trim().length,
      systemSlug: suggestion.slug,
    });
  }

  function openSuggestion(index: number) {
    const suggestion = suggestions[index];
    if (!suggestion) return;

    trackSelection(index, "keyboard");
    setIsOpen(false);
    router.push(`/systemes/${suggestion.slug}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!query.trim()) {
      if (event.key === "Escape") setIsOpen(false);
      return;
    }

    if (!suggestions.length) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openSuggestion(activeIndex);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  const showDropdown = isOpen && deferredQuery.trim().length > 0 && suggestions.length > 0;
  const showEmptyState = isOpen && deferredQuery.trim().length > 0 && suggestions.length === 0;

  return (
    <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen overflow-hidden bg-dema-cream px-4 pb-20 pt-12 text-center md:px-8 md:pb-24 md:pt-16">
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-6xl">
          <h1
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
            aria-label="Trouvez le système métier de votre entreprise"
          >
            <span className="block font-sans font-light not-italic text-brand-blue/62 md:whitespace-nowrap">
              Trouvez le système métier
            </span>
            <span className="demaa-hero-title block text-dema-forest" aria-hidden="true">
              pour votre entreprise
            </span>
          </h1>

        </div>

        <div ref={containerRef} className="relative mx-auto mt-9 max-w-4xl text-left md:mt-11">
          <div className="demaa-search-shell p-1.5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/42"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveSector(ALL_SECTORS_LABEL);
                  setActiveIndex(0);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Ex. BTP, restaurant, cabinet comptable..."
                role="combobox"
                aria-label="Rechercher votre activité"
                aria-autocomplete="list"
                aria-expanded={showDropdown || showEmptyState}
                aria-controls="system-search-suggestions"
                aria-activedescendant={
                  showDropdown && suggestions[activeIndex]
                    ? `system-search-suggestion-${suggestions[activeIndex].slug}`
                    : undefined
                }
                className="w-full rounded-full bg-dema-paper py-4 pl-14 pr-16 text-base text-brand-blue outline-none transition placeholder:text-brand-blue/30 md:py-5 md:pl-16 md:pr-20 md:text-lg"
              />
              <button
                type="button"
                onClick={() => setAreSectorTagsVisible((visible) => !visible)}
                aria-expanded={areSectorTagsVisible}
                aria-label={areSectorTagsVisible ? "Masquer les catégories" : "Afficher les catégories"}
                className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:right-2.5 md:h-10 md:w-10 ${
                  areSectorTagsVisible || activeSector !== ALL_SECTORS_LABEL
                    ? "bg-dema-sage text-dema-forest"
                    : "bg-dema-canvas text-dema-muted"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {areSectorTagsVisible ? (
            <div className="mt-4 overflow-x-auto pb-1 soft-scroll" aria-label="Filtrer par secteur">
              <div className="flex min-w-max gap-2 px-1">
                {sectors.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    aria-pressed={activeSector === sector}
                    onClick={() => {
                      setActiveSector(sector);
                      setQuery("");
                      setIsOpen(false);
                    }}
                    className={`demaa-chip shrink-0 whitespace-nowrap ${
                      activeSector === sector ? "demaa-chip-active" : ""
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showDropdown ? (
            <div
              id="system-search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-3 overflow-hidden rounded-[1.5rem] border border-dema-line/80 bg-dema-paper shadow-[0_22px_48px_rgba(23,35,29,0.09)]"
            >
              <div className="border-b border-dema-line/70 px-5 py-3 text-xs uppercase tracking-[0.18em] text-dema-muted">
                {deferredQuery.trim() ? "Suggestions" : "Activités fréquentes"}
              </div>
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <Link
                    key={suggestion.slug}
                    id={`system-search-suggestion-${suggestion.slug}`}
                    href={`/systemes/${suggestion.slug}`}
                    prefetch
                    onClick={() => trackSelection(index, "click")}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    role="option"
                    aria-selected={activeIndex === index}
                    className={`flex items-center justify-between gap-4 rounded-[1.05rem] px-4 py-3 transition ${
                      activeIndex === index
                        ? "bg-dema-sage text-brand-blue"
                        : "text-brand-blue/90 hover:bg-dema-sage/70"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium md:text-[15px]">
                        {suggestion.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-dema-muted md:text-sm">
                        {suggestion.sectorLabel}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 text-xs text-dema-muted md:text-sm">
                      Voir le système métier
                      {activeIndex === index ? (
                        <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : null}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {showEmptyState ? (
            <div className="absolute left-0 right-0 top-full z-30 mt-3 rounded-[1.35rem] border border-dashed border-dema-line bg-dema-paper px-5 py-5 text-center text-sm text-dema-muted shadow-[0_22px_48px_rgba(23,35,29,0.09)]">
              Aucune activité trouvée. Essayez un autre mot-clé plus large.
            </div>
          ) : null}
        </div>

        {systemSections.length > 0 ? (
          <div className="mt-10 space-y-9 text-left sm:mt-12 sm:space-y-11">
            {systemSections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-light tracking-tight text-brand-blue/85 sm:text-2xl">
                  {section.title}
                </h2>
                <HorizontalScrollHint
                  className="-mx-4 mt-3 overflow-x-auto px-4 pb-4 pt-1 soft-scroll md:-mx-8 md:px-8"
                  controlsClassName="absolute right-0 -top-10 z-10 flex items-center gap-1.5"
                >
                  <div className="flex gap-4">
                    {section.systems.map((system) => (
                      <SystemDirectoryCard key={system.id} system={system} />
                    ))}
                  </div>
                </HorizontalScrollHint>
              </section>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-2xl rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-8 text-center">
            <p className="text-base text-brand-blue">Aucun système métier trouvé.</p>
            <p className="mt-2 text-sm text-dema-muted">Essayez un autre mot-clé ou un autre secteur.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function SystemDirectoryCard({ system }: { system: System }) {
  const icon = createElement(getSystemIcon(system), {
    className: "h-4 w-4",
    "aria-hidden": true,
  });

  return (
    <Link
      href={`/systemes/${system.slug}`}
      className="demaa-card group relative flex aspect-square w-[74vw] max-w-[15rem] shrink-0 flex-col overflow-hidden rounded-[1.2rem] p-4 sm:w-[15rem] sm:p-5 [content-visibility:auto] [contain-intrinsic-size:15rem_15rem]"
    >
      <span className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper sm:h-10 sm:w-10">
        {icon}
      </span>
      <div className="relative z-10 mt-4 flex min-w-0 flex-1 flex-col justify-center">
        <h2 className="line-clamp-2 text-base font-medium leading-tight tracking-tight text-brand-blue sm:text-lg">
          {system.name}
        </h2>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-dema-muted sm:text-sm">
          {system.shortDescription ?? system.description}
        </p>
      </div>
    </Link>
  );
}
