"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Workflow,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import ServiceOfferDetails, { getServicePriceLabel } from "@/components/ServiceOfferDetails";
import type { PublishedServiceOfferDto } from "@/lib/service-catalog-v2-dto";

type ServiceCategoryId = PublishedServiceOfferDto["categoryId"];

type ServiceGroup = Readonly<{
  categoryId: ServiceCategoryId;
  categoryTitle: PublishedServiceOfferDto["categoryTitle"];
  offers: readonly PublishedServiceOfferDto[];
}>;

type RailState = Readonly<{
  canNext: boolean;
  canPrevious: boolean;
}>;

const CATEGORY_ORDER: readonly ServiceCategoryId[] = [
  "structurer-digitaliser",
  "developper-visibilite",
];

const CATEGORY_ICONS = {
  "structurer-digitaliser": Workflow,
  "developper-visibilite": Megaphone,
} as const;

// Working decision: with seven curated offers, category rails are sufficient.
// No search or internal/external filter is introduced in this rollout.

function groupOffers(offers: readonly PublishedServiceOfferDto[]): readonly ServiceGroup[] {
  return CATEGORY_ORDER.flatMap((categoryId) => {
    const categoryOffers = offers.filter((offer) => offer.categoryId === categoryId);
    if (categoryOffers.length === 0) return [];
    return [{
      categoryId,
      categoryTitle: categoryOffers[0].categoryTitle,
      offers: categoryOffers,
    }];
  });
}

function buildInitialRailState(groups: readonly ServiceGroup[]) {
  return Object.fromEntries(
    groups.map((group) => [
      group.categoryId,
      {
        canNext: group.offers.length > 1,
        canPrevious: false,
      },
    ]),
  ) as Partial<Record<ServiceCategoryId, RailState>>;
}

export default function ServicesMarketplace({
  offers,
}: {
  offers: readonly PublishedServiceOfferDto[];
}) {
  const groups = useMemo(() => groupOffers(offers), [offers]);
  const railRefs = useRef<Partial<Record<ServiceCategoryId, HTMLDivElement | null>>>({});
  const [railStates, setRailStates] = useState(() => buildInitialRailState(groups));
  const [selected, setSelected] = useState<PublishedServiceOfferDto | null>(null);

  const updateRailState = useCallback((group: ServiceGroup) => {
    const rail = railRefs.current[group.categoryId];
    if (!rail) return;

    const nextState = {
      canNext: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2,
      canPrevious: rail.scrollLeft > 2,
    };

    setRailStates((current) => {
      const previous = current[group.categoryId];
      if (
        previous?.canNext === nextState.canNext &&
        previous?.canPrevious === nextState.canPrevious
      ) {
        return current;
      }
      return { ...current, [group.categoryId]: nextState };
    });
  }, []);

  useEffect(() => {
    const updateAllRails = () => groups.forEach(updateRailState);
    updateAllRails();
    window.addEventListener("resize", updateAllRails);
    return () => window.removeEventListener("resize", updateAllRails);
  }, [groups, updateRailState]);

  const closeDialog = useCallback(() => {
    setSelected(null);
  }, []);

  function navigateRail(group: ServiceGroup, direction: -1 | 1) {
    const rail = railRefs.current[group.categoryId];
    const firstCard = rail?.querySelector<HTMLElement>("[data-service-offer-card]");
    if (!rail || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    rail.scrollBy({ behavior: "smooth", left: direction * step });
  }

  if (groups.length === 0) return null;

  return (
    <>
      <div className="min-w-0 max-w-full space-y-12">
        {groups.map((group) => {
          const railState = railStates[group.categoryId];
          const CategoryIcon = CATEGORY_ICONS[group.categoryId];

          return (
            <section
              key={group.categoryId}
              aria-labelledby={`service-category-${group.categoryId}`}
              className="min-w-0 max-w-full"
            >
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <CategoryIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2
                    id={`service-category-${group.categoryId}`}
                    className="mt-4 max-w-2xl text-2xl font-semibold tracking-[-0.03em] text-brand-blue sm:text-3xl"
                  >
                    {group.categoryTitle}
                  </h2>
                </div>

                {group.offers.length > 1 ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Voir les services précédents - ${group.categoryTitle}`}
                      onClick={() => navigateRail(group, -1)}
                      disabled={!railState?.canPrevious}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Voir les services suivants - ${group.categoryTitle}`}
                      onClick={() => navigateRail(group, 1)}
                      disabled={!railState?.canNext}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>

              <div
                ref={(node) => {
                  railRefs.current[group.categoryId] = node;
                }}
                onScroll={() => updateRailState(group)}
                className="mt-5 grid max-w-full snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:auto-cols-[calc((100%_-_2rem)_/_3)] [&::-webkit-scrollbar]:hidden"
              >
                {group.offers.map((offer) => (
                  <button
                    key={offer.slug}
                    type="button"
                    data-service-offer-card
                    onClick={() => setSelected(offer)}
                    aria-label={`Ouvrir ${offer.title}`}
                    className="group aspect-square min-w-0 snap-start overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-6"
                  >
                    <span className="flex h-full min-h-0 flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-dema-forest">
                        {getServicePriceLabel(offer.pricing)}
                      </span>
                      <span className="mt-4 block text-xl font-semibold leading-snug tracking-[-0.02em] text-brand-blue sm:text-2xl">
                        {offer.title}
                      </span>
                      <span className="mt-3 line-clamp-4 text-sm leading-relaxed text-dema-muted">
                        {offer.description}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-dema-forest">
                        Voir le service
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selected ? (
        <DirectoryDetailDialogShell
          ariaLabel={`Détails de ${selected.title}`}
          maxWidthClassName="max-w-5xl"
          onClose={closeDialog}
        >
          <div className="mb-6 flex justify-end">
            <Link
              href={`/services/${selected.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-dema-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
            >
              Ouvrir la page du service
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ServiceOfferDetails offer={selected} />
        </DirectoryDetailDialogShell>
      ) : null}
    </>
  );
}
