"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import type { ActionPlan } from "@/lib/action-plan-contract";

function buildShareText(plan: ActionPlan) {
  return [
    "Mon plan d’action Demaa",
    "",
    plan.summary,
    "",
    "À faire cette semaine",
    ...plan.weeklyActions.map(
      (action, index) => `${index + 1}. ${action.title}`,
    ),
  ].join("\n");
}

export default function ActionPlanShareControl({ plan }: { plan: ActionPlan }) {
  const [copied, setCopied] = useState(false);

  async function sharePlan() {
    const text = buildShareText(plan);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mon plan d’action Demaa",
          text,
        });
        return;
      }

      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      try {
        await navigator.clipboard.writeText(text);
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
      onClick={() => void sharePlan()}
      className="demaa-secondary-button min-h-11 shrink-0 gap-2"
      aria-live="polite"
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Share2 className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? "Copié" : "Partager"}
    </button>
  );
}
