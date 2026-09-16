"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import {
  TUTORIAL_CATEGORIES,
  type TutorialDefinition,
} from "@/lib/tutorial-catalog";
import { matchesSearchQuery } from "@/lib/search";

const ALL_CATEGORIES = "Tous";

export default function TutorialLibrary({
  tutorials,
}: {
  tutorials: readonly TutorialDefinition[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const filteredTutorials = useMemo(
    () => tutorials.filter((tutorial) => (
      (activeCategory === ALL_CATEGORIES || tutorial.category === activeCategory)
      && matchesSearchQuery(query, [
        tutorial.title,
        tutorial.summary,
        tutorial.category,
        tutorial.format === "practice" ? tutorial.tool : "méthode",
        ...tutorial.searchTerms,
        ...tutorial.keyPoints,
      ])
    )),
    [activeCategory, query, tutorials],
  );

  return (
    <div>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="demaa-search-shell">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/42"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Rechercher dans les méthodes"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une méthode…"
              className="demaa-search-control"
            />
            <button
              type="button"
              onClick={() => setAreFiltersVisible((visible) => !visible)}
              aria-expanded={areFiltersVisible}
              aria-label={areFiltersVisible ? "Masquer les thèmes" : "Afficher les thèmes"}
              className={`absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition ${
                areFiltersVisible || activeCategory !== ALL_CATEGORIES
                  ? "bg-dema-sage text-dema-forest"
                  : "bg-dema-canvas text-dema-muted"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {areFiltersVisible ? (
          <div className="mt-4 overflow-x-auto pb-1 soft-scroll" role="group" aria-label="Filtrer les méthodes par thème">
            <div className="flex min-w-max gap-2 px-1">
              {[ALL_CATEGORIES, ...TUTORIAL_CATEGORIES].map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  className={`demaa-chip shrink-0 whitespace-nowrap ${
                    activeCategory === category ? "demaa-chip-active" : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {filteredTutorials.length} {filteredTutorials.length > 1 ? "méthodes trouvées" : "méthode trouvée"}
        </p>
      </div>

      {filteredTutorials.length > 0 ? (
        <section aria-label="Méthodes" className="px-4 py-14 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial, index) => (
              <Link
                key={tutorial.slug}
                href={`/tutoriels/${tutorial.slug}`}
                className="group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
              >
                <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
                  {tutorial.format === "method" ? (
                    <div className="relative flex aspect-video items-center justify-start overflow-hidden rounded-[1.25rem] border border-dema-forest/10 bg-dema-sage/45 p-6 sm:p-8">
                      <p className="max-w-[88%] text-left font-serif text-2xl italic leading-tight text-dema-forest sm:text-3xl">
                        {tutorial.thumbnailStatement}
                      </p>
                    </div>
                  ) : (
                    <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper">
                      <Image
                        src={tutorial.thumbnail}
                        alt={`Aperçu de la mise en pratique : ${tutorial.title}`}
                        fill
                        loading={index < 2 ? "eager" : "lazy"}
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.01]"
                      />
                    </div>
                  )}
                  <div className="px-0.5 pb-1 pt-4">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-dema-forest/65">
                      {tutorial.format === "method"
                        ? `${tutorial.category} · ${tutorial.readingMinutes} min`
                        : `${tutorial.tool} · ${tutorial.topic}`}
                    </p>
                    <h2 className="mt-2 text-xl font-normal leading-tight tracking-[-0.02em] text-brand-blue transition-colors group-hover:text-dema-forest sm:text-2xl">
                      {tutorial.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-dema-muted">
                      {tutorial.summary}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto mt-12 w-full max-w-4xl px-4 sm:px-6" aria-live="polite">
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper px-6 py-14 text-center">
            <h2 className="text-xl font-medium text-brand-blue">Aucune méthode trouvée</h2>
            <p className="mt-2 text-sm text-dema-muted">Essayez un mot plus simple ou un autre thème.</p>
          </div>
        </section>
      )}
    </div>
  );
}
