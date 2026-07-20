"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  CircleDollarSign,
  FileSignature,
  FileText,
  FolderKanban,
  FormInput,
  GraduationCap,
  Handshake,
  HeartHandshake,
  PackageSearch,
  Scale,
  UsersRound,
  Wrench,
} from "lucide-react";
import AccompagnementServices from "@/components/AccompagnementServices";
import FinanceDetailDialog from "@/components/FinanceDetailDialog";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";
import ProNetworkDetailDialog from "@/components/ProNetworkDetailDialog";
import RecruitmentDetailDialog from "@/components/RecruitmentDetailDialog";
import SoftwareDetailDialog from "@/components/SoftwareDetailDialog";
import SupplierDetailDialog from "@/components/SupplierDetailDialog";
import SystemCompleteModal from "@/components/SystemCompleteModal";
import SystemeTabContent from "@/components/SystemeTabContent";
import TrainingDetailDialog from "@/components/TrainingDetailDialog";
import type { DemaaAidItem } from "@/lib/aid-catalog";
import {
  getRecommendedAidsForSystem,
  splitAidRecommendationsForDisplay,
} from "@/lib/aid-recommendations";
import { getFreeToolsForSystem } from "@/lib/free-tools";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  getFinanceCardBadge,
  getProNetworkCardBadge,
  getSupplierCardBadge,
} from "@/lib/card-badges";
import type { DemaaFinanceItem } from "@/lib/finance-catalog";
import {
  getRecommendedFinanceForSystem,
  getVisibleFinanceRecommendationCountForSystem,
} from "@/lib/finance-recommendations";
import type { DemaaProNetwork } from "@/lib/pro-network-catalog";
import { getRecommendedProNetworksForSystem } from "@/lib/pro-network-recommendations";
import { getRecommendedRecruitmentItemsForSystem } from "@/lib/recruitment-recommendations";
import type { DemaaRecruitmentItem } from "@/lib/recruitment-catalog";
import { getGroupedRecommendedTrainingsForSystem } from "@/lib/training-recommendations";
import type { DemaaTraining } from "@/lib/training-catalog";
import { type OperationalSystemDetail } from "@/lib/system-operations";
import { getRecommendedSuppliersForSystem } from "@/lib/supplier-recommendations";
import type { DemaaSupplier } from "@/lib/supplier-catalog";
import {
  isVisibleSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import { getToolDirectorySlug, type ToolDirectoryItem } from "@/lib/tool-directory";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  detail: OperationalSystemDetail;
  intro: string;
  initialActiveTab?: string;
  headingAs?: "h1" | "h2";
  headingId?: string;
};

const SYSTEM_CARD_CLASS =
  "demaa-card group flex h-full min-h-[14rem] flex-col rounded-[1.15rem] p-5 text-left";
const SYSTEM_CARD_TITLE_CLASS =
  "mt-2 line-clamp-2 text-lg font-semibold leading-snug text-brand-blue";
const SYSTEM_CARD_DESCRIPTION_CLASS =
  "mt-3 line-clamp-3 text-sm leading-relaxed text-dema-muted";
const MAX_VISIBLE_RECOMMENDATIONS = 3;
const GENERIC_TOOL_CATEGORIES = new Set(["Outils métier", "Outils transverses"]);
const INDUSTRY_TOOL_TAGS = new Set([
  "Avocat",
  "Bâtiment",
  "Immobilier",
  "Restaurant",
  "Commerce",
  "Santé",
  "Artisanat",
  "Droit",
]);

const SYSTEM_SECTION_CARDS = [
  {
    tab: "process",
    label: "Process",
    description: "Les process opérationnels classés par catégorie, réunis dans un kit prêt à utiliser.",
    icon: FolderKanban,
  },
  {
    tab: "outils",
    label: "Outils",
    description: "Les solutions métier et transverses utiles pour cette activité.",
    icon: Wrench,
  },
  {
    tab: "fournisseurs",
    label: "Fournisseurs",
    description: "Les partenaires et prestataires utiles à regarder en priorité.",
    icon: PackageSearch,
  },
  {
    tab: "financement",
    label: "Financement",
    description: "Les solutions de financement et les aides adaptées à votre situation.",
    icon: CircleDollarSign,
  },
  {
    tab: "recrutement",
    label: "Recrutement",
    description: "Les bons canaux et services pour renforcer votre équipe.",
    icon: UsersRound,
  },
  {
    tab: "formation",
    label: "Formation",
    description: "Les formations métier et transverses utiles pour progresser.",
    icon: GraduationCap,
  },
  {
    tab: "reseaux-pro",
    label: "Réseau pro",
    description: "Les réseaux et organisations qui peuvent soutenir votre développement.",
    icon: Handshake,
  },
  {
    tab: "accompagnement",
    label: "Accompagnement",
    description: "Un appui humain pour structurer, gérer ou faire évoluer votre société.",
    icon: HeartHandshake,
  },
] as const satisfies ReadonlyArray<{
  tab: SystemDetailTab;
  label: string;
  description: string;
  icon: typeof FolderKanban;
}>;

type SupplierSection = {
  title: string;
  items: DemaaSupplier[];
};

type FundingPriorityItem =
  | { kind: "finance"; item: DemaaFinanceItem }
  | { kind: "aid"; item: DemaaAidItem };

function isTransverseTool(tool: OperationalSystemDetail["tools"][number]): boolean {
  if (tool.scope) {
    return tool.scope === "transverse";
  }

  if (tool.detail?.scope) {
    return tool.detail.scope === "transverse";
  }

  return Boolean(tool.slug && tool.detail?.scope === "transverse");
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

function getToolEyebrow(tool: OperationalSystemDetail["tools"][number]): string | null {
  const category = tool.detail?.category ?? tool.type;

  if (category && !GENERIC_TOOL_CATEGORIES.has(category)) {
    return category;
  }

  const informativeTag = tool.detail?.tags?.find((tag) => !INDUSTRY_TOOL_TAGS.has(tag));
  return informativeTag ?? null;
}

function getToolIcon(tool: OperationalSystemDetail["tools"][number]) {
  const category = (tool.detail?.category ?? tool.type).toLowerCase();
  const tags = tool.detail?.tags?.map((tag) => tag.toLowerCase()) ?? [];

  if (category.includes("formulaire")) {
    return FormInput;
  }

  if (category.includes("gestion") || tags.includes("dossiers") || tags.includes("documents")) {
    return FolderKanban;
  }

  if (category.includes("signature") || category.includes("document")) {
    return FileSignature;
  }

  if (category.includes("ia") || tags.some((tag) => tag.includes("ia"))) {
    return Bot;
  }

  if (tags.some((tag) => tag.includes("agenda") || tag.includes("planification") || tag.includes("rendez-vous"))) {
    return CalendarDays;
  }

  if (tags.some((tag) => tag.includes("juridique") || tag.includes("jurisprudence") || tag.includes("doctrine"))) {
    return Scale;
  }

  if (category.includes("outil")) {
    return Briefcase;
  }

  return Wrench;
}

function getSupplierSectionKey(supplier: DemaaSupplier): string {
  if (
    supplier.category === "Assurance" ||
    supplier.category === "Mutuelle" ||
    supplier.category === "Paiement" ||
    supplier.category === "Téléphonie" ||
    supplier.slug === "insify" ||
    supplier.slug === "swile" ||
    supplier.tags.some((tag) => ["RH", "Avantages", "Mutuelle"].includes(tag))
  ) {
    return "transverse";
  }

  return "operations";
}

function groupSuppliersBySection(suppliers: DemaaSupplier[]): SupplierSection[] {
  const sections = new Map<string, SupplierSection>([
    ["operations", { title: "Exploitation & matériel", items: [] }],
    ["transverse", { title: "Transverses", items: [] }],
  ]);

  suppliers.forEach((supplier) => {
    sections.get(getSupplierSectionKey(supplier))?.items.push(supplier);
  });

  return Array.from(sections.values()).filter((section) => section.items.length > 0);
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

function handleSupplierDetailClick(
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

function handleProNetworkDetailClick(
  event: MouseEvent<HTMLAnchorElement>,
  network: DemaaProNetwork,
  onOpenDetails: (network: DemaaProNetwork) => void,
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
  onOpenDetails(network);
}

export default function SystemDetailContent({
  system,
  detail,
  intro,
  initialActiveTab,
  headingAs = "h1",
  headingId,
}: SystemDetailContentProps) {
  const router = useRouter();
  const defaultTab = isVisibleSystemDetailTab(initialActiveTab)
    ? initialActiveTab
    : null;
  const [activeTab, setActiveTab] = useState<SystemDetailTab | null>(defaultTab);
  const [isSystemCompleteModalOpen, setIsSystemCompleteModalOpen] = useState(false);
  const [selectedToolDetail, setSelectedToolDetail] = useState<ToolDirectoryItem | null>(null);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<DemaaSupplier | null>(null);
  const [selectedFinanceDetail, setSelectedFinanceDetail] = useState<DemaaFinanceItem | null>(null);
  const [selectedProNetworkDetail, setSelectedProNetworkDetail] = useState<DemaaProNetwork | null>(null);
  const [selectedRecruitmentDetail, setSelectedRecruitmentDetail] = useState<DemaaRecruitmentItem | null>(null);
  const [selectedTrainingDetail, setSelectedTrainingDetail] = useState<DemaaTraining | null>(null);
  const [expandedRecommendationSections, setExpandedRecommendationSections] = useState<
    Record<string, boolean>
  >({});
  const recommendedSuppliers = useMemo(
    () => (activeTab === "fournisseurs"
      ? getRecommendedSuppliersForSystem(system.slug, detail.sectorLabel)
      : []),
    [activeTab, detail.sectorLabel, system.slug]
  );
  const recommendedFinance = useMemo(
    () => (activeTab === "financement" ? getRecommendedFinanceForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const visibleFinanceRecommendationCount = useMemo(
    () => getVisibleFinanceRecommendationCountForSystem(system.slug),
    [system.slug],
  );
  const recommendedAids = useMemo(
    () => (activeTab === "financement"
      ? getRecommendedAidsForSystem(system.slug, detail.sectorLabel)
      : []),
    [activeTab, detail.sectorLabel, system.slug]
  );
  const prioritizedAids = useMemo(
    () => splitAidRecommendationsForDisplay(recommendedAids),
    [recommendedAids],
  );
  const recommendedProNetworks = useMemo(
    () => (activeTab === "reseaux-pro" ? getRecommendedProNetworksForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const freeTools = useMemo(
    () => (activeTab === "outils" ? getFreeToolsForSystem(system.slug, detail.sectorLabel) : []),
    [activeTab, detail.sectorLabel, system.slug]
  );
  const recommendedTrainings = useMemo(
    () => (activeTab === "formation"
      ? getGroupedRecommendedTrainingsForSystem(system.slug, detail.sectorLabel)
      : { metier: [], transverse: [] }),
    [activeTab, detail.sectorLabel, system.slug]
  );
  const recommendedRecruitmentItems = useMemo(
    () => (activeTab === "recrutement"
      ? getRecommendedRecruitmentItemsForSystem(detail.sectorLabel)
      : []),
    [activeTab, detail.sectorLabel]
  );
  const displayedRecruitmentItems = useMemo(() => {
    return {
      visible: recommendedRecruitmentItems.slice(0, MAX_VISIBLE_RECOMMENDATIONS),
      additional: recommendedRecruitmentItems.slice(MAX_VISIBLE_RECOMMENDATIONS),
    };
  }, [recommendedRecruitmentItems]);
  const displayedTrainings = useMemo(() => {
    const visibleMetierLimit = recommendedTrainings.transverse.length
      ? MAX_VISIBLE_RECOMMENDATIONS - 1
      : MAX_VISIBLE_RECOMMENDATIONS;
    const visibleMetier = recommendedTrainings.metier.slice(0, visibleMetierLimit);
    const remainingSlots = MAX_VISIBLE_RECOMMENDATIONS - visibleMetier.length;
    const visibleTransverse = recommendedTrainings.transverse.slice(0, remainingSlots);

    return {
      visibleMetier,
      visibleTransverse,
      additionalMetier: recommendedTrainings.metier.slice(visibleMetier.length),
      additionalTransverse: recommendedTrainings.transverse.slice(visibleTransverse.length),
    };
  }, [recommendedTrainings]);
  const visibleSupplierCount = MAX_VISIBLE_RECOMMENDATIONS;
  const additionalSupplierSections = useMemo(
    () => (activeTab === "fournisseurs"
      ? groupSuppliersBySection(recommendedSuppliers.slice(visibleSupplierCount))
      : []),
    [activeTab, recommendedSuppliers, visibleSupplierCount]
  );
  const visibleFinanceItems = useMemo(
    () => recommendedFinance.slice(0, visibleFinanceRecommendationCount),
    [recommendedFinance, visibleFinanceRecommendationCount],
  );
  const displayedAids = useMemo(() => {
    const visibleAidSlots = Math.max(
      0,
      MAX_VISIBLE_RECOMMENDATIONS - visibleFinanceItems.length,
    );

    return {
      recommended: prioritizedAids.recommended.slice(0, visibleAidSlots),
      secondary: [
        ...prioritizedAids.recommended.slice(visibleAidSlots),
        ...prioritizedAids.secondary,
      ],
    };
  }, [prioritizedAids, visibleFinanceItems.length]);
  const priorityFundingItems = useMemo<FundingPriorityItem[]>(
    () => [
      ...visibleFinanceItems.map((item) => ({ kind: "finance" as const, item })),
      ...displayedAids.recommended.map((item) => ({ kind: "aid" as const, item })),
    ].slice(0, MAX_VISIBLE_RECOMMENDATIONS),
    [displayedAids.recommended, visibleFinanceItems],
  );
  const additionalFinanceItems = useMemo(
    () => recommendedFinance.slice(visibleFinanceRecommendationCount),
    [recommendedFinance, visibleFinanceRecommendationCount],
  );
  const Heading = headingAs;

  function selectTab(tab: SystemDetailTab) {
    startTransition(() => {
      setActiveTab(tab);
    });
  }

  function returnToSections() {
    startTransition(() => {
      setActiveTab(null);
    });

    const url = new URL(window.location.href);
    url.searchParams.delete("tab");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function handleBack() {
    if (activeTab === null) {
      router.back();
      return;
    }

    returnToSections();
  }

  function toggleRecommendationSection(sectionKey: string) {
    setExpandedRecommendationSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  }

  function renderShowMoreButton({
    sectionKey,
    hiddenCount,
    label,
  }: {
    sectionKey: string;
    hiddenCount: number;
    label: string;
  }) {
    if (!hiddenCount) {
      return null;
    }

    const isExpanded = Boolean(expandedRecommendationSections[sectionKey]);

    return (
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => toggleRecommendationSection(sectionKey)}
        className="inline-flex items-center gap-2 text-sm font-medium text-dema-forest transition hover:text-brand-blue"
      >
        {isExpanded ? "Voir moins" : `${label} (${hiddenCount})`}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
    );
  }

  function renderToolCard(tool: OperationalSystemDetail["tools"][number]) {
    const eyebrow = getToolEyebrow(tool);
    const ToolIcon = getToolIcon(tool);
    const content = (
      <>
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <ToolIcon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <div>
          {eyebrow ? (
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
              {eyebrow}
            </p>
          ) : null}
          <h3 className={SYSTEM_CARD_TITLE_CLASS}>
            {tool.name}
          </h3>
        </div>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {tool.usage}
        </p>
      </>
    );
    const className = SYSTEM_CARD_CLASS;

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
            setSelectedToolDetail
          );
        }}
      >
        {content}
      </Link>
    );
  }

  function renderToolCarousel(
    tools: OperationalSystemDetail["tools"],
    tone: "forest" | "muted",
    title: string,
  ) {
    return (
      <div>
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
            tone === "forest" ? "text-dema-forest" : "text-dema-muted"
          }`}
        >
          {title}
        </p>
        <HorizontalScrollHint
          className="-mx-4 overflow-x-auto px-4 pb-4 pt-3 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          controlsClassName="absolute -right-2 -top-9 z-10 flex items-center gap-1.5 sm:-right-3"
        >
          <div className="flex w-max snap-x snap-mandatory gap-4">
            {tools.map((tool) => (
              <div
                key={tool.slug ?? tool.name}
                className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
              >
                {renderToolCard(tool)}
              </div>
            ))}
          </div>
        </HorizontalScrollHint>
      </div>
    );
  }

  function renderCardSection<T>({
    items,
    title,
    tone,
    layout = "carousel",
    getKey,
    renderCard,
  }: {
    items: T[];
    title: string;
    tone: "forest" | "muted";
    layout?: "grid" | "carousel";
    getKey: (item: T) => string;
    renderCard: (item: T) => ReactNode;
  }) {
    if (items.length <= 1) {
      return (
        <div className="space-y-4">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
              tone === "forest" ? "text-dema-forest" : "text-dema-muted"
            }`}
          >
            {title}
          </p>
          <div className="max-w-[20rem]">
            {items[0] ? renderCard(items[0]) : null}
          </div>
        </div>
      );
    }

    if (layout === "grid") {
      return (
        <div className="space-y-4">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
              tone === "forest" ? "text-dema-forest" : "text-dema-muted"
            }`}
          >
            {title}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {items.map((item) => (
              <div key={getKey(item)} className="min-w-0">
                {renderCard(item)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
            tone === "forest" ? "text-dema-forest" : "text-dema-muted"
          }`}
        >
          {title}
        </p>
        <HorizontalScrollHint
          className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          controlsClassName="absolute -right-2 -top-9 z-10 flex items-center gap-1.5 sm:-right-3"
        >
          <div className="flex w-max snap-x snap-mandatory gap-4">
            {items.map((item) => (
              <div
                key={getKey(item)}
                className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
              >
                {renderCard(item)}
              </div>
            ))}
          </div>
        </HorizontalScrollHint>
      </div>
    );
  }

  function renderSupplierCard(supplier: DemaaSupplier) {
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
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {supplier.name}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {supplier.shortDescription}
        </p>
        {getSupplierCardBadge(supplier) ? (
          <div className="mt-auto pt-4">
            <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
              {getSupplierCardBadge(supplier)}
            </span>
          </div>
        ) : null}
      </>
    );
    return (
      <Link
        key={supplier.slug}
        href={`/annuaire-fournisseurs/${supplier.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
        className={SYSTEM_CARD_CLASS}
        onClick={(event) => {
          handleSupplierDetailClick(event, supplier, setSelectedSupplierDetail);
        }}
      >
        {content}
      </Link>
    );
  }

  function renderProNetworkCard(network: DemaaProNetwork) {
    return (
      <Link
        key={network.slug}
        href={`/annuaire-reseaux-pro/${network.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
        className={SYSTEM_CARD_CLASS}
        onClick={(event) => {
          handleProNetworkDetailClick(event, network, setSelectedProNetworkDetail);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <ServiceIcon icon={network.icon} className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {network.category}
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {network.name}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {network.shortDescription}
        </p>
        {getProNetworkCardBadge(network) ? (
          <div className="mt-auto pt-4">
            <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
              {getProNetworkCardBadge(network)}
            </span>
          </div>
        ) : null}
      </Link>
    );
  }

  function renderFinanceCard(item: DemaaFinanceItem) {
    return (
      <Link
        key={item.slug}
        href={`/annuaire-financement/${item.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
        className={SYSTEM_CARD_CLASS}
        onClick={(event) => {
          event.preventDefault();
          setSelectedFinanceDetail(item);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <ServiceIcon icon={item.icon} className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {item.category}
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {item.name}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {item.shortDescription}
        </p>
        {getFinanceCardBadge(item) ? (
          <div className="mt-auto pt-4">
            <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
              {getFinanceCardBadge(item)}
            </span>
          </div>
        ) : null}
      </Link>
    );
  }

  function renderAidCard(item: DemaaAidItem) {
    return (
      <Link
        key={item.slug}
        href={`/aides-et-subventions/${item.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
        className={SYSTEM_CARD_CLASS}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <ServiceIcon icon={item.icon} className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {item.family}
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {item.name}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {item.shortDescription}
        </p>
      </Link>
    );
  }

  function renderFreeToolCard(tool: ToolDirectoryItem) {
    return (
      <Link
        key={getToolDirectorySlug(tool)}
        href={tool.url}
        className={SYSTEM_CARD_CLASS}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {tool.category}
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {tool.name}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {tool.description}
        </p>
      </Link>
    );
  }

  function renderTrainingCard(training: DemaaTraining) {
    return (
      <Link
        key={training.slug}
        href={`/annuaire-formations/${training.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
        className={SYSTEM_CARD_CLASS}
        onClick={(event) => {
          handleTrainingDetailClick(event, training, setSelectedTrainingDetail);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <ServiceIcon icon={training.icon} className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {training.family}
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {training.name}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {training.shortDescription}
        </p>
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-dema-forest">
          {training.provider}
          {training.format ? ` · ${training.format}` : ""}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  function renderRecruitmentCard(item: DemaaRecruitmentItem) {
    return (
      <Link
        key={item.slug}
        href={`/annuaire-recrutement/${item.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
        className={SYSTEM_CARD_CLASS}
        onClick={(event) => {
          handleRecruitmentDetailClick(event, item, setSelectedRecruitmentDetail);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <ServiceIcon icon={item.icon} className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {item.family}
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {item.name}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {item.shortDescription}
        </p>
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-dema-forest">
          {item.provider}
          {item.format ? ` · ${item.format}` : ""}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleBack}
        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-neutral-700"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Revenir
      </button>

      <div className="mt-4 text-left">
        <Heading
          id={headingId}
          className="text-3xl font-normal tracking-tight text-brand-blue md:text-4xl"
        >
          {system.name}
        </Heading>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted">
          {intro}
        </p>
      </div>

      {activeTab === null ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {SYSTEM_SECTION_CARDS.filter((section) => isVisibleSystemDetailTab(section.tab)).map(
            (section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.tab}
                  type="button"
                  onClick={() => selectTab(section.tab)}
                  className="group flex min-h-[13rem] min-w-0 flex-col rounded-[1.25rem] border border-dema-line bg-dema-paper p-4 text-left transition hover:-translate-y-0.5 hover:border-dema-forest/25 hover:shadow-[0_16px_36px_rgba(23,35,29,0.06)] sm:p-5 md:p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper sm:h-11 sm:w-11">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  </span>
                  <div className="mt-4 flex items-start justify-between gap-2 sm:mt-6 sm:items-center sm:gap-3">
                    <h2 className="min-w-0 break-words text-base font-medium leading-snug text-brand-blue sm:text-xl">
                      {section.label}
                    </h2>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-dema-forest/60 transition group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-2 line-clamp-4 text-xs leading-5 text-dema-muted sm:text-sm sm:leading-relaxed">
                    {section.description}
                  </p>
                </button>
              );
            },
          )}
        </div>
      ) : (
        <>
          <div className="mt-7">
        {activeTab === "process" ? (
          <SystemeTabContent
            systemName={system.name}
            systeme={detail.systeme}
            onRequestSystemComplete={() => setIsSystemCompleteModalOpen(true)}
          />
        ) : activeTab === "outils" ? (
          <div className="space-y-5">
            {(() => {
              const recommendedTools = detail.tools
                .filter((tool) => tool.recommended)
                .slice(0, MAX_VISIBLE_RECOMMENDATIONS);
              const recommendedToolSlugs = new Set(
                recommendedTools.map((tool) => tool.slug ?? tool.name),
              );
              const additionalBusinessTools = detail.tools.filter(
                (tool) =>
                  !recommendedToolSlugs.has(tool.slug ?? tool.name) && !isTransverseTool(tool),
              );
              const additionalTransverseTools = detail.tools.filter(
                (tool) =>
                  !recommendedToolSlugs.has(tool.slug ?? tool.name) && isTransverseTool(tool),
              );
              const hiddenToolCount =
                additionalBusinessTools.length + additionalTransverseTools.length + freeTools.length;
              const isExpanded = Boolean(expandedRecommendationSections.tools);

              return (
                <>
                  {recommendedTools.length ? (
                    renderCardSection({
                      items: recommendedTools,
                      title: "Outils métier",
                      tone: "forest",
                      layout: "grid",
                      getKey: (tool) => tool.slug ?? tool.name,
                      renderCard: renderToolCard,
                    })
                  ) : hiddenToolCount ? (
                    <p className="max-w-2xl text-sm leading-6 text-dema-muted">
                      Aucun outil métier n’est proposé pour ce kit à ce jour. Les solutions
                      disponibles restent consultables ci-dessous.
                    </p>
                  ) : null}

                  {renderShowMoreButton({
                    sectionKey: "tools",
                    hiddenCount: hiddenToolCount,
                    label: "Voir plus d’outils",
                  })}

                  {isExpanded ? (
                    <div className="space-y-5 border-t border-dema-line/70 pt-5">
                      {additionalBusinessTools.length
                        ? renderToolCarousel(additionalBusinessTools, "muted", "Autres outils métier")
                        : null}

                      {additionalTransverseTools.length
                        ? renderToolCarousel(additionalTransverseTools, "muted", "Outils transverses")
                        : null}

                      {freeTools.length ? (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted">
                            Outils gratuits
                          </p>
                          <HorizontalScrollHint
                            className="-mx-4 overflow-x-auto px-4 pb-4 pt-3 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                            controlsClassName="absolute -right-2 -top-9 z-10 flex items-center gap-1.5 sm:-right-3"
                          >
                            <div className="flex w-max snap-x snap-mandatory gap-4">
                              {freeTools.map((tool) => (
                                <div
                                  key={getToolDirectorySlug(tool)}
                                  className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
                                >
                                  {renderFreeToolCard(tool)}
                                </div>
                              ))}
                            </div>
                          </HorizontalScrollHint>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                </>
              );
            })()}
          </div>
        ) : activeTab === "fournisseurs" ? (
          <div className="space-y-5">
            {recommendedSuppliers.length
              ? renderCardSection({
                items: recommendedSuppliers.slice(0, visibleSupplierCount),
                title: "Fournisseurs",
                tone: "forest",
                layout: "grid",
                getKey: (supplier) => supplier.slug,
                renderCard: renderSupplierCard,
              })
              : null}
            {renderShowMoreButton({
              sectionKey: "suppliers",
              hiddenCount: recommendedSuppliers.slice(visibleSupplierCount).length,
              label: "Voir plus de fournisseurs",
            })}
            {expandedRecommendationSections.suppliers ? (
              <div className="space-y-5 border-t border-dema-line/70 pt-5">
                {additionalSupplierSections.map((section) => (
                  <div key={section.title}>
                    {renderCardSection({
                      items: section.items,
                      title: `Autres — ${section.title}`,
                      tone: "muted",
                      getKey: (supplier) => supplier.slug,
                      renderCard: renderSupplierCard,
                    })}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : activeTab === "financement" ? (
          <div className="space-y-5">
            {priorityFundingItems.length
              ? renderCardSection({
                items: priorityFundingItems,
                title: "Financements et aides",
                tone: "forest",
                layout: "grid",
                getKey: ({ kind, item }) => `${kind}-${item.slug}`,
                renderCard: ({ kind, item }) => kind === "finance"
                  ? renderFinanceCard(item)
                  : renderAidCard(item),
              })
              : null}
            {renderShowMoreButton({
              sectionKey: "funding",
              hiddenCount: additionalFinanceItems.length + displayedAids.secondary.length,
              label: "Voir plus de financements et d’aides",
            })}
            {expandedRecommendationSections.funding ? (
              <div className="space-y-5 border-t border-dema-line/70 pt-5">
                {additionalFinanceItems.length
                  ? renderCardSection({
                    items: additionalFinanceItems,
                    title: "Financer l’activité",
                    tone: "muted",
                    getKey: (item) => item.slug,
                    renderCard: renderFinanceCard,
                  })
                  : null}
                {displayedAids.secondary.length
                  ? renderCardSection({
                    items: displayedAids.secondary,
                    title: "Aides publiques",
                    tone: "muted",
                    getKey: (item) => item.slug,
                    renderCard: renderAidCard,
                  })
                  : null}
              </div>
            ) : null}
          </div>
        ) : activeTab === "reseaux-pro" ? (
          <div className="space-y-5">
            {recommendedProNetworks.length
              ? renderCardSection({
                items: recommendedProNetworks.slice(0, MAX_VISIBLE_RECOMMENDATIONS),
                title: "Réseaux professionnels",
                tone: "forest",
                layout: "grid",
                getKey: (network) => network.slug,
                renderCard: renderProNetworkCard,
              })
              : null}
            {renderShowMoreButton({
              sectionKey: "networks",
              hiddenCount: recommendedProNetworks.slice(MAX_VISIBLE_RECOMMENDATIONS).length,
              label: "Voir plus de réseaux",
            })}
            {expandedRecommendationSections.networks &&
            recommendedProNetworks.length > MAX_VISIBLE_RECOMMENDATIONS ? (
              <div className="border-t border-dema-line/70 pt-5">
                {renderCardSection({
                  items: recommendedProNetworks.slice(MAX_VISIBLE_RECOMMENDATIONS),
                  title: "Autres réseaux professionnels",
                  tone: "muted",
                  getKey: (network) => network.slug,
                  renderCard: renderProNetworkCard,
                })}
              </div>
            ) : null}
          </div>
        ) : activeTab === "accompagnement" ? (
          <AccompagnementServices
            sectorLabel={detail.sectorLabel}
            source="Kit opérationnel"
            systemName={system.name}
            systemSlug={system.slug}
          />
        ) : activeTab === "recrutement" ? (
          <div className="space-y-5">
            {recommendedRecruitmentItems.length ? (
              <>
                {displayedRecruitmentItems.visible.length ? (
                  renderCardSection({
                    items: displayedRecruitmentItems.visible,
                    title: "Solutions de recrutement",
                    tone: "forest",
                    layout: "grid",
                    getKey: (item) => item.slug,
                    renderCard: renderRecruitmentCard,
                  })
                ) : null}
                {renderShowMoreButton({
                  sectionKey: "recruitment",
                  hiddenCount: displayedRecruitmentItems.additional.length,
                  label: "Voir plus de solutions de recrutement",
                })}
                {expandedRecommendationSections.recruitment ? (
                  <div className="border-t border-dema-line/70 pt-5">
                    {displayedRecruitmentItems.additional.length
                      ? renderCardSection({
                        items: displayedRecruitmentItems.additional,
                        title: "Autres solutions de recrutement",
                        tone: "muted",
                        getKey: (item) => item.slug,
                        renderCard: renderRecruitmentCard,
                      })
                      : null}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : activeTab === "formation" ? (
          <div className="space-y-5">
            {recommendedTrainings.metier.length || recommendedTrainings.transverse.length ? (
              <>
                {displayedTrainings.visibleMetier.length ? (
                  renderCardSection({
                    items: displayedTrainings.visibleMetier,
                    title: "Formations métier",
                    tone: "forest",
                    layout: "grid",
                    getKey: (training) => training.slug,
                    renderCard: renderTrainingCard,
                  })
                ) : null}
                {displayedTrainings.visibleTransverse.length ? (
                  renderCardSection({
                    items: displayedTrainings.visibleTransverse,
                    title: "Formations transverses",
                    tone: displayedTrainings.visibleMetier.length ? "muted" : "forest",
                    layout: "grid",
                    getKey: (training) => training.slug,
                    renderCard: renderTrainingCard,
                  })
                ) : null}
                {renderShowMoreButton({
                  sectionKey: "trainings",
                  hiddenCount:
                    displayedTrainings.additionalMetier.length +
                    displayedTrainings.additionalTransverse.length,
                  label: "Voir plus de formations",
                })}
                {expandedRecommendationSections.trainings ? (
                  <div className="space-y-5 border-t border-dema-line/70 pt-5">
                    {displayedTrainings.additionalMetier.length
                      ? renderCardSection({
                        items: displayedTrainings.additionalMetier,
                        title: "Autres formations métier",
                        tone: "muted",
                        getKey: (training) => training.slug,
                        renderCard: renderTrainingCard,
                      })
                      : null}
                    {displayedTrainings.additionalTransverse.length
                      ? renderCardSection({
                        items: displayedTrainings.additionalTransverse,
                        title: "Autres formations transverses",
                        tone: "muted",
                        getKey: (training) => training.slug,
                        renderCard: renderTrainingCard,
                      })
                      : null}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5" />
        )}
          </div>
        </>
      )}

      {selectedToolDetail ? (
        <SoftwareDetailDialog tool={selectedToolDetail} onClose={() => setSelectedToolDetail(null)} />
      ) : null}

      {selectedSupplierDetail ? (
        <SupplierDetailDialog
          supplier={selectedSupplierDetail}
          onClose={() => setSelectedSupplierDetail(null)}
        />
      ) : null}

      {selectedFinanceDetail ? (
        <FinanceDetailDialog
          item={selectedFinanceDetail}
          onClose={() => setSelectedFinanceDetail(null)}
        />
      ) : null}

      {selectedProNetworkDetail ? (
        <ProNetworkDetailDialog
          network={selectedProNetworkDetail}
          onClose={() => setSelectedProNetworkDetail(null)}
        />
      ) : null}

      {selectedRecruitmentDetail ? (
        <RecruitmentDetailDialog
          item={selectedRecruitmentDetail}
          onClose={() => setSelectedRecruitmentDetail(null)}
        />
      ) : null}

      {selectedTrainingDetail ? (
        <TrainingDetailDialog
          training={selectedTrainingDetail}
          onClose={() => setSelectedTrainingDetail(null)}
        />
      ) : null}

      {isSystemCompleteModalOpen ? (
        <SystemCompleteModal
          systemSlug={system.slug}
          systemName={system.name}
          systeme={detail.systeme}
          onClose={() => setIsSystemCompleteModalOpen(false)}
        />
      ) : null}

    </>
  );
}

function handleTrainingDetailClick(
  event: MouseEvent<HTMLAnchorElement>,
  training: DemaaTraining,
  onOpenDetails: (training: DemaaTraining) => void,
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
  onOpenDetails(training);
}

function handleRecruitmentDetailClick(
  event: MouseEvent<HTMLAnchorElement>,
  item: DemaaRecruitmentItem,
  onOpenDetails: (item: DemaaRecruitmentItem) => void,
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
  onOpenDetails(item);
}
