"use client";

import { Check, Copy, Mail, Printer } from "lucide-react";
import { useState } from "react";
import SystemProcessesEmailDialog from "@/components/SystemProcessesEmailDialog";

export default function SystemRecapPrintButton({
  emailDelivery,
}: {
  emailDelivery?: {
    systemName: string;
    systemSlug: string;
  };
}) {
  const [isPrintUnavailable, setIsPrintUnavailable] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

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
    <>
      <div className="w-full print:hidden sm:w-auto sm:max-w-md">
        <div className="flex w-full flex-col gap-3 min-[440px]:flex-row sm:gap-4">
          <button
            type="button"
            onClick={handlePrint}
            aria-label="Imprimer ou enregistrer en PDF"
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-dema-forest/20 bg-white px-2.5 py-3 text-[0.625rem] font-semibold text-dema-forest transition hover:border-dema-forest/35 hover:bg-dema-sage/30 min-[360px]:text-xs sm:flex-none sm:px-4 sm:text-sm"
          >
            <Printer className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
            Imprimer le document
          </button>
          {emailDelivery ? (
            <button
              type="button"
              onClick={() => setIsEmailOpen(true)}
              className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-dema-forest px-2.5 py-3 text-[0.625rem] font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 min-[360px]:text-xs sm:flex-none sm:px-4 sm:text-sm"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
              Recevoir le document
            </button>
          ) : null}
        </div>
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

      {isEmailOpen && emailDelivery ? (
        <SystemProcessesEmailDialog
          onClose={() => setIsEmailOpen(false)}
          systemName={emailDelivery.systemName}
          systemSlug={emailDelivery.systemSlug}
        />
      ) : null}
    </>
  );
}
