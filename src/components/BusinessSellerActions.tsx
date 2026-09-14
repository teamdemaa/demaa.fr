"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { BusinessValuationInput, BusinessValuationResult } from "@/lib/business-valuation";

const BusinessSaleDialog = dynamic(() => import("@/components/BusinessSaleDialog"), { ssr: false });
const BusinessValuationDialog = dynamic(() => import("@/components/BusinessValuationDialog"), { ssr: false });

const primaryClassName = "inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35";
const secondaryClassName = "inline-flex min-h-12 items-center justify-center rounded-full border border-dema-forest/25 bg-dema-paper px-7 py-3 text-sm font-medium text-dema-forest transition hover:border-dema-forest/45 hover:bg-dema-sage/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25";

export default function BusinessSellerActions({ variant = "hero" }: { variant?: "hero" | "sale" | "estimate" }) {
  const [view, setView] = useState<"sale" | "valuation" | null>(null);
  const [valuation, setValuation] = useState<{ input: BusinessValuationInput; result: BusinessValuationResult }>();

  return (
    <>
      {variant === "hero" ? (
        <div className="mx-auto mt-8 flex max-w-xl flex-col items-start justify-start gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button type="button" className={`${primaryClassName} w-fit`} onClick={() => setView("sale")}>Vendre mon entreprise</button>
          <button type="button" className={`${secondaryClassName} w-fit`} onClick={() => setView("valuation")}>Estimer mon entreprise</button>
        </div>
      ) : variant === "sale" ? (
        <button type="button" className={primaryClassName} onClick={() => setView("sale")}>Vendre mon entreprise</button>
      ) : (
        <button type="button" className={`${primaryClassName} mt-8 w-fit`} onClick={() => setView("valuation")}>Estimer mon entreprise</button>
      )}
      {view === "sale" ? createPortal(<BusinessSaleDialog onClose={() => setView(null)} valuationInput={valuation?.input} valuationResult={valuation?.result} />, document.body) : null}
      {view === "valuation" ? createPortal(<BusinessValuationDialog onClose={() => setView(null)} onContinue={(input, result) => { setValuation({ input, result }); setView("sale"); }} />, document.body) : null}
    </>
  );
}
