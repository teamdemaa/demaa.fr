"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ModelResourceCard from "@/components/ModelResourceCard";
import { SYSTEM_RESOURCES, type SystemResource } from "@/lib/system-resource-catalog";

type RailState = Readonly<{
  canNext: boolean;
  canPrevious: boolean;
}>;

export default function SystemResourcesTab({
  resources = SYSTEM_RESOURCES.filter((resource) => resource.format === "template"),
}: {
  resources?: readonly SystemResource[];
}) {
  const orderedResources = useMemo(
    () => [...resources].sort((left, right) => left.rank - right.rank),
    [resources],
  );
  const railRef = useRef<HTMLDivElement | null>(null);
  const [railState, setRailState] = useState<RailState>({
    canNext: orderedResources.length > 1,
    canPrevious: false,
  });

  const updateRailState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    setRailState({
      canNext: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2,
      canPrevious: rail.scrollLeft > 2,
    });
  }, []);

  useEffect(() => {
    updateRailState();
    window.addEventListener("resize", updateRailState);
    return () => window.removeEventListener("resize", updateRailState);
  }, [orderedResources.length, updateRailState]);

  function navigateRail(direction: -1 | 1) {
    const rail = railRef.current;
    const firstCard = rail?.querySelector<HTMLElement>("[data-system-resource-card]");
    if (!rail || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({
      behavior: "smooth",
      left: direction * (firstCard.getBoundingClientRect().width + gap),
    });
  }

  if (orderedResources.length === 0) {
    return (
      <p
        className="rounded-[1.15rem] border border-dema-line bg-dema-paper px-5 py-6 text-sm leading-relaxed text-dema-muted sm:px-6"
        role="status"
      >
        Aucune ressource n’est disponible pour ce système pour le moment.
      </p>
    );
  }

  return (
      <section aria-labelledby="system-models-title" className="min-w-0 max-w-full overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 id="system-models-title" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-dema-muted">Modèles et documents</h3>
        {orderedResources.length > 1 ? (
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Voir les ressources précédentes"
              onClick={() => navigateRail(-1)}
              disabled={!railState.canPrevious}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Voir les ressources suivantes"
              onClick={() => navigateRail(1)}
              disabled={!railState.canNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        </div>

        <div
          ref={railRef}
          onScroll={updateRailState}
          className="grid max-w-full snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:auto-cols-[calc((100%_-_2rem)_/_3)] [&::-webkit-scrollbar]:hidden"
        >
          {orderedResources.map((resource) => (
            <div
              key={resource.resourceSlug}
              data-system-resource-card
              className="min-w-0 snap-start"
            >
              <ModelResourceCard resource={resource} />
            </div>
          ))}
        </div>
      </section>
  );
}
