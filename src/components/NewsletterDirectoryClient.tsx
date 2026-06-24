"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import LibraryIndexHeader from "@/components/LibraryIndexHeader";
import { matchesSearchQuery } from "@/lib/search";
import type { NewsletterDirectoryEntry } from "@/lib/newsletter-content";

type NewsletterDirectoryClientProps = {
  entries: NewsletterDirectoryEntry[];
};

export default function NewsletterDirectoryClient({
  entries,
}: NewsletterDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const filters = useMemo(() => {
    const sectorFilters = Array.from(
      new Set(entries.map((entry) => entry.sectorLabel).filter(Boolean)),
    );

    return ["Tous", ...sectorFilters];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch = matchesSearchQuery(searchQuery, [
        entry.title,
        entry.description,
        entry.sectorLabel,
        entry.slug,
        ...entry.tags,
      ]);

      const matchesFilter = activeFilter === "Tous" || entry.sectorLabel === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, entries, searchQuery]);

  function renderNewsletterCard(entry: NewsletterDirectoryEntry) {
    return (
      <Link
        key={entry.slug}
        href={`/annuaire-newsletters/${entry.slug}`}
        className="block h-full group"
      >
        <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(0,0,0,0.045)]">
          <div className="flex aspect-[16/10] items-center justify-center border-b border-dema-forest/10 bg-[radial-gradient(circle_at_top,#5a8a6f_0%,#2f6548_58%,#1d3e2c_100%)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <Mail className="h-7 w-7" />
            </div>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h2 className="text-[1.85rem] font-normal leading-tight text-brand-blue transition-colors group-hover:text-neutral-700">
              {entry.title}
            </h2>
            <p className="mt-3 leading-relaxed text-gray-500">
              {entry.description}
            </p>
            <p className="mt-3 text-xs font-medium text-dema-muted">
              Editeur recommande : <span className="text-brand-blue">{entry.publisher}</span>
            </p>
            <div className="mt-5 flex justify-end">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-brand-blue transition-colors group-hover:bg-neutral-100 group-hover:text-neutral-700">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <div className="w-full">
      <LibraryIndexHeader
        title="Annuaire newsletters"
        description="Retrouvez les newsletters recommandees par Demaa par secteur d'activite, avec une fiche de contexte puis un acces direct vers la source editoriale."
        searchValue={searchQuery}
        searchPlaceholder="Rechercher une newsletter, un secteur, un sujet..."
        activeFilter={activeFilter}
        defaultFilter="Tous"
        isFilterOpen={isFilterPanelOpen}
        filters={filters}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
        onFilterSelect={(filter) => {
          setActiveFilter(filter);
          setIsFilterPanelOpen(false);
        }}
      />

      <section className="mx-auto max-w-6xl px-4 py-7">
        <div className="flex items-center justify-end pb-5">
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
            <h2 className="text-xl font-bold text-brand-blue">Aucune newsletter trouvée</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou un filtre plus large.
            </p>
          </div>
        ) : (
          <section>
            <div className="pb-5">
              <h2 className="text-2xl font-bold text-brand-blue">Newsletters</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
                Une carte par newsletter reelle, avec acces direct vers sa source editoriale.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredEntries.map((entry) => renderNewsletterCard(entry))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
