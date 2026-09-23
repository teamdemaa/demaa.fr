"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { AcademyPreviewCard } from "@/lib/academy-preview-catalog";
import { matchesSearchQuery } from "@/lib/search";

const ALL = "Tous";

export default function AcademyPreviewLibrary({ cards }: { cards: readonly AcademyPreviewCard[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categories = [...new Set(cards.map((card) => card.category))];
  const results = useMemo(() => cards.filter((card) =>
    (category === ALL || card.category === category) &&
    matchesSearchQuery(query, [card.title, card.summary, card.category, card.format, ...card.searchTerms]),
  ), [cards, category, query]);

  return (
    <div>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="demaa-search-shell">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/42" aria-hidden="true" />
            <input type="search" aria-label="Rechercher dans les tutoriels" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un tutoriel…" className="demaa-search-control" />
            <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-label={filtersOpen ? "Masquer les thèmes" : "Afficher les thèmes"} className={`absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition ${filtersOpen || category !== ALL ? "bg-dema-sage text-dema-forest" : "bg-dema-canvas text-dema-muted"}`}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        {filtersOpen ? (
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrer les tutoriels par thème">
            {[ALL, ...categories].map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`demaa-chip ${category === item ? "demaa-chip-active" : ""}`}>{item}</button>)}
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">{results.length} contenus trouvés</p>
      </div>

      {results.length ? (
        <section aria-label="Tutoriels" className="px-4 py-14 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {results.map((card) => (
              <article key={card.href} className="min-w-0">
                <Link href={card.href} className="group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4">
                  <div className="relative flex aspect-video items-center overflow-hidden rounded-[1.25rem] border border-dema-forest/10 bg-dema-sage/45 p-6 sm:p-8">
                    {card.image ? (
                      <Image src={card.image} alt={card.imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    ) : (
                      <p className="max-w-[88%] font-serif text-2xl italic leading-tight text-dema-forest sm:text-3xl">{card.category}</p>
                    )}
                  </div>
                  <div className="px-0.5 pt-4">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-dema-forest/65">{card.format} · {card.category}</p>
                    <h2 className="mt-2 text-xl font-normal leading-tight tracking-[-0.02em] text-brand-blue transition-colors group-hover:text-dema-forest sm:text-2xl">{card.title}</h2>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : <p className="mx-auto max-w-4xl px-4 py-16 text-center text-dema-muted">Aucun contenu trouvé. Essayez un autre mot ou thème.</p>}
    </div>
  );
}
