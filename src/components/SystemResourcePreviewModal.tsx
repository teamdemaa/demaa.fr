"use client";

import Image from "next/image";
import { ExternalLink, FileText } from "lucide-react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import { trackSystemJourneyEvent } from "@/lib/kit-analytics-client";
import type { SystemResource } from "@/lib/system-resource-catalog";

export default function SystemResourcePreviewModal({
  onClose,
  resource,
  trackingContext,
}: {
  onClose: () => void;
  resource: SystemResource;
  trackingContext: string;
}) {
  const href = `/api/systeme-kit/open/${resource.resourceSlug}`;

  return (
    <DirectoryDetailDialogShell
      ariaLabel={`Aperçu - ${resource.title}`}
      maxWidthClassName="max-w-3xl"
      onClose={onClose}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(15rem,0.85fr)] md:items-center">
        <div className="relative aspect-video overflow-hidden rounded-[1rem] border border-dema-line bg-white">
          {resource.preview ? (
            <Image
              src={resource.preview.src}
              alt={resource.preview.alt}
              fill
              sizes="(max-width: 767px) 90vw, 52vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-dema-forest">
              <FileText className="h-10 w-10" aria-hidden="true" />
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-dema-muted">
            {resource.formatLabel}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-3xl">
            {resource.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            {resource.description}
          </p>
          {resource.previewDisclosure ? (
            <p className="mt-3 text-xs leading-relaxed text-dema-muted">
              {resource.previewDisclosure}
            </p>
          ) : null}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackSystemJourneyEvent("system_resource_opened", {
              resourceSlug: resource.resourceSlug,
              systemSlug: trackingContext,
            })}
            className="demaa-primary-button mt-6 inline-flex w-full items-center justify-center gap-2"
          >
            {resource.openLabel ?? "Ouvrir le document"}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </DirectoryDetailDialogShell>
  );
}
