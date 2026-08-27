"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { DocumentModel } from "@/lib/document-models";
import {
  getAirtableEmbedUrl,
  getDocumentModelPreviewSrc,
} from "@/lib/document-models";
import { trackCopyableModelEvent } from "@/lib/kit-analytics-client";

type DocumentModelPreviewProps = {
  model: DocumentModel;
  className?: string;
};

export default function DocumentModelPreview({
  model,
  className = "",
}: DocumentModelPreviewProps) {
  const previewSrc = useMemo(() => getDocumentModelPreviewSrc(model), [model]);
  const airtableEmbedUrl = useMemo(
    () => getAirtableEmbedUrl(model.ctaHref),
    [model.ctaHref],
  );
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const [isAirtableInteractive, setIsAirtableInteractive] = useState(false);
  const airtableFrameRef = useRef<HTMLIFrameElement>(null);
  const showImagePreview = Boolean(previewSrc) && !hasPreviewError;

  function trackAirtablePreviewOpen() {
    trackCopyableModelEvent("copyable_model_preview_opened", {
      modelSlug: model.slug,
      platform: "airtable",
      surface: "model_preview",
    });
  }

  if (airtableEmbedUrl) {
    return (
      <div
        className={`flex h-full min-h-[28rem] w-full flex-col bg-[#f7f7f3] lg:min-h-[32rem] ${className}`.trim()}
      >
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-dema-line bg-white px-4">
          <span className="text-xs font-medium text-brand-blue/60">
            Aperçu interactif
          </span>
          <a
            href={model.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackAirtablePreviewOpen}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-dema-line bg-white px-3 text-xs font-medium text-dema-forest transition hover:border-dema-forest/35"
          >
            Ouvrir dans Airtable
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
        <div className="relative min-h-0 flex-1">
          <div
            inert={isAirtableInteractive ? undefined : true}
            className={`absolute inset-0 ${isAirtableInteractive ? "" : "pointer-events-none"}`.trim()}
          >
            <iframe
              ref={airtableFrameRef}
              src={airtableEmbedUrl}
              title={`Aperçu interactif Airtable : ${model.title}`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              tabIndex={isAirtableInteractive ? 0 : -1}
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          {!isAirtableInteractive ? (
            <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
              <button
                type="button"
                onClick={() => {
                  trackAirtablePreviewOpen();
                  setIsAirtableInteractive(true);
                  window.requestAnimationFrame(() => airtableFrameRef.current?.focus());
                }}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-dema-forest/25 bg-white/95 px-5 text-xs font-medium text-dema-forest shadow-[0_8px_25px_rgba(31,52,43,0.14)] backdrop-blur transition hover:border-dema-forest/40 hover:bg-white"
              >
                Explorer la base
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (showImagePreview) {
    return (
      <div className={`relative h-full w-full bg-white ${className}`.trim()}>
        <Image
          src={previewSrc ?? ""}
          alt={model.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain object-center"
          onError={() => setHasPreviewError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col justify-between bg-[linear-gradient(180deg,#fcfcfa_0%,#f4f5f1_100%)] p-5 text-left ${className}`.trim()}
    >
      <div className="flex justify-end">
        <span className="rounded-full border border-dema-line/80 bg-white/80 px-3 py-1 text-[10px] font-medium text-brand-blue/62">
          {model.category}
        </span>
      </div>

      <div className="mt-6">
        <p className="max-w-[22ch] text-2xl font-semibold leading-tight text-brand-blue sm:text-3xl">
          {model.title}
        </p>
        <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-brand-blue/62">
          {model.description}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className={`h-3 rounded-full ${
              index % 3 === 0 ? "bg-dema-forest/18" : "bg-dema-line/90"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
