"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3, Search, SlidersHorizontal } from "lucide-react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import AcademyVideoArtwork from "@/components/AcademyVideoArtwork";
import { trackAcademyEvent } from "@/lib/academy-analytics-client";
import type {
  AcademyVideoCategory,
  AcademyVideoEntry,
} from "@/lib/academy-video-catalog";
import { matchesSearchQuery } from "@/lib/search";

const ALL_CATEGORIES = "Tous les sujets";
const FILTERS_ID = "academy-category-filters";

export default function AcademyCatalogClient({
  videos,
}: {
  videos: readonly AcademyVideoEntry[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<
    typeof ALL_CATEGORIES | AcademyVideoCategory
  >(ALL_CATEGORIES);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const deferredQuery = useDeferredValue(query);
  const categories = useMemo(
    () => [
      ALL_CATEGORIES,
      ...Array.from(new Set(videos.map((video) => video.category))),
    ],
    [videos],
  );
  const visibleVideos = useMemo(
    () =>
      videos.filter(
        (video) =>
          (category === ALL_CATEGORIES || video.category === category) &&
          matchesSearchQuery(deferredQuery, [
            video.cardTitle,
            video.h1,
            video.primaryKeyword,
            ...video.secondaryKeywords,
            ...video.topics,
          ]),
      ),
    [category, deferredQuery, videos],
  );

  return (
    <>
      <div
        className="mx-auto mt-10 max-w-4xl md:mt-12"
        onKeyDown={(event) => {
          if (event.key !== "Escape" || !areFiltersOpen) return;
          event.preventDefault();
          setAreFiltersOpen(false);
          filterButtonRef.current?.focus();
        }}
      >
        <div className="demaa-search-shell p-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/44"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une question, un sujet…"
              aria-label="Rechercher dans l’Académie"
              className="w-full rounded-full bg-dema-paper py-4 pl-14 pr-16 text-base text-brand-blue outline-none placeholder:text-brand-blue/30 sm:py-5"
            />
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setAreFiltersOpen((current) => !current)}
              aria-expanded={areFiltersOpen}
              aria-controls={FILTERS_ID}
              aria-label={
                areFiltersOpen
                  ? "Masquer les filtres par sujet"
                  : "Afficher les filtres par sujet"
              }
              className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#e9ede8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {areFiltersOpen ? (
          <div
            id={FILTERS_ID}
            className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center"
            aria-label="Filtrer les vidéos par catégorie"
          >
            {categories.map((item) => {
              const active = item === category;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setCategory(
                      item as typeof ALL_CATEGORIES | AcademyVideoCategory,
                    );
                    trackAcademyEvent("academy_filter_selected", {
                      category: item,
                      queryLength: query.trim().length,
                    });
                  }}
                  className={`demaa-chip shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 ${
                    active ? "demaa-chip-active" : ""
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <section className="mx-auto mt-14 w-full max-w-7xl md:mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              À découvrir
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
              Des réponses concrètes, en quelques minutes
            </h2>
          </div>
          <p className="shrink-0 text-sm text-dema-muted" role="status" aria-live="polite">
            {visibleVideos.length} {visibleVideos.length > 1 ? "fiches" : "fiche"}
          </p>
        </div>

        {visibleVideos.length ? (
          <div className="mt-7 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:gap-x-7">
            {visibleVideos.map((video, index) => (
              <article key={video.slug} className="group min-w-0">
                <Link
                  href={`/academie/${video.slug}`}
                  onClick={() =>
                    trackAcademyEvent("academy_video_card_opened", {
                      category: video.category,
                      queryLength: query.trim().length,
                      videoSlug: video.slug,
                    })
                  }
                  className="block rounded-[1.4rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
                  aria-label={`Lire la fiche : ${video.cardTitle}`}
                >
                  <AcademyVideoArtwork video={video} priority={index < 2} />
                </Link>
                <div className="mt-4 flex items-start justify-between gap-4 px-1">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-dema-forest">{video.category}</p>
                    <h3 className="mt-1 text-lg font-semibold leading-snug tracking-[-0.02em] text-brand-blue">
                      <Link href={`/academie/${video.slug}`} className="rounded-sm hover:text-dema-forest">
                        {video.cardTitle}
                      </Link>
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dema-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {video.durationLabel}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="mt-1 h-5 w-5 shrink-0 text-dema-forest transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-[1.5rem] border border-dashed border-dema-line bg-dema-paper px-6 py-14 text-center">
            <p className="font-medium text-brand-blue">Aucune fiche ne correspond à cette recherche.</p>
            <p className="mt-2 text-sm text-dema-muted">
              Essayez un mot plus large, comme « trésorerie » ou « bénéfice ».
            </p>
          </div>
        )}
      </section>
    </>
  );
}
