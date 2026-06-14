"use client";

import SearchFilterControls from "@/components/SearchFilterControls";

type LibraryIndexHeaderProps = {
  title: string;
  description: string;
  searchValue: string;
  searchPlaceholder: string;
  activeFilter: string;
  defaultFilter: string;
  isFilterOpen: boolean;
  filters: readonly string[];
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onFilterSelect: (filter: string) => void;
};

export default function LibraryIndexHeader({
  title,
  description,
  searchValue,
  searchPlaceholder,
  activeFilter,
  defaultFilter,
  isFilterOpen,
  filters,
  onSearchChange,
  onFilterClick,
  onFilterSelect,
}: LibraryIndexHeaderProps) {
  return (
    <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-5 pt-8 md:pt-10">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
          {description}
        </p>

        <div className="mt-5">
          <SearchFilterControls
            value={searchValue}
            placeholder={searchPlaceholder}
            activeFilter={activeFilter}
            defaultFilter={defaultFilter}
            isFilterOpen={isFilterOpen}
            filters={filters}
            onChange={onSearchChange}
            onFilterClick={onFilterClick}
            onFilterSelect={onFilterSelect}
          />
        </div>
      </div>
    </section>
  );
}
