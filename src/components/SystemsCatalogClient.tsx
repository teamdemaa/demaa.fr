"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
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
  ChevronDown,
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
import SoftwareDetailDialog from "@/components/SoftwareDetailDialog";
import SystemSetupModal from "@/components/SystemSetupModal";
import type { ToolDirectoryItem } from "@/lib/tool-directory";
import type { System } from "@/lib/types";
import type { OperationalSystemDetail, SystemPillar } from "@/lib/system-operations";

type SystemsCatalogClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  showIntro?: boolean;
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
  const [openProcessIds, setOpenProcessIds] = useState<Set<string>>(new Set());
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState("Tous");
  const [isSystemSetupModalOpen, setIsSystemSetupModalOpen] = useState(false);
  const [selectedToolDetail, setSelectedToolDetail] = useState<ToolDirectoryItem | null>(null);
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;

  function updateSearchQuery(value: string) {
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  }

  function toggleProcessCard(processId: string) {
    setOpenProcessIds((currentOpenIds) => {
      const nextOpenIds = new Set(currentOpenIds);

      if (nextOpenIds.has(processId)) {
        nextOpenIds.delete(processId);
      } else {
        nextOpenIds.add(processId);
      }

      return nextOpenIds;
    });
  }

  function openToolDetails(tool: ToolDirectoryItem) {
    setSelectedToolDetail(tool);
  }

  function closeToolDetails() {
    setSelectedToolDetail(null);
  }

  useEffect(() => {
    function handlePopState() {
      setSelectedToolDetail(null);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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
        sectorLabel.toLowerCase().includes(query);

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

          <div className={showIntro ? "mt-10" : "border-b border-dema-line/65 pb-4 pt-2 md:pb-5 md:pt-0"}>
            {showSearchBar ? (
              <div className="demaa-search-shell mx-auto max-w-4xl p-1.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42 md:left-5 md:h-5 md:w-5" />
                  <input
                    value={searchQuery}
                    onChange={(event) => updateSearchQuery(event.target.value)}
                    placeholder="Rechercher une entreprise, un processus, un outil..."
                    className="w-full rounded-full bg-dema-paper py-3.5 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-4 md:pl-12 md:text-base"
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
                    className={`demaa-chip ${
                      activeSector === sector
                        ? "demaa-chip-active"
                        : ""
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {systemSections.length === 0 ? (
            <div className="mt-8 rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
              <h2 className="text-xl font-bold text-brand-blue">Aucun système trouvé</h2>
              <p className="mt-3 text-sm font-normal text-dema-muted">
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
                        const Icon = getSystemIcon(system);

                        return (
                          <button
                            key={system.id}
                            type="button"
                            onClick={() => {
                              setSelectedSlug(system.slug);
                              setActiveTab("processus");
                              setOpenProcessIds(new Set());
                            }}
                            className="demaa-card group flex min-h-[10rem] flex-[0_0_calc(50%-0.5rem)] cursor-pointer flex-col rounded-[1.15rem] p-5 text-left md:flex-[0_0_calc(25%-0.75rem)]"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                              <Icon className="h-4 w-4" />
                            </span>
                            <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-brand-blue">
                              {system.name}
                            </h3>
                            <p className="mt-3 line-clamp-3 text-sm font-normal leading-relaxed text-dema-muted">
                              {system.description}
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
          onClick={() => {
            setSelectedSlug(null);
            setOpenProcessIds(new Set());
          }}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 pt-14 shadow-[0_24px_60px_rgba(23,35,29,0.14)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="flex-1 text-left">
                <p className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  {detail.sectorLabel}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                  {selectedSystem.name}
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-dema-muted">
                  {selectedSystem.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSystemSetupModalOpen(true)}
                  className="demaa-primary-button"
                >
                  Demander un audit de mes process
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlug(null);
                    setOpenProcessIds(new Set());
                  }}
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest md:static"
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
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:transition ${
                  activeTab === "processus"
                    ? "bg-transparent text-brand-blue after:bg-dema-forest"
                    : "bg-transparent text-brand-blue/55 after:bg-transparent hover:text-brand-blue/75"
                }`}
              >
                Processus
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("outils")}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:transition ${
                  activeTab === "outils"
                    ? "bg-transparent text-brand-blue after:bg-dema-forest"
                    : "bg-transparent text-brand-blue/55 after:bg-transparent hover:text-brand-blue/75"
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
                        className="w-[18rem] shrink-0 rounded-[1.25rem] border border-dema-line bg-dema-paper p-4 shadow-[0_8px_24px_rgba(23,35,29,0.035)]"
                      >
                        <h3 className="demaa-section-title text-xl text-brand-blue">{pillar}</h3>
                        <div className="mt-4 space-y-3">
                          {pillarCards.length > 0 ? (
                            pillarCards.map((process) => {
                              const processId = `${selectedSystem.slug}-${pillar}-${process.title}`
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "")
                                .replace(/[^a-zA-Z0-9]+/g, "-")
                                .replace(/^-|-$/g, "")
                                .toLowerCase();
                              const isOpen = openProcessIds.has(processId);

                              return (
                                <article
                                  key={process.title}
                                  className={`rounded-[1.15rem] border text-left transition ${
                                    isOpen
                                      ? "border-dema-forest/18 bg-dema-paper shadow-[0_10px_24px_rgba(23,35,29,0.045)]"
                                      : "border-transparent bg-dema-sage/45 hover:border-dema-line hover:bg-dema-paper"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleProcessCard(processId)}
                                    className="flex min-h-12 w-full items-center justify-between gap-3 px-3 py-3 text-left"
                                    aria-expanded={isOpen}
                                    aria-controls={`${processId}-content`}
                                  >
                                    <h4 className="text-left text-sm font-semibold leading-snug text-brand-blue">
                                      {process.title}
                                    </h4>
                                    <ChevronDown
                                      className={`h-4 w-4 shrink-0 text-dema-forest/45 transition-transform duration-200 ${
                                        isOpen ? "rotate-180" : ""
                                      }`}
                                      aria-hidden="true"
                                    />
                                  </button>
                                  <div
                                    id={`${processId}-content`}
                                    aria-hidden={!isOpen}
                                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
                                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    }`}
                                  >
                                    <div className="min-h-0">
                                      <div className="px-3 pb-3 pt-0">
                                        <p className="text-left text-xs leading-relaxed text-brand-blue/78">
                                          {process.description}
                                        </p>
                                        {process.examples ? (
                                          <p className="mt-3 text-left text-xs italic leading-relaxed text-dema-muted">
                                            {process.examples}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              );
                            })
                          ) : (
                            <div className="rounded-[1rem] border border-dema-line bg-dema-cream/65 p-3">
                              <p className="text-left text-xs leading-relaxed text-dema-muted">
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
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {detail.tools.map((tool) => {
                  const content = (
                    <>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
                          {tool.type}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-brand-blue">
                          {tool.name}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                        {tool.usage}
                      </p>
                    </>
                  );
                  const className =
                    "demaa-card block rounded-[1.15rem] p-5 text-left";

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
                      onClick={(event) => {
                        handleToolDetailClick(
                          event,
                          tool.detail ?? getFallbackToolDetail(tool),
                          openToolDetails
                        );
                      }}
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

      {selectedToolDetail ? (
        <SoftwareDetailDialog tool={selectedToolDetail} onClose={closeToolDetails} />
      ) : null}

      <SystemSetupModal
        isOpen={isSystemSetupModalOpen}
        onClose={() => setIsSystemSetupModalOpen(false)}
        initialSector={selectedSystem?.name ?? detail?.sectorLabel}
      />
    </>
  );
}

function getFallbackToolDetail(tool: OperationalSystemDetail["tools"][number]): ToolDirectoryItem {
  return {
    slug: tool.slug,
    name: tool.name,
    category: tool.type,
    description: tool.usage,
    sectors: [],
    bestFor: tool.usage,
    pricingHint: "À vérifier",
    tags: [],
    url: tool.url ?? "#",
  };
}

function handleToolDetailClick(
  event: MouseEvent<HTMLAnchorElement>,
  tool: ToolDirectoryItem,
  onOpenDetails: (tool: ToolDirectoryItem) => void,
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
  onOpenDetails(tool);
}
