"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import DocumentModelPreview from "@/components/DocumentModelPreview";
import LibraryIndexHeader from "@/components/LibraryIndexHeader";
import type { DocumentModel } from "@/lib/document-models";
import { matchesSearchQuery } from "@/lib/search";

type ResourcesIndexClientProps = {
  entries: DocumentModel[];
};

export default function ResourcesIndexClient({
  entries,
}: ResourcesIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const filters = useMemo(() => {
    const categoryFilters = Array.from(
      new Set(entries.map((entry) => entry.category).filter(Boolean)),
    );

    return ["Tous", ...categoryFilters];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch = matchesSearchQuery(searchQuery, [
        entry.title,
        entry.description,
        entry.category,
        entry.slug,
        ...entry.tags,
      ]);

      const matchesFilter = activeFilter === "Tous" || entry.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, entries, searchQuery]);

  return (
    <div className="w-full">
      <LibraryIndexHeader
        title="Modèles de documents"
        description="Retrouvez les modèles de documents Demaa pour piloter, organiser et structurer votre activité avec une base exploitable."
        searchValue={searchQuery}
        searchPlaceholder="Rechercher un modèle, un tableau de pilotage, un sujet..."
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
          {(searchQuery || activeFilter !== "Tous") ? (
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
            <h2 className="text-xl font-bold text-brand-blue">Aucun modèle trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou un filtre plus large.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.map((entry) => {
              return (
                <Link
                  key={entry.slug}
                  href={`/modeles-de-documents/${entry.slug}`}
                  className="block h-full group"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(0,0,0,0.045)]">
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-gray-100 bg-white">
                      <DocumentModelPreview model={entry} />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2 text-sm font-medium text-brand-coral">
                          <BookOpen className="h-4 w-4" />
                          <span>
                            {new Date(entry.date).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <h2 className="mt-4 text-[1.85rem] font-normal leading-tight text-brand-blue transition-colors group-hover:text-neutral-700">
                        {entry.title}
                      </h2>
                      <p className="mt-3 leading-relaxed text-gray-500">
                        {entry.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/75"
                          >
                            {tag}
                          </span>
                        ))}
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
