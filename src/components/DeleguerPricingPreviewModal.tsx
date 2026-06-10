"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import AssistantsCatalogClient from "@/components/AssistantsCatalogClient";

type DeleguerPricingPreviewModalProps = {
  onClose: () => void;
};

export default function DeleguerPricingPreviewModal({
  onClose,
}: DeleguerPricingPreviewModalProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const pricingSection = contentRef.current?.querySelector("#pricing");
      pricingSection?.scrollIntoView({ block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-blue/45 p-3 md:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Pricing Structuration & Automatisation"
      onClick={onClose}
    >
      <div
        className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-dema-line px-4 py-3 md:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              Demaa
            </p>
            <h2 className="truncate text-lg font-semibold text-brand-blue md:text-xl">
              Structuration & Automatisation
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto bg-dema-cream soft-scroll">
          <AssistantsCatalogClient />
        </div>
      </div>
    </div>
  );
}
