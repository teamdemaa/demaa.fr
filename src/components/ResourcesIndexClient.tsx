"use client";

import { useMemo, useState } from "react";
import ModelResourceCard from "@/components/ModelResourceCard";
import LibraryIndexHeader from "@/components/LibraryIndexHeader";
import type { DocumentModel } from "@/lib/document-models";
import { matchesSearchQuery } from "@/lib/search";
import { SYSTEM_RESOURCES } from "@/lib/system-resource-catalog";

type ResourcesIndexClientProps = {
  entries: DocumentModel[];
  headingAs?: "h1" | "h2";
  embedded?: boolean;
};

export default function ResourcesIndexClient({
  entries,
  headingAs = "h1",
  embedded = false,
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
        headingAs={headingAs}
        embedded={embedded}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry) => {
              const resource = SYSTEM_RESOURCES.find((item) => item.resourceSlug === entry.slug);
              if (!resource) return null;
              return (
                <div
                  key={entry.slug}
                  className="h-full"
                >
                  <ModelResourceCard resource={resource} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
