"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import AssistantPackSelector from "@/components/AssistantPackSelector";
import SearchFilterControls from "@/components/SearchFilterControls";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  ASSISTANT_SERVICE_SLUG,
  isAssistantPackSlug,
} from "@/lib/assistant-service-packs";
import { matchesSearchQuery } from "@/lib/search";
import { getPurchasableServiceConfig } from "@/lib/service-purchase";
import {
  CART_UPDATED_EVENT,
  openServiceCartModal,
  readServiceCartSlugs,
  writeServiceCartSlugs,
} from "@/lib/service-cart";
import type { DemaaService, ServiceCategory } from "@/lib/service-catalog";

const serviceFlowSteps = [
  {
    step: "01",
    title: "Vous choisissez le bon service",
    description:
      "Vous prenez le service qui répond à votre besoin du moment: déléguer, structurer, débloquer ou avancer plus vite.",
  },
  {
    step: "02",
    title: "Demaa exécute et vous tient informé",
    description:
      "Le sujet est pris en charge, vous êtes tenu au courant simplement, et les échanges se font de façon fluide, notamment sur WhatsApp.",
  },
  {
    step: "03",
    title: "Vous êtes soulagé",
    description:
      "Vous arrêtez de porter seul ce qui vous ralentit, vous gagnez du temps mental, et l'entreprise avance plus sereinement.",
  },
] as const;

const reliefPoints = [
  "Vous arrêtez de tout porter seul.",
  "Les sujets avancent sans revenir sur votre bureau à chaque étape.",
  "Vous gardez de la visibilité, sans y passer votre journée.",
] as const;

const globalFaqItems = [
  {
    question: "Est-ce que c'est adapté à une petite entreprise ?",
    answer:
      "Oui. Les services sont pensés pour des dirigeants qui ont besoin d'avancer vite, sans complexifier davantage leur quotidien.",
  },
  {
    question: "Qu'est-ce que j'achète exactement ?",
    answer:
      "Vous achetez une exécution claire sur un besoin précis, avec un résultat attendu et une communication simple tout au long du sujet.",
  },
  {
    question: "Comment je suis tenu au courant ?",
    answer:
      "Demaa vous informe au fil de l'avancement, avec des échanges simples et rapides, notamment sur WhatsApp.",
  },
  {
    question: "Qu'est-ce que ça change concrètement pour moi ?",
    answer:
      "Vous ne portez plus seul les sujets qui traînent, vous gagnez du temps, et vous respirez davantage au quotidien.",
  },
] as const;

const serviceTestimonial = {
  quote:
    "Avant, tout passait par moi. Depuis qu'on a mis en place une vraie organisation, chacun sait ce qu'il peut décider. Je respire enfin.",
  author: "D.K dirigeant d'une entreprise de nettoyage industrielle",
} as const;

type ServiceDirectoryClientProps = {
  services: DemaaService[];
  categories: readonly ServiceCategory[];
  initialCategory?: string;
  initialSearch?: string;
  hideSearchControls?: boolean;
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
  hideSearchControls = false,
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

          {!hideSearchControls ? (
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
          ) : null}
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
                isSelected={
                  service.slug === ASSISTANT_SERVICE_SLUG
                    ? selectedSlugs.some((slug) => isAssistantPackSlug(slug))
                    : selectedSlugs.includes(service.slug)
                }
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

        <ServiceTrustSection />
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
  const isAssistantService = service.slug === ASSISTANT_SERVICE_SLUG;

  return (
    <article className="demaa-card flex min-h-[18rem] flex-col rounded-[1.25rem] p-6 text-left">
      <Link
        href={`/annuaire-services/${service.slug}`}
        className="flex flex-1 flex-col text-left"
      >
        <div className="flex items-start gap-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-dema-forest hover:text-dema-paper">
            <ServiceIcon icon={service.icon} className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        </div>
        <h2 className="mt-5 text-[1.35rem] font-normal leading-tight tracking-tight text-brand-blue">
          {service.name}
        </h2>
        <p className="mt-3 line-clamp-3 text-[0.98rem] leading-relaxed text-dema-muted">
          {service.shortDescription}
        </p>
        <div className="mt-auto flex items-end gap-3 pt-5">
          {isAssistantService ? (
            <p className="text-[1rem] font-medium text-dema-muted">3 packs disponibles</p>
          ) : purchaseConfig ? (
            <p className="text-[1.15rem] font-medium tracking-tight text-brand-blue">
              {service.price}
            </p>
          ) : (
            <p className="text-sm font-medium text-dema-muted">Sur devis</p>
          )}
        </div>
      </Link>

      <div className="mt-6 flex items-center gap-3">
        {isAssistantService ? (
          <AssistantPackSelector
            compact
            className="w-full"
            buttonLabel="Sélectionner"
            showHelperText={false}
          />
        ) : purchaseConfig ? (
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

function ServiceTrustSection() {
  return (
    <div className="mt-20 space-y-24 pt-10 md:mt-26 md:space-y-32 md:pt-14">
      <section className="border-t border-dema-line/80 pt-14 md:pt-18">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
            Comment ça marche
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-blue md:text-[2.5rem]">
            Vous choisissez. Demaa exécute.
            <br />
            Vous respirez.
          </h2>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {serviceFlowSteps.map((item) => (
            <article key={item.step} className="space-y-3">
              <p className="text-[2.1rem] font-semibold uppercase leading-none tracking-[0.18em] text-dema-forest/55 md:text-[2.4rem]">
                {item.step}
              </p>
              <h3 className="text-[1.22rem] font-medium leading-snug text-brand-blue">
                {item.title}
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-dema-muted md:text-[0.98rem]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] bg-dema-sage/55 px-6 py-13 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
          <div className="max-w-2xl md:pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              Ce que ça change
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-blue md:text-[2.5rem]">
              Moins de charge mentale.
              <br />
              Plus d&apos;avancement.
            </h2>
          </div>
          <div className="space-y-4">
            {reliefPoints.map((point) => (
              <div
                key={point}
                className="border-b border-dema-line/80 pb-4 text-[1.05rem] leading-relaxed text-brand-blue/86"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-dema-line/80 pt-14 md:pt-18">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
            Questions fréquentes
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-blue md:text-[2.5rem]">
            Ce que vous voulez savoir avant d&apos;acheter
          </h2>
        </div>
        <div className="mx-auto mt-8 max-w-4xl space-y-3">
          {globalFaqItems.map((item) => (
            <details key={item.question} className="demaa-accordion px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-base font-medium leading-snug text-brand-blue">
                  {item.question}
                </span>
                <ChevronDown
                  className="demaa-accordion-chevron h-4 w-4 shrink-0 text-dema-muted transition-transform"
                  aria-hidden="true"
                />
              </summary>
              <p className="demaa-accordion-content mt-3 max-w-xl pr-4 text-sm leading-relaxed text-dema-muted md:text-[0.98rem]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-dema-line/80 pt-14 md:pt-18">
        <div className="mx-auto max-w-4xl rounded-[1.5rem] bg-dema-forest px-8 py-12 text-center text-dema-paper md:px-14 md:py-16">
          <blockquote className="demaa-section-title text-[2rem] leading-tight tracking-tight text-dema-paper md:text-[2.7rem]">
            “{serviceTestimonial.quote}”
          </blockquote>
          <p className="mt-5 text-sm font-medium tracking-[0.01em] text-dema-paper/72">
            {serviceTestimonial.author}
          </p>
        </div>
      </section>
    </div>
  );
}
