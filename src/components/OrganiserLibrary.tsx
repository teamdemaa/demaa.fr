"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import CopyableModelCard from "@/components/CopyableModelCard";
import OrganiserProcessMap from "@/components/OrganiserProcessMap";
import type { AcademyProcessStep } from "@/lib/academy-course-content";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";
import { matchesSearchQuery } from "@/lib/search";

export type OrganiserGuideCardData = Readonly<{
  category: string;
  format: string;
  image?: string;
  keyPoints: readonly string[];
  slug: string;
  summary: string;
  tags: readonly string[];
  thumbnail: string | null;
  title: string;
}>;

export type OrganiserProcessCardData = Readonly<{
  category: string;
  durationMinutes: number;
  promise: string;
  recapPoints: readonly string[];
  sector: string;
  slug: string;
  steps: readonly AcademyProcessStep[];
  systemLabel: string;
  thumbnail: string | null;
  title: string;
}>;

type OrganiserLibraryProps = Readonly<{
  guides: readonly OrganiserGuideCardData[];
  models: readonly CopyableModelDefinition[];
  processes: readonly OrganiserProcessCardData[];
}>;

const ALL_FILTERS = "Tous";
const ORGANISER_FILTERS = [
  ALL_FILTERS,
  "Clients & ventes",
  "Planning & opérations",
  "Administration & facturation",
  "Outils & automatisation",
] as const;

type OrganiserFilter = (typeof ORGANISER_FILTERS)[number];

function getOrganiserFilter(category: string): OrganiserFilter {
  const normalizedCategory = category.toLocaleLowerCase("fr");

  if (normalizedCategory.includes("outil")) {
    return "Outils & automatisation";
  }

  if (
    normalizedCategory.includes("planning")
    || normalizedCategory.includes("intervention")
    || normalizedCategory.includes("réalisation")
    || normalizedCategory.includes("stock")
  ) {
    return "Planning & opérations";
  }

  if (
    normalizedCategory.includes("document")
    || normalizedCategory.includes("administration")
    || normalizedCategory.includes("facturation")
    || normalizedCategory.includes("conformité")
  ) {
    return "Administration & facturation";
  }

  return "Clients & ventes";
}

export default function OrganiserLibrary({ guides, models, processes }: OrganiserLibraryProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrganiserFilter>(ALL_FILTERS);
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);

  const filteredProcesses = useMemo(
    () => processes.filter((content) => (
      (activeFilter === ALL_FILTERS || getOrganiserFilter(content.category) === activeFilter)
      && matchesSearchQuery(query, [
        content.title,
        content.category,
        content.promise,
        content.sector,
        content.systemLabel,
        ...content.recapPoints,
      ])
    )),
    [activeFilter, processes, query],
  );

  const filteredGuides = useMemo(
    () => guides.filter((guide) => (
      (activeFilter === ALL_FILTERS || getOrganiserFilter(guide.category) === activeFilter)
      && matchesSearchQuery(query, [
        guide.title,
        guide.summary,
        guide.category,
        ...guide.tags,
        ...guide.keyPoints,
      ])
    )),
    [activeFilter, guides, query],
  );

  const hasResults = filteredProcesses.length + filteredGuides.length > 0;

  return (
    <div>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="demaa-search-shell p-1.5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/42"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Rechercher dans Organisation"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un processus ou un sujet…"
              className="w-full rounded-full bg-dema-paper py-4 pl-12 pr-16 text-base text-brand-blue outline-none transition placeholder:text-brand-blue/30 focus:ring-2 focus:ring-dema-forest/20 md:py-5 md:pl-16 md:pr-20 md:text-lg"
            />
            <button
              type="button"
              onClick={() => setAreFiltersVisible((visible) => !visible)}
              aria-expanded={areFiltersVisible}
              aria-label={areFiltersVisible ? "Masquer les catégories" : "Afficher les catégories"}
              className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:right-2.5 md:h-10 md:w-10 ${
                areFiltersVisible || activeFilter !== ALL_FILTERS
                  ? "bg-dema-sage text-dema-forest"
                  : "bg-dema-canvas text-dema-muted"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {areFiltersVisible ? (
          <div className="mt-4 overflow-x-auto pb-1 soft-scroll" aria-label="Filtrer les contenus par thème">
            <div className="flex min-w-max gap-2 px-1">
              {ORGANISER_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={activeFilter === filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setQuery("");
                  }}
                  className={`demaa-chip shrink-0 whitespace-nowrap ${
                    activeFilter === filter ? "demaa-chip-active" : ""
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {!hasResults ? (
        <section className="mx-auto mt-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-live="polite">
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper px-6 py-14 text-center">
            <h2 className="text-xl font-medium text-brand-blue">Aucun contenu trouvé</h2>
            <p className="mt-2 text-sm text-dema-muted">Essayez un mot plus simple ou un autre sujet.</p>
          </div>
        </section>
      ) : null}

      {filteredProcesses.length || filteredGuides.length ? (
        <section id="cas-concrets" aria-label="Cas concrets" className="scroll-mt-24 px-4 py-14 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-1 gap-x-8 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
              {filteredGuides.map((guide, index) => {
                const image = guide.thumbnail ?? guide.image;
                return (
                  <Link
                    key={`guide-${guide.slug}`}
                    href={`/contenus/${guide.slug}`}
                    className="group block w-full rounded-[1.25rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
                  >
                    <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
                      <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper">
                        {image ? (
                          <Image
                            src={image}
                            alt={`Aperçu : ${guide.title}`}
                            fill
                            loading={index === 0 ? "eager" : "lazy"}
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition duration-300 group-hover:scale-[1.01]"
                          />
                        ) : null}
                      </div>
                      <div className="px-0.5 pb-1 pt-3.5">
                        <h3 className="line-clamp-2 text-[0.9rem] font-normal leading-[1.3] text-brand-blue opacity-80 transition-colors group-hover:text-dema-forest">
                          {guide.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-1 text-[0.7rem] text-dema-muted opacity-75">
                          {guide.format} · {guide.category}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}

              {filteredProcesses.map((content) => {
                return (
                  <Link
                    key={`process-${content.slug}`}
                    href={`/organiser/${content.slug}`}
                    className="group block w-full rounded-[1.25rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
                  >
                    <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
                      <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-sage transition-colors duration-200">
                        {content.thumbnail ? (
                          <Image
                            src={content.thumbnail}
                            alt={`Aperçu : ${content.title}`}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition duration-300 group-hover:scale-[1.01]"
                          />
                        ) : (
                          <OrganiserProcessMap steps={content.steps} compact />
                        )}
                      </div>
                      <div className="px-0.5 pb-1 pt-3.5">
                        <h3 className="line-clamp-2 text-[0.9rem] font-normal leading-[1.3] text-brand-blue opacity-80 transition-colors group-hover:text-dema-forest">
                          {content.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-1 text-[0.7rem] text-dema-muted opacity-75">
                          Process · {content.systemLabel} · {content.durationMinutes} min
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {!query && activeFilter === ALL_FILTERS ? (
        <section
          className="px-4 pb-4 pt-2 sm:px-6 lg:px-8"
          aria-labelledby="organiser-models-heading"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex items-end justify-between gap-6">
              <h2
                id="organiser-models-heading"
                className="text-2xl font-light tracking-[-0.03em] text-brand-blue sm:text-3xl"
              >
                Modèles prêts à copier
              </h2>
              <Link
                href="/modeles?from=organisation"
                className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-dema-forest transition hover:text-brand-blue"
              >
                Voir tous les modèles
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-4 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="grid max-w-full snap-x snap-mandatory grid-flow-col auto-cols-[84%] items-stretch gap-4 overscroll-x-contain sm:auto-cols-[48%] lg:auto-cols-[calc((100%_-_2rem)_/_3)] xl:auto-cols-[calc((100%_-_3rem)_/_4)]">
                {models.map((model) => (
                  <div key={model.slug} className="min-w-0 snap-start">
                    <CopyableModelCard
                      href={`/modeles/${model.slug}?from=organisation`}
                      model={model}
                      titleLevel={3}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
