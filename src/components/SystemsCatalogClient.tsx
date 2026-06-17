"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Aperture,
  BadgeCheck,
  BookOpenCheck,
  Box,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Camera,
  Car,
  ChefHat,
  Cloud,
  Code2,
  ClipboardCheck,
  Cpu,
  Dumbbell,
  Factory,
  FileText,
  Flower2,
  Gavel,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Headphones,
  Home,
  KeyRound,
  Landmark,
  Layers,
  Megaphone,
  Navigation,
  Newspaper,
  PartyPopper,
  PenTool,
  Scissors,
  Shield,
  SlidersHorizontal,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  UserCheck,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";
import { ALL_SECTORS_LABEL } from "@/lib/public-sectors";
import { matchesSearchQuery } from "@/lib/search";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { System } from "@/lib/types";

type SystemsCatalogClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  showIntro?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  activeSector?: string;
  onActiveSectorChange?: (value: string) => void;
  showSearchBar?: boolean;
};

const systemIcons: Record<string, LucideIcon> = {
  Aperture,
  Box,
  Briefcase: BriefcaseBusiness,
  Building2,
  Calculator,
  Camera,
  Car,
  ChefHat,
  Cloud,
  Code: Code2,
  ClipboardCheck,
  Cpu,
  Croissant: Store,
  Dolly: Truck,
  Dumbbell,
  Factory,
  FileCheck2: BookOpenCheck,
  FileText,
  Flower2,
  Gavel,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Headphones,
  Home,
  Key: KeyRound,
  Landmark,
  Laptop: BriefcaseBusiness,
  Layers,
  Megaphone,
  Navigation,
  Newspaper,
  PartyPopper,
  PenTool,
  Scissors,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  UserCheck,
  Utensils: ChefHat,
  Video,
  Wrench,
};

const activityIcons: Record<string, LucideIcon> = {
  "cabinet-comptable": Calculator,
  "cabinet-d-avocat": Gavel,
  "cabinet-de-conseil": BriefcaseBusiness,
  "agence-marketing": Megaphone,
  freelance: BriefcaseBusiness,
  "agence-de-recrutement": UserCheck,
  "agence-web": Code2,
  "creation-de-contenu": Camera,
  saas: Cloud,
  "maintenance-informatique": Cpu,
  btp: Building2,
  artisanat: Hammer,
  "agence-immobiliere": Home,
  "investissement-locatif": Landmark,
  "gestion-patrimoine": Landmark,
  "courtier-assurance": Shield,
  demenagement: Truck,
  "livraison-dernier-kilometre": Navigation,
  "transport-de-marchandise": Box,
  "transport-de-personnes": Car,
  restaurant: ChefHat,
  boulangerie: Store,
  traiteur: ChefHat,
  "commerce-de-detail": Store,
  "e-commerce": ShoppingBag,
  "institut-de-beaute": Flower2,
  "salon-de-coiffure": Scissors,
  "salle-de-sport": Dumbbell,
  "services-a-la-personne": HeartHandshake,
  "formation-en-ligne": GraduationCap,
  "organisme-de-formation": BookOpenCheck,
  evenementiel: PartyPopper,
  "photographe-videaste": Aperture,
  media: Newspaper,
  "nettoyage-professionnel": Sparkles,
  "reparation-telephonique": Smartphone,
  "garage-automobile": Wrench,
  marketplace: Layers,
  "location-de-materiel": ClipboardCheck,
  "securite-privee": Shield,
  "industrie-production": Factory,
};

function getSystemIcon(system: System): LucideIcon {
  const slugIcon = activityIcons[system.slug];

  if (slugIcon) {
    return slugIcon;
  }

  const normalizedName = system.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedName.includes("comptable")) return Calculator;
  if (normalizedName.includes("avocat")) return Gavel;
  if (normalizedName.includes("marketing")) return Megaphone;
  if (normalizedName.includes("recrutement")) return UserCheck;
  if (normalizedName.includes("web")) return Code2;
  if (normalizedName.includes("contenu")) return Camera;
  if (normalizedName.includes("formation")) return GraduationCap;
  if (normalizedName.includes("restaurant")) return ChefHat;
  if (normalizedName.includes("coiffure")) return Scissors;
  if (normalizedName.includes("beaute")) return Flower2;
  if (normalizedName.includes("transport")) return Truck;
  if (normalizedName.includes("immobilier")) return Home;
  if (normalizedName.includes("patrimoine")) return Landmark;

  const icon = system.icon;
  return systemIcons[icon] ?? BadgeCheck;
}

export default function SystemsCatalogClient({
  systems,
  detailsBySlug,
  showIntro = true,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  activeSector: controlledActiveSector,
  onActiveSectorChange,
  showSearchBar = true,
}: SystemsCatalogClientProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalActiveSector, setInternalActiveSector] = useState(ALL_SECTORS_LABEL);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  const activeSector = controlledActiveSector ?? internalActiveSector;

  function updateSearchQuery(value: string) {
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  }

  function updateActiveSector(value: string) {
    if (onActiveSectorChange) {
      onActiveSectorChange(value);
    } else {
      setInternalActiveSector(value);
    }
    setIsFilterPanelOpen(false);
  }

  const sectors = useMemo(() => {
    const visibleSectors = systems
      .map((system) => detailsBySlug[system.slug]?.sectorLabel)
      .filter((sector): sector is string => Boolean(sector));

    return [ALL_SECTORS_LABEL, ...Array.from(new Set(visibleSectors))];
  }, [detailsBySlug, systems]);
  const effectiveActiveSector = sectors.includes(activeSector) ? activeSector : ALL_SECTORS_LABEL;

  const filteredSystems = useMemo(() => {
    return systems.filter((system) => {
      const detail = detailsBySlug[system.slug];
      const sectorLabel = detail?.sectorLabel ?? "Conseil & services aux entreprises";

      const matchesSearch = matchesSearchQuery(searchQuery, [
        system.name,
        system.description,
        ...system.tags,
        sectorLabel,
        system.slug,
      ]);

      const matchesSector =
        effectiveActiveSector === ALL_SECTORS_LABEL || sectorLabel === effectiveActiveSector;

      return matchesSearch && matchesSector;
    });
  }, [detailsBySlug, effectiveActiveSector, searchQuery, systems]);

  const systemSections = useMemo(() => {
    const sections = filteredSystems.reduce<Array<{ index: number; title: string; systems: System[] }>>(
      (currentSections, system) => {
        const title = detailsBySlug[system.slug]?.sectorLabel ?? "Autres systèmes";
        const section = currentSections.find((current) => current.title === title);

        if (section) {
          section.systems.push(system);
        } else {
          currentSections.push({ index: currentSections.length, title, systems: [system] });
        }

        return currentSections;
      },
      []
    );

    return sections.sort((first, second) => {
      const byCount = second.systems.length - first.systems.length;

      return byCount || first.index - second.index;
    });
  }, [detailsBySlug, filteredSystems]);

  return (
    <section
      className={
        showIntro
          ? "w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-12 pt-14 md:pb-16 md:pt-24"
          : "w-full pb-20 md:pb-24"
      }
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {showIntro ? (
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              Entreprises & systèmes
            </p>
            <h1 className="mt-3 demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
              Les processus essentiels par entreprise
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-dema-muted">
              Un catalogue d&apos;entreprises pour voir les systèmes à mettre en place,
              les processus prioritaires et les outils métiers les plus utiles.
            </p>
          </div>
        ) : null}

        <div className={showIntro ? "mt-10" : "border-b border-dema-line/65 pb-4 pt-1 md:pb-5 md:pt-0"}>
          {showSearchBar ? (
            <div className="demaa-search-shell mx-auto max-w-4xl p-1.5">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(event) => updateSearchQuery(event.target.value)}
                  placeholder="Rechercher une entreprise, un processus, un outil..."
                  className="w-full rounded-full bg-dema-paper py-3.5 pl-5 pr-16 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-4 md:pl-6 md:pr-20 md:text-base"
                />
                <button
                  type="button"
                  onClick={() => setIsFilterPanelOpen((current) => !current)}
                  className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:right-2.5 md:h-10 md:w-10 ${
                    effectiveActiveSector === ALL_SECTORS_LABEL
                      ? "bg-dema-sage text-dema-forest"
                      : "bg-dema-forest text-dema-paper"
                  }`}
                  aria-expanded={isFilterPanelOpen}
                  aria-label="Afficher les filtres"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}

          {showSearchBar && isFilterPanelOpen ? (
            <div className="mx-auto mt-2 max-w-4xl overflow-x-auto pb-1 soft-scroll">
              <div className="flex min-w-max gap-2 px-1">
                {sectors.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => updateActiveSector(sector)}
                    className={`demaa-chip shrink-0 whitespace-nowrap ${
                      effectiveActiveSector === sector
                        ? "demaa-chip-active"
                        : ""
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {systemSections.length === 0 ? (
          <div className="mt-8 rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun système trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou un secteur plus large.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-8 md:mt-8 md:space-y-9">
            {systemSections.map((section) => (
              <section key={section.title}>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <h2 className="demaa-section-title text-2xl tracking-tight text-brand-blue/85 md:text-3xl">
                    {section.title}
                  </h2>
                </div>
                <HorizontalScrollHint
                  className="-mx-4 overflow-x-auto px-4 pb-4 pt-2 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                  controlsClassName="absolute -right-2 -top-10 z-10 flex items-center gap-1.5 sm:-right-3"
                >
                  <div className="flex gap-4">
                    {section.systems.map((system) => {
                      const Icon = getSystemIcon(system);

                      return (
                        <SystemCard
                          key={system.id}
                          href={`/systemes/${system.slug}`}
                          icon={
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                              <Icon className="h-4 w-4" />
                            </span>
                          }
                          title={system.name}
                          description={system.description}
                        />
                      );
                    })}
                  </div>
                </HorizontalScrollHint>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SystemCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="demaa-card group flex min-h-[10rem] flex-[0_0_calc(50%-0.5rem)] cursor-pointer flex-col rounded-[1.15rem] p-5 text-left md:flex-[0_0_calc(25%-0.75rem)]"
    >
      {icon}
      <h3 className="mt-4 line-clamp-2 text-lg font-normal leading-tight tracking-tight text-brand-blue">
        {title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm font-normal leading-relaxed text-dema-muted">
        {description}
      </p>
    </Link>
  );
}
