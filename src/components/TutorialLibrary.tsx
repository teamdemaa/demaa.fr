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
        tutorial.tool,
        ...tutorial.searchTerms,
        ...tutorial.keyPoints,
      ])
    )),
    [activeCategory, query, tutorials],
  );

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
              aria-label="Rechercher dans les tutoriels"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un tutoriel…"
              className="w-full rounded-full bg-dema-paper py-4 pl-12 pr-16 text-base text-brand-blue outline-none transition placeholder:text-brand-blue/30 focus:ring-2 focus:ring-dema-forest/20 md:py-5 md:pl-16 md:pr-20 md:text-lg"
            />
            <button
              type="button"
              onClick={() => setAreFiltersVisible((visible) => !visible)}
              aria-expanded={areFiltersVisible}
              aria-label={areFiltersVisible ? "Masquer les thèmes" : "Afficher les thèmes"}
              className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:right-2.5 md:h-10 md:w-10 ${
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
          <div className="mt-4 overflow-x-auto pb-1 soft-scroll" role="group" aria-label="Filtrer les tutoriels par thème">
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
          {filteredTutorials.length} {filteredTutorials.length > 1 ? "tutoriels trouvés" : "tutoriel trouvé"}
        </p>
      </div>

      {filteredTutorials.length > 0 ? (
        <section aria-label="Tutoriels" className="px-4 py-14 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
            {filteredTutorials.map((tutorial, index) => (
              <Link
                key={tutorial.slug}
                href={`/tutoriels/${tutorial.slug}`}
                className="group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
              >
                <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
                  <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper">
                    <Image
                      src={tutorial.thumbnail}
                      alt={`Aperçu du tutoriel : ${tutorial.title}`}
                      fill
                      loading={index < 2 ? "eager" : "lazy"}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.01]"
                    />
                  </div>
                  <div className="px-0.5 pb-1 pt-4">
                    <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-dema-forest/65">
                      <span>Tutoriel</span>
                      <span aria-hidden="true">·</span>
                      <span>{tutorial.tool}</span>
                      <span aria-hidden="true">·</span>
                      <span className="normal-case tracking-normal text-dema-muted">{tutorial.minutes} min</span>
                    </div>
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
            <h2 className="text-xl font-medium text-brand-blue">Aucun tutoriel trouvé</h2>
            <p className="mt-2 text-sm text-dema-muted">Essayez un mot plus simple ou un autre thème.</p>
          </div>
        </section>
      )}
    </div>
  );
}
