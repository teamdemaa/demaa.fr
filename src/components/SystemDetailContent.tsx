"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  CalendarDays,
  Calculator,
  FileSignature,
  FileText,
  FolderKanban,
  FormInput,
  Scale,
  Wrench,
} from "lucide-react";
import FinanceDetailDialog from "@/components/FinanceDetailDialog";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";
import ProNetworkDetailDialog from "@/components/ProNetworkDetailDialog";
import RecruitmentDetailDialog from "@/components/RecruitmentDetailDialog";
import SoftwareDetailDialog from "@/components/SoftwareDetailDialog";
import SupplierDetailDialog from "@/components/SupplierDetailDialog";
import TrainingDetailDialog from "@/components/TrainingDetailDialog";
import type { DemaaAidItem } from "@/lib/aid-catalog";
import type { AccountingFirm } from "@/lib/accounting-directory";
import { getRecommendedAidsForSystem } from "@/lib/aid-recommendations";
import { getDocumentModelsForSystem, type DocumentModel } from "@/lib/document-models";
import { getFreeToolsForSystem } from "@/lib/free-tools";
import { ServiceIcon } from "@/components/ServiceIcon";
import CourseSlidesDialog from "@/components/CourseSlidesDialog";
import DocumentModelPreview from "@/components/DocumentModelPreview";
import {
  getFinanceCardBadge,
  getProNetworkCardBadge,
  getSupplierCardBadge,
} from "@/lib/card-badges";
import type { CourseEntry } from "@/lib/course-content";
import type { DemaaFinanceItem } from "@/lib/finance-catalog";
import { getRelatedNewslettersForSystemSlug, type NewsletterEntry } from "@/lib/newsletters";
import { getRecommendedFinanceForSystem } from "@/lib/finance-recommendations";
import type { DemaaProNetwork } from "@/lib/pro-network-catalog";
import { getRecommendedProNetworksForSystem } from "@/lib/pro-network-recommendations";
import { getGroupedRecommendedRecruitmentItemsForSystem } from "@/lib/recruitment-recommendations";
import type { DemaaRecruitmentItem } from "@/lib/recruitment-catalog";
import { getRelatedCoursesForSystemSlug } from "@/lib/related-courses";
import { getGroupedRecommendedTrainingsForSystem } from "@/lib/training-recommendations";
import type { DemaaTraining } from "@/lib/training-catalog";
import { ORGANISATION_AUDIT_MODAL_HREF } from "@/lib/organisation-audit";
import { getToolDirectorySectorSeoPath } from "@/lib/sector-taxonomy";
import { type OperationalSystemDetail } from "@/lib/system-operations";
import { getRecommendedSuppliersForSystem } from "@/lib/supplier-recommendations";
import type { DemaaSupplier } from "@/lib/supplier-catalog";
import {
  isSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import { getToolDirectorySlug, type ToolDirectoryItem } from "@/lib/tool-directory";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  detail: OperationalSystemDetail;
  recommendedAccountingFirms: AccountingFirm[];
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

type SupplierSection = {
  title: string;
  items: DemaaSupplier[];
};

type FinanceSection = {
  title: string;
  items: DemaaFinanceItem[];
};

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
  if (supplier.category === "Assurance" || supplier.slug === "protection-juridique") {
    return "protection";
  }

  if (
    supplier.category === "Mutuelle" ||
    supplier.slug === "swile" ||
    supplier.tags.some((tag) => ["RH", "Avantages", "Mutuelle"].includes(tag))
  ) {
    return "team";
  }

  if (supplier.category === "Paiement" || supplier.category === "Téléphonie") {
    return "payments";
  }

  return "operations";
}

function groupSuppliersBySection(suppliers: DemaaSupplier[]): SupplierSection[] {
  const sections = new Map<string, SupplierSection>([
    ["protection", { title: "Protection & conformité", items: [] }],
    ["team", { title: "Équipe & avantages", items: [] }],
    ["operations", { title: "Exploitation & matériel", items: [] }],
    ["payments", { title: "Encaissement & téléphonie", items: [] }],
  ]);

  suppliers.forEach((supplier) => {
    sections.get(getSupplierSectionKey(supplier))?.items.push(supplier);
  });

  return Array.from(sections.values()).filter((section) => section.items.length > 0);
}

function getFinanceSectionKey(item: DemaaFinanceItem): FinanceSection["title"] {
  if (item.category === "Compte pro & crédit") {
    return "Compte pro & crédit";
  }

  if (item.category === "Leasing & flotte") {
    return "Véhicules & flotte";
  }

  return "Trésorerie & factures";
}

function groupFinanceBySection(items: DemaaFinanceItem[]): FinanceSection[] {
  const sections = new Map<FinanceSection["title"], FinanceSection>([
    ["Compte pro & crédit", { title: "Compte pro & crédit", items: [] }],
    ["Trésorerie & factures", { title: "Trésorerie & factures", items: [] }],
    ["Véhicules & flotte", { title: "Véhicules & flotte", items: [] }],
  ]);

  items.forEach((item) => {
    sections.get(getFinanceSectionKey(item))?.items.push(item);
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
  recommendedAccountingFirms,
  intro,
  initialActiveTab,
  headingAs = "h1",
  headingId,
}: SystemDetailContentProps) {
  const defaultTab =
    initialActiveTab === "cours"
      ? "ressources"
      : isSystemDetailTab(initialActiveTab)
        ? initialActiveTab
        : "outils";
  const [activeTab, setActiveTab] = useState<SystemDetailTab>(defaultTab);
  const [selectedToolDetail, setSelectedToolDetail] = useState<ToolDirectoryItem | null>(null);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<DemaaSupplier | null>(null);
  const [selectedFinanceDetail, setSelectedFinanceDetail] = useState<DemaaFinanceItem | null>(null);
  const [selectedProNetworkDetail, setSelectedProNetworkDetail] = useState<DemaaProNetwork | null>(null);
  const [selectedRecruitmentDetail, setSelectedRecruitmentDetail] = useState<DemaaRecruitmentItem | null>(null);
  const [selectedTrainingDetail, setSelectedTrainingDetail] = useState<DemaaTraining | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseEntry | null>(null);
  const recommendedSuppliers = useMemo(
    () => (activeTab === "fournisseurs" ? getRecommendedSuppliersForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const recommendedFinance = useMemo(
    () => (activeTab === "financement" ? getRecommendedFinanceForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const recommendedAids = useMemo(
    () => (activeTab === "financement"
      ? getRecommendedAidsForSystem(system.slug, detail.sectorLabel)
      : []),
    [activeTab, detail.sectorLabel, system.slug]
  );
  const recommendedProNetworks = useMemo(
    () => (activeTab === "reseaux-pro" ? getRecommendedProNetworksForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const freeTools = useMemo(
    () => (activeTab === "outils" ? getFreeToolsForSystem(system.slug, detail.sectorLabel) : []),
    [activeTab, detail.sectorLabel, system.slug]
  );
  const courses = useMemo(
    () => (activeTab === "ressources" ? getRelatedCoursesForSystemSlug(system.slug) : []),
    [activeTab, system.slug]
  );
  const newsletters = useMemo(
    () => (activeTab === "ressources" ? getRelatedNewslettersForSystemSlug(system.slug) : []),
    [activeTab, system.slug]
  );
  const documentModels = useMemo(
    () => (activeTab === "ressources" ? getDocumentModelsForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const recommendedTrainings = useMemo(
    () => (activeTab === "formation"
      ? getGroupedRecommendedTrainingsForSystem(system.slug, detail.sectorLabel)
      : { metier: [], transverse: [] }),
    [activeTab, detail.sectorLabel, system.slug]
  );
  const recommendedRecruitmentItems = useMemo(
    () => (activeTab === "recrutement"
      ? getGroupedRecommendedRecruitmentItemsForSystem(detail.sectorLabel)
      : { alternance: [], recrutement: [] }),
    [activeTab, detail.sectorLabel]
  );
  const supplierSections = useMemo(
    () => (activeTab === "fournisseurs" ? groupSuppliersBySection(recommendedSuppliers) : []),
    [activeTab, recommendedSuppliers]
  );
  const financeSections = useMemo(
    () => (activeTab === "financement" ? groupFinanceBySection(recommendedFinance) : []),
    [activeTab, recommendedFinance]
  );
  const showAccountingTab = system.slug !== "cabinet-comptable";
  const Heading = headingAs;

  function selectTab(tab: SystemDetailTab) {
    startTransition(() => {
      setActiveTab(tab);
    });
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
    getKey,
    renderCard,
  }: {
    items: T[];
    title: string;
    tone: "forest" | "muted";
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
        href={`/annuaire-fournisseurs/${supplier.slug}`}
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
        href={`/annuaire-reseaux-pro/${network.slug}`}
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
        href={`/annuaire-financement/${item.slug}`}
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
        href={`/aides-et-subventions/${item.slug}`}
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

  function renderCourseCard(course: CourseEntry) {
    return (
      <Link
        key={course.slug}
        href={`/cours/${course.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
        className={`${SYSTEM_CARD_CLASS} shadow-[0_2px_10px_rgba(23,35,29,0.012)] hover:shadow-[0_10px_22px_rgba(23,35,29,0.03)]`}
        onClick={(event) => {
          handleToolDetailClick(
            event,
            {
              slug: course.slug,
              name: course.title,
              category: course.category,
              description: course.description,
              sectors: [],
              bestFor: course.description,
              pricingHint: course.duration,
              tags: course.tags,
              url: `/cours/${course.slug}?retourSysteme=${encodeURIComponent(system.slug)}`,
            },
            () => setSelectedCourse(course),
          );
        }}
      >
        <div className="-m-5 mb-0 relative aspect-[16/9] overflow-hidden rounded-t-[1.15rem] border-b border-dema-line bg-white">
          {course.image ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              sizes="320px"
              className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {course.category}
        </p>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {course.description}
        </p>
      </Link>
    );
  }

  function renderBrowseAllLink({
    browseHref,
    browseLabel,
  }: {
    browseHref: string;
    browseLabel: string;
  }) {
    return (
      <div className="flex justify-start">
        <Link
          href={browseHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-dema-forest transition hover:text-brand-blue"
        >
          {browseLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  function renderNewsletterCard(newsletter: NewsletterEntry) {
    return (
      <Link
        key={newsletter.slug}
        href={newsletter.href}
        className={SYSTEM_CARD_CLASS}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {newsletter.frequency} · Newsletter
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {newsletter.title}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {newsletter.description}
        </p>
        <p className="mt-4 text-xs font-medium text-dema-muted">
          Editeur recommande : <span className="text-brand-blue">{newsletter.publisher}</span>
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

  function renderAccountingFirmCard(firm: AccountingFirm) {
    const industryLabel = firm.industries[0] ?? "Cabinet recommandé";
    const cityLabel = firm.city && firm.city !== "Ville non renseignée" ? firm.city : null;

    return (
      <Link
        key={firm.slug}
        href={`/annuaire-experts-comptables/cabinets/${firm.slug}`}
        className={SYSTEM_CARD_CLASS}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <Calculator className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {industryLabel}
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {firm.name}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {firm.description}
        </p>
        {cityLabel ? (
          <p className="mt-auto pt-4 text-xs font-medium text-dema-muted">
            {cityLabel}
          </p>
        ) : null}
      </Link>
    );
  }

  function renderTrainingCard(training: DemaaTraining) {
    return (
      <Link
        key={training.slug}
        href={`/annuaire-formations/${training.slug}`}
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
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  function renderRecruitmentCard(item: DemaaRecruitmentItem) {
    return (
      <Link
        key={item.slug}
        href={`/annuaire-recrutement/${item.slug}`}
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
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  return (
    <>
      <div className="text-left">
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

      <div className="mt-4 flex flex-col gap-2 text-left sm:flex-row sm:flex-wrap">
        <Link
          href={ORGANISATION_AUDIT_MODAL_HREF}
          scroll={false}
          className="demaa-secondary-button self-start"
        >
          Déléguez ce qui vous ralentit
        </Link>
      </div>

      <div className="mt-5 -mx-2 overflow-x-auto px-2 pb-2 soft-scroll">
        <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
          {(
            [
              ["outils", "Outils"],
              ["fournisseurs", "Fournisseurs"],
              ...(showAccountingTab
                ? ([["expert-comptable", "Expert comptable"]] as Array<[SystemDetailTab, string]>)
                : []),
              ["financement", "Financement"],
              ["reseaux-pro", "Réseau pro"],
              ["recrutement", "Recrutement"],
              ["ressources", "Ressources"],
              ["formation", "Formation"],
            ] as Array<[SystemDetailTab, string]>
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => selectTab(tab)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:transition ${
                activeTab === tab
                  ? "bg-transparent text-brand-blue after:bg-dema-forest"
                  : "bg-transparent text-brand-blue/55 after:bg-transparent hover:text-brand-blue/75"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {activeTab === "outils" ? (
          <div className="space-y-5">
            {(() => {
              const businessTools = detail.tools.filter((tool) => !isTransverseTool(tool));
              const transverseTools = detail.tools.filter(isTransverseTool);

              return (
                <>
                  {businessTools.length ? (
                    renderToolCarousel(businessTools, "forest", "Outils métier")
                  ) : null}

                  {transverseTools.length ? (
                    renderToolCarousel(transverseTools, "muted", "Outils transverses")
                  ) : null}

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

                  {businessTools.length || transverseTools.length || freeTools.length ? (
                    renderBrowseAllLink({
                      browseHref: `${
                        getToolDirectorySectorSeoPath(detail.sectorLabel) ?? "/annuaire-outils"
                      }?retourSysteme=${encodeURIComponent(system.slug)}`,
                      browseLabel: "Voir tous les outils",
                    })
                  ) : null}
                </>
              );
            })()}
          </div>
        ) : activeTab === "fournisseurs" ? (
          <div className="space-y-5">
            {supplierSections.map((section, index) => (
              <div key={section.title}>
                {renderCardSection({
                  items: section.items,
                  title: section.title,
                  tone: index === 0 ? "forest" : "muted",
                  getKey: (supplier) => supplier.slug,
                  renderCard: renderSupplierCard,
                })}
              </div>
            ))}
            {recommendedSuppliers.length ? (
              renderBrowseAllLink({
                browseHref: `/annuaire-fournisseurs?retourSysteme=${encodeURIComponent(system.slug)}`,
                browseLabel: "Voir l'annuaire fournisseurs",
              })
            ) : null}
          </div>
        ) : activeTab === "expert-comptable" && showAccountingTab ? (
          <div className="space-y-5">
            {recommendedAccountingFirms.length ? (
              <>
                {renderCardSection({
                  items: recommendedAccountingFirms,
                  title: "Cabinets recommandés",
                  tone: "forest",
                  getKey: (firm) => firm.slug,
                  renderCard: renderAccountingFirmCard,
                })}
                {renderBrowseAllLink({
                  browseHref: `/annuaire-experts-comptables?retourSysteme=${encodeURIComponent(system.slug)}`,
                  browseLabel: "Voir l'annuaire experts-comptables",
                })}
              </>
            ) : null}
          </div>
        ) : activeTab === "financement" ? (
          <div className="space-y-5">
            {financeSections.map((section, index) => (
              <div key={section.title}>
                {renderCardSection({
                  items: section.items,
                  title: section.title,
                  tone: index === 0 ? "forest" : "muted",
                  getKey: (item) => item.slug,
                  renderCard: renderFinanceCard,
                })}
              </div>
            ))}
            {recommendedAids.length ? (
              <div>
                {renderCardSection({
                  items: recommendedAids,
                  title: "Aides & subventions",
                  tone: "muted",
                  getKey: (item) => item.slug,
                  renderCard: renderAidCard,
                })}
              </div>
            ) : null}
            {recommendedFinance.length ? (
              renderBrowseAllLink({
                browseHref: `/annuaire-financement?retourSysteme=${encodeURIComponent(system.slug)}`,
                browseLabel: "Voir l'annuaire financement",
              })
            ) : null}
            {recommendedAids.length ? (
              renderBrowseAllLink({
                browseHref: `/aides-et-subventions?retourSysteme=${encodeURIComponent(system.slug)}`,
                browseLabel: "Voir toutes les aides & subventions",
              })
            ) : null}
          </div>
        ) : activeTab === "reseaux-pro" ? (
          <div className="space-y-5">
            {recommendedProNetworks.length ? (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Réseau pro
                </p>
                <HorizontalScrollHint
                  className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                  controlsClassName="absolute -right-2 -top-9 z-10 flex items-center gap-1.5 sm:-right-3"
                >
                  <div className="flex w-max snap-x snap-mandatory gap-4">
                    {recommendedProNetworks.map((network) => (
                      <div
                        key={network.slug}
                        className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
                      >
                        {renderProNetworkCard(network)}
                      </div>
                    ))}
                  </div>
                </HorizontalScrollHint>
              </div>
            ) : null}
            {recommendedProNetworks.length ? (
              renderBrowseAllLink({
                browseHref: `/annuaire-reseaux-pro?retourSysteme=${encodeURIComponent(system.slug)}`,
                browseLabel: "Voir l'annuaire réseaux pro",
              })
            ) : null}
          </div>
        ) : activeTab === "recrutement" ? (
          <div className="space-y-5">
            {recommendedRecruitmentItems.alternance.length || recommendedRecruitmentItems.recrutement.length ? (
              <>
                {recommendedRecruitmentItems.alternance.length ? (
                  renderCardSection({
                    items: recommendedRecruitmentItems.alternance,
                    title: "Alternance",
                    tone: "forest",
                    getKey: (item) => item.slug,
                    renderCard: renderRecruitmentCard,
                  })
                ) : null}
                {recommendedRecruitmentItems.recrutement.length ? (
                  renderCardSection({
                    items: recommendedRecruitmentItems.recrutement,
                    title: "Recrutement",
                    tone: recommendedRecruitmentItems.alternance.length ? "muted" : "forest",
                    getKey: (item) => item.slug,
                    renderCard: renderRecruitmentCard,
                  })
                ) : null}
                {renderBrowseAllLink({
                  browseHref: `/annuaire-recrutement?retourSysteme=${encodeURIComponent(system.slug)}`,
                  browseLabel: "Voir l'annuaire recrutement",
                })}
              </>
            ) : null}
          </div>
        ) : activeTab === "formation" ? (
          <div className="space-y-5">
            {recommendedTrainings.metier.length || recommendedTrainings.transverse.length ? (
              <>
                {recommendedTrainings.metier.length ? (
                  renderCardSection({
                    items: recommendedTrainings.metier,
                    title: "Formations métier",
                    tone: "forest",
                    getKey: (training) => training.slug,
                    renderCard: renderTrainingCard,
                  })
                ) : null}
                {recommendedTrainings.transverse.length ? (
                  renderCardSection({
                    items: recommendedTrainings.transverse,
                    title: "Formations transverses",
                    tone: recommendedTrainings.metier.length ? "muted" : "forest",
                    getKey: (training) => training.slug,
                    renderCard: renderTrainingCard,
                  })
                ) : null}
                {renderBrowseAllLink({
                  browseHref: `/annuaire-formations?retourSysteme=${encodeURIComponent(system.slug)}`,
                  browseLabel: "Voir l'annuaire formations",
                })}
              </>
            ) : null}
          </div>
        ) : activeTab === "ressources" ? (
          <div className="space-y-5">
            {courses.length ? (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Cours
                </p>
                <HorizontalScrollHint
                  className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                  controlsClassName="absolute -right-2 -top-9 z-10 flex items-center gap-1.5 sm:-right-3"
                >
                  <div className="flex w-max snap-x snap-mandatory gap-4">
                    {courses.map((course) => (
                      <div
                        key={course.slug}
                        className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
                      >
                        {renderCourseCard(course)}
                      </div>
                    ))}
                  </div>
                </HorizontalScrollHint>
                {renderBrowseAllLink({
                  browseHref: `/cours?retourSysteme=${encodeURIComponent(system.slug)}`,
                  browseLabel: "Voir tous les cours",
                })}
              </div>
            ) : null}
            {newsletters.length ? (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted">
                  Newsletters recommandées
                </p>
                <HorizontalScrollHint
                  className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                  controlsClassName="absolute -right-2 -top-9 z-10 flex items-center gap-1.5 sm:-right-3"
                >
                  <div className="flex w-max snap-x snap-mandatory gap-4">
                    {newsletters.map((newsletter) => (
                      <div
                        key={newsletter.slug}
                        className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
                      >
                        {renderNewsletterCard(newsletter)}
                      </div>
                    ))}
                  </div>
                </HorizontalScrollHint>
              </div>
            ) : null}
            {documentModels.length ? (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted">
                  Modèles de documents
                </p>
                <HorizontalScrollHint
                  className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                  controlsClassName="absolute -right-2 -top-9 z-10 flex items-center gap-1.5 sm:-right-3"
                >
                  <div className="flex w-max snap-x snap-mandatory gap-4">
                    {documentModels.map((model) => (
                      <div
                        key={model.slug}
                        className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
                      >
                        {renderDocumentModelCard(model)}
                      </div>
                    ))}
                  </div>
                </HorizontalScrollHint>
                {renderBrowseAllLink({
                  browseHref: "/modeles-de-documents",
                  browseLabel: "Voir tous les modèles de documents",
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5" />
        )}
      </div>

      {selectedToolDetail ? (
        <SoftwareDetailDialog tool={selectedToolDetail} onClose={() => setSelectedToolDetail(null)} />
      ) : null}

      {selectedCourse ? (
        <CourseSlidesDialog
          key={selectedCourse.slug}
          course={selectedCourse}
          detailHref={`/cours/${selectedCourse.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
          onClose={() => setSelectedCourse(null)}
        />
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

  function renderDocumentModelCard(model: DocumentModel) {
    return (
      <Link
        key={model.slug}
        href={`/modeles-de-documents/${model.slug}`}
        className={SYSTEM_CARD_CLASS}
      >
        <div className="-m-5 mb-0 relative aspect-[16/9] overflow-hidden rounded-t-[1.15rem] border-b border-dema-line bg-white">
          <DocumentModelPreview model={model} />
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {model.category}
        </p>
        <h3 className={SYSTEM_CARD_TITLE_CLASS}>
          {model.title}
        </h3>
        <p className={SYSTEM_CARD_DESCRIPTION_CLASS}>
          {model.description}
        </p>
      </Link>
    );
  }
