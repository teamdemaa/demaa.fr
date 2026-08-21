"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export default function AppLibrarySearch({
  activeFilter,
  filters,
  isFilterOpen,
  onFilterSelect,
  onFilterToggle,
  onQueryChange,
  placeholder,
  query,
  unconstrained = false,
  filterLabels = {
    close: "Masquer les catégories",
    group: "Filtrer par catégorie",
    open: "Afficher les catégories",
  },
}: {
  activeFilter: string;
  filters: readonly string[];
  isFilterOpen: boolean;
  onFilterSelect: (filter: string) => void;
  onFilterToggle: () => void;
  onQueryChange: (query: string) => void;
  placeholder: string;
  query: string;
  unconstrained?: boolean;
  filterLabels?: {
    close: string;
    group: string;
    open: string;
  };
}) {
  return (
    <div className={unconstrained
      ? "relative w-full"
      : "relative mx-auto w-full max-w-xl xl:w-[min(40vw,36rem)]"}
    >
      <div className="demaa-search-shell p-1">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label={placeholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="min-h-10 w-full rounded-full bg-dema-paper pl-11 pr-12 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/30"
          />
          <button
            type="button"
            onClick={onFilterToggle}
            aria-expanded={isFilterOpen}
            aria-label={isFilterOpen ? filterLabels.close : filterLabels.open}
            className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition ${
              isFilterOpen || activeFilter !== filters[0]
                ? "bg-dema-sage text-dema-forest"
                : "bg-dema-canvas text-dema-muted"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isFilterOpen ? (
        <div
          className="demaa-popover-shadow absolute left-0 right-0 top-full z-40 mt-2 rounded-2xl border border-dema-line bg-dema-paper p-2"
          aria-label={filterLabels.group}
        >
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                aria-pressed={activeFilter === filter}
                onClick={() => onFilterSelect(filter)}
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
  );
}
