"use client";

import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Handshake,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import AccountingDirectoryProfileModal from "@/components/AccountingDirectoryProfileModal";
import FinanceDetailDialog from "@/components/FinanceDetailDialog";
import ProNetworkDetailDialog from "@/components/ProNetworkDetailDialog";
import RecruitmentDetailDialog from "@/components/RecruitmentDetailDialog";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import SupplierDetailDialog from "@/components/SupplierDetailDialog";
import TrainingDetailDialog from "@/components/TrainingDetailDialog";
import { trackSystemEcosystemEvent } from "@/lib/kit-analytics-client";
import {
  getSystemEcosystemResourceIdentity,
  type SystemEcosystemGroup,
  type SystemEcosystemResource,
} from "@/lib/system-ecosystem-types";

type SelectedResource = {
  groupSlug: string;
  position: number;
  resource: SystemEcosystemResource;
};

type RailState = {
  canNext: boolean;
  canPrevious: boolean;
  position: number;
};

const RESOURCE_ICONS = {
  accounting: Building2,
  finance: Landmark,
  network: Handshake,
  recruitment: BriefcaseBusiness,
  service: ShieldCheck,
  supplier: ShieldCheck,
  training: GraduationCap,
} as const;

function buildInitialRailState(groups: SystemEcosystemGroup[]) {
  return Object.fromEntries(
    groups.map((group) => [
      group.slug,
      {
        canNext: group.resources.length > 1,
        canPrevious: false,
        position: 0,
      },
    ]),
  ) as Record<string, RailState>;
}

function ResourceDialog({
  selected,
  systemSlug,
  onClose,
}: {
  selected: SelectedResource;
  systemSlug: string;
  onClose: () => void;
}) {
  const { resource } = selected;

  if (resource.type === "accounting") {
    return (
      <AccountingDirectoryProfileModal
        firm={resource.item}
        onClose={onClose}
      />
    );
  }

  if (resource.type === "finance") {
    return <FinanceDetailDialog item={resource.item} onClose={onClose} />;
  }

  if (resource.type === "network") {
    return (
      <ProNetworkDetailDialog network={resource.item} onClose={onClose} />
    );
  }

  if (resource.type === "recruitment") {
    return <RecruitmentDetailDialog item={resource.item} onClose={onClose} />;
  }

  if (resource.type === "service") {
    return (
      <ServiceDetailDialog
        service={resource.item}
        source={`Système opérationnel — ${systemSlug}`}
        onClose={onClose}
      />
    );
  }

  if (resource.type === "supplier") {
    return <SupplierDetailDialog supplier={resource.item} onClose={onClose} />;
  }

  return <TrainingDetailDialog training={resource.item} onClose={onClose} />;
}

export default function SystemEcosystemTab({
  groups,
  systemSlug,
}: {
  groups: SystemEcosystemGroup[];
  systemSlug: string;
}) {
  const railRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [railStates, setRailStates] = useState(() =>
    buildInitialRailState(groups),
  );
  const [selected, setSelected] = useState<SelectedResource | null>(null);

  const updateRailState = useCallback((group: SystemEcosystemGroup) => {
    const rail = railRefs.current[group.slug];
    if (!rail) return;

    const firstCard = rail.querySelector<HTMLElement>(
      "[data-ecosystem-resource-card]",
    );
    const cardWidth = firstCard?.getBoundingClientRect().width ?? rail.clientWidth;
    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    const step = Math.max(cardWidth + gap, 1);
    const position = Math.min(
      group.resources.length - 1,
      Math.max(0, Math.round(rail.scrollLeft / step)),
    );
    const nextState = {
      canNext: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2,
      canPrevious: rail.scrollLeft > 2,
      position,
    };

    setRailStates((current) => {
      const previous = current[group.slug];
      if (
        previous?.canNext === nextState.canNext &&
        previous?.canPrevious === nextState.canPrevious &&
        previous?.position === nextState.position
      ) {
        return current;
      }

      return { ...current, [group.slug]: nextState };
    });
  }, []);

  useEffect(() => {
    const updateAllRails = () => {
      groups.forEach(updateRailState);
    };

    updateAllRails();
    window.addEventListener("resize", updateAllRails);
    return () => window.removeEventListener("resize", updateAllRails);
  }, [groups, updateRailState]);

  const closeResource = useCallback(() => {
    if (selected) {
      const identity = getSystemEcosystemResourceIdentity(selected.resource);
      trackSystemEcosystemEvent("system_ecosystem_resource_closed", {
        groupSlug: selected.groupSlug,
        position: selected.position,
        resourceSlug: identity.slug,
        resourceType: identity.type,
        systemSlug,
      });
    }

    setSelected(null);
  }, [selected, systemSlug]);

  function openResource(
    group: SystemEcosystemGroup,
    resource: SystemEcosystemResource,
    position: number,
  ) {
    const identity = getSystemEcosystemResourceIdentity(resource);
    setSelected({ groupSlug: group.slug, position, resource });
    trackSystemEcosystemEvent("system_ecosystem_resource_opened", {
      groupSlug: group.slug,
      position,
      resourceSlug: identity.slug,
      resourceType: identity.type,
      systemSlug,
    });
  }

  function navigateRail(
    group: SystemEcosystemGroup,
    direction: -1 | 1,
  ) {
    const rail = railRefs.current[group.slug];
    const firstCard = rail?.querySelector<HTMLElement>(
      "[data-ecosystem-resource-card]",
    );
    if (!rail || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    const currentPosition = railStates[group.slug]?.position ?? 0;
    const nextPosition = Math.min(
      group.resources.length - 1,
      Math.max(0, currentPosition + direction),
    );

    rail.scrollBy({ behavior: "smooth", left: direction * step });
    trackSystemEcosystemEvent("system_ecosystem_rail_navigated", {
      groupSlug: group.slug,
      position: nextPosition,
      systemSlug,
    });
  }

  function trackModalCta(event: MouseEvent<HTMLDivElement>) {
    if (!selected || !(event.target instanceof Element)) return;

    const cta = event.target.closest(
      'a[href^="http"], a[href^="mailto:"], a[href^="tel:"], [data-resource-cta]',
    );
    if (!cta) return;

    const identity = getSystemEcosystemResourceIdentity(selected.resource);
    trackSystemEcosystemEvent("system_ecosystem_resource_cta_clicked", {
      groupSlug: selected.groupSlug,
      position: selected.position,
      resourceSlug: identity.slug,
      resourceType: identity.type,
      systemSlug,
    });
  }

  if (!groups.length) {
    return (
      <div className="demaa-surface rounded-[1.25rem] px-5 py-6">
        <p className="text-sm leading-relaxed text-dema-muted">
          Les ressources de cet écosystème sont en cours de vérification.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-10">
        {groups.map((group) => {
          const railState = railStates[group.slug];

          return (
            <section
              key={group.slug}
              aria-labelledby={`ecosystem-group-${group.slug}`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3
                  id={`ecosystem-group-${group.slug}`}
                  className="text-xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-2xl"
                >
                  {group.title}
                </h3>

                {group.resources.length > 1 ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Voir les ressources précédentes — ${group.title}`}
                      onClick={() => navigateRail(group, -1)}
                      disabled={!railState?.canPrevious}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Voir les ressources suivantes — ${group.title}`}
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
                  railRefs.current[group.slug] = node;
                }}
                onScroll={() => updateRailState(group)}
                className="mt-4 grid snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:auto-cols-[calc((100%_-_2rem)_/_3)] [&::-webkit-scrollbar]:hidden"
              >
                {group.resources.map((resource, position) => {
                  const identity =
                    getSystemEcosystemResourceIdentity(resource);
                  const ResourceIcon = RESOURCE_ICONS[resource.type];

                  return (
                    <button
                      key={`${resource.type}-${identity.slug}`}
                      type="button"
                      data-ecosystem-resource-card
                      onClick={() => openResource(group, resource, position)}
                      className="group aspect-square min-w-0 snap-start overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-6"
                      aria-label={`Ouvrir ${identity.name}`}
                    >
                      <span className="flex h-full min-h-0 flex-col">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                          <ResourceIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-dema-muted">
                          {identity.category}
                        </span>
                        <span className="mt-2 block text-lg font-semibold leading-snug text-brand-blue sm:text-xl">
                          {identity.name}
                        </span>
                        <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-dema-muted">
                          {identity.description}
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
        <div onClickCapture={trackModalCta}>
          <ResourceDialog
            selected={selected}
            systemSlug={systemSlug}
            onClose={closeResource}
          />
        </div>
      ) : null}
    </>
  );
}
