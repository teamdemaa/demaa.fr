"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { trackSystemJourneyEvent } from "@/lib/kit-analytics-client";
import type { SystemResource } from "@/lib/system-resource-catalog";
import SystemResourcePreviewModal from "@/components/SystemResourcePreviewModal";

export default function SystemResourcesTab({
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
  const [previewResource, setPreviewResource] = useState<SystemResource | null>(null);

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orderedResources.map((resource) => {
            const className = "group min-w-0 overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-6";
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
              <Link
                key={resource.resourceSlug}
                href={`/systemes/${systemSlug}/recapitulatif`}
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
                onClick={() => setPreviewResource(resource)}
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
          onClose={() => setPreviewResource(null)}
        />
      ) : null}
    </>
  );
}
