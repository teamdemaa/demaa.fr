"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  LoaderCircle,
  ShoppingBag,
  X,
} from "lucide-react";
import PrimaryMobileNav, { type PrimaryNavTab } from "@/components/PrimaryMobileNav";
import SearchFilterControls from "@/components/SearchFilterControls";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getServiceCardBadge } from "@/lib/card-badges";
import { matchesSearchQuery } from "@/lib/search";
import {
  formatPurchasableServicePrice,
  getPurchasableServiceConfig,
} from "@/lib/service-purchase";
import {
  CART_UPDATED_EVENT,
  readServiceCartSlugs,
  writeServiceCartSlugs,
} from "@/lib/service-cart";
import type { DemaaService, ServiceCategory } from "@/lib/service-catalog";

type ServiceDirectoryClientProps = {
  services: DemaaService[];
  categories: readonly ServiceCategory[];
  focusCartOnLoad?: boolean;
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
  heroIntroEyebrow?: string;
  heroIntroText?: string;
  heroDescriptionLines?: {
    primary: string;
    secondary: string;
  };
};

type CheckoutResponse =
  | { url: string }
  | { error: string };

export default function ServiceDirectoryClient({
  services,
  categories,
  focusCartOnLoad = false,
  initialCategory,
  initialSearch = "",
  backLink,
  title = "Annuaire Services",
  description = "Les services Demaa pour lancer, structurer, déléguer et développer une activité.",
  activePrimaryTab,
  heroTitleLines,
  heroIntroEyebrow,
  heroIntroText,
  heroDescriptionLines,
}: ServiceDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && categories.includes(initialCategory as ServiceCategory)
      ? initialCategory
      : "Tous"
  );
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [highlightCart, setHighlightCart] = useState(false);
  const [isDesktopCartOpen, setIsDesktopCartOpen] = useState(false);
  const previousSelectedCountRef = useRef(0);

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

  useEffect(() => {
    if (!focusCartOnLoad || selectedSlugs.length === 0) return;

    setIsDesktopCartOpen(true);

    const timer = window.setTimeout(() => {
      const cartElement = document.getElementById("demaa-service-cart");

      cartElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setHighlightCart(true);
    }, 120);

    const highlightTimer = window.setTimeout(() => {
      setHighlightCart(false);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(highlightTimer);
    };
  }, [focusCartOnLoad, selectedSlugs.length]);

  useEffect(() => {
    const previousCount = previousSelectedCountRef.current;
    const nextCount = selectedSlugs.length;

    if (nextCount === 0) {
      setIsDesktopCartOpen(false);
    } else if (previousCount === 0 && nextCount > 0) {
      setIsDesktopCartOpen(true);
    }

    previousSelectedCountRef.current = nextCount;
  }, [selectedSlugs.length]);

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

  const selectedServices = useMemo(() => {
    return selectedSlugs
      .map((slug) => {
        const service = services.find((entry) => entry.slug === slug);
        const purchase = getPurchasableServiceConfig(slug);

        if (!service || !purchase) return null;

        return {
          ...service,
          ...purchase,
        };
      })
      .filter((service): service is NonNullable<typeof service> => Boolean(service));
  }, [selectedSlugs, services]);

  const cartTotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => sum + service.unitAmount, 0);
  }, [selectedServices]);

  const serviceFilters = useMemo(() => ["Tous", ...categories], [categories]);

  function selectCategory(category: string) {
    setActiveCategory(category);
    setIsFilterPanelOpen(false);
  }

  function toggleServiceSelection(slug: string) {
    if (!getPurchasableServiceConfig(slug)) return;

    setCheckoutError(null);
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((entry) => entry !== slug)
      : [...selectedSlugs, slug];

    writeServiceCartSlugs(next);
    setSelectedSlugs(next);
  }

  function removeServiceSelection(slug: string) {
    setCheckoutError(null);
    const next = selectedSlugs.filter((entry) => entry !== slug);

    writeServiceCartSlugs(next);
    setSelectedSlugs(next);
  }

  function clearServiceSelection() {
    setCheckoutError(null);
    writeServiceCartSlugs([]);
    setSelectedSlugs([]);
  }

  async function handleCheckout() {
    if (selectedSlugs.length === 0 || isCheckoutLoading) return;

    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceSlugs: selectedSlugs,
        }),
      });

      const payload = (await response.json().catch(() => null)) as CheckoutResponse | null;

      if (!response.ok || !payload || !("url" in payload)) {
        throw new Error(
          payload && "error" in payload
            ? payload.error
            : "Impossible de lancer le paiement pour le moment."
        );
      }

      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Impossible de lancer le paiement pour le moment."
      );
      setIsCheckoutLoading(false);
    }
  }

  const hasDesktopCartOffset = selectedServices.length > 0 && isDesktopCartOpen;

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
          {activePrimaryTab && heroTitleLines ? (
            <PrimaryMobileNav activeTab={activePrimaryTab} />
          ) : activePrimaryTab ? (
            <div className="mb-6">
              <PrimaryMobileNav activeTab={activePrimaryTab} />
            </div>
          ) : null}
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
                <span className="demaa-hero-title text-brand-blue/86">
                  {heroTitleLines.primary}
                </span>
                <br />
                <span className="font-sans font-light not-italic text-brand-blue/44">
                  {heroTitleLines.secondary}
                </span>
              </h1>
              {heroDescriptionLines ? (
                <p className="mx-auto mt-5 max-w-fit text-[13px] leading-relaxed text-dema-muted sm:text-sm md:max-w-2xl md:text-base">
                  <span className="block whitespace-nowrap">
                    {heroDescriptionLines.primary}
                  </span>
                  <span className="block whitespace-nowrap">
                    {heroDescriptionLines.secondary}
                  </span>
                </p>
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

      <section
        className={`mx-auto max-w-7xl px-4 py-7 transition-[padding] duration-300 sm:px-6 lg:px-8 ${
          hasDesktopCartOffset ? "md:pr-[31rem] xl:pr-[33rem]" : ""
        }`}
      >
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center justify-end">
            {activeCategory !== "Tous" || searchQuery ? (
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

      <ServiceCartTray
        isDesktopCartOpen={isDesktopCartOpen}
        error={checkoutError}
        highlight={highlightCart}
        onDesktopOpen={() => setIsDesktopCartOpen(true)}
        onDesktopClose={() => setIsDesktopCartOpen(false)}
        onClear={clearServiceSelection}
        isCheckoutLoading={isCheckoutLoading}
        onCheckout={handleCheckout}
        onRemove={removeServiceSelection}
        selectedServices={selectedServices}
        total={cartTotal}
      />
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
    <article className="demaa-card flex min-h-[16rem] flex-col rounded-[1.15rem] p-5 text-left">
      <Link
        href={`/annuaire-services/${service.slug}`}
        className="flex flex-1 flex-col text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-dema-forest hover:text-dema-paper">
            <ServiceIcon icon={service.icon} className="h-4 w-4" aria-hidden="true" />
          </span>
          {purchaseConfig ? (
            <span className="rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
              {formatPurchasableServicePrice(
                purchaseConfig.unitAmount,
                purchaseConfig.currency
              )}
            </span>
          ) : null}
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
        {badge ? (
          <div className="mt-3">
            <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
              {badge}
            </span>
          </div>
        ) : null}
      </Link>

      <div className="mt-5 flex items-center justify-between gap-3">
        {purchaseConfig ? (
          <button
            type="button"
            onClick={() => onToggleSelection(service.slug)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
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

        <Link
          href={`/annuaire-services/${service.slug}`}
          className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
        >
          Voir le détail
        </Link>
      </div>
    </article>
  );
}

function ServiceCartTray({
  selectedServices,
  total,
  isDesktopCartOpen,
  onRemove,
  onClear,
  onCheckout,
  onDesktopOpen,
  onDesktopClose,
  isCheckoutLoading,
  error,
  highlight = false,
}: {
  selectedServices: Array<
    DemaaService & {
      currency: "eur";
      unitAmount: number;
    }
  >;
  total: number;
  isDesktopCartOpen: boolean;
  onRemove: (slug: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  onDesktopOpen: () => void;
  onDesktopClose: () => void;
  isCheckoutLoading: boolean;
  error: string | null;
  highlight?: boolean;
}) {
  if (selectedServices.length === 0) return null;

  return (
    <>
      <div className="hidden md:block">
        <div
          className={`fixed inset-0 z-30 bg-brand-blue/10 transition-opacity duration-300 ${
            isDesktopCartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden="true"
          onClick={onDesktopClose}
        />
        {!isDesktopCartOpen ? (
          <button
            type="button"
            onClick={onDesktopOpen}
            className="fixed right-5 top-[6.6rem] z-40 inline-flex items-center gap-3 rounded-full border border-dema-line/70 bg-dema-paper/94 px-3.5 py-2.5 text-sm font-medium text-brand-blue shadow-[0_10px_24px_rgba(23,35,29,0.06)] backdrop-blur transition hover:border-dema-forest/18 hover:text-dema-forest"
            aria-label="Ouvrir le panier"
            aria-expanded={false}
            aria-controls="demaa-service-cart"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-[1.05rem] font-semibold">
              Panier
            </span>
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-dema-forest px-2 text-sm font-semibold text-white">
              {selectedServices.length}
            </span>
          </button>
        ) : null}
        <aside
          className={`fixed bottom-4 right-4 top-[5.35rem] z-40 w-[27.75rem] overflow-hidden rounded-[1.7rem] border border-white/8 bg-[#2f4f3f] text-dema-paper shadow-[0_18px_38px_rgba(23,35,29,0.12)] transition-transform duration-300 ease-out ${
            isDesktopCartOpen ? "translate-x-0" : "translate-x-[110%]"
          }`}
        >
          <CartContent
            desktop
            error={error}
            highlight={highlight}
            isCheckoutLoading={isCheckoutLoading}
            onClear={onClear}
            onCheckout={onCheckout}
            onCloseDesktop={onDesktopClose}
            onRemove={onRemove}
            selectedServices={selectedServices}
            total={total}
          />
        </aside>
      </div>
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-dema-line bg-dema-paper/95 shadow-[0_-14px_40px_rgba(23,35,29,0.12)] backdrop-blur md:hidden">
        <CartContent
          compact
          error={error}
          highlight={highlight}
          isCheckoutLoading={isCheckoutLoading}
          onClear={onClear}
          onCheckout={onCheckout}
          onRemove={onRemove}
          selectedServices={selectedServices}
          total={total}
        />
      </aside>
    </>
  );
}

function CartContent({
  selectedServices,
  total,
  onRemove,
  onClear,
  onCheckout,
  onCloseDesktop,
  isCheckoutLoading,
  error,
  compact = false,
  desktop = false,
  highlight = false,
}: {
  selectedServices: Array<
    DemaaService & {
      currency: "eur";
      unitAmount: number;
    }
  >;
  total: number;
  onRemove: (slug: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  onCloseDesktop?: () => void;
  isCheckoutLoading: boolean;
  error: string | null;
  compact?: boolean;
  desktop?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      id="demaa-service-cart"
      className={`${compact ? "p-4" : desktop ? "flex h-full flex-col px-6 pb-6 pt-5" : "p-5"} transition-shadow duration-500 ${
        highlight ? "shadow-[0_0_0_3px_rgba(49,95,70,0.2)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
              desktop ? "bg-white/12 text-dema-paper" : "bg-dema-sage text-dema-forest"
            }`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${desktop ? "text-white/58" : "text-dema-muted"}`}>
              Panier
            </p>
            <p className={`mt-1 text-[1.05rem] font-semibold ${desktop ? "text-dema-paper" : "text-brand-blue"}`}>
              {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} ·{" "}
              {formatPurchasableServicePrice(total)}
            </p>
          </div>
        </div>
        {desktop && onCloseDesktop ? (
          <button
            type="button"
            onClick={onCloseDesktop}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/82 transition hover:bg-white/14 hover:text-white"
            aria-label="Fermer le panier"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {desktop ? (
        <div className="mt-5 border-b border-white/10 pb-5" />
      ) : null}
      <div className={`flex items-center justify-between gap-3 ${desktop ? "mt-4" : "mt-3"}`}>
        <p className={`text-xs ${desktop ? "text-white/62" : "text-dema-muted"}`}>
          {selectedServices.length} élément{selectedServices.length > 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={onClear}
          className={`text-xs font-medium transition ${
            desktop ? "text-white/78 hover:text-white" : "text-dema-muted hover:text-dema-forest"
          }`}
        >
          Vider
        </button>
      </div>

      <div
        className={`mt-5 ${compact ? "max-h-40" : desktop ? "flex-1 overflow-y-auto pr-1" : "max-h-64 overflow-y-auto pr-1"}`}
      >
        <div className={desktop ? "space-y-2.5" : "space-y-2"}>
          {selectedServices.map((service) => (
            <div
              key={service.slug}
              className={`flex items-start justify-between gap-3 px-3 py-3 ${
                desktop
                  ? "rounded-[1.1rem] border border-white/6 bg-white/7"
                  : "rounded-[0.95rem] bg-dema-sage/40"
              }`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-medium leading-snug ${desktop ? "text-dema-paper" : "text-brand-blue"}`}>
                  {service.name}
                </p>
                <p className={`mt-1 text-xs ${desktop ? "text-white/62" : "text-dema-muted"}`}>
                  {formatPurchasableServicePrice(service.unitAmount, service.currency)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(service.slug)}
                className={`inline-flex shrink-0 items-center justify-center rounded-full transition ${
                  desktop
                    ? "h-8 w-8 border border-white/12 bg-white/10 text-white/76 hover:bg-white/16 hover:text-white"
                    : "h-7 w-7 border border-dema-line bg-white text-brand-blue/65 hover:border-dema-forest/25 hover:text-dema-forest"
                }`}
                aria-label={`Retirer ${service.name}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <p
          className={`mt-4 rounded-[0.9rem] px-3 py-2 text-sm ${
            desktop
              ? "border border-white/10 bg-white/10 text-dema-paper"
              : "border border-dema-forest/10 bg-dema-sage/60 text-dema-forest"
          }`}
        >
          {error}
        </p>
      ) : null}

      <div className={desktop ? "mt-5 border-t border-white/10 pt-5" : ""}>
        <button
          type="button"
          onClick={onCheckout}
          disabled={isCheckoutLoading}
          className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            desktop
              ? "bg-dema-paper text-dema-forest hover:bg-white"
              : "bg-dema-forest text-dema-paper hover:bg-brand-blue"
          } ${compact ? "mb-[env(safe-area-inset-bottom)]" : ""}`}
        >
          {isCheckoutLoading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Redirection…
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Payer {formatPurchasableServicePrice(total)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
