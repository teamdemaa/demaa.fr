"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Map,
  PanelRightOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import AccountingAppointmentDialog from "@/components/AccountingAppointmentDialog";
import AccountingDirectoryMap from "@/components/AccountingDirectoryMap";
import AccountingFirmCard from "@/components/AccountingFirmCard";
import AccountingFirmDetailContent from "@/components/AccountingFirmDetailContent";
import type {
  AccountingDirectoryFacet,
  AccountingDirectoryFacets,
  AccountingDirectoryFilters,
  AccountingFirm,
} from "@/lib/accounting-directory";
import { getFilteredAccountingFirms } from "@/lib/accounting-directory";

type AccountingDirectoryClientProps = {
  firms: AccountingFirm[];
  facets: AccountingDirectoryFacets;
  title: string;
  description?: string;
  initialFilters?: AccountingDirectoryFilters;
  backLink?: {
    href: string;
    label: string;
  };
};

type ActiveFilterChip = {
  key: string;
  label: string;
  onClear: () => void;
};

const PAGE_SIZE = 20;
const MAX_SELECTED_FIRMS = 3;

export default function AccountingDirectoryClient({
  firms,
  facets,
  title,
  description,
  initialFilters = {},
  backLink,
}: AccountingDirectoryClientProps) {
  const [filters, setFilters] = useState<AccountingDirectoryFilters>(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [visibleFirmCount, setVisibleFirmCount] = useState(PAGE_SIZE);
  const [selectedFirmSlugs, setSelectedFirmSlugs] = useState<string[]>([]);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [profileFirm, setProfileFirm] = useState<AccountingFirm | null>(null);
  const [previewFirmSlug, setPreviewFirmSlug] = useState<string | undefined>();
  const [showMap, setShowMap] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const filteredFirms = useMemo(
    () => getFilteredAccountingFirms(firms, filters),
    [firms, filters]
  );
  const visibleFirms = filteredFirms.slice(0, visibleFirmCount);
  const remainingFirmCount = Math.max(0, filteredFirms.length - visibleFirms.length);
  const selectedFirms = useMemo(
    () =>
      selectedFirmSlugs
        .map((slug) => firms.find((firm) => firm.slug === slug))
        .filter((firm): firm is AccountingFirm => Boolean(firm)),
    [firms, selectedFirmSlugs]
  );
  const profileSimilarFirms = useMemo(() => {
    if (!profileFirm) return [];
    return getFilteredAccountingFirms(
      firms.filter((firm) => firm.slug !== profileFirm.slug),
      {
        city: profileFirm.city,
        region: profileFirm.regions[0],
        service: profileFirm.services[0],
      }
    ).slice(0, 3);
  }, [firms, profileFirm]);

  const updateFilter = <Key extends keyof AccountingDirectoryFilters>(
    key: Key,
    value: AccountingDirectoryFilters[Key]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
    setVisibleFirmCount(PAGE_SIZE);
    setPreviewFirmSlug(undefined);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setVisibleFirmCount(PAGE_SIZE);
    setPreviewFirmSlug(undefined);
  };

  const activeFilterChips = useMemo(() => {
    const facetLabel = (items: AccountingDirectoryFacet[], value?: string) =>
      value ? items.find((item) => item.value === value)?.label ?? value : "";

    const chips: ActiveFilterChip[] = [];

    if (filters.city) {
      chips.push({
        key: "city",
        label: facetLabel(facets.cities, filters.city),
        onClear: () => updateFilter("city", undefined),
      });
    }
    if (filters.region) {
      chips.push({
        key: "region",
        label: facetLabel(facets.regions, filters.region),
        onClear: () => updateFilter("region", undefined),
      });
    }
    if (filters.service) {
      chips.push({
        key: "service",
        label: facetLabel(facets.services, filters.service),
        onClear: () => updateFilter("service", undefined),
      });
    }
    if (filters.industry) {
      chips.push({
        key: "industry",
        label: facetLabel(facets.industries, filters.industry),
        onClear: () => updateFilter("industry", undefined),
      });
    }
    if (filters.clientType) {
      chips.push({
        key: "clientType",
        label: facetLabel(facets.clientTypes, filters.clientType),
        onClear: () => updateFilter("clientType", undefined),
      });
    }
    if (filters.tool) {
      chips.push({
        key: "tool",
        label: facetLabel(facets.tools, filters.tool),
        onClear: () => updateFilter("tool", undefined),
      });
    }
    if (filters.verifiedOnly) {
      chips.push({
        key: "verifiedOnly",
        label: "Vérifiés OEC",
        onClear: () => updateFilter("verifiedOnly", false),
      });
    }
    if (filters.newClientsOnly) {
      chips.push({
        key: "newClientsOnly",
        label: "Nouveaux clients",
        onClear: () => updateFilter("newClientsOnly", false),
      });
    }
    if (filters.creationOfferOnly) {
      chips.push({
        key: "creationOfferOnly",
        label: "Création d'entreprise",
        onClear: () => updateFilter("creationOfferOnly", false),
      });
    }

    return chips;
  }, [facets, filters]);

  const toggleFirmSelection = (firm: AccountingFirm) => {
    setSelectionMessage("");
    setSelectedFirmSlugs((current) => {
      if (current.includes(firm.slug)) {
        return current.filter((slug) => slug !== firm.slug);
      }

      if (current.length >= MAX_SELECTED_FIRMS) {
        setSelectionMessage("Vous pouvez sélectionner jusqu'à 3 cabinets.");
        return current;
      }

      return [...current, firm.slug];
    });
  };

  return (
    <>
      <div className="min-h-screen bg-dema-cream text-brand-blue">
        <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-5 pt-8 md:px-8 md:pt-10">
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
              {title}
            </h1>
            {description ? (
              <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
                {description}
              </p>
            ) : null}
            <div className="mt-5">
              <div className="demaa-search-shell mx-auto w-full max-w-4xl">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue/36"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={filters.query ?? ""}
                    onChange={(event) => updateFilter("query", event.target.value)}
                    placeholder="Rechercher un cabinet, un besoin, un secteur..."
                    aria-label="Rechercher un cabinet"
                    className="w-full rounded-full bg-dema-paper py-2.5 pl-11 pr-24 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-3 md:pl-6 md:pr-28 md:text-base lg:pl-12"
                  />
                  {filters.query ? (
                    <button
                      type="button"
                      onClick={() => updateFilter("query", "")}
                      className="absolute right-11 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-dema-forest/42 transition hover:bg-dema-sage/70 hover:text-dema-forest/70 md:right-12"
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(true)}
                    className={`absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition md:h-9 md:w-9 ${
                      activeFilterChips.length
                        ? "bg-dema-forest text-dema-paper"
                        : "bg-dema-sage text-dema-forest"
                    }`}
                    aria-label={`Afficher les filtres${activeFilterChips.length ? `, ${activeFilterChips.length} actifs` : ""}`}
                  >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {activeFilterChips.length ? (
              <div className="mx-auto mt-3 max-w-4xl overflow-x-auto pb-1 soft-scroll">
                <div className="flex min-w-max gap-2 px-1">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      className="demaa-chip demaa-chip-active inline-flex shrink-0 items-center gap-2 whitespace-nowrap"
                      onClick={chip.onClear}
                    >
                      {chip.label}
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end pb-5">
            {(filters.query ||
              filters.city ||
              filters.region ||
              filters.service ||
              filters.industry ||
              filters.clientType ||
              filters.tool ||
              filters.verifiedOnly ||
              filters.newClientsOnly ||
              filters.creationOfferOnly) ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
              >
                Réinitialiser
              </button>
            ) : null}
          </div>

          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-blue">
                  {filteredFirms.length} cabinet{filteredFirms.length > 1 ? "s" : ""} trouvé
                  {filteredFirms.length > 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-sm text-dema-muted">
                  Sélectionnez jusqu&apos;à 3 cabinets pour une mise en relation directe.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!showMap ? (
                  <button
                    type="button"
                    className="hidden items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest lg:inline-flex"
                    onClick={() => setShowMap(true)}
                  >
                    <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
                    Afficher la carte
                  </button>
                ) : null}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest lg:hidden"
                  onClick={() => setShowMobileMap(true)}
                >
                  <Map className="h-4 w-4" aria-hidden="true" />
                  Carte
                </button>
              </div>
            </div>

            {selectionMessage ? (
              <p className="mt-4 rounded-[1rem] border border-dema-line bg-dema-paper px-4 py-3 text-sm text-dema-forest">
                {selectionMessage}
              </p>
            ) : null}

            <div
              className={`mt-6 ${showMap ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start" : ""}`}
            >
              <div>
                {visibleFirms.length ? (
                  <div
                    className={
                      showMap
                        ? "grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3"
                        : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    }
                  >
                    {visibleFirms.map((firm) => (
                      <div
                        key={firm.id}
                        className="h-full"
                        onMouseEnter={
                          showMap ? () => setPreviewFirmSlug(firm.slug) : undefined
                        }
                        onMouseLeave={
                          showMap ? () => setPreviewFirmSlug(undefined) : undefined
                        }
                        onFocus={showMap ? () => setPreviewFirmSlug(firm.slug) : undefined}
                      >
                        <AccountingFirmCard
                          firm={firm}
                          isSelected={selectedFirmSlugs.includes(firm.slug)}
                          isSelectionDisabled={
                            selectedFirmSlugs.length >= MAX_SELECTED_FIRMS &&
                            !selectedFirmSlugs.includes(firm.slug)
                          }
                          isHighlighted={showMap && previewFirmSlug === firm.slug}
                          onToggleSelection={toggleFirmSelection}
                          onOpenProfile={setProfileFirm}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-8 text-center">
                    <h2 className="text-xl font-semibold text-brand-blue">
                      Aucun cabinet ne correspond pour l&apos;instant
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                      Ajustez les filtres ou élargissez la ville, le service ou le
                      secteur recherché.
                    </p>
                    <button
                      type="button"
                      className="mt-5 inline-flex rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
                      onClick={resetFilters}
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}

                {remainingFirmCount > 0 ? (
                  <div className="mt-8 flex flex-col gap-3 border-t border-dema-line/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-dema-muted">
                      {visibleFirms.length} cabinets affichés sur {filteredFirms.length}
                    </p>
                    <button
                      type="button"
                      className="inline-flex rounded-full border border-dema-line bg-dema-paper px-5 py-3 text-sm font-semibold text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                      onClick={() =>
                        setVisibleFirmCount((current) => current + PAGE_SIZE)
                      }
                    >
                      Voir plus ({remainingFirmCount})
                    </button>
                  </div>
                ) : null}
              </div>

              {showMap ? (
                <div className="hidden lg:block">
                  <AccountingDirectoryMap
                    firms={filteredFirms}
                    activeCity={filters.city}
                    highlightedFirmSlug={previewFirmSlug}
                    onCitySelect={(city) => updateFilter("city", city)}
                    onFirmPreview={setPreviewFirmSlug}
                    onOpenProfile={setProfileFirm}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>

      </div>

      {showAdvancedFilters ? (
        <AccountingDirectoryFilterModal
          filters={filters}
          facets={facets}
          onClose={() => setShowAdvancedFilters(false)}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />
      ) : null}

      {showMobileMap ? (
        <AccountingDirectoryMapDrawer
          firms={filteredFirms}
          activeCity={filters.city}
          highlightedFirmSlug={previewFirmSlug}
          onClose={() => setShowMobileMap(false)}
          onCitySelect={(city) => updateFilter("city", city)}
          onFirmPreview={setPreviewFirmSlug}
          onOpenProfile={(firm) => {
            setProfileFirm(firm);
            setShowMobileMap(false);
          }}
        />
      ) : null}

      {profileFirm ? (
        <AccountingDirectoryProfileModal
          firm={profileFirm}
          similarFirms={profileSimilarFirms}
          onClose={() => setProfileFirm(null)}
        />
      ) : null}

      {selectedFirms.length ? (
        <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-dema-line bg-dema-paper/95 px-4 py-3 shadow-[0_-12px_32px_-24px_rgba(23,35,29,0.35)] backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-blue">
                {selectedFirms.length} cabinet{selectedFirms.length > 1 ? "s" : ""}{" "}
                sélectionné{selectedFirms.length > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-sm text-dema-muted">
                {selectedFirms.map((firm) => firm.name).join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex rounded-full border border-dema-line bg-dema-paper px-4 py-3 text-sm font-semibold text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                onClick={() => setSelectedFirmSlugs([])}
              >
                Vider
              </button>
              <AccountingAppointmentDialog
                firms={selectedFirms}
                buttonLabel="Demander une mise en relation"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AccountingDirectoryFilterModal({
  filters,
  facets,
  onClose,
  onFilterChange,
  onReset,
}: {
  filters: AccountingDirectoryFilters;
  facets: AccountingDirectoryFacets;
  onClose: () => void;
  onFilterChange: <Key extends keyof AccountingDirectoryFilters>(
    key: Key,
    value: AccountingDirectoryFilters[Key]
  ) => void;
  onReset: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end bg-brand-blue/40 px-4 py-4 md:items-center md:justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 shadow-[0_24px_70px_rgba(23,35,29,0.2)] md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dema-forest">
              Affiner la recherche
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue">
              Filtres avancés
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FacetSelect
            label="Ville"
            value={filters.city}
            facets={facets.cities}
            onChange={(value) => onFilterChange("city", value)}
          />
          <FacetSelect
            label="Région"
            value={filters.region}
            facets={facets.regions}
            onChange={(value) => onFilterChange("region", value)}
          />
          <FacetSelect
            label="Service"
            value={filters.service}
            facets={facets.services}
            onChange={(value) => onFilterChange("service", value)}
          />
          <FacetSelect
            label="Secteur"
            value={filters.industry}
            facets={facets.industries}
            onChange={(value) => onFilterChange("industry", value)}
          />
          <FacetSelect
            label="Type de client"
            value={filters.clientType}
            facets={facets.clientTypes}
            onChange={(value) => onFilterChange("clientType", value)}
          />
          <FacetSelect
            label="Outil"
            value={filters.tool}
            facets={facets.tools}
            onChange={(value) => onFilterChange("tool", value)}
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <ToggleFilter
            label="Vérifiés OEC"
            checked={Boolean(filters.verifiedOnly)}
            onChange={(checked) => onFilterChange("verifiedOnly", checked)}
          />
          <ToggleFilter
            label="Nouveaux clients"
            checked={Boolean(filters.newClientsOnly)}
            onChange={(checked) => onFilterChange("newClientsOnly", checked)}
          />
          <ToggleFilter
            label="Création d'entreprise"
            checked={Boolean(filters.creationOfferOnly)}
            onChange={(checked) => onFilterChange("creationOfferOnly", checked)}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            className="inline-flex rounded-full border border-dema-line bg-dema-paper px-4 py-3 text-sm font-semibold text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            onClick={onReset}
          >
            Réinitialiser
          </button>
          <button
            type="button"
            className="inline-flex rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
            onClick={onClose}
          >
            Voir les résultats
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountingDirectoryMapDrawer({
  firms,
  activeCity,
  highlightedFirmSlug,
  onClose,
  onCitySelect,
  onFirmPreview,
  onOpenProfile,
}: {
  firms: AccountingFirm[];
  activeCity?: string;
  highlightedFirmSlug?: string;
  onClose: () => void;
  onCitySelect: (city?: string) => void;
  onFirmPreview: (slug?: string) => void;
  onOpenProfile: (firm: AccountingFirm) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[85] bg-brand-blue/35 px-4 py-4 lg:hidden"
      onClick={onClose}
    >
      <div
        className="absolute inset-x-4 bottom-4 max-h-[82vh] overflow-y-auto rounded-[1.25rem] border border-dema-line bg-dema-paper p-4 shadow-[0_24px_70px_rgba(23,35,29,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-blue">Carte des cabinets</p>
            <p className="text-xs text-dema-muted">
              Touchez une ville pour filtrer.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <AccountingDirectoryMap
          firms={firms}
          activeCity={activeCity}
          highlightedFirmSlug={highlightedFirmSlug}
          onCitySelect={(city) => {
            onCitySelect(city);
          }}
          onFirmPreview={onFirmPreview}
          onOpenProfile={onOpenProfile}
          onAfterCitySelect={onClose}
        />
      </div>
    </div>
  );
}

function AccountingDirectoryProfileModal({
  firm,
  similarFirms,
  onClose,
}: {
  firm: AccountingFirm;
  similarFirms: AccountingFirm[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[95] overflow-y-auto bg-brand-blue/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative mx-auto max-w-6xl rounded-[1.25rem] border border-dema-line bg-dema-cream p-4 shadow-[0_24px_70px_rgba(23,35,29,0.2)] md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <AccountingFirmDetailContent
          firm={firm}
          similarFirms={similarFirms}
          showBackLink={false}
        />
      </div>
    </div>
  );
}

function FacetSelect({
  label,
  value,
  facets,
  onChange,
}: {
  label: string;
  value?: string;
  facets: AccountingDirectoryFacet[];
  onChange: (value?: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-blue">{label}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="demaa-input w-full rounded-xl border-dema-line bg-dema-paper pr-10"
      >
        <option value="">Tous</option>
        {facets.map((facet) => (
          <option key={`${label}-${facet.value}`} value={facet.value}>
            {facet.label} ({facet.count})
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleFilter({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`flex items-center justify-between rounded-[1rem] border px-4 py-3 text-left text-sm font-medium transition ${
        checked
          ? "border-dema-forest bg-dema-sage/70 text-dema-forest"
          : "border-dema-line bg-dema-paper text-brand-blue hover:border-dema-forest/25"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span>{label}</span>
      <span
        className={`h-5 w-9 rounded-full p-0.5 transition ${
          checked ? "bg-dema-forest" : "bg-dema-line"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
