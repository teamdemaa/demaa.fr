"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import PrimaryMobileNav, { type PrimaryNavTab } from "@/components/PrimaryMobileNav";
import SystemsCatalogClient from "@/components/SystemsCatalogClient";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { System } from "@/lib/types";

type HomeTabsClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  initialSystem?: string;
};

export default function HomeTabsClient({
  systems,
  detailsBySlug,
  initialSystem,
}: HomeTabsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  function selectPrimaryMobileTab(tab: PrimaryNavTab) {
    if (tab === "structurer") {
      window.history.replaceState(null, "", "/");
      setSearchQuery("");
    }
  }

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-5 pt-12 text-center md:px-8 md:pb-6 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-[2.24rem] tracking-tight leading-[0.98] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              <span className="demaa-hero-title text-brand-blue/86">
                Organisez efficacement
              </span>{" "}
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/44">
                votre entreprise
              </span>
            </h1>
          </div>

          <SearchBar
            value={searchQuery}
            placeholder="Rechercher votre activité"
            onChange={setSearchQuery}
          />
        </div>
      </section>

      <SystemsCatalogClient
        key={`systems-${initialSystem ?? "none"}`}
        systems={systems}
        detailsBySlug={detailsBySlug}
        showIntro={false}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showSearchBar={false}
        initialSelectedSlug={initialSystem}
      />

      <div className="h-24 md:hidden" aria-hidden="true" />
      <PrimaryMobileNav activeTab="structurer" onSelect={selectPrimaryMobileTab} />
    </>
  );
}

function SearchBar({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="demaa-search-shell mx-auto w-full max-w-4xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42 md:left-5 md:h-5 md:w-5" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-full bg-dema-paper py-2.5 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-3 md:pl-12 md:text-base"
        />
      </div>
    </div>
  );
}
