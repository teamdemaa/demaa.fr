"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { buildPublicSystemAppHref } from "@/lib/action-plan-app-context";

export default function SystemShareControl({
  systemName,
  systemSlug,
  localeCode = "fr",
}: {
  systemName: string;
  systemSlug: string;
  localeCode?: "fr" | "en";
}) {
  const [copied, setCopied] = useState(false);

  async function shareSystem() {
    const url = new URL(
      `${localeCode === "en" ? "/en" : ""}${buildPublicSystemAppHref({ systemId: systemSlug })}`,
      window.location.origin,
    ).toString();
    const title = `${localeCode === "en" ? "Business type" : "Système"} ${systemName} | Demaa`;

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
      aria-label={copied ? (localeCode === "en" ? "Business type link copied" : "Lien du système copié") : (localeCode === "en" ? "Share this business type" : "Partager ce système")}
      title={copied ? (localeCode === "en" ? "Link copied" : "Lien copié") : (localeCode === "en" ? "Share this business type" : "Partager ce système")}
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
