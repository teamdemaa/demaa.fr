"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gauge,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import SolutionReferralForm from "@/components/SolutionReferralForm";
import { trackSystemSolutionEvent } from "@/lib/kit-analytics-client";
import type { SolutionSection } from "@/lib/solution-registry-dto";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
  SupportedSolutionInteractionDto,
} from "@/lib/system-solutions-ui-dto";

type RailState = Readonly<{
  canNext: boolean;
  canPrevious: boolean;
}>;

type VisibleSolutionSection = Exclude<SolutionSection, "models">;

// Working UI copy only. These labels are intentionally centralized so W6 can
// align final editorial and SEO wording before integration.
export const SOLUTION_UI_WORKING_LABELS: Readonly<
  Record<VisibleSolutionSection, string>
> = {
  software: "Outils",
  services: "Prestations",
  providers: "Fournisseurs",
  networks: "Réseaux professionnels",
};

export const SOLUTION_RAIL_DISPLAY_ORDER: readonly VisibleSolutionSection[] = [
  "software",
  "services",
  "providers",
  "networks",
];

const RESOURCE_ICONS = {
  tool: Gauge,
  software: Wrench,
  provider: BriefcaseBusiness,
  directory: Building2,
  expertise: BriefcaseBusiness,
} as const;

const DEFAULT_RESOURCE_LABELS: Readonly<
  Record<RenderableSolutionPlacementDto["resource"]["resourceType"], string>
> = {
  tool: "Outil",
  software: "Logiciel",
  provider: "Fournisseur",
  directory: "Organisation professionnelle",
  expertise: "Prestation",
};

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
}: {
  interaction: SupportedSolutionInteractionDto;
  label: string;
  onClick: () => void;
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
}: {
  placement: RenderableSolutionPlacementDto;
  onClose: () => void;
}) {
  const { resource } = placement;
  return (
    <DirectoryDetailDialogShell
      ariaLabel={`Détails de ${resource.name}`}
      maxWidthClassName="max-w-2xl"
      onClose={onClose}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
        {resource.displayCategory ?? DEFAULT_RESOURCE_LABELS[resource.resourceType]}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-brand-blue sm:text-3xl">
        {resource.name}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-dema-muted">
        {resource.description}
      </p>
      {resource.interaction.interactionMode === "referral_form" ? (
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
            <h4 className="text-sm font-semibold text-brand-blue">Ce que vous y gagnez</h4>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              {placement.usage}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-brand-blue">Pourquoi cette solution</h4>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              {placement.fitRationale}
            </p>
          </div>
          {resource.indicativePricing ? (
            <div>
              <h4 className="text-sm font-semibold text-brand-blue">Tarif indicatif</h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {resource.indicativePricing}
              </p>
            </div>
          ) : null}
          {placement.fitConstraints.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-brand-blue">À vérifier avant de choisir</h4>
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

      {resource.interaction.interactionMode !== "referral_form" ? (
        <SolutionAction
          interaction={resource.interaction}
          label={resource.ctaLabel ?? "Découvrir la solution"}
          onClick={() => trackSystemSolutionEvent("system_solution_resource_cta_clicked", {
            rank: placement.rank,
            resourceSlug: resource.resourceSlug,
            resourceType: resource.resourceType,
            section: placement.section,
            systemSlug: placement.systemSlug,
          })}
        />
      ) : null}
    </DirectoryDetailDialogShell>
  );
}

export default function SystemSolutionsTab({
  sections,
}: {
  sections: readonly RenderableSolutionSectionDto[];
}) {
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
  const [selected, setSelected] = useState<RenderableSolutionPlacementDto | null>(null);

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
    setSelected(null);
  }, []);

  function navigateRail(group: RenderableSolutionSectionDto, direction: -1 | 1) {
    const rail = railRefs.current[group.section];
    const firstCard = rail?.querySelector<HTMLElement>("[data-solution-resource-card]");
    if (!rail || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    rail.scrollBy({ behavior: "smooth", left: direction * step });
  }

  if (visibleSections.length === 0) {
    return (
      <p
        className="rounded-[1.15rem] border border-dema-line bg-dema-paper px-5 py-6 text-sm leading-relaxed text-dema-muted sm:px-6"
        role="status"
      >
        Nous vérifions encore les solutions les plus pertinentes pour ce métier.
      </p>
    );
  }

  return (
    <>
      <div className="max-w-full space-y-10 overflow-hidden">
        {visibleSections.map((group) => {
          const label = SOLUTION_UI_WORKING_LABELS[
            group.section as VisibleSolutionSection
          ];
          const railState = railStates[group.section];

          return (
            <section
              key={group.section}
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
                      aria-label={`Voir les solutions précédentes - ${label}`}
                      onClick={() => navigateRail(group, -1)}
                      disabled={!railState?.canPrevious}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Voir les solutions suivantes - ${label}`}
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
                className="mt-4 grid max-w-full snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:auto-cols-[calc((100%_-_2rem)_/_3)] [&::-webkit-scrollbar]:hidden"
              >
                {group.placements.map((placement) => {
                  const { resource } = placement;
                  const ResourceIcon = RESOURCE_ICONS[resource.resourceType];
                  return (
                    <button
                      key={placement.placementId}
                      type="button"
                      data-solution-resource-card
                      onClick={() => {
                        if (resource.interaction.interactionMode === "system_delivery") return;
                        trackSystemSolutionEvent("system_solution_resource_opened", {
                          rank: placement.rank,
                          resourceSlug: resource.resourceSlug,
                          resourceType: resource.resourceType,
                          section: placement.section,
                          systemSlug: placement.systemSlug,
                        });
                        setSelected(placement);
                      }}
                      className="group min-h-[248px] min-w-0 snap-start overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-6 md:aspect-square md:min-h-0"
                      aria-label={`Ouvrir ${resource.name}`}
                    >
                      <span className="flex h-full min-h-0 flex-col">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                          <ResourceIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.15em] text-dema-muted md:mt-5">
                          {resource.displayCategory ?? DEFAULT_RESOURCE_LABELS[resource.resourceType]}
                        </span>
                        <span className="mt-1.5 block text-lg font-semibold leading-snug text-brand-blue sm:text-xl md:mt-2">
                          {resource.name}
                        </span>
                        <span className="mt-2 text-[13px] leading-5 text-dema-muted md:mt-3 md:text-sm md:leading-relaxed">
                          {resource.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {selected ? (
        <SolutionDialog placement={selected} onClose={closeSolution} />
      ) : null}
    </>
  );
}
