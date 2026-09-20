"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { MethodDefinition } from "@/lib/method-catalog";
import { matchesSearchQuery } from "@/lib/search";

const ALL = "Tous";

export default function SiniAdviceLibrary({ methods }: { methods: readonly MethodDefinition[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categories = [...new Set(methods.map((method) => method.category))];
  const results = useMemo(() => methods.filter((method) =>
    (category === ALL || method.category === category) &&
    matchesSearchQuery(query, [method.title, method.summary, method.category, ...method.searchTerms, ...method.keyPoints]),
  ), [category, methods, query]);

  return (
    <div>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="rounded-full border border-[#d8e0e7] bg-white p-1 shadow-[0_8px_22px_rgba(23,40,62,0.03)]">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-5 h-5 w-5 text-[#597391]" aria-hidden="true" />
            <input
              type="search"
              aria-label="Rechercher dans les conseils"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une méthode…"
              className="min-w-0 flex-1 rounded-full bg-white py-3.5 pl-12 pr-2 text-base text-[#17283e] outline-none placeholder:text-[#8695a4] md:py-4"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
              aria-label={filtersOpen ? "Masquer les thèmes" : "Afficher les thèmes"}
              className={`mr-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${filtersOpen || category !== ALL ? "bg-[#dce8f1] text-[#244a68]" : "text-[#627181] hover:bg-[#edf3f8]"}`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        {filtersOpen ? (
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrer les conseils par thème">
            {[ALL, ...categories].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`min-h-9 rounded-full px-4 py-1.5 text-xs transition ${category === item ? "bg-[#dce8f1] font-semibold text-[#244a68]" : "bg-white text-[#627181] hover:bg-[#edf3f8]"}`}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">{results.length} méthodes trouvées</p>
      </div>

      {results.length ? (
        <section aria-label="Méthodes de conseil" className="px-4 py-14 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {results.map((method) => (
              <Link
                key={method.slug}
                href={`/conseil/${method.slug}`}
                className="group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#597391] focus-visible:ring-offset-4"
              >
                <article className="transition-transform duration-200 group-hover:-translate-y-px motion-reduce:transform-none">
                  <div className="flex aspect-video items-center overflow-hidden rounded-[1.25rem] border border-[#d8e0e7] bg-[#e7eef4] p-6 sm:p-8">
                    <p className="max-w-[88%] font-serif text-2xl italic leading-tight text-[#244a68] sm:text-3xl">{method.thumbnailStatement}</p>
                  </div>
                  <div className="px-0.5 pb-1 pt-4">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#597391]">{method.category} · {method.readingMinutes} min</p>
                    <h2 className="mt-2 text-xl font-normal leading-tight tracking-[-0.02em] text-[#17283e] transition-colors group-hover:text-[#597391] sm:text-2xl">{method.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#627181]">{method.summary}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <p className="mx-auto max-w-4xl px-4 py-16 text-center text-[#627181]">Aucune méthode trouvée. Essayez un autre mot ou thème.</p>
      )}
    </div>
  );
}
