"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GuideNotifyModal from "@/components/GuideNotifyModal";
import GuideSlidesDialog from "@/components/GuideSlidesDialog";
import { trackSystemJourneyEvent } from "@/lib/kit-analytics-client";
import { getGuideSlides } from "@/lib/system-guide-slides";
import type { SystemResource } from "@/lib/system-resource-catalog";

type RailState = Readonly<{
  canNext: boolean;
  canPrevious: boolean;
}>;

export default function SystemGuidesRail({
  resources,
  systemSlug,
}: {
  resources: readonly SystemResource[];
  systemSlug: string;
}) {
  const orderedResources = useMemo(
    () => [...resources].sort((left, right) => left.rank - right.rank),
    [resources],
  );
  const railRef = useRef<HTMLDivElement | null>(null);
  const [slideResource, setSlideResource] = useState<SystemResource | null>(null);
  const [notifyResource, setNotifyResource] = useState<SystemResource | null>(null);
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
    const firstCard = rail?.querySelector<HTMLElement>("[data-guide-resource-card]");
    if (!rail || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({
      behavior: "smooth",
      left: direction * (firstCard.getBoundingClientRect().width + gap),
    });
  }

  function handleOpenSlides(resource: SystemResource) {
    setSlideResource(resource);
    trackSystemJourneyEvent("system_resource_opened", {
      resourceSlug: resource.resourceSlug,
      systemSlug,
    });
  }

  if (orderedResources.length === 0) return null;

  return (
    <section aria-label="Guides du système" className="min-w-0 max-w-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-dema-muted">
          Guides métier
        </h3>
        {orderedResources.length > 1 ? (
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Voir les guides précédents"
              onClick={() => navigateRail(-1)}
              disabled={!railState.canPrevious}
              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Voir les guides suivants"
              onClick={() => navigateRail(1)}
              disabled={!railState.canNext}
              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={railRef}
        onScroll={updateRailState}
        className="grid max-w-full snap-x snap-mandatory grid-flow-col auto-cols-[78%] gap-6 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] sm:auto-cols-[46%] md:auto-cols-[calc((100%_-_3rem)_/_3)] [&::-webkit-scrollbar]:hidden"
      >
        {orderedResources.map((resource, resourceIndex) => {
          const isAvailable = resource.availability === "available";
          if (isAvailable) {
            return (
              <button
                key={resource.resourceSlug}
                type="button"
                data-guide-resource-card
                onClick={() => handleOpenSlides(resource)}
                className="group min-w-0 snap-start text-left focus-visible:outline-none"
                aria-label={`Ouvrir ${resource.title}`}
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[0.9rem] shadow-[0_10px_28px_rgba(23,35,29,0.06)] transition group-hover:shadow-[0_14px_32px_rgba(23,35,29,0.1)]">
                  {resource.preview ? (
                    <Image
                      src={resource.preview.src}
                      alt={resource.preview.alt}
                      fill
                      loading={resourceIndex === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 640px) 78vw, (max-width: 768px) 46vw, 33vw"
                      className="object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : null}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium leading-snug text-brand-blue">
                    {resource.tagline ?? resource.title}
                  </p>
                  <p className="mt-1 text-xs text-dema-muted">
                    {resource.readingMinutes
                      ? `${resource.readingMinutes} min de lecture`
                      : resource.formatLabel}
                  </p>
                </div>
              </button>
            );
          }

          return (
            <article
              key={resource.resourceSlug}
              data-guide-resource-card
              className="min-w-0 snap-start"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-[0.9rem] border border-dema-line bg-[#f4f5f2] shadow-[0_10px_28px_rgba(23,35,29,0.035)]">
                <div className="absolute inset-0 flex items-center px-5 sm:px-6">
                  <span className="max-w-[88%] text-[clamp(1rem,1.5vw,1.25rem)] font-light leading-[1.18] tracking-[-0.02em] text-dema-muted">
                    {resource.title}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium leading-snug text-dema-muted">
                  {resource.tagline ?? resource.title}
                </p>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-1 text-xs text-dema-muted">
                  <span>Bientôt disponible</span>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setNotifyResource(resource)}
                    className="font-medium text-dema-forest underline decoration-dema-forest/35 underline-offset-4 transition hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
                  >
                    Être informé(e)
                  </button>
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {slideResource ? (
        <GuideSlidesDialog
          title={slideResource.title}
          slides={getGuideSlides(slideResource.resourceSlug)}
          onClose={() => setSlideResource(null)}
        />
      ) : null}

      {notifyResource ? (
        <GuideNotifyModal
          resource={notifyResource}
          systemSlug={systemSlug}
          onClose={() => setNotifyResource(null)}
        />
      ) : null}
    </section>
  );
}
