"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { getOperationalSystemPurchaseLabel } from "@/lib/operational-system-offer";

type OperationalSystemPurchaseButtonProps = {
  systemSlug: string;
};

export default function OperationalSystemPurchaseButton({
  systemSlug,
}: OperationalSystemPurchaseButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/operational-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemSlug }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; url?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.error || "Impossible d’ouvrir le paiement pour le moment.",
        );
      }

      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Impossible d’ouvrir le paiement pour le moment.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={isSubmitting}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-dema-forest/25 bg-dema-paper px-5 py-3 text-sm font-semibold text-dema-forest transition hover:border-dema-forest hover:bg-dema-sage/35 disabled:cursor-wait disabled:opacity-65 sm:w-auto"
      >
        {isSubmitting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isSubmitting ? "Ouverture du paiement…" : getOperationalSystemPurchaseLabel()}
      </button>
      {error ? (
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-brand-coral" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
