"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import LibraryIndexHeader from "@/components/LibraryIndexHeader";
import {
  getContentFormat,
  type ContentCatalogEntry,
} from "@/lib/content-catalog";
import { matchesSearchQuery } from "@/lib/search";

type ContentDirectoryClientProps = Readonly<{
  entries: readonly ContentCatalogEntry[];
}>;

export default function ContentDirectoryClient({ entries }: ContentDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filters = useMemo(
    () => ["Tous", ...Array.from(new Set(entries.map((entry) => entry.category)))],
    [entries],
  );
  const filteredEntries = useMemo(
    () => entries.filter((entry) => (
      matchesSearchQuery(searchQuery, [
        entry.title,
        entry.shortTitle,
        entry.summary,
        entry.category,
        ...entry.tags,
      ]) && (activeFilter === "Tous" || entry.category === activeFilter)
    )),
    [activeFilter, entries, searchQuery],
  );

  return (
    <div className="w-full">
      <LibraryIndexHeader
        title="Contenus"
        description="Des explications concrètes pour comprendre un sujet et savoir quoi faire ensuite."
        searchValue={searchQuery}
        searchPlaceholder="Rechercher un sujet..."
        activeFilter={activeFilter}
        defaultFilter="Tous"
        isFilterOpen={isFilterOpen}
        filters={filters}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setIsFilterOpen((current) => !current)}
        onFilterSelect={(filter) => {
          setActiveFilter(filter);
          setIsFilterOpen(false);
        }}
      />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex min-h-7 justify-end pb-5">
          {searchQuery || activeFilter !== "Tous" ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("Tous");
              }}
              className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
            >
              Réinitialiser
            </button>
          ) : null}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-medium text-brand-blue">Aucun contenu trouvé</h2>
            <p className="mt-2 text-sm text-dema-muted">Essayez un autre mot-clé ou un filtre plus large.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.map((entry) => {
              const image = entry.media.youtubeThumbnail ?? entry.media.slides?.[0];
              return (
                <Link key={entry.slug} href={`/contenus/${entry.slug}`} className="group block">
                  <article className="demaa-card h-full overflow-hidden rounded-[1.5rem]">
                    <div className="relative aspect-video overflow-hidden border-b border-dema-line bg-dema-sage">
                      {image ? (
                        <Image
                          src={image}
                          alt={`Aperçu : ${entry.shortTitle}`}
                          fill
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.015]"
                        />
                      ) : null}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-dema-sage px-3 py-1 text-xs font-medium text-dema-forest">
                          {getContentFormat(entry)}
                        </span>
                        <span className="text-xs text-dema-muted">{entry.category}</span>
                      </div>
                      <h2 className="mt-4 text-2xl font-normal leading-tight text-brand-blue">
                        {entry.shortTitle}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-dema-muted">{entry.summary}</p>
                      <div className="mt-5 flex items-center justify-end text-dema-forest">
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
