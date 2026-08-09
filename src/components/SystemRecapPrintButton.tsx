"use client";

import { Check, Copy, Printer } from "lucide-react";
import { useState } from "react";

export default function SystemRecapPrintButton() {
  const [isPrintUnavailable, setIsPrintUnavailable] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  function handlePrint() {
    if (typeof window.print === "function") {
      window.print();
      return;
    }

    setIsPrintUnavailable(true);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <div className="print:hidden sm:max-w-xs">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-dema-forest/20 bg-white px-5 py-3 text-sm font-semibold text-dema-forest transition hover:border-dema-forest/35 hover:bg-dema-sage/30"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Imprimer ou enregistrer en PDF
      </button>
      {isPrintUnavailable ? (
        <div className="mt-3 rounded-xl border border-dema-line bg-dema-sage/25 p-3" role="status">
          <p className="text-xs leading-relaxed text-dema-muted">
            L’impression n’est pas disponible dans ce navigateur. Ouvrez cette page dans Chrome, Safari ou Firefox.
          </p>
          <button
            type="button"
            onClick={handleCopyLink}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-dema-forest underline decoration-dema-forest/30 underline-offset-4"
          >
            {isCopied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {isCopied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
