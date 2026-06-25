"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import SearchFilterControls from "@/components/SearchFilterControls";
import RecruitmentDetailDialog from "@/components/RecruitmentDetailDialog";
import { ServiceIcon } from "@/components/ServiceIcon";
import { matchesSearchQuery } from "@/lib/search";
import {
  type DemaaRecruitmentItem,
  type RecruitmentFamily,
} from "@/lib/recruitment-catalog";

type RecruitmentDirectoryClientProps = {
  items: DemaaRecruitmentItem[];
  families: readonly RecruitmentFamily[];
  initialFamily?: string;
  initialSearch?: string;
  backLink?: {
    href: string;
    label: string;
  };
};

export default function RecruitmentDirectoryClient({
  items,
  families,
  initialFamily,
  initialSearch = "",
  backLink,
}: RecruitmentDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFamily, setActiveFamily] = useState(
    initialFamily && families.includes(initialFamily as RecruitmentFamily)
      ? initialFamily
      : "Tous",
  );
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DemaaRecruitmentItem | null>(null);

  useEffect(() => {
    function handlePopState() {
      setSelectedItem(null);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFamily =
        activeFamily === "Tous" || item.family === activeFamily;
      const matchesSearch = matchesSearchQuery(searchQuery, [
        item.name,
        item.provider,
        item.category,
        item.description,
        item.bestFor,
        ...item.tags,
        ...item.usefulFor,
        ...item.sectors,
      ]);

      return matchesFamily && matchesSearch;
    });
  }, [activeFamily, items, searchQuery]);

  const filters = useMemo(() => ["Tous", ...families], [families]);

  function openDetails(item: DemaaRecruitmentItem) {
    setSelectedItem(item);
    const detailUrl = `/annuaire-recrutement/${item.slug}`;

    if (window.location.pathname !== detailUrl) {
      window.history.pushState({ demaaRecruitmentModal: true }, "", detailUrl);
    }
  }

  function closeDetails() {
    if (window.history.state?.demaaRecruitmentModal) {
      window.history.back();
      return;
    }

    setSelectedItem(null);
  }

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
            Annuaire recrutement
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
            Des solutions utiles pour recruter, diffuser une offre, recruter en alternance ou trouver un renfort plus rapidement.
          </p>

          <div className="mt-5">
            <SearchFilterControls
              value={searchQuery}
              placeholder="Rechercher une solution, un sujet, un besoin..."
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
        <div className="flex items-center justify-end pb-5">
          {activeFamily !== "Tous" || searchQuery ? (
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
            <h2 className="text-xl font-bold text-brand-blue">Aucune solution trouvée</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou une famille plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <Link
                key={item.slug}
                href={`/annuaire-recrutement/${item.slug}`}
                onClick={(event) => handleRecruitmentCardClick(event, item, openDetails)}
                className="demaa-card group flex min-h-[17rem] flex-col rounded-[1.15rem] p-5 text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                    <ServiceIcon icon={item.icon} className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
                  {item.family}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-brand-blue">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  {item.shortDescription}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-blue/65">
                  {item.provider}
                  {item.format ? ` · ${item.format}` : ""}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-dema-forest">
                  {item.cta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {selectedItem ? (
        <RecruitmentDetailDialog item={selectedItem} onClose={closeDetails} />
      ) : null}
    </div>
  );
}

function handleRecruitmentCardClick(
  event: MouseEvent<HTMLAnchorElement>,
  item: DemaaRecruitmentItem,
  onOpenDetails: (item: DemaaRecruitmentItem) => void,
) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  onOpenDetails(item);
}
