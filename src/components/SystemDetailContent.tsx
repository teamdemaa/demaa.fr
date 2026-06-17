"use client";

import Link from "next/link";
import { startTransition, useMemo, useState, type MouseEvent } from "react";
import { FileText, GraduationCap } from "lucide-react";
import DeleguerPricingPreviewModal from "@/components/DeleguerPricingPreviewModal";
import PartnerOffersForm from "@/components/PartnerOffersForm";
import ProNetworkDetailDialog from "@/components/ProNetworkDetailDialog";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import SoftwareDetailDialog from "@/components/SoftwareDetailDialog";
import SupplierDetailDialog from "@/components/SupplierDetailDialog";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  getProNetworkCardBadge,
  getServiceCardBadge,
  getSupplierCardBadge,
} from "@/lib/card-badges";
import type { CourseEntry } from "@/lib/course-content";
import type { DemaaProNetwork } from "@/lib/pro-network-catalog";
import { getRecommendedProNetworksForSystem } from "@/lib/pro-network-recommendations";
import { getRelatedCoursesForSystemSlug } from "@/lib/related-courses";
import { getSectorPageByLabel } from "@/lib/sector-pages";
import { getRecommendedServicesForSystem } from "@/lib/service-recommendations";
import type { DemaaService } from "@/lib/service-catalog";
import { type OperationalSystemDetail } from "@/lib/system-operations";
import { getRecommendedSuppliersForSystem } from "@/lib/supplier-recommendations";
import type { DemaaSupplier } from "@/lib/supplier-catalog";
import {
  isSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import type { ToolDirectoryItem } from "@/lib/tool-directory";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  detail: OperationalSystemDetail;
  intro: string;
  initialActiveTab?: string;
  headingAs?: "h1" | "h2";
  headingId?: string;
};

const GOOGLE_AUDIT_BOOKING_URL = "https://calendar.app.google/E9WX9qfHxViWZ3uq8";
const PILOTING_SHEET_URLS: Partial<Record<System["slug"], string>> = {
  batiment: "https://docs.google.com/spreadsheets/d/1hThXGp-YMvO69dQIyAbFNMQVByzE973tbrnjIUMkYMs/edit",
  "plomberie-chauffage":
    "https://docs.google.com/spreadsheets/d/1cruI9aFuuP4ggbbQ2nQKxA2Pcv1dJGL9K3SZ-gJGKGQ/edit",
  "electricite-generale":
    "https://docs.google.com/spreadsheets/d/1cGtxwRceldfZlFjokVTfkuOJyXrKw0zZ8E87Ue7F7FE/edit",
  "renovation-interieur":
    "https://docs.google.com/spreadsheets/d/1Mj_cU-we__AkIv3VetPPLCdE88bhPsgzPW9863y9ZzM/edit",
  "menuiserie-agencement":
    "https://docs.google.com/spreadsheets/d/1Cv_zaCfuDH8APYRgbVoWQajSZwcjWknhvMxUN1HWSNY/edit",
  "maconnerie-gros-oeuvre":
    "https://docs.google.com/spreadsheets/d/1g8znKrrHg28-aOS2yBce_VNpE4g5_jdgbAi7hvB-vic/edit",
  "architecte-maitre-oeuvre":
    "https://docs.google.com/spreadsheets/d/11MyBHnQIB_7ClHQOZakw20fKE8bY_SevzmJw7HUVrO4/edit",
  "peintre-en-batiment":
    "https://docs.google.com/spreadsheets/d/1WL5ZBbGQWTSEdjaHIz7C70EPzuTM5VN2RSLmqbbddxI/edit",
  couvreur: "https://docs.google.com/spreadsheets/d/1TxpREzqwewHhFFB4zUeLfGJRgMBqJi5J8pNj-aBF1RY/edit",
  carreleur: "https://docs.google.com/spreadsheets/d/1rslN-Iquxm6Cp3D8SBz_ZXoCRCylhiUlFMYhP_oz6uk/edit",
  climatisation:
    "https://docs.google.com/spreadsheets/d/1Acdluq7dc-H_34fkWd4vJXxYuJXPXUzdD464eICiTcQ/edit",
  paysagiste: "https://docs.google.com/spreadsheets/d/1XQfyE_Fk4PpR24Gyf4Fsv_PSHrtLwPWjHHu0GEI6hno/edit",
  pisciniste: "https://docs.google.com/spreadsheets/d/1hHscXb9BBiCsfkpcxuQ5k2EzHb3Z3s52a-TuTOlHFzM/edit",
  serrurier: "https://docs.google.com/spreadsheets/d/1sznkKMKpSdzNr4scE1usEIgpNyGH0ibXlAyqEh_ilcg/edit",
  "garage-automobile":
    "https://docs.google.com/spreadsheets/d/1-O-rNsfSwNcCtU1Zaab0kWkcTsNBUDzMT0YpG3PZka0/edit",
  carrosserie:
    "https://docs.google.com/spreadsheets/d/1yzTeRFlzWNSMQ1xvsbqCQx0rRqVuUULaoa1Jly4ucfA/edit",
  demenagement:
    "https://docs.google.com/spreadsheets/d/10iF9BBFFOUjV8-W9atnptqjo4ssIjGuyTWCr2YfnCMA/edit",
  "livraison-dernier-kilometre":
    "https://docs.google.com/spreadsheets/d/1vcZsHocv0svXHqbT1r5Jn768DAp4KqgQ1bsh1Lwyieo/edit",
  "transport-de-marchandise":
    "https://docs.google.com/spreadsheets/d/19oKO19pRSZwua2UeGvVzyZnHlOwqCtgS8kBI6CU89Pc/edit",
  "transport-de-personnes":
    "https://docs.google.com/spreadsheets/d/1oyp7LcTYBhd_YnSG6hRkogFXuByQV3SNL8oRVOY5h3E/edit",
  "nettoyage-professionnel":
    "https://docs.google.com/spreadsheets/d/1GyxXzsewMbpSQTVie0w53MLLY1U5ph9f0uZV6LNMfzg/edit",
  "entreprise-de-securite":
    "https://docs.google.com/spreadsheets/d/1wxpRpc4MdgauiTF5MgwJjokgfdHr2OiG9yhBzZJ2Bic/edit",
  "services-a-la-personne":
    "https://docs.google.com/spreadsheets/d/1s4fhzbwG4avCkwWm1jSyC2cGjSrBAzAajGvuS8Ze5fE/edit",
  "aide-a-domicile-menage":
    "https://docs.google.com/spreadsheets/d/1_089awA6PYuNg6_1TOCXeugHTbnGl2jYxW0wXFNS5qs/edit",
  pressing:
    "https://docs.google.com/spreadsheets/d/1fzn8qDag7cTqr7PxeFTHW5tRdTnMb_M5UPIhFMU6trc/edit",
  "laverie-automatique":
    "https://docs.google.com/spreadsheets/d/18rjmkDUbiU56tQUPeG79SycFCRKZmMVZnmgmqgVC8KY/edit",
  "agence-de-voyage":
    "https://docs.google.com/spreadsheets/d/135A-PoG2b-AkRuPkzlJeGMuiZLeWThW5h-NUPVPKMTE/edit",
  "agence-marketing":
    "https://docs.google.com/spreadsheets/d/1yqWnO8QnI6MJcjcXQNbsVnptJ8hSEKT56hZcu651RJc/edit",
  "cabinet-comptable":
    "https://docs.google.com/spreadsheets/d/1iZuJ1hSCNksaJC_gTOCdKKg-60MoJj12iZVaqKrgg6c/edit",
  "cabinet-davocat":
    "https://docs.google.com/spreadsheets/d/1LwnvOas8DUG286sZ3jOS-_fBr6Bj1Q8I6ZpE_lYigJw/edit",
  "cabinet-de-conseil":
    "https://docs.google.com/spreadsheets/d/1dULvdh9xRouDhPswybmSSx0c_lSsvENxjT3_8fM3sKM/edit",
  "production-industrie":
    "https://docs.google.com/spreadsheets/d/14hxGrhgKmvVwi2hDgfvpoIj_5MyWQCntCrum-Ecx49A/edit",
  opticien:
    "https://docs.google.com/spreadsheets/d/1Y5xucGB1VYR9mgaghtJHdfEjbcKdv7E1vG8OaFFfFzo/edit",
  "reparation-informatique-mobile":
    "https://docs.google.com/spreadsheets/d/141GolGHKmeiodlgLT4Oag0izsknAiupsJ8WQnfTn61s/edit",
  "food-truck":
    "https://docs.google.com/spreadsheets/d/1bajbua9QbzR7BbN4Uwv9T2FMAEJe9l__RyLJTesUBo0/edit",
  association:
    "https://docs.google.com/spreadsheets/d/1UfDMsanJisonen5FhemaLmx8UC3EPDBgGcW_Tt-EFpE/edit",
  "consultant-independant":
    "https://docs.google.com/spreadsheets/d/1UCsrZLWdqK2hacju3d0R3vGGqoQCaaqCGobTAHyUL9M/edit",
  "coach-sportif":
    "https://docs.google.com/spreadsheets/d/10Rhl25jSUF2EF65jo7o3Tn4KldKGvbHiFgHlZFoOZm8/edit",
  "institut-de-beaute":
    "https://docs.google.com/spreadsheets/d/1uISQC-lgk-Z1XMnxLv5xUpZ0wDznI66_KqPTAEU3hZ8/edit",
  "salon-de-coiffure":
    "https://docs.google.com/spreadsheets/d/1u7Jc7e8k8ieTcCtgBdZpHoAkhkHUo9k6h6aPDw12_g0/edit",
  osteopathe:
    "https://docs.google.com/spreadsheets/d/1jTOYEviY77seifxcsqwkKf3Jy_5CJ0yUoBITKCGFrPI/edit",
  psychologue:
    "https://docs.google.com/spreadsheets/d/1DDgOoJeY7vQNpdQCmMG2zldk0gwChcqaaYVhYmfQQSw/edit",
  creche:
    "https://docs.google.com/spreadsheets/d/1UTy1QoDyLGY5rRin5ZL0mCoSYE8Ag1EXdAI0uiwfjbk/edit",
  "hotel-hebergement-independant":
    "https://docs.google.com/spreadsheets/d/1uKY1zb79mZf9Y_tZqaNOYfKOcs_9E6rEmzP70m3F--g/edit",
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
  const defaultTab = isSystemDetailTab(initialActiveTab) ? initialActiveTab : "outils";
  const [activeTab, setActiveTab] = useState<SystemDetailTab>(defaultTab);
  const [selectedToolDetail, setSelectedToolDetail] = useState<ToolDirectoryItem | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<DemaaService | null>(null);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<DemaaSupplier | null>(null);
  const [selectedProNetworkDetail, setSelectedProNetworkDetail] = useState<DemaaProNetwork | null>(null);
  const [isDeleguerPricingOpen, setIsDeleguerPricingOpen] = useState(false);
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
  const courses = useMemo(
    () => (activeTab === "cours" ? getRelatedCoursesForSystemSlug(system.slug) : []),
    [activeTab, system.slug]
  );
  const Heading = headingAs;
  const sectorPage = getSectorPageByLabel(detail.sectorLabel);
  const pilotingSheetUrl = PILOTING_SHEET_URLS[system.slug];
  const documentHref = pilotingSheetUrl ?? `/plans-organisation/${system.slug}`;
  const documentLabel = pilotingSheetUrl
    ? "Obtenir le Tableau de pilotage"
    : "Obtenir le Plan d'organisation";

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
        {getServiceCardBadge(service) ? (
          <div className="mt-auto pt-4">
            <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
              {getServiceCardBadge(service)}
            </span>
          </div>
        ) : null}
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

  function renderCourseCard(course: CourseEntry) {
    return (
      <Link
        key={course.slug}
        href={`/cours/${course.slug}?retourSysteme=${encodeURIComponent(system.slug)}`}
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
          href={documentHref}
          target="_blank"
          rel="noopener noreferrer"
          className="demaa-secondary-button gap-2 bg-dema-paper"
        >
          <FileText className="h-4 w-4" />
          {documentLabel}
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
              ["outils", "Outils"],
              ["fournisseurs", "Partenaires & fournisseurs"],
              ["reseaux-pro", "Réseaux Pro"],
              ["services", "Services"],
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
        {activeTab === "outils" ? (
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
        ) : (
          <div className="space-y-5">
            {renderBrowseAllLink({
              browseHref: `/cours?retourSysteme=${encodeURIComponent(system.slug)}`,
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
