"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  toolDirectory,
  toolDirectoryCategories,
  toolDirectorySectors,
} from "@/lib/tool-directory";

export default function ToolDirectoryClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState("Tous");
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return toolDirectory.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.bestFor.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        tool.sectors.some((sector) => sector.toLowerCase().includes(query)) ||
        tool.category.toLowerCase().includes(query);

      const matchesSector =
        activeSector === "Tous" || tool.sectors.includes(activeSector);

      const matchesCategory =
        activeCategory === "Tous" || tool.category === activeCategory;

      return matchesSearch && matchesSector && matchesCategory;
    });
  }, [activeCategory, activeSector, searchQuery]);

  return (
    <div className="w-full">
      <section className="w-full border-b border-brand-blue/5 bg-[#FFF9F8] px-4 pb-5 pt-8 md:pt-10">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
            Annuaire Outils
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-light leading-relaxed text-gray-400">
            Les outils utiles aux TPE, classés par secteur et usage.
          </p>

          <div className="mx-auto mt-5 max-w-2xl rounded-full border border-brand-blue/5 bg-white p-1.5 shadow-[0_10px_30px_rgba(25,27,48,0.035)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un outil, un usage, un secteur..."
                className="w-full rounded-full bg-white py-3 pl-10 pr-5 text-sm font-light text-brand-blue outline-none transition placeholder:text-brand-blue/25"
              />
            </div>
          </div>

          <div className="mx-auto mt-3 flex max-w-5xl gap-2 overflow-x-auto pb-2 soft-scroll">
            <FilterChip
              label="Tous"
              isActive={activeSector === "Tous" && activeCategory === "Tous"}
              onClick={() => {
                setActiveSector("Tous");
                setActiveCategory("Tous");
              }}
            />
            {toolDirectorySectors
              .filter((sector) => sector !== "Tous")
              .map((sector) => (
                <FilterChip
                  key={sector}
                  label={sector}
                  isActive={activeSector === sector}
                  onClick={() => {
                    setActiveSector(sector);
                    setActiveCategory("Tous");
                  }}
                />
              ))}
            {toolDirectoryCategories
              .filter((category) => category !== "Tous")
              .map((category) => (
                <FilterChip
                  key={category}
                  label={category}
                  isActive={activeCategory === category}
                  onClick={() => {
                    setActiveCategory(category);
                    setActiveSector("Tous");
                  }}
                />
              ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 md:py-7">
        <div className="flex items-center justify-between gap-4 pb-5">
          <p className="text-sm font-light text-gray-400">
            <span className="font-semibold text-brand-blue">{filteredTools.length}</span>{" "}
            outils trouvés
          </p>
          {(activeSector !== "Tous" || activeCategory !== "Tous" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveSector("Tous");
                setActiveCategory("Tous");
              }}
              className="text-xs font-medium text-brand-coral transition hover:text-brand-blue"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-brand-blue/10 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun outil trouvé</h2>
            <p className="mt-3 text-sm font-light text-gray-400">
              Essayez un autre secteur, une autre catégorie ou un mot-clé plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col rounded-[1.25rem] border border-brand-blue/8 bg-white p-4 shadow-[0_8px_24px_rgba(25,27,48,0.025)] transition hover:-translate-y-0.5 hover:border-brand-coral/25 hover:shadow-[0_16px_42px_rgba(25,27,48,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-brand-coral">
                      {tool.category}
                    </p>
                    <h2 className="mt-1.5 text-lg font-bold tracking-tight text-brand-blue">
                      {tool.name}
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-sm font-light leading-relaxed text-gray-500">
                  {tool.description}
                </p>

                <p className="mt-2 text-xs font-light leading-relaxed text-brand-blue/50">
                  {tool.bestFor}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tool.sectors.slice(0, 2).map((sector) => (
                    <span
                      key={sector}
                      className="rounded-full bg-[#FFF3EF] px-2.5 py-1 text-[10px] font-light text-brand-blue/70"
                    >
                      {sector}
                    </span>
                  ))}
                  {tool.sectors.length > 2 && (
                    <span className="rounded-full bg-brand-blue/5 px-2.5 py-1 text-[10px] font-light text-brand-blue/50">
                      +{tool.sectors.length - 2}
                    </span>
                  )}
                  {tool.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#FFF3EF] px-2.5 py-1 text-[10px] font-light text-brand-blue/55"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-3">
                  <span className="inline-flex rounded-full bg-brand-blue px-3 py-1 text-[10px] font-medium text-white">
                    {tool.pricingHint}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-xs transition ${
        isActive
          ? "bg-brand-blue text-white shadow-sm"
          : "bg-[#FFF3EF] text-brand-blue/65 hover:bg-brand-coral/15"
      }`}
    >
      {label}
    </button>
  );
}
