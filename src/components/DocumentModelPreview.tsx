"use client";

import Image from "next/image";
import { FileSpreadsheet } from "lucide-react";
import { useMemo, useState } from "react";
import type { DocumentModel } from "@/lib/document-models";
import { getDocumentModelPreviewSrc } from "@/lib/document-models";

type DocumentModelPreviewProps = {
  model: DocumentModel;
  className?: string;
};

function formatPilotingTitle(title: string) {
  return title.replace(/^Tableau de pilotage pour\s+/i, "");
}

export default function DocumentModelPreview({
  model,
  className = "",
}: DocumentModelPreviewProps) {
  const previewSrc = useMemo(() => getDocumentModelPreviewSrc(model), [model]);
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const showImagePreview = Boolean(previewSrc) && !hasPreviewError && !model.systemSlug;
  const displayTitle = model.systemSlug ? formatPilotingTitle(model.title) : model.title;

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

  if (model.systemSlug) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center border border-[#d7e5dc] bg-[radial-gradient(circle_at_top,#f4faf6_0%,#e8f2eb_58%,#deebe3_100%)] ${className}`.trim()}
      >
        <FileSpreadsheet className="h-5 w-5 text-[#2d7b4f]/26" strokeWidth={1.5} />
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
          {displayTitle}
        </p>
        <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-brand-blue/62">
          {model.systemSlug
            ? "Tableau de pilotage metier relie au Google Sheet source."
            : model.description}
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
