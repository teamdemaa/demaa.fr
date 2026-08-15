"use client";

import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackSystemJourneyEvent } from "@/lib/kit-analytics-client";
import type { SystemResource } from "@/lib/system-resource-catalog";
import SystemResourcePreviewModal from "@/components/SystemResourcePreviewModal";

export default function SystemResourcesTab({
  initialResourceSlug,
  layout = "grid",
  onResourceSlugChange,
  resources,
  systemSlug,
}: {
  initialResourceSlug?: string;
  layout?: "grid" | "rail";
  onResourceSlugChange?: (resourceSlug: string | undefined) => void;
  resources: readonly SystemResource[];
  systemSlug: string;
}) {
  const orderedResources = useMemo(
    () => [...resources].sort((left, right) => left.rank - right.rank),
    [resources],
  );
  const [localPreviewResource, setLocalPreviewResource] = useState<SystemResource | null>(null);
  const previewResource = onResourceSlugChange
    ? orderedResources.find(
        (resource) =>
          resource.resourceSlug === initialResourceSlug &&
          resource.resourceSlug !== "processus-metier",
      ) ?? null
    : localPreviewResource;
  const railRef = useRef<HTMLDivElement | null>(null);
  const [railState, setRailState] = useState({
    canNext: orderedResources.length > 1,
    canPrevious: false,
  });

  const updateRailState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const nextState = {
      canNext: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2,
      canPrevious: rail.scrollLeft > 2,
    };
    setRailState((current) =>
      current.canNext === nextState.canNext &&
      current.canPrevious === nextState.canPrevious
        ? current
        : nextState,
    );
  }, []);

  useEffect(() => {
    if (layout !== "rail") return;
    updateRailState();
    window.addEventListener("resize", updateRailState);
    return () => window.removeEventListener("resize", updateRailState);
  }, [layout, orderedResources, updateRailState]);

  function navigateRail(direction: -1 | 1) {
    const rail = railRef.current;
    const firstCard = rail?.querySelector<HTMLElement>(
      "[data-system-resource-card]",
    );
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
      <section aria-label="Documents du système" className="min-w-0 max-w-full">
        {layout === "rail" ? (
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-2xl">
              Ressources
            </h3>
            {orderedResources.length > 1 ? (
              <div className="flex shrink-0 items-center gap-2">
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
        ) : null}
        <div
          ref={layout === "rail" ? railRef : undefined}
          onScroll={layout === "rail" ? updateRailState : undefined}
          className={
            layout === "rail"
              ? "mt-4 grid max-w-full snap-x snap-mandatory grid-flow-col items-stretch auto-cols-[82%] gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:auto-cols-[calc((100%_-_1rem)_/_2)] lg:auto-cols-[calc((100%_-_2rem)_/_3)] xl:auto-cols-[calc((100%_-_3rem)_/_3.5)] [&::-webkit-scrollbar]:hidden"
              : "grid grid-cols-1 gap-4 md:grid-cols-2"
          }
        >
          {orderedResources.map((resource) => {
            const className = `group min-w-0 overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-6 ${
              layout === "rail" ? "h-72 snap-start" : ""
            }`;
            const content = (
              <span className="flex h-full min-h-0 flex-col">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-4 block line-clamp-2 min-h-[2.5em] text-[10px] font-semibold uppercase leading-[1.25] tracking-[0.15em] text-dema-muted">
                  {resource.formatLabel}
                </span>
                <span className="mt-1.5 block line-clamp-2 min-h-[2.5em] text-lg font-semibold leading-tight text-brand-blue sm:text-xl">
                  {resource.title}
                </span>
                <span className="mt-2 line-clamp-3 text-[13px] leading-5 text-dema-muted md:text-sm">
                  {resource.description}
                </span>
              </span>
            );

            return resource.resourceSlug === "processus-metier" ? (
              <Link
                key={resource.resourceSlug}
                href={`/systemes/${systemSlug}/processus`}
                data-system-resource-card
                onClick={() => trackSystemJourneyEvent("system_resource_opened", {
                  resourceSlug: resource.resourceSlug,
                  systemSlug,
                })}
                className={className}
                aria-label={`Ouvrir ${resource.title}`}
              >
                {content}
              </Link>
            ) : (
              <button
                key={resource.resourceSlug}
                type="button"
                data-system-resource-card
                onClick={() => {
                  if (onResourceSlugChange) {
                    onResourceSlugChange(resource.resourceSlug);
                  } else {
                    setLocalPreviewResource(resource);
                  }
                }}
                className={className}
                aria-label={`Voir un aperçu de ${resource.title}`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </section>
      {previewResource ? (
        <SystemResourcePreviewModal
          resource={previewResource}
          trackingContext={systemSlug}
          onClose={() => {
            if (onResourceSlugChange) onResourceSlugChange(undefined);
            else setLocalPreviewResource(null);
          }}
        />
      ) : null}
    </>
  );
}
