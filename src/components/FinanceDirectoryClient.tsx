"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import FinanceDetailDialog from "@/components/FinanceDetailDialog";
import SearchFilterControls from "@/components/SearchFilterControls";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getFinanceCardBadge } from "@/lib/card-badges";
import { type DemaaFinanceItem, type FinanceFamily } from "@/lib/finance-catalog";
import { matchesSearchQuery } from "@/lib/search";

type FinanceDirectoryClientProps = {
  items: DemaaFinanceItem[];
  families: readonly FinanceFamily[];
  initialSearch?: string;
  backLink?: {
    href: string;
    label: string;
  };
};

export default function FinanceDirectoryClient({
  items,
  families,
  initialSearch = "",
  backLink,
}: FinanceDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFamily, setActiveFamily] = useState<string>("Tous");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DemaaFinanceItem | null>(null);

  useEffect(() => {
    function handlePopState() {
      setSelectedItem(null);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = matchesSearchQuery(searchQuery, [
        item.name,
        item.description,
        item.bestFor,
        ...item.tags,
        ...item.usefulFor,
        item.category,
        item.family,
        item.slug,
      ]);
      const matchesFamily = activeFamily === "Tous" || item.family === activeFamily;

      return matchesSearch && matchesFamily;
    });
  }, [activeFamily, items, searchQuery]);

  const filters = useMemo(() => ["Tous", ...families], [families]);

  function openFinanceDetails(item: DemaaFinanceItem) {
    setSelectedItem(item);
    const detailUrl = `/annuaire-financement/${item.slug}`;

    if (window.location.pathname !== detailUrl) {
      window.history.pushState({ demaaFinanceModal: true }, "", detailUrl);
    }
  }

  function closeFinanceDetails() {
    if (window.history.state?.demaaFinanceModal) {
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
            Annuaire financement
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
            Comptes pro avec crédit, affacturage, BFR et solutions de leasing utiles aux TPE.
          </p>

          <div className="mt-5">
            <SearchFilterControls
              value={searchQuery}
              placeholder="Rechercher un acteur d'affacturage, de crédit ou de leasing..."
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
            <h2 className="text-xl font-bold text-brand-blue">Aucune solution de financement trouvée</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou une famille plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <FinanceCard key={item.slug} item={item} onOpenDetails={openFinanceDetails} />
            ))}
          </div>
        )}
      </section>

      {selectedItem ? (
        <FinanceDetailDialog item={selectedItem} onClose={closeFinanceDetails} />
      ) : null}
    </div>
  );
}

function FinanceCard({
  item,
  onOpenDetails,
}: {
  item: DemaaFinanceItem;
  onOpenDetails: (item: DemaaFinanceItem) => void;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
          <ServiceIcon icon={item.icon} className="h-4 w-4" aria-hidden="true" />
        </span>
        {item.partner ? (
          <span className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/70">
            partenaire
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
        {item.category}
      </p>
      <h2 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
        {item.name}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-dema-muted">
        {item.shortDescription}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        {getFinanceCardBadge(item) ? (
          <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
            {getFinanceCardBadge(item)}
          </span>
        ) : (
          <span />
        )}
                    <span className="inline-flex items-center text-dema-forest" aria-hidden="true">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
      </div>
    </>
  );

  return (
    <Link
      href={`/annuaire-financement/${item.slug}`}
      className="demaa-card group flex min-h-[15rem] flex-col rounded-[1.15rem] p-5 text-left"
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onOpenDetails(item);
      }}
    >
      {content}
    </Link>
  );
}
