"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import SearchFilterControls from "@/components/SearchFilterControls";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  type AidFamilyDefinition,
  type DemaaAidItem,
} from "@/lib/aid-catalog";
import { matchesSearchQuery } from "@/lib/search";

type AidDirectoryClientProps = {
  items: DemaaAidItem[];
  families: AidFamilyDefinition[];
  initialSearch?: string;
  returnSystemSlug?: string;
  backLink?: {
    href: string;
    label: string;
  };
};

export default function AidDirectoryClient({
  items,
  families,
  initialSearch = "",
  returnSystemSlug,
  backLink,
}: AidDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFamily, setActiveFamily] = useState<string>("Tous");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = matchesSearchQuery(searchQuery, [
        item.name,
        item.description,
        item.bestFor,
        ...item.tags,
        ...item.usefulFor,
        item.family,
        item.type,
        item.slug,
      ]);
      const matchesFamily = activeFamily === "Tous" || item.family === activeFamily;

      return matchesSearch && matchesFamily;
    });
  }, [activeFamily, items, searchQuery]);

  const filters = useMemo(() => ["Tous", ...families.map((family) => family.name)], [families]);
  const returnSystemQuery = returnSystemSlug
    ? `?retourSysteme=${encodeURIComponent(returnSystemSlug)}`
    : "";

  return (
    <div className="w-full">
      <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-5 pt-8 md:pt-10">
        <div className="mx-auto max-w-5xl text-center">
          {backLink ? (
            <div className="mb-4 flex justify-start">
              <Link
                href={backLink.href}
                className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {backLink.label}
              </Link>
            </div>
          ) : null}
          <h1 className="demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
            Aides & subventions
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
            Un point d&apos;entrée simple pour repérer les aides les plus regardées par les TPE et PME.
          </p>

          <div className="mt-5">
            <SearchFilterControls
              value={searchQuery}
              placeholder="Rechercher une aide, un dispositif ou un besoin..."
              activeFilter={activeFamily}
              defaultFilter="Tous"
              isFilterOpen={isFilterPanelOpen}
              filters={filters}
              onChange={setSearchQuery}
              onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
              onFilterSelect={(filter) => {
                setActiveFamily(filter);
                setIsFilterPanelOpen(false);
              }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {families.map((family) => (
            <Link
              key={family.slug}
              href={`/aides-et-subventions/${family.slug}${returnSystemQuery}`}
              className="demaa-card group flex min-h-[14rem] flex-col rounded-[1.15rem] p-5 text-left"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                <ServiceIcon icon={family.icon} className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
                Famille
              </p>
              <h2 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
                {family.name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                {family.shortDescription}
              </p>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end pb-5 pt-8">
          {(searchQuery || activeFamily !== "Tous") ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFamily("Tous");
              }}
              className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
            >
              Réinitialiser
            </button>
          ) : null}
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucune aide trouvée</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez une autre famille ou un autre mot-clé.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <Link
                key={item.slug}
                href={`/aides-et-subventions/${item.slug}${returnSystemQuery}`}
                className="demaa-card group flex min-h-[15rem] flex-col rounded-[1.15rem] p-5 text-left"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                  <ServiceIcon icon={item.icon} className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
                  {item.family}
                </p>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
                  {item.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  {item.shortDescription}
                </p>
                <div className="mt-auto pt-4">
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
                    {item.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
