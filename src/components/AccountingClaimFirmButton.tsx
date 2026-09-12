"use client";

import { useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import type { AccountingFirm } from "@/lib/accounting-directory";

type AccountingClaimFirmButtonProps = {
  firm: AccountingFirm;
  className?: string;
};

export default function AccountingClaimFirmButton({
  firm,
  className = "inline-flex w-full items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-5 py-3 text-sm font-semibold text-brand-blue transition hover:border-dema-forest/30 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-60",
}: AccountingClaimFirmButtonProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function requestClaim() {
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/accounting-directory-claim-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmSlug: firm.slug,
          sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Impossible de lancer la revendication.");
      }
      setStatus("sent");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible de lancer la revendication.",
      );
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-full border border-dema-line bg-dema-sage/60 px-5 py-3 text-center text-sm font-medium text-dema-forest">
        Demande envoyée, nous revenons vers {firm.name}.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void requestClaim()}
        disabled={status === "submitting" || !firm.email}
        className={className}
      >
        {status === "submitting" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        )}
        Revendiquer cette fiche
      </button>
      {errorMessage ? (
        <p className="text-xs font-medium text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
