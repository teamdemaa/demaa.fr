"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import SearchFilterControls from "@/components/SearchFilterControls";
import { ServiceIcon } from "@/components/ServiceIcon";
import SupplierDetailDialog from "@/components/SupplierDetailDialog";
import { matchesSearchQuery } from "@/lib/search";
import { type DemaaSupplier, type SupplierFamily } from "@/lib/supplier-catalog";

type SupplierDirectoryClientProps = {
  suppliers: DemaaSupplier[];
  families: readonly SupplierFamily[];
  initialCategory?: string;
  initialSearch?: string;
  backLink?: {
    href: string;
    label: string;
  };
};

export default function SupplierDirectoryClient({
  suppliers,
  families,
  initialSearch = "",
  backLink,
}: SupplierDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFamily, setActiveFamily] = useState<string>("Tous");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<DemaaSupplier | null>(null);

  useEffect(() => {
    function handlePopState() {
      setSelectedSupplier(null);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch = matchesSearchQuery(searchQuery, [
        supplier.name,
        supplier.description,
        supplier.bestFor,
        ...supplier.tags,
        ...supplier.usefulFor,
        supplier.category,
        supplier.family,
        supplier.slug,
      ]);

      const matchesFamily =
        activeFamily === "Tous" || supplier.family === activeFamily;

      return matchesSearch && matchesFamily;
    });
  }, [activeFamily, searchQuery, suppliers]);
  const supplierFilters = useMemo(() => ["Tous", ...families], [families]);

  function openSupplierDetails(supplier: DemaaSupplier) {
    setSelectedSupplier(supplier);
    const detailUrl = `/annuaire-fournisseurs/${supplier.slug}`;

    if (window.location.pathname !== detailUrl) {
      window.history.pushState({ demaaSupplierModal: true }, "", detailUrl);
    }
  }

  function closeSupplierDetails() {
    if (window.history.state?.demaaSupplierModal) {
      window.history.back();
      return;
    }

    setSelectedSupplier(null);
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
            Annuaire Partenaires & fournisseurs
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
            Banques, assurances, mutuelles, achats, équipements et partenaires utiles selon l&apos;activité.
          </p>

          <div className="mt-5">
            <SearchFilterControls
              value={searchQuery}
              placeholder="Rechercher une banque, un grossiste, un partenaire..."
              activeFilter={activeFamily}
              defaultFilter="Tous"
              isFilterOpen={isFilterPanelOpen}
              filters={supplierFilters}
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

        {filteredSuppliers.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun partenaire ou fournisseur trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou une catégorie plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.slug}
                supplier={supplier}
                onOpenDetails={openSupplierDetails}
              />
            ))}
          </div>
        )}
      </section>

      {selectedSupplier ? (
        <SupplierDetailDialog supplier={selectedSupplier} onClose={closeSupplierDetails} />
      ) : null}
    </div>
  );
}

function SupplierCard({
  supplier,
  onOpenDetails,
}: {
  supplier: DemaaSupplier;
  onOpenDetails: (supplier: DemaaSupplier) => void;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
          <ServiceIcon icon={supplier.icon} className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-brand-blue">
        {supplier.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-dema-muted">
        {supplier.shortDescription}
      </p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-blue/65">
        {supplier.bestFor}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
          {supplier.offerHint}
        </span>
        <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
          {supplier.category}
        </span>
        {supplier.partner ? (
          <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
            partenaire
          </span>
        ) : null}
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-dema-forest">
        {supplier.cta}
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </>
  );

  return (
    <Link
      href={`/annuaire-fournisseurs/${supplier.slug}`}
      onClick={(event) => handleSupplierCardClick(event, supplier, onOpenDetails)}
      className="demaa-card group flex min-h-[17rem] flex-col rounded-[1.15rem] p-5 text-left"
    >
      {content}
    </Link>
  );
}

function handleSupplierCardClick(
  event: MouseEvent<HTMLAnchorElement>,
  supplier: DemaaSupplier,
  onOpenDetails: (supplier: DemaaSupplier) => void,
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
  onOpenDetails(supplier);
}
