"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { CornerDownLeft, Search } from "lucide-react";
import { matchesSearchQuery, normalizeSearchText } from "@/lib/search";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { System } from "@/lib/types";

type SystemSearchHeroProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
};

type SystemSuggestion = {
  slug: string;
  name: string;
  description: string;
  sectorLabel: string;
  score: number;
};

const MAX_SUGGESTIONS = 6;

function getSuggestionScore(system: System, sectorLabel: string, query: string): number {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return Number.POSITIVE_INFINITY;
  }

  const normalizedName = normalizeSearchText(system.name);
  const normalizedSlug = normalizeSearchText(system.slug);
  const normalizedSector = normalizeSearchText(sectorLabel);
  const normalizedDescription = normalizeSearchText(system.description);

  if (normalizedName === normalizedQuery || normalizedSlug === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  if (normalizedSlug.startsWith(normalizedQuery)) return 2;
  if (normalizedSector.startsWith(normalizedQuery)) return 3;
  if (normalizedName.includes(normalizedQuery)) return 4;
  if (normalizedSector.includes(normalizedQuery)) return 5;
  if (normalizedDescription.includes(normalizedQuery)) return 6;

  return 7;
}

export default function SystemSearchHero({
  systems,
  detailsBySlug,
}: SystemSearchHeroProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);

  const suggestions = useMemo(() => {
    const visibleSystems = systems.map<SystemSuggestion>((system) => {
      const sectorLabel =
        detailsBySlug[system.slug]?.sectorLabel ?? "Conseil & services aux entreprises";

      return {
        slug: system.slug,
        name: system.name,
        description: system.description,
        sectorLabel,
        score: getSuggestionScore(system, sectorLabel, deferredQuery),
      };
    });

    if (!deferredQuery.trim()) {
      return visibleSystems.slice(0, MAX_SUGGESTIONS);
    }

    return visibleSystems
      .filter((system) =>
        matchesSearchQuery(deferredQuery, [
          system.name,
          system.description,
          system.sectorLabel,
          system.slug,
        ]),
      )
      .sort((left, right) => {
        const byScore = left.score - right.score;

        if (byScore !== 0) {
          return byScore;
        }

        return left.name.localeCompare(right.name, "fr");
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [deferredQuery, detailsBySlug, systems]);

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

  function openSuggestion(index: number) {
    const suggestion = suggestions[index];

    if (!suggestion) {
      return;
    }

    setIsOpen(false);
    router.push(`/systemes/${suggestion.slug}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
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

  const showDropdown = isOpen && (!deferredQuery.trim() || suggestions.length > 0);
  const showEmptyState = isOpen && deferredQuery.trim().length > 0 && suggestions.length === 0;

  return (
    <section className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] flex min-h-[calc(100vh-4.5rem)] w-screen items-center overflow-hidden bg-dema-cream px-4 py-12 text-center md:px-8 md:py-16">
      <div className="relative mx-auto w-full max-w-6xl -translate-y-[15%]">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-[clamp(2.8rem,8vw,5.4rem)] leading-[0.94] tracking-tight text-brand-blue">
            <span className="demaa-hero-title text-dema-forest">
              Trouver votre Boîte à outils
            </span>
            <br />
            <span className="font-sans font-light not-italic text-brand-blue/62">
              pour votre entreprise
            </span>
          </h1>

        </div>

        <div ref={containerRef} className="relative mx-auto mt-10 max-w-4xl text-left md:mt-12">
          <div className="demaa-search-shell p-2">
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
                className="w-full rounded-full bg-dema-paper py-5 pl-14 pr-6 text-base text-brand-blue outline-none transition placeholder:text-brand-blue/30 md:py-6 md:pl-16 md:text-lg"
              />
            </div>
          </div>

          {showDropdown ? (
            <div
              id="system-search-suggestions"
              role="listbox"
              className="mt-3 overflow-hidden rounded-[1.5rem] border border-dema-line/80 bg-dema-paper shadow-[0_22px_48px_rgba(23,35,29,0.09)]"
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
                      Voir le système
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
            <div className="mt-3 rounded-[1.35rem] border border-dashed border-dema-line bg-dema-paper px-5 py-5 text-center text-sm text-dema-muted">
              Aucune activité trouvée. Essayez un autre mot-clé plus large.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
