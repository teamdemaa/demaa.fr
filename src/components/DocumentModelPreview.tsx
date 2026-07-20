"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { DocumentModel } from "@/lib/document-models";
import { getDocumentModelPreviewSrc } from "@/lib/document-models";

type DocumentModelPreviewProps = {
  model: DocumentModel;
  className?: string;
};

export default function DocumentModelPreview({
  model,
  className = "",
}: DocumentModelPreviewProps) {
  const previewSrc = useMemo(() => getDocumentModelPreviewSrc(model), [model]);
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const showImagePreview = Boolean(previewSrc) && !hasPreviewError;

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
