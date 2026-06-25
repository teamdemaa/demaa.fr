"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import SearchFilterControls from "@/components/SearchFilterControls";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getServiceCardBadge } from "@/lib/card-badges";
import { matchesSearchQuery } from "@/lib/search";
import { getPurchasableServiceConfig } from "@/lib/service-purchase";
import {
  CART_UPDATED_EVENT,
  openServiceCartModal,
  readServiceCartSlugs,
  writeServiceCartSlugs,
} from "@/lib/service-cart";
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
  heroTitleLines?: {
    primary: string;
    secondary?: string;
  };
  invertHeroTitleStyles?: boolean;
  heroIntroEyebrow?: string;
  heroIntroText?: string;
  heroDescriptionLines?: {
    primary: string;
    secondary: string;
  };
  heroActions?: ReactNode;
};

export default function ServiceDirectoryClient({
  services,
  categories,
  initialCategory,
  initialSearch = "",
  backLink,
  title = "Annuaire Services",
  description = "Les services Demaa pour lancer, structurer, déléguer et développer une activité.",
  heroTitleLines,
  heroIntroEyebrow,
  heroIntroText,
  heroDescriptionLines,
  heroActions,
  invertHeroTitleStyles = false,
}: ServiceDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && categories.includes(initialCategory as ServiceCategory)
      ? initialCategory
      : "Tous"
  );
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  useEffect(() => {
    const syncCart = () => {
      setSelectedSlugs(readServiceCartSlugs());
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
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

  function toggleServiceSelection(slug: string) {
    if (!getPurchasableServiceConfig(slug)) return;

    const isAdding = !selectedSlugs.includes(slug);
    const next = isAdding
      ? [...selectedSlugs, slug]
      : selectedSlugs.filter((entry) => entry !== slug);

    writeServiceCartSlugs(next);
    setSelectedSlugs(next);

    if (isAdding) {
      openServiceCartModal();
    }
  }

  return (
    <div className="w-full pb-28 md:pb-6">
      <section
        className={
          heroTitleLines
            ? "ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-5 pt-5 text-center md:px-8 md:pb-6 md:pt-16"
            : "w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-5 pt-8 md:pt-10"
        }
      >
        <div
          className={
            heroTitleLines
              ? "mx-auto max-w-6xl space-y-6 md:space-y-7"
              : "mx-auto max-w-5xl text-center"
          }
        >
          {heroTitleLines ? (
            <div className="mx-auto max-w-5xl">
              {heroIntroEyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  {heroIntroEyebrow}
                </p>
              ) : null}
              {heroIntroText ? (
                <p className="mx-auto mt-3 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted md:text-base">
                  {heroIntroText}
                </p>
              ) : null}
              <h1 className="text-[clamp(3rem,14.5vw,3.36rem)] leading-[0.92] tracking-tight sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
                <span
                  className={
                    invertHeroTitleStyles
                      ? "font-sans font-light not-italic text-brand-blue/44"
                      : "demaa-hero-title text-brand-blue/86"
                  }
                >
                  {heroTitleLines.primary}
                </span>
                {heroTitleLines.secondary ? (
                  <>
                    <br />
                    <span
                      className={
                        invertHeroTitleStyles
                          ? "demaa-hero-title text-brand-blue/86"
                          : "font-sans font-light not-italic text-brand-blue/44"
                      }
                    >
                      {heroTitleLines.secondary}
                    </span>
                  </>
                ) : null}
              </h1>
              {heroDescriptionLines ? (
                <div className="mx-auto mt-5 max-w-3xl">
                  <p className="text-balance text-[1.05rem] font-light leading-relaxed text-brand-blue/78 sm:text-lg md:text-[1.32rem]">
                    {heroDescriptionLines.primary}
                  </p>
                  <p className="mx-auto mt-2 max-w-2xl text-balance text-[13px] leading-relaxed text-dema-muted sm:text-sm md:text-base">
                    {heroDescriptionLines.secondary}
                  </p>
                </div>
              ) : null}
              {heroActions ? (
                <div className="mx-auto mt-6 flex max-w-3xl flex-col items-center justify-center gap-3 sm:flex-row">
                  {heroActions}
                </div>
              ) : null}
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

      <section className="mx-auto max-w-7xl px-4 pb-7 pt-4 sm:px-6 lg:px-8">
        {activeCategory !== "Tous" || searchQuery ? (
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center justify-end">
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
            </div>
          </div>
        ) : null}

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
                isSelected={selectedSlugs.includes(service.slug)}
                onToggleSelection={toggleServiceSelection}
                service={service}
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
    </div>
  );
}

function ServiceCard({
  service,
  onToggleSelection,
  isSelected,
}: {
  service: DemaaService;
  onToggleSelection: (slug: string) => void;
  isSelected: boolean;
}) {
  const purchaseConfig = getPurchasableServiceConfig(service.slug);
  const badge = getServiceCardBadge(service);

  return (
    <article className="demaa-card flex min-h-[18rem] flex-col rounded-[1.25rem] p-6 text-left">
      <Link
        href={`/annuaire-services/${service.slug}`}
        className="flex flex-1 flex-col text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-dema-forest hover:text-dema-paper">
            <ServiceIcon icon={service.icon} className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="rounded-full bg-dema-sage/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-brand-blue/72">
            {service.category}
          </span>
        </div>
        <h2 className="mt-5 text-[1.35rem] font-semibold leading-tight tracking-tight text-brand-blue">
          {service.name}
        </h2>
        <p className="mt-3 line-clamp-3 text-[0.98rem] leading-relaxed text-dema-muted">
          {service.shortDescription}
        </p>
        <div className="mt-5 flex items-end justify-between gap-3">
          {purchaseConfig ? (
            <p className="text-[1.15rem] font-semibold tracking-tight text-brand-blue">
              {service.price}
            </p>
          ) : (
            <p className="text-sm font-medium text-dema-muted">Sur devis</p>
          )}
          {badge ? (
            <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
              {badge}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="mt-6 flex items-center gap-3">
        {purchaseConfig ? (
          <button
            type="button"
            onClick={() => onToggleSelection(service.slug)}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-xs font-medium transition ${
              isSelected
                ? "border-dema-forest bg-dema-forest text-white"
                : "border-dema-line bg-dema-paper text-brand-blue/75 hover:border-dema-forest/25 hover:text-dema-forest"
            }`}
            aria-pressed={isSelected}
          >
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
                isSelected
                  ? "border-white bg-white text-dema-forest"
                  : "border-brand-blue/25 bg-white text-transparent"
              }`}
            >
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
            {isSelected ? "Ajouté" : "Sélectionner"}
          </button>
        ) : (
          <span className="text-xs font-medium text-dema-muted">Sur devis</span>
        )}
      </div>
    </article>
  );
}
