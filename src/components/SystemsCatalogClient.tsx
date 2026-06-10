"use client";

import Image from "next/image";
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
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Code2,
  ClipboardCheck,
  Cpu,
  Dumbbell,
  Factory,
  ExternalLink,
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
  X,
  type LucideIcon,
} from "lucide-react";
import SoftwareDetailDialog from "@/components/SoftwareDetailDialog";
import SystemSetupModal from "@/components/SystemSetupModal";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";
import DeleguerPricingPreviewModal from "@/components/DeleguerPricingPreviewModal";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import { ALL_SECTORS_LABEL, publicSectorFilterLabels } from "@/lib/public-sectors";
import type { ToolDirectoryItem } from "@/lib/tool-directory";
import type { System } from "@/lib/types";
import type { OperationalSystemDetail, SystemPillar } from "@/lib/system-operations";
import { getSystemResources, type SystemResource } from "@/lib/system-resources";
import { buildBusinessBlockChecklists } from "@/lib/business-block-checklists";
import { getRecommendedServicesForSystem } from "@/lib/service-recommendations";
import type { DemaaService } from "@/lib/service-catalog";
import { getRecommendedSuppliersForSystem } from "@/lib/supplier-recommendations";
import type { DemaaSupplier } from "@/lib/supplier-catalog";

type SystemsCatalogClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  showIntro?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  activeSector?: string;
  onActiveSectorChange?: (value: string) => void;
  showSearchBar?: boolean;
  initialSelectedSlug?: string;
  initialActiveTab?: string;
};

type SystemModalTab = "processus" | "outils" | "services" | "fournisseurs" | "ressources";
type ProcessGroup = {
  title: string;
  checklist: string[];
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

const TRANSVERSE_TOOL_SLUGS = new Set([
  "google-workspace",
  "microsoft-365",
  "notion",
  "airtable",
  "figma",
  "canva",
  "chatgpt",
  "claude",
  "cursor",
  "github-copilot",
  "make",
  "zapier",
  "fillout",
  "tally",
  "typeform",
  "pennylane",
  "tiime",
  "dext",
  "regate",
  "payfit",
  "hubspot",
  "pipedrive",
  "calendly",
  "stripe",
  "brevo",
  "metricool",
  "buffer",
]);

function isTransverseTool(tool: OperationalSystemDetail["tools"][number]): boolean {
  if (tool.detail?.scope) {
    return tool.detail.scope === "transverse";
  }

  return Boolean(tool.slug && TRANSVERSE_TOOL_SLUGS.has(tool.slug));
}

function getProcessChecklistItems(examples?: string): string[] {
  if (!examples) {
    return [];
  }

  return examples
    .replace(/^Exemple\s*:\s*/i, "")
    .replace(/\.$/, "")
    .split("→")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildProcessGroups(detail: OperationalSystemDetail): ProcessGroup[] {
  if (detail.businessBlocks.length) {
    return buildBusinessBlockChecklists(detail.businessBlocks, { systemId: detail.slug });
  }

  return PILLARS.map((pillar) => ({
    title: pillar,
    checklist: detail.processes
      .filter((process) => process.pillar === pillar)
      .flatMap((process) => getProcessChecklistItems(process.examples))
      .slice(0, 7),
  }));
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
  initialSelectedSlug,
  initialActiveTab,
}: SystemsCatalogClientProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSelectedSlug ?? null);
  const [activeTab, setActiveTab] = useState<SystemModalTab>(
    isSystemModalTab(initialActiveTab) ? initialActiveTab : "processus"
  );
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalActiveSector, setInternalActiveSector] = useState(ALL_SECTORS_LABEL);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSystemSetupModalOpen, setIsSystemSetupModalOpen] = useState(false);
  const [selectedToolDetail, setSelectedToolDetail] = useState<ToolDirectoryItem | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<DemaaService | null>(null);
  const [isDeleguerPricingOpen, setIsDeleguerPricingOpen] = useState(false);
  const [resourcePreview, setResourcePreview] = useState<{
    resource: SystemResource;
    slideIndex: number;
  } | null>(null);
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

  function closeSystemModal() {
    setSelectedSlug(null);
  }

  function openToolDetails(tool: ToolDirectoryItem) {
    setSelectedToolDetail(tool);
  }

  function closeToolDetails() {
    setSelectedToolDetail(null);
  }

  function openResourcePreview(resource: SystemResource) {
    setResourcePreview({ resource, slideIndex: 0 });
  }

  function closeResourcePreview() {
    setResourcePreview(null);
  }

  function changeResourceSlide(direction: -1 | 1) {
    setResourcePreview((currentPreview) => {
      if (!currentPreview) return currentPreview;

      const slides = getResourceSlides(currentPreview.resource);
      const nextIndex =
        (currentPreview.slideIndex + direction + slides.length) % slides.length;

      return { ...currentPreview, slideIndex: nextIndex };
    });
  }

  function renderToolCard(tool: OperationalSystemDetail["tools"][number]) {
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
    const className = "demaa-card block rounded-[1.15rem] p-5 text-left";

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
        href={`/annuaire-outils/${tool.slug}`}
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
  }

  function renderServiceCard(service: DemaaService) {
    const serviceSource =
      service.slug === "structuration-automatisation" ? "Demaa" : "Partenaire";

    return (
      <button
        type="button"
        key={service.slug}
        onClick={() => {
          if (service.slug === "structuration-automatisation") {
            setIsDeleguerPricingOpen(true);
            return;
          }

          setSelectedServiceDetail(service);
        }}
        className="demaa-card group flex min-h-[15rem] flex-col rounded-[1.15rem] p-5 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <ServiceIcon icon={service.icon} className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {service.category}
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
          {service.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-dema-muted">
          {service.shortDescription}
        </p>
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
              {service.price}
            </span>
            <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
              {service.category}
            </span>
            <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
              {serviceSource}
            </span>
          </div>
        </div>
      </button>
    );
  }

  function renderSupplierCard(supplier: DemaaSupplier) {
    const isExternal = supplier.href.startsWith("http");
    const content = (
      <>
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <ServiceIcon icon={supplier.icon} className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {supplier.category}
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
          {supplier.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-dema-muted">
          {supplier.shortDescription}
        </p>
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-dema-forest px-3 py-1 text-[10px] font-medium text-dema-paper">
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
        </div>
      </>
    );
    const className = "demaa-card group flex min-h-[15rem] flex-col rounded-[1.15rem] p-5 text-left";

    if (isExternal) {
      return (
        <a
          key={supplier.slug}
          href={supplier.href}
          target="_blank"
          rel="noreferrer"
          className={className}
        >
          {content}
        </a>
      );
    }

    return (
      <Link key={supplier.slug} href={supplier.href} className={className}>
        {content}
      </Link>
    );
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

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSystemModal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedSlug]);

  const sectors = publicSectorFilterLabels;

  const filteredSystems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return systems.filter((system) => {
      const detail = detailsBySlug[system.slug];
      const sectorLabel = detail?.sectorLabel ?? "Conseil & services aux entreprises";

      const matchesSearch =
        !query ||
        system.name.toLowerCase().includes(query) ||
        system.description.toLowerCase().includes(query) ||
        system.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        sectorLabel.toLowerCase().includes(query);

      const matchesSector = activeSector === ALL_SECTORS_LABEL || sectorLabel === activeSector;

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
  const processGroups = detail ? buildProcessGroups(detail) : [];
  const recommendedServices = selectedSlug
    ? getRecommendedServicesForSystem(selectedSlug)
    : [];

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
                      activeSector === ALL_SECTORS_LABEL
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
            <div className="mt-8 space-y-8 md:mt-10 md:space-y-9">
              {systemSections.map((section) => (
                <section key={section.title}>
                  <div className="mb-3">
                    <h2 className="demaa-section-title text-2xl tracking-tight text-brand-blue/85 md:text-3xl">
                      {section.title}
                    </h2>
                  </div>
                  <HorizontalScrollHint
                    className="-mx-4 overflow-x-auto px-4 pb-4 pt-2 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                    controlsClassName="absolute right-0 -top-10 z-10 flex items-center gap-1.5"
                  >
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
                            }}
                            className="demaa-card group flex min-h-[10rem] flex-[0_0_calc(50%-0.5rem)] cursor-pointer flex-col rounded-[1.15rem] p-5 text-left md:flex-[0_0_calc(25%-0.75rem)]"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                              <Icon className="h-4 w-4" />
                            </span>
                            <h3 className="mt-4 line-clamp-2 text-lg font-normal leading-tight tracking-tight text-brand-blue">
                              {system.name}
                            </h3>
                            <p className="mt-3 line-clamp-3 text-sm font-normal leading-relaxed text-dema-muted">
                              {system.description}
                            </p>
                          </button>
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

      {selectedSystem && detail ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/35 p-4"
          onClick={closeSystemModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-detail-title"
        >
          <div
            className="relative flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 pt-14 shadow-[0_24px_60px_rgba(23,35,29,0.14)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="flex-1 text-left">
                <p className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  {detail.sectorLabel}
                </p>
                <h2 id="system-detail-title" className="mt-2 text-3xl font-normal tracking-tight text-brand-blue md:text-4xl">
                  {selectedSystem.name}
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-dema-muted">
                  {selectedSystem.description}
                </p>
              </div>
              <div className="flex shrink-0 items-start gap-2">
                <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
                  <Link
                    href={`/documents-structuration/${selectedSystem.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demaa-secondary-button gap-2 bg-dema-paper"
                  >
                    <FileText className="h-4 w-4" />
                    Ouvrir le document de structuration
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsSystemSetupModalOpen(true)}
                    className="demaa-primary-button"
                  >
                    Audit organisation gratuit
                  </button>
                </div>
                <button
                  type="button"
                  onClick={closeSystemModal}
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
              <button
                type="button"
                onClick={() => setActiveTab("services")}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:transition ${
                  activeTab === "services"
                    ? "bg-transparent text-brand-blue after:bg-dema-forest"
                    : "bg-transparent text-brand-blue/55 after:bg-transparent hover:text-brand-blue/75"
                }`}
              >
                Services
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("fournisseurs")}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:transition ${
                  activeTab === "fournisseurs"
                    ? "bg-transparent text-brand-blue after:bg-dema-forest"
                    : "bg-transparent text-brand-blue/55 after:bg-transparent hover:text-brand-blue/75"
                }`}
              >
                Fournisseurs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ressources")}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:transition ${
                  activeTab === "ressources"
                    ? "bg-transparent text-brand-blue after:bg-dema-forest"
                    : "bg-transparent text-brand-blue/55 after:bg-transparent hover:text-brand-blue/75"
                }`}
              >
                Ressources
              </button>
            </div>

            <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1 soft-scroll">
              {activeTab === "processus" ? (
                <div className="space-y-5">
                  <div className="overflow-x-auto pb-2 soft-scroll xl:overflow-x-visible">
                    <div className="mx-auto flex min-w-max justify-start gap-4">
                      {processGroups.map((group) => {
                        return (
                          <div
                            key={group.title}
                            className="w-[18rem] shrink-0 rounded-[1.25rem] border border-dema-line bg-dema-paper p-4 shadow-[0_8px_24px_rgba(23,35,29,0.035)]"
                          >
                            <h3 className="demaa-section-title text-center text-xl text-brand-blue">
                              {group.title}
                            </h3>
                            <div className="mt-4">
                              {group.checklist.length > 0 ? (
                                <ul className="space-y-2">
                                  {group.checklist.map((item) => (
                                    <li
                                      key={item}
                                      className="flex items-start gap-2 text-left text-xs leading-relaxed text-dema-muted"
                                    >
                                      <span className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                                      </span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="rounded-[1rem] border border-dema-line bg-dema-cream/65 p-3">
                                  <p className="text-left text-xs leading-relaxed text-dema-muted">
                                    Pas de checklist prioritaire ajoutée pour ce bloc.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : activeTab === "outils" ? (
                <div className="space-y-5">
                  {(() => {
                    const businessTools = detail.tools.filter((tool) => !isTransverseTool(tool));
                    const transverseTools = detail.tools.filter(isTransverseTool);

                    return (
                      <>
                        {businessTools.length ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                              Outils métier
                            </p>
                            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                              {businessTools.map(renderToolCard)}
                            </div>
                          </div>
                        ) : null}

                        {transverseTools.length ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted">
                              Outils transverses
                            </p>
                            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                              {transverseTools.map(renderToolCard)}
                            </div>
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                  <div className="rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5 text-left">
                    <h3 className="text-lg font-semibold text-brand-blue">
                      Besoin de comparer plus largement ?
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-dema-muted">
                      L&apos;annuaire rassemble les logiciels, plateformes et outils de travail
                      utiles pour organiser, vendre, produire et piloter l&apos;activité.
                    </p>
                    <Link
                      href={`/annuaire-outils?retourSysteme=${encodeURIComponent(selectedSystem.slug)}`}
                      className="mt-4 inline-flex items-center rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                    >
                      Voir tous les outils
                    </Link>
                  </div>
                </div>
              ) : activeTab === "services" ? (
                <div className="space-y-5">
                  <div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {recommendedServices.map(renderServiceCard)}
                    </div>
                  </div>

                  <div className="rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5 text-left">
                    <h3 className="text-lg font-semibold text-brand-blue">
                      Besoin de voir tout le catalogue ?
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-dema-muted">
                      L&apos;annuaire services rassemble les offres juridiques, finance,
                      acquisition, structuration, automatisation et support opérationnel.
                    </p>
                    <Link
                      href={`/deleguer?retourSysteme=${encodeURIComponent(selectedSystem.slug)}`}
                      className="mt-4 inline-flex items-center rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                    >
                      Voir tous les services
                    </Link>
                  </div>
                </div>
              ) : activeTab === "fournisseurs" ? (
                <div className="space-y-5">
                  <div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {getRecommendedSuppliersForSystem(selectedSystem.slug).map(renderSupplierCard)}
                    </div>
                  </div>

                  <div className="rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5 text-left">
                    <h3 className="text-lg font-semibold text-brand-blue">
                      Besoin de comparer plus largement ?
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-dema-muted">
                      L&apos;annuaire fournisseurs rassemble banques, assurances, mutuelles,
                      matériaux, grossistes, équipements, énergie, téléphonie et partenaires métier.
                    </p>
                    <Link
                      href={`/annuaire-fournisseurs?retourSysteme=${encodeURIComponent(selectedSystem.slug)}`}
                      className="mt-4 inline-flex items-center rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                    >
                      Voir tous les fournisseurs
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {getSystemResources(selectedSystem.slug).map((resource) => (
                    <SystemResourceCard
                      key={resource.id}
                      resource={resource}
                      onPreview={openResourcePreview}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selectedToolDetail ? (
        <SoftwareDetailDialog tool={selectedToolDetail} onClose={closeToolDetails} />
      ) : null}

      {selectedServiceDetail ? (
        <ServiceDetailDialog
          service={selectedServiceDetail}
          source={selectedSystem ? `Système ${selectedSystem.name}` : "Modale système"}
          onClose={() => setSelectedServiceDetail(null)}
        />
      ) : null}

      {isDeleguerPricingOpen ? (
        <DeleguerPricingPreviewModal onClose={() => setIsDeleguerPricingOpen(false)} />
      ) : null}

      {resourcePreview ? (
        <SystemResourcePreview
          resource={resourcePreview.resource}
          slideIndex={resourcePreview.slideIndex}
          onClose={closeResourcePreview}
          onSlideChange={changeResourceSlide}
        />
      ) : null}

      <SystemSetupModal
        isOpen={isSystemSetupModalOpen}
        onClose={() => setIsSystemSetupModalOpen(false)}
        initialSector={selectedSystem?.name ?? detail?.sectorLabel}
      />
    </>
  );
}

function isSystemModalTab(tab?: string): tab is SystemModalTab {
  return (
    tab === "processus" ||
    tab === "outils" ||
    tab === "services" ||
    tab === "fournisseurs" ||
    tab === "ressources"
  );
}

function getResourceSlides(resource: SystemResource): string[] {
  return resource.slides?.length ? resource.slides : [resource.image];
}

function SystemResourceCard({
  resource,
  onPreview,
}: {
  resource: SystemResource;
  onPreview: (resource: SystemResource) => void;
}) {
  return (
    <article className="demaa-card group overflow-hidden rounded-[1.15rem] text-left">
      <button
        type="button"
        onClick={() => onPreview(resource)}
        className="block w-full text-left"
        aria-label={`Agrandir ${resource.title}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-dema-line bg-[#f8f8f5]">
          <Image
            src={resource.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 390px, (min-width: 768px) 50vw, calc(100vw - 48px)"
            className="object-contain p-2.5 transition duration-300 ease-out group-hover:scale-[1.006] sm:p-3"
          />
        </div>
        <div className="px-5 pb-3 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
            {resource.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
            {resource.title}
          </h3>
        </div>
      </button>
      <div className="px-5 pb-5">
        <a
          href={resource.resourceHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-dema-forest transition hover:text-brand-blue"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          {resource.resourceLabel}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function SystemResourcePreview({
  resource,
  slideIndex,
  onClose,
  onSlideChange,
}: {
  resource: SystemResource;
  slideIndex: number;
  onClose: () => void;
  onSlideChange: (direction: -1 | 1) => void;
}) {
  const slides = getResourceSlides(resource);
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMultipleSlides) onSlideChange(-1);
      if (event.key === "ArrowRight" && hasMultipleSlides) onSlideChange(1);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasMultipleSlides, onClose, onSlideChange]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/72 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={resource.title}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.15rem] bg-dema-paper shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-dema-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
              {resource.category}
            </p>
            <h2 className="truncate text-sm font-semibold text-brand-blue sm:text-base">
              {resource.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Fermer l'aperçu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative min-h-[58vh] bg-[#f8f8f5] sm:min-h-[68vh]">
          <Image
            src={slides[slideIndex]}
            alt=""
            fill
            sizes="100vw"
            className="object-contain p-3 sm:p-6"
            priority
          />

          {hasMultipleSlides ? (
            <>
              <button
                type="button"
                onClick={() => onSlideChange(-1)}
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-dema-line bg-dema-paper/92 text-brand-blue shadow-sm transition hover:border-dema-forest/25 hover:text-dema-forest"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onSlideChange(1)}
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-dema-line bg-dema-paper/92 text-brand-blue shadow-sm transition hover:border-dema-forest/25 hover:text-dema-forest"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dema-line px-4 py-3 sm:px-5">
          <p className="text-xs font-medium text-dema-muted">
            {hasMultipleSlides ? `${slideIndex + 1} / ${slides.length}` : "Aperçu"}
          </p>
          <a
            href={resource.resourceHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-dema-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-blue"
          >
            {resource.resourceLabel}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
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
