"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useMemo, useState, type MouseEvent } from "react";
import { Check, ChevronDown, ExternalLink, FileText, GraduationCap } from "lucide-react";
import DeleguerPricingPreviewModal from "@/components/DeleguerPricingPreviewModal";
import PartnerOffersForm from "@/components/PartnerOffersForm";
import ProNetworkDetailDialog from "@/components/ProNetworkDetailDialog";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import SoftwareDetailDialog from "@/components/SoftwareDetailDialog";
import SupplierDetailDialog from "@/components/SupplierDetailDialog";
import { ServiceIcon } from "@/components/ServiceIcon";
import { buildBusinessBlockChecklists } from "@/lib/business-block-checklists";
import type { CourseEntry } from "@/lib/course-content";
import type { DemaaProNetwork } from "@/lib/pro-network-catalog";
import { getRecommendedProNetworksForSystem } from "@/lib/pro-network-recommendations";
import { getRelatedCoursesForSystemSlug } from "@/lib/related-courses";
import { getSectorPageByLabel } from "@/lib/sector-pages";
import { getRecommendedServicesForSystem } from "@/lib/service-recommendations";
import type { DemaaService } from "@/lib/service-catalog";
import { getSystemResources, type SystemResource } from "@/lib/system-resources";
import {
  type OperationalSystemDetail,
  type SystemPillar,
} from "@/lib/system-operations";
import { getRecommendedSuppliersForSystem } from "@/lib/supplier-recommendations";
import type { DemaaSupplier } from "@/lib/supplier-catalog";
import {
  isSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import type { ToolDirectoryItem } from "@/lib/tool-directory";
import type { System } from "@/lib/types";

type ProcessGroup = {
  title: string;
  checklist: string[];
};

type SystemDetailContentProps = {
  system: System;
  detail: OperationalSystemDetail;
  intro: string;
  initialActiveTab?: string;
  headingAs?: "h1" | "h2";
  headingId?: string;
};

const PILLARS: SystemPillar[] = [
  "Stratégie",
  "Marketing & Vente",
  "Opérations",
  "Finance & administration",
  "Équipe",
];

const GOOGLE_AUDIT_BOOKING_URL = "https://calendar.app.google/E9WX9qfHxViWZ3uq8";

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

function getProNetworkCardTags(network: DemaaProNetwork): string[] {
  const normalizedCategory = network.category.toLowerCase();

  return network.tags
    .filter((tag) => tag.toLowerCase() !== normalizedCategory)
    .slice(0, 3);
}

export default function SystemDetailContent({
  system,
  detail,
  intro,
  initialActiveTab,
  headingAs = "h1",
  headingId,
}: SystemDetailContentProps) {
  const defaultTab = isSystemDetailTab(initialActiveTab) ? initialActiveTab : "processus";
  const [activeTab, setActiveTab] = useState<SystemDetailTab>(defaultTab);
  const [selectedToolDetail, setSelectedToolDetail] = useState<ToolDirectoryItem | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<DemaaService | null>(null);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<DemaaSupplier | null>(null);
  const [selectedProNetworkDetail, setSelectedProNetworkDetail] = useState<DemaaProNetwork | null>(null);
  const [isDeleguerPricingOpen, setIsDeleguerPricingOpen] = useState(false);
  const processGroups = useMemo(() => buildProcessGroups(detail), [detail]);
  const recommendedServices = useMemo(
    () => (activeTab === "services" ? getRecommendedServicesForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const recommendedSuppliers = useMemo(
    () => (activeTab === "fournisseurs" ? getRecommendedSuppliersForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const recommendedProNetworks = useMemo(
    () => (activeTab === "reseaux-pro" ? getRecommendedProNetworksForSystem(system.slug) : []),
    [activeTab, system.slug]
  );
  const resources = useMemo(
    () => (activeTab === "ressources" ? getSystemResources(system.slug) : []),
    [activeTab, system.slug]
  );
  const courses = useMemo(
    () => (activeTab === "cours" ? getRelatedCoursesForSystemSlug(system.slug) : []),
    [activeTab, system.slug]
  );
  const Heading = headingAs;
  const sectorPage = getSectorPageByLabel(detail.sectorLabel);

  function selectTab(tab: SystemDetailTab) {
    startTransition(() => {
      setActiveTab(tab);
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
            setSelectedToolDetail
          );
        }}
      >
        {content}
      </Link>
    );
  }

  function renderServiceCard(service: DemaaService) {
    const serviceSource =
      service.slug === "organisation-automatisation" ? "Demaa" : "Partenaire";

    return (
      <button
        type="button"
        key={service.slug}
        onClick={() => {
          if (service.slug === "organisation-automatisation") {
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
            <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
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
    return (
      <Link
        key={supplier.slug}
        href={`/annuaire-fournisseurs/${supplier.slug}`}
        className="demaa-card group flex min-h-[15rem] flex-col rounded-[1.15rem] p-5 text-left"
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
        className="demaa-card group flex min-h-[15rem] flex-col rounded-[1.15rem] p-5 text-left"
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
        <h3 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
          {network.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-dema-muted">
          {network.shortDescription}
        </p>
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {getProNetworkCardTags(network).map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    );
  }

  function renderCourseCard(course: CourseEntry) {
    return (
      <Link
        key={course.slug}
        href={`/cours/${course.slug}`}
        className="demaa-card group flex h-full flex-col rounded-[1.15rem] p-5 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/70">
            {course.duration}
          </span>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
          {course.category}
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
          {course.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-dema-muted">
          {course.description}
        </p>
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap gap-2">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    );
  }

  function renderPartnerOffersBlock({
    source,
  }: {
    source: string;
  }) {
    return (
      <div>
        <div className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3">
          <div className="rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5 text-left">
            <h3 className="text-lg font-semibold text-brand-blue">
              Bénéficier de tarifs négociés
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              Plus on est nombreux, plus on peut faire valoir des réductions
              intéressantes. Rejoignez la liste pour être informé des tarifs négociés
              et des offres partenaires utiles.
            </p>
            <PartnerOffersForm
              compact
              source={source}
              submitLabel="Recevoir les tarifs négociés"
              submitClassName="bg-dema-forest hover:bg-[#284f3a] disabled:bg-dema-forest/60"
            />
          </div>
        </div>
      </div>
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
      <div className="flex justify-start md:justify-end">
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

  return (
    <>
      <div className="text-left">
        {sectorPage ? (
          <Link
            href={`/secteurs/${sectorPage.slug}`}
            className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest transition hover:text-brand-blue"
          >
            {detail.sectorLabel}
          </Link>
        ) : (
          <p className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
            {detail.sectorLabel}
          </p>
        )}
        <Heading
          id={headingId}
          className="mt-2 text-3xl font-normal tracking-tight text-brand-blue md:text-4xl"
        >
          {system.name}
        </Heading>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted">
          {intro}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-left sm:flex-row sm:flex-wrap">
        <Link
          href={`/plans-organisation/${system.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="demaa-secondary-button gap-2 bg-dema-paper"
        >
          <FileText className="h-4 w-4" />
          Obtenir le Plan d&apos;organisation
        </Link>
        <Link
          href={GOOGLE_AUDIT_BOOKING_URL}
          className="demaa-primary-button"
        >
          Audit organisation gratuit
        </Link>
      </div>

      <div className="mt-5 -mx-2 overflow-x-auto px-2 pb-2 soft-scroll">
        <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
          {(
            [
              ["processus", "Processus"],
              ["outils", "Outils"],
              ["services", "Services"],
              ["fournisseurs", "Partenaires & fournisseurs"],
              ["reseaux-pro", "Réseaux Pro"],
              ["ressources", "Ressources"],
              ["cours", "Cours"],
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
        {activeTab === "processus" ? (
          <div className="space-y-5">
            <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
              {processGroups.map((group) => (
                <details
                  key={group.title}
                  className="demaa-accordion group self-start overflow-hidden"
                  data-print-expandable
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4 sm:px-5">
                    <div className="min-w-0 text-left">
                      <h3 className="text-[1.05rem] font-medium text-brand-blue">
                        {group.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className="demaa-accordion-chevron h-4 w-4 shrink-0 text-dema-forest transition duration-200"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="demaa-accordion-content border-t border-dema-line/80 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                    {group.checklist.length > 0 ? (
                      <ul className="space-y-2.5">
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
                </details>
              ))}
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
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                          Outils métier
                        </p>
                        <Link
                          href={`/annuaire-outils?retourSysteme=${encodeURIComponent(system.slug)}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-dema-forest transition hover:text-brand-blue"
                        >
                          Voir tous les outils
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
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
            {renderPartnerOffersBlock({
              source: `system_tools_${system.slug}`,
            })}
          </div>
        ) : activeTab === "services" ? (
          <div className="space-y-5">
            {renderBrowseAllLink({
              browseHref: `/annuaire-services?retourSysteme=${encodeURIComponent(system.slug)}`,
              browseLabel: "Voir tous les services",
            })}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {recommendedServices.map(renderServiceCard)}
            </div>

            {renderPartnerOffersBlock({
              source: `system_services_${system.slug}`,
            })}
          </div>
        ) : activeTab === "fournisseurs" ? (
          <div className="space-y-5">
            {renderBrowseAllLink({
              browseHref: `/annuaire-fournisseurs?retourSysteme=${encodeURIComponent(system.slug)}`,
              browseLabel: "Voir tous les fournisseurs",
            })}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {recommendedSuppliers.map(renderSupplierCard)}
            </div>

            {renderPartnerOffersBlock({
              source: `system_suppliers_${system.slug}`,
            })}
          </div>
        ) : activeTab === "reseaux-pro" ? (
          <div className="space-y-5">
            {renderBrowseAllLink({
              browseHref: `/annuaire-reseaux-pro?retourSysteme=${encodeURIComponent(system.slug)}`,
              browseLabel: "Voir tous les réseaux pro",
            })}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendedProNetworks.map(renderProNetworkCard)}
            </div>
          </div>
        ) : activeTab === "ressources" ? (
          <div className="space-y-5">
            {renderBrowseAllLink({
              browseHref: `/ressources`,
              browseLabel: "Voir toutes les ressources",
            })}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <SystemResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {renderBrowseAllLink({
              browseHref: "/cours",
              browseLabel: "Voir tous les cours",
            })}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map(renderCourseCard)}
            </div>
          </div>
        )}
      </div>

      {selectedToolDetail ? (
        <SoftwareDetailDialog tool={selectedToolDetail} onClose={() => setSelectedToolDetail(null)} />
      ) : null}

      {selectedServiceDetail ? (
        <ServiceDetailDialog
          service={selectedServiceDetail}
          source={`Système ${system.name}`}
          onClose={() => setSelectedServiceDetail(null)}
        />
      ) : null}

      {selectedSupplierDetail ? (
        <SupplierDetailDialog
          supplier={selectedSupplierDetail}
          onClose={() => setSelectedSupplierDetail(null)}
        />
      ) : null}

      {selectedProNetworkDetail ? (
        <ProNetworkDetailDialog
          network={selectedProNetworkDetail}
          onClose={() => setSelectedProNetworkDetail(null)}
        />
      ) : null}

      {isDeleguerPricingOpen ? (
        <DeleguerPricingPreviewModal onClose={() => setIsDeleguerPricingOpen(false)} />
      ) : null}
    </>
  );
}

function SystemResourceCard({
  resource,
}: {
  resource: SystemResource;
}) {
  return (
    <article className="demaa-card group overflow-hidden rounded-[1.15rem] text-left">
      <Link
        href={`/ressources/${resource.id}`}
        className="block w-full text-left"
        aria-label={`Voir ${resource.title}`}
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
      </Link>
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
