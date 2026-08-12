"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export default function SystemShareControl({
  systemName,
}: {
  systemName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function shareSystem() {
    const url = window.location.href;
    const title = `Système ${systemName} | Demaa`;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2_000);
      } catch {
        setCopied(false);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={() => void shareSystem()}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted transition hover:border-dema-forest/30 hover:text-dema-forest"
      aria-label={copied ? "Lien du système copié" : "Partager ce système"}
      title={copied ? "Lien copié" : "Partager ce système"}
      aria-live="polite"
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Share2 className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
