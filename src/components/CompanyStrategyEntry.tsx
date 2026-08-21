"use client";

import { ArrowRight, Compass } from "lucide-react";

export default function CompanyStrategyEntry({
  localeCode = "fr",
  onOpen,
}: {
  localeCode?: "fr" | "en";
  onOpen: () => void;
}) {
  return (
    <section className="mt-6 rounded-[1.25rem] border border-dema-line bg-dema-sage/30 p-5 sm:p-6">
      <button
        type="button"
        onClick={onOpen}
        className="group flex min-h-14 w-full items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-paper text-dema-forest">
          <Compass className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold text-dema-forest">
            {localeCode === "en" ? "Strategy" : "Stratégie"}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-dema-muted">
            {localeCode === "en"
              ? "Clarify your positioning, offer and priorities."
              : "Clarifiez votre positionnement, votre offre et vos priorités."}
          </span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-dema-muted transition group-hover:translate-x-0.5 group-hover:text-dema-forest" aria-hidden="true" />
      </button>
    </section>
  );
}
