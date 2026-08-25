"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  BadgeEuro,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gauge,
  Landmark,
  Bookmark,
  BookmarkCheck,
  Wrench,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import SolutionReferralForm from "@/components/SolutionReferralForm";
import ServiceCallbackForm from "@/components/ServiceCallbackForm";
import ToolOutboundLink from "@/components/ToolOutboundLink";
import { trackSystemSolutionEvent } from "@/lib/kit-analytics-client";
import type { SolutionSection } from "@/lib/solution-registry-dto";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
  SupportedSolutionInteractionDto,
} from "@/lib/system-solutions-ui-dto";
import {
  isToolSolutionResourceType,
  type ToolOutboundSurface,
} from "@/lib/tool-outbound-attribution";
import { getSolutionsUiCopy } from "@/lib/solutions-ui-copy";

type RailState = Readonly<{
  canNext: boolean;
  canPrevious: boolean;
}>;

type VisibleSolutionSection = Exclude<SolutionSection, "models">;

// Working UI copy only. These labels are intentionally centralized so W6 can
// align final editorial and SEO wording before integration.
export const SOLUTION_UI_WORKING_LABELS: Readonly<
  Record<VisibleSolutionSection, string>
> = getSolutionsUiCopy("fr").sectionLabels;

export const SOLUTION_RAIL_DISPLAY_ORDER: readonly VisibleSolutionSection[] = [
  "software",
  "services",
  "providers",
  "financing",
  "aids",
  "networks",
];

const RESOURCE_ICONS = {
  tool: Gauge,
  software: Wrench,
  provider: BriefcaseBusiness,
  directory: Building2,
  expertise: BriefcaseBusiness,
  financing: BadgeEuro,
  aid: Landmark,
} as const;

function buildInitialRailState(sections: readonly RenderableSolutionSectionDto[]) {
  return Object.fromEntries(
    sections.map(({ section, placements }) => [
      section,
      {
        canNext: placements.length > 1,
        canPrevious: false,
      },
    ]),
  ) as Partial<Record<SolutionSection, RailState>>;
}

function SolutionAction({
  interaction,
  label,
  onClick,
  resourceSlug,
  resourceType,
  systemSlug,
  toolOutboundSurface,
}: {
  interaction: SupportedSolutionInteractionDto;
  label: string;
  onClick: () => void;
  resourceSlug: string;
  resourceType: string;
  systemSlug: string;
  toolOutboundSurface: ToolOutboundSurface;
}) {
  if (
    interaction.interactionMode === "system_delivery" ||
    interaction.interactionMode === "referral_form"
  ) return null;

  const className =
    "mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2";

  if (interaction.href.startsWith("/")) {
    return (
      <Link href={interaction.href} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  }

  if (isToolSolutionResourceType(resourceType)) {
    return (
      <ToolOutboundLink
        href={interaction.href}
        surface={toolOutboundSurface}
        systemSlug={systemSlug}
        toolSlug={resourceSlug}
        className={className}
        onClick={onClick}
      >
        {label}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </ToolOutboundLink>
    );
  }

  return (
    <a
      href={interaction.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {label}
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function SolutionDialog({
  placement,
  onClose,
  localeCode,
  marketCode,
  toolOutboundSurface,
}: {
  placement: RenderableSolutionPlacementDto;
  onClose: () => void;
  localeCode: "fr" | "en";
  marketCode: string;
  toolOutboundSurface: ToolOutboundSurface;
}) {
  const { resource } = placement;
  const isEnglish = localeCode === "en";
  const isEnglishService = isEnglish && placement.section === "services";
  const ui = getSolutionsUiCopy(localeCode);
  return (
    <DirectoryDetailDialogShell
      ariaLabel={ui.detailsFor(resource.name)}
      closeLabel={ui.close}
      maxWidthClassName="max-w-2xl"
      onClose={onClose}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
        {resource.displayCategory ?? ui.resourceLabels[resource.resourceType]}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-brand-blue sm:text-3xl">
        {resource.name}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-dema-muted">
        {resource.description}
      </p>
      {isEnglishService ? (
        <div className="mt-7 space-y-5 border-t border-dema-line pt-6">
          <div>
            <h4 className="text-sm font-semibold text-brand-blue">{ui.gain}</h4>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">{placement.usage}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-brand-blue">{ui.fit}</h4>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">{placement.fitRationale}</p>
          </div>
          {resource.indicativePricing ? (
            <div>
              <h4 className="text-sm font-semibold text-brand-blue">{ui.price}</h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">{resource.indicativePricing}</p>
            </div>
          ) : null}
          {placement.fitConstraints.length ? (
            <div>
              <h4 className="text-sm font-semibold text-brand-blue">{ui.constraints}</h4>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-dema-muted">
                {placement.fitConstraints.map((constraint) => <li key={constraint}>• {constraint}</li>)}
              </ul>
            </div>
          ) : null}
          <ServiceCallbackForm
            localeCode="en"
            marketCode={marketCode}
            serviceSlug={resource.resourceSlug}
            source="english-solutions"
            systemSlug={placement.systemSlug}
          />
        </div>
      ) : resource.interaction.interactionMode === "referral_form" ? (
        <div className="mt-6 border-t border-dema-line pt-5">
          <p className="text-sm leading-relaxed text-brand-blue">
            {placement.usage}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-dema-muted">
            {resource.resourceType === "expertise"
              ? "Demaa examine votre besoin puis vous oriente, si possible, vers un professionnel adapté. Vous restez libre d’accepter ou non la mise en relation."
              : `${resource.name} contracte et facture ses prestations. Demaa facilite uniquement la mise en relation.`}
          </p>
          <SolutionReferralForm
            referralMode={resource.resourceType === "expertise" ? "matching" : "direct"}
            resourceName={resource.name}
            resourceSlug={resource.resourceSlug}
            systemSlug={placement.systemSlug}
          />
        </div>
      ) : (
        <div className="mt-7 space-y-5 border-t border-dema-line pt-6">
          <div>
            <h4 className="text-sm font-semibold text-brand-blue">{ui.gain}</h4>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              {placement.usage}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-brand-blue">{ui.fit}</h4>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              {placement.fitRationale}
            </p>
          </div>
          {resource.indicativePricing ? (
            <div>
              <h4 className="text-sm font-semibold text-brand-blue">{ui.price}</h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {resource.indicativePricing}
              </p>
            </div>
          ) : null}
          {placement.fitConstraints.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-brand-blue">{ui.constraints}</h4>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-dema-muted">
                {placement.fitConstraints.map((constraint) => (
                  <li key={constraint} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {!isEnglishService && resource.interaction.interactionMode !== "referral_form" ? (
        <SolutionAction
          interaction={resource.interaction}
          label={resource.ctaLabel ?? ui.discover}
          onClick={() => {
            onClose();
            trackSystemSolutionEvent("system_solution_resource_cta_clicked", {
              rank: placement.rank,
              resourceSlug: resource.resourceSlug,
              resourceType: resource.resourceType,
              section: placement.section,
              systemSlug: placement.systemSlug,
            });
          }}
          resourceSlug={resource.resourceSlug}
          resourceType={resource.resourceType}
          systemSlug={placement.systemSlug}
          toolOutboundSurface={toolOutboundSurface}
        />
      ) : null}
    </DirectoryDetailDialogShell>
  );
}

export default function SystemSolutionsTab({
  sections,
  initialResourceSlug,
  onResourceSlugChange,
  selectedPlacementIds,
  onToggleSelection,
  localeCode = "fr",
  marketCode = "fr-fr",
  toolOutboundSurface = "solutions",
  interstitialAfterSection,
  interstitialContent,
}: {
  sections: readonly RenderableSolutionSectionDto[];
  initialResourceSlug?: string;
  onResourceSlugChange?: (resourceSlug: string | undefined) => void;
  selectedPlacementIds?: ReadonlySet<string>;
  onToggleSelection?: (placementId: string) => void;
  localeCode?: "fr" | "en";
  marketCode?: string;
  toolOutboundSurface?: ToolOutboundSurface;
  interstitialAfterSection?: VisibleSolutionSection;
  interstitialContent?: ReactNode;
}) {
  const ui = getSolutionsUiCopy(localeCode);
  const visibleSections = useMemo(
    () => SOLUTION_RAIL_DISPLAY_ORDER.flatMap((section) =>
      sections.filter((group) => group.section === section && group.placements.length > 0),
    ),
    [sections],
  );
  const railRefs = useRef<Partial<Record<SolutionSection, HTMLDivElement | null>>>({});
  const [railStates, setRailStates] = useState(() =>
    buildInitialRailState(visibleSections),
  );
  const [localSelected, setLocalSelected] = useState<RenderableSolutionPlacementDto | null>(() =>
    initialResourceSlug
      ? visibleSections
          .flatMap((group) => group.placements)
          .find((placement) => placement.resource.resourceSlug === initialResourceSlug) ?? null
      : null,
  );
  const selected = onResourceSlugChange
    ? visibleSections
        .flatMap((group) => group.placements)
        .find((placement) => placement.resource.resourceSlug === initialResourceSlug) ?? null
    : localSelected;
  const selectedPlacements = useMemo(
    () => visibleSections
      .flatMap((group) => group.placements)
      .filter((placement) => selectedPlacementIds?.has(placement.placementId)),
    [selectedPlacementIds, visibleSections],
  );
  const hasInterstitialAnchor = Boolean(
    interstitialAfterSection && visibleSections.some(
      ({ section }) => section === interstitialAfterSection,
    ),
  );

  const updateRailState = useCallback((group: RenderableSolutionSectionDto) => {
    const rail = railRefs.current[group.section];
    if (!rail) return;

    const nextState = {
      canNext: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2,
      canPrevious: rail.scrollLeft > 2,
    };

    setRailStates((current) => {
      const previous = current[group.section];
      if (
        previous?.canNext === nextState.canNext &&
        previous?.canPrevious === nextState.canPrevious
      ) {
        return current;
      }
      return { ...current, [group.section]: nextState };
    });
  }, []);

  useEffect(() => {
    const updateAllRails = () => {
      visibleSections.forEach(updateRailState);
    };
    updateAllRails();
    window.addEventListener("resize", updateAllRails);
    return () => window.removeEventListener("resize", updateAllRails);
  }, [updateRailState, visibleSections]);

  const closeSolution = useCallback(() => {
    if (onResourceSlugChange) onResourceSlugChange(undefined);
    else setLocalSelected(null);
  }, [onResourceSlugChange]);

  function navigateRail(group: RenderableSolutionSectionDto, direction: -1 | 1) {
    const rail = railRefs.current[group.section];
    const firstCard = rail?.querySelector<HTMLElement>("[data-solution-resource-card]");
    if (!rail || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    rail.scrollBy({ behavior: "smooth", left: direction * step });
  }

  function renderPlacementCard(placement: RenderableSolutionPlacementDto) {
    const { resource } = placement;
    const ResourceIcon = RESOURCE_ICONS[resource.resourceType];
    const isSaved = selectedPlacementIds?.has(placement.placementId) ?? false;
    const cardClassName = "group flex h-[19rem] w-full min-w-0 flex-col overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-6";
    const cardContent = (
      <span className="flex h-full min-h-0 flex-col">
        <span className="flex items-center justify-between gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <ResourceIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        </span>
        <span className="mt-4 line-clamp-2 min-h-[2.5em] block text-[10px] font-semibold uppercase leading-[1.25] tracking-[0.15em] text-dema-muted">
          {resource.displayCategory ?? ui.resourceLabels[resource.resourceType]}
        </span>
        <span className="mt-1.5 line-clamp-2 block min-h-[2.5em] text-lg font-semibold leading-tight text-brand-blue sm:text-xl">
          {resource.name}
        </span>
        <span className="mt-2 line-clamp-2 text-[13px] leading-5 text-dema-muted md:text-sm">
          {resource.description}
        </span>
      </span>
    );
    const openEvent = () => trackSystemSolutionEvent(
      "system_solution_resource_opened",
      {
        rank: placement.rank,
        resourceSlug: resource.resourceSlug,
        resourceType: resource.resourceType,
        section: placement.section,
        systemSlug: placement.systemSlug,
      },
    );
    const opensServicePage =
      localeCode === "fr" &&
      placement.section === "services" &&
      resource.interaction.interactionMode === "detail" &&
      !onResourceSlugChange;

    return (
      <div
        key={placement.placementId}
        data-solution-resource-card
        className="relative h-[19rem] min-w-0 snap-start"
      >
        {opensServicePage ? (
          <Link
            href={resource.interaction.href}
            onClick={openEvent}
            className={cardClassName}
            aria-label={ui.open(resource.name)}
          >
            {cardContent}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (resource.interaction.interactionMode === "system_delivery") return;
              openEvent();
              if (onResourceSlugChange) {
                onResourceSlugChange(resource.resourceSlug);
              } else {
                setLocalSelected(placement);
              }
            }}
            className={cardClassName}
            aria-label={ui.open(resource.name)}
          >
            {cardContent}
          </button>
        )}
        {onToggleSelection ? (
          <button
            type="button"
            onClick={() => onToggleSelection(placement.placementId)}
            aria-pressed={isSaved}
            aria-label={isSaved
              ? ui.removeFromSelection(resource.name)
              : ui.save(resource.name)}
            className={`absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 ${
              isSaved
                ? "border-dema-forest/20 bg-dema-forest text-white"
                : "border-dema-line bg-dema-paper/95 text-dema-muted hover:border-dema-forest/25 hover:text-dema-forest"
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4.5 w-4.5" aria-hidden="true" />
            ) : (
              <Bookmark className="h-4.5 w-4.5" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    );
  }

  if (visibleSections.length === 0 && !interstitialContent) {
    return (
      <p
        className="rounded-[1.15rem] border border-dema-line bg-dema-paper px-5 py-6 text-sm leading-relaxed text-dema-muted sm:px-6"
        role="status"
      >
        {ui.empty}
      </p>
    );
  }

  return (
    <>
      <div className="max-w-full space-y-10 overflow-hidden">
        {selectedPlacements.length > 0 ? (
          <section aria-labelledby="solution-section-selection" className="min-w-0 max-w-full">
            <h3
              id="solution-section-selection"
              className="text-xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-2xl"
            >
              {ui.selection}
            </h3>
            <div className="mt-4 grid max-w-full snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:auto-cols-[calc((100%_-_1rem)_/_2)] lg:auto-cols-[calc((100%_-_2rem)_/_3)] xl:auto-cols-[calc((100%_-_3rem)_/_3.5)] [&::-webkit-scrollbar]:hidden">
              {selectedPlacements.map(renderPlacementCard)}
            </div>
          </section>
        ) : null}

        {interstitialContent && !hasInterstitialAnchor
          ? interstitialContent
          : null}

        {visibleSections.map((group) => {
          const label = ui.sectionLabels[group.section as VisibleSolutionSection];
          const railState = railStates[group.section];

          return <Fragment key={group.section}>
            <section
              aria-labelledby={`solution-section-${group.section}`}
              className="min-w-0 max-w-full"
            >
              <div className="flex items-center justify-between gap-4">
                <h3
                  id={`solution-section-${group.section}`}
                  className="text-xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-2xl"
                >
                  {label}
                </h3>
                {group.placements.length > 1 ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={`${ui.previous} - ${label}`}
                      onClick={() => navigateRail(group, -1)}
                      disabled={!railState?.canPrevious}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`${ui.next} - ${label}`}
                      onClick={() => navigateRail(group, 1)}
                      disabled={!railState?.canNext}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>

              <div
                ref={(node) => {
                  railRefs.current[group.section] = node;
                }}
                onScroll={() => updateRailState(group)}
                className="mt-4 grid max-w-full snap-x snap-mandatory grid-flow-col items-stretch auto-cols-[82%] gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:auto-cols-[calc((100%_-_1rem)_/_2)] lg:auto-cols-[calc((100%_-_2rem)_/_3)] xl:auto-cols-[calc((100%_-_3rem)_/_3.5)] [&::-webkit-scrollbar]:hidden"
              >
                {group.placements.map(renderPlacementCard)}
              </div>
            </section>
            {interstitialContent && group.section === interstitialAfterSection
              ? interstitialContent
              : null}
          </Fragment>;
        })}
      </div>

      {selected ? (
        <SolutionDialog
          placement={selected}
          onClose={closeSolution}
          localeCode={localeCode}
          marketCode={marketCode}
          toolOutboundSurface={toolOutboundSurface}
        />
      ) : null}
    </>
  );
}
