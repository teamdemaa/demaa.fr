"use client";

import { SlidersHorizontal, X } from "lucide-react";

type SearchFilterControlsProps = {
  value: string;
  placeholder: string;
  activeFilter: string;
  defaultFilter: string;
  isFilterOpen: boolean;
  filters: readonly string[];
  onChange: (value: string) => void;
  onFilterClick: () => void;
  onFilterSelect: (filter: string) => void;
};

export default function SearchFilterControls({
  value,
  placeholder,
  activeFilter,
  defaultFilter,
  isFilterOpen,
  filters,
  onChange,
  onFilterClick,
  onFilterSelect,
}: SearchFilterControlsProps) {
  return (
    <>
      <div className="demaa-search-shell mx-auto w-full max-w-4xl">
        <div className="relative">
          <input
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full rounded-full bg-dema-paper py-2.5 pl-5 pr-24 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-3 md:pl-6 md:pr-28 md:text-base"
          />
          <button
            type="button"
            onClick={onFilterClick}
            className={`absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition md:h-9 md:w-9 ${
              activeFilter === defaultFilter
                ? "bg-dema-sage text-dema-forest"
                : "bg-dema-forest text-dema-paper"
            }`}
            aria-expanded={isFilterOpen}
            aria-label="Afficher les filtres"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-11 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-dema-forest/42 transition hover:bg-dema-sage/70 hover:text-dema-forest/70 md:right-12"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {isFilterOpen ? (
        <div className="mx-auto mt-3 max-w-4xl overflow-x-auto pb-1 soft-scroll">
          <div className="flex min-w-max gap-2 px-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
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
    </>
  );
}
