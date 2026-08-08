"use client";

import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackSystemJourneyEvent } from "@/lib/kit-analytics-client";
import type { SystemResource } from "@/lib/system-resource-catalog";
import SystemRecapRequestModal from "@/components/SystemRecapRequestModal";

type RailState = Readonly<{
  canNext: boolean;
  canPrevious: boolean;
}>;

export default function SystemResourcesTab({
  resources,
  systemName,
  systemSlug,
}: {
  resources: readonly SystemResource[];
  systemName: string;
  systemSlug: string;
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
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);

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
    <>
      <section aria-label="Modèles et documents du système" className="min-w-0 max-w-full overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-dema-muted">
            Modèles et documents
          </h3>
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
          {orderedResources.map((resource) => {
            const className = "group min-h-[248px] min-w-0 snap-start overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-6 md:aspect-square md:min-h-0";
            const content = (
              <span className="flex h-full min-h-0 flex-col">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.15em] text-dema-muted md:mt-5">
                  {resource.formatLabel}
                </span>
                <span className="mt-1.5 block text-lg font-semibold leading-snug text-brand-blue sm:text-xl md:mt-2">
                  {resource.title}
                </span>
                <span className="mt-2 text-[13px] leading-5 text-dema-muted md:mt-3 md:text-sm md:leading-relaxed">
                  {resource.description}
                </span>
              </span>
            );

            return resource.resourceSlug === "recapitulatif-systeme" ? (
              <button
                key={resource.resourceSlug}
                type="button"
                data-system-resource-card
                onClick={() => setIsRecapModalOpen(true)}
                className={className}
                aria-label={`Recevoir ${resource.title}`}
              >
                {content}
              </button>
            ) : (
              <a
                key={resource.resourceSlug}
                href={`/api/systeme-kit/open/${resource.resourceSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                data-system-resource-card
                onClick={() => trackSystemJourneyEvent("system_resource_opened", {
                  resourceSlug: resource.resourceSlug,
                  systemSlug,
                })}
                className={className}
                aria-label={`Ouvrir ${resource.title}`}
              >
                {content}
              </a>
            );
          })}
        </div>
      </section>
      {isRecapModalOpen ? (
        <SystemRecapRequestModal
          onClose={() => setIsRecapModalOpen(false)}
          systemName={systemName}
          systemSlug={systemSlug}
        />
      ) : null}
    </>
  );
}
