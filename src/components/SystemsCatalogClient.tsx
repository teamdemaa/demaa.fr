"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  Search,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  UserCheck,
  Video,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import SystemSetupModal from "@/components/SystemSetupModal";
import type { System } from "@/lib/types";
import type { OperationalSystemDetail, SystemPillar } from "@/lib/system-operations";

type SystemsCatalogClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  showIntro?: boolean;
  pageSize?: number;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  showSearchBar?: boolean;
  initialSelectedSlug?: string;
};

const PILLARS: SystemPillar[] = [
  "Stratégie",
  "Marketing & Vente",
  "Opérations",
  "Finance & administration",
  "Équipe",
];

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
  showSearchBar = true,
  initialSelectedSlug,
}: SystemsCatalogClientProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSelectedSlug ?? null);
  const [activeTab, setActiveTab] = useState<"processus" | "outils">("processus");
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState("Tous");
  const [isSystemSetupModalOpen, setIsSystemSetupModalOpen] = useState(false);
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;

  function updateSearchQuery(value: string) {
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  }

  const sectors = useMemo(
    () => [
      "Tous",
      ...Array.from(
        new Set(
          systems.map((system) => detailsBySlug[system.slug]?.sectorLabel ?? "Services & conseil")
        )
      ),
    ],
    [detailsBySlug, systems]
  );

  const filteredSystems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return systems.filter((system) => {
      const detail = detailsBySlug[system.slug];
      const sectorLabel = detail?.sectorLabel ?? "Services & conseil";

      const matchesSearch =
        !query ||
        system.name.toLowerCase().includes(query) ||
        system.description.toLowerCase().includes(query) ||
        system.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        sectorLabel.toLowerCase().includes(query) ||
        detail?.editorialSubtitle.toLowerCase().includes(query);

      const matchesSector = activeSector === "Tous" || sectorLabel === activeSector;

      return matchesSearch && matchesSector;
    });
  }, [activeSector, detailsBySlug, searchQuery, systems]);

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

  const selectedSystem = useMemo(
    () => systems.find((system) => system.slug === selectedSlug) ?? null,
    [selectedSlug, systems]
  );
  const detail = selectedSlug ? detailsBySlug[selectedSlug] : null;

  return (
    <>
      <section
        className={
          showIntro
            ? "w-full border-b border-brand-blue/5 bg-[#ffffff]/70 px-4 pb-12 pt-14 md:pb-16 md:pt-24"
            : "w-full pb-20 md:pb-24"
        }
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {showIntro ? (
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
                Entreprises & systèmes
              </p>
              <h1 className="mt-3 demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
                Les processus essentiels par entreprise
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
                Un catalogue d&apos;entreprises pour voir les systèmes à mettre en place,
                les processus prioritaires et les outils métiers les plus utiles.
              </p>
            </div>
          ) : null}

          <div className={showIntro ? "mt-10" : "border-b border-brand-blue/5 pb-4 pt-2 md:pb-5 md:pt-0"}>
            {showSearchBar ? (
              <div className="mx-auto max-w-4xl rounded-full border border-brand-blue/5 bg-white p-1.5 shadow-[0_10px_30px_rgba(20,20,20,0.035)]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300 md:left-5 md:h-5 md:w-5" />
                  <input
                    value={searchQuery}
                    onChange={(event) => updateSearchQuery(event.target.value)}
                    placeholder="Rechercher une entreprise, un processus, un outil..."
                    className="w-full rounded-full bg-white py-3.5 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/40 md:py-4 md:pl-12 md:text-base"
                  />
                </div>
              </div>
            ) : null}

            <div className={`mx-auto max-w-4xl overflow-x-auto pb-2 soft-scroll ${showSearchBar ? "mt-3" : "mt-1"}`}>
              <div className="flex min-w-max justify-center gap-2 px-1">
                {sectors.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => {
                      setActiveSector(sector);
                    }}
                    className={`min-h-9 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition md:min-h-10 md:px-4 md:text-sm ${
                      activeSector === sector
                        ? "bg-brand-blue text-white shadow-sm"
                        : "bg-neutral-100 text-brand-blue/65 hover:bg-neutral-200"
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {systemSections.length === 0 ? (
            <div className="mt-8 rounded-[1.25rem] border border-dashed border-brand-blue/10 bg-white p-10 text-center">
              <h2 className="text-xl font-bold text-brand-blue">Aucun système trouvé</h2>
              <p className="mt-3 text-sm font-normal text-gray-500">
                Essayez un autre mot-clé ou un secteur plus large.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-8 md:mt-10 md:space-y-9">
              {systemSections.map((section) => (
                <section key={section.title}>
                  <div className="mb-3">
                    <h2 className="demaa-section-title text-2xl tracking-tight text-brand-blue/85 md:text-3xl">
                      {section.title}
                    </h2>
                  </div>
                  <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-2 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className="flex gap-4">
                      {section.systems.map((system) => {
                        const detail = detailsBySlug[system.slug];
                        const Icon = getSystemIcon(system);

                        return (
                          <button
                            key={system.id}
                            type="button"
                            onClick={() => {
                              setSelectedSlug(system.slug);
                              setActiveTab("processus");
                            }}
                            className="group flex min-h-[10rem] flex-[0_0_calc(50%-0.5rem)] cursor-pointer flex-col rounded-[1.15rem] border border-brand-blue/8 bg-white p-5 text-left shadow-[0_8px_24px_rgba(20,20,20,0.025)] transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_16px_42px_rgba(20,20,20,0.06)] md:flex-[0_0_calc(25%-0.75rem)]"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition group-hover:bg-neutral-200 group-hover:text-neutral-950">
                              <Icon className="h-4 w-4" />
                            </span>
                            <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-brand-blue">
                              {system.name}
                            </h3>
                            <p className="mt-3 line-clamp-3 text-sm font-normal leading-relaxed text-gray-600">
                              {detail?.editorialSubtitle ?? system.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedSystem && detail ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/35 p-4"
          onClick={() => setSelectedSlug(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-[1.25rem] bg-[#ffffff] p-6 pt-14 shadow-[0_30px_80px_rgba(20,20,20,0.18)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="flex-1 text-left">
                <p className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
                  {selectedSystem.name}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                  {selectedSystem.name}
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
                  {selectedSystem.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSystemSetupModalOpen(true)}
                  className="rounded-full border border-brand-blue/10 bg-white px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-neutral-300 hover:text-neutral-700"
                >
                  Demander un audit Systèmes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlug(null)}
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-blue/10 bg-white text-brand-blue transition hover:border-neutral-300 hover:text-neutral-700 md:static"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("processus")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "processus"
                    ? "bg-brand-blue text-white"
                    : "bg-white text-brand-blue/70"
                }`}
              >
                Processus
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("outils")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "outils"
                    ? "bg-brand-blue text-white"
                    : "bg-white text-brand-blue/70"
                }`}
              >
                Outils
              </button>
            </div>

            {activeTab === "processus" ? (
              <div className="mt-6 overflow-x-auto pb-2 soft-scroll">
                <div className="mx-auto flex min-w-max justify-center gap-4">
                  {PILLARS.map((pillar) => {
                    const pillarCards = detail.processes.filter(
                      (process) => process.pillar === pillar
                    );

                    return (
                      <div
                        key={pillar}
                        className="w-[18rem] shrink-0 rounded-[1.75rem] border border-neutral-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(20,20,20,0.025)]"
                      >
                        <h3 className="demaa-section-title text-xl text-brand-blue">{pillar}</h3>
                        <div className="mt-4 space-y-3">
                          {pillarCards.length > 0 ? (
                            pillarCards.map((process) => (
                              <article
                                key={process.title}
                                className="rounded-[1.25rem] bg-neutral-50/90 p-3 text-left shadow-none"
                              >
                                <h4 className="text-left text-sm font-semibold leading-snug text-brand-blue">
                                  {process.title}
                                </h4>
                                <p className="mt-2 text-left text-xs leading-relaxed text-neutral-700">
                                  {process.description}
                                </p>
                                {process.examples ? (
                                  <p className="mt-3 text-left text-xs italic leading-relaxed text-neutral-400">
                                    {process.examples}
                                  </p>
                                ) : null}
                              </article>
                            ))
                          ) : (
                            <div className="rounded-[1.25rem] border border-brand-blue/8 bg-transparent p-3">
                              <p className="text-left text-xs leading-relaxed text-gray-500">
                                Pas de processus prioritaire ajouté pour ce pilier.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {detail.tools.map((tool) => {
                  const content = (
                    <>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          {tool.type}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-brand-blue">
                          {tool.name}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {tool.usage}
                      </p>
                    </>
                  );
                  const className =
                    "block rounded-[1.75rem] border border-brand-blue/8 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_16px_40px_rgba(20,20,20,0.05)]";

                  if (!tool.slug) {
                    return (
                      <article key={tool.name} className={className}>
                        {content}
                      </article>
                    );
                  }

                  return (
                    <Link
                      key={tool.name}
                      href={`/annuaire-logiciel/${tool.slug}`}
                      className={className}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <SystemSetupModal
        isOpen={isSystemSetupModalOpen}
        onClose={() => setIsSystemSetupModalOpen(false)}
        initialSector={selectedSystem?.name ?? detail?.sectorLabel}
      />
    </>
  );
}
