"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ArrowLeft } from "lucide-react";
import PrimaryMobileNav, { type PrimaryNavTab } from "@/components/PrimaryMobileNav";
import SearchFilterControls from "@/components/SearchFilterControls";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import { getServiceCardBadge } from "@/lib/card-badges";
import { matchesSearchQuery } from "@/lib/search";
import type { DemaaService, ServiceCategory } from "@/lib/service-catalog";

type ServiceDirectoryClientProps = {
  services: DemaaService[];
  categories: readonly ServiceCategory[];
  initialCategory?: string;
  initialSearch?: string;
  backLink?: {
    href: string;
    label: string;
  };
  title?: string;
  description?: string;
  activePrimaryTab?: PrimaryNavTab;
  heroTitleLines?: {
    primary: string;
    secondary: string;
  };
};

export default function ServiceDirectoryClient({
  services,
  categories,
  initialCategory,
  initialSearch = "",
  backLink,
  title = "Annuaire Services",
  description = "Les services Demaa pour lancer, structurer, déléguer et développer une activité.",
  activePrimaryTab,
  heroTitleLines,
}: ServiceDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && categories.includes(initialCategory as ServiceCategory)
      ? initialCategory
      : "Tous"
  );
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<DemaaService | null>(null);

  useEffect(() => {
    function handlePopState() {
      setSelectedService(null);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "Tous" || service.category === activeCategory;
      const matchesSearch = matchesSearchQuery(searchQuery, [
        service.name,
        service.description,
        service.bestFor,
        ...service.tags,
        ...service.usefulFor,
        service.category,
        service.slug,
      ]);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, services]);
  const serviceFilters = useMemo(() => ["Tous", ...categories], [categories]);

  function selectCategory(category: string) {
    setActiveCategory(category);
    setIsFilterPanelOpen(false);
  }

  function openServiceDetails(service: DemaaService) {
    setSelectedService(service);
    const detailUrl = `/annuaire-services/${service.slug}`;

    if (window.location.pathname !== detailUrl) {
      window.history.pushState({ demaaServiceModal: true }, "", detailUrl);
    }
  }

  function closeServiceDetails() {
    if (window.history.state?.demaaServiceModal) {
      window.history.back();
      return;
    }

    setSelectedService(null);
  }

  return (
    <div className="w-full">
      <section
        className={
          heroTitleLines
            ? "ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-5 pt-5 text-center md:px-8 md:pb-6 md:pt-16"
            : "w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-5 pt-8 md:pt-10"
        }
      >
        <div className={heroTitleLines ? "mx-auto max-w-6xl space-y-6 md:space-y-7" : "mx-auto max-w-5xl text-center"}>
          {activePrimaryTab && heroTitleLines ? (
            <PrimaryMobileNav activeTab={activePrimaryTab} />
          ) : activePrimaryTab ? (
            <div className="mb-6">
              <PrimaryMobileNav activeTab={activePrimaryTab} />
            </div>
          ) : null}
          {heroTitleLines ? (
            <div className="mx-auto max-w-5xl">
              <h1 className="text-[clamp(3rem,14.5vw,3.36rem)] tracking-tight leading-[0.92] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
                <span className="demaa-hero-title text-brand-blue/86">
                  {heroTitleLines.primary}
                </span>
                <br />
                <span className="font-sans font-light not-italic text-brand-blue/44">
                  {heroTitleLines.secondary}
                </span>
              </h1>
            </div>
          ) : (
            <>
              <h1 className="demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
                {title}
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
                {description}
              </p>
            </>
          )}

          <div className={heroTitleLines ? "" : "mt-5 space-y-4"}>
            <div className="flex justify-center">
              <Link href="/organisation-automatisation" className="demaa-primary-button">
                Audit organisation gratuit
              </Link>
            </div>
            <SearchFilterControls
              value={searchQuery}
              placeholder="Rechercher un service, un besoin, une activité..."
              activeFilter={activeCategory}
              defaultFilter="Tous"
              isFilterOpen={isFilterPanelOpen}
              filters={serviceFilters}
              onChange={setSearchQuery}
              onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
              onFilterSelect={selectCategory}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_12px_32px_rgba(23,35,29,0.04)] sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                Espace membres
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                Rejoignez le réseau Demaa
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                Un espace membres pour networker avec les personnes du secteur, profiter d&apos;avantages concrets et échanger régulièrement avec vos pairs.
              </p>
            </div>
            <div className="shrink-0 rounded-[1rem] bg-dema-sage/75 px-4 py-3 text-left md:min-w-[10rem]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Tarif
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-brand-blue">
                1000 €/an
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              "Opportunité de networker avec les personnes du secteur",
              "-20% sur tous les services",
              "Tarifs négociés fournisseurs",
              "1 call tous les mois avec les pairs",
            ].map((benefit) => (
              <div
                key={benefit}
                className="rounded-[1rem] border border-dema-line bg-dema-cream px-4 py-3 text-sm text-brand-blue/78"
              >
                {benefit}
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Link
              href="/mon-espace"
              className="inline-flex items-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
            >
              Découvrir l&apos;espace membres
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-end pb-5">
          {(activeCategory !== "Tous" || searchQuery) ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("Tous");
              }}
              className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
            >
              Réinitialiser
            </button>
          ) : null}
        </div>

        {filteredServices.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun service trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou une catégorie plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                onOpenDetails={openServiceDetails}
              />
            ))}
          </div>
        )}

        {backLink ? (
          <div className="mt-8 flex justify-start">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {backLink.label}
            </Link>
          </div>
        ) : null}
      </section>

      {selectedService ? (
        <ServiceDetailDialog
          service={selectedService}
          source="Annuaire services"
          onClose={closeServiceDetails}
        />
      ) : null}
    </div>
  );
}

function ServiceCard({
  service,
  onOpenDetails,
}: {
  service: DemaaService;
  onOpenDetails: (service: DemaaService) => void;
}) {
  return (
    <Link
      href={`/annuaire-services/${service.slug}`}
      onClick={(event) => handleServiceCardClick(event, service, onOpenDetails)}
      className="demaa-card group flex min-h-[15.5rem] flex-col rounded-[1.15rem] p-5 text-left"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
          <ServiceIcon icon={service.icon} className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-brand-blue">
        {service.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-dema-muted">
        {service.shortDescription}
      </p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-blue/65">
        {service.bestFor}
      </p>
      <div className="mt-4">
        <span className="inline-flex rounded-full bg-dema-forest px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-paper">
          -20% membres
        </span>
      </div>
      {getServiceCardBadge(service) ? (
        <div className="mt-2">
          <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
            {getServiceCardBadge(service)}
          </span>
        </div>
      ) : null}
    </Link>
  );
}

function handleServiceCardClick(
  event: MouseEvent<HTMLAnchorElement>,
  service: DemaaService,
  onOpenDetails: (service: DemaaService) => void,
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
  onOpenDetails(service);
}
