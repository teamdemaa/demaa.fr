"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

function buildShareText(
  plan: PersistableActionPlan,
  workspace?: ActionPlanWorkspaceState,
) {
  const visibleActions = workspace
    ? plan.weeklyActions.filter(
        (action) => !workspace.deletedActionIds.includes(action.id),
      )
    : plan.weeklyActions;

  return [
    "Mon plan d’action Demaa",
    "",
    plan.summary,
    "",
    "À faire cette semaine",
    ...visibleActions.map(
      (action, index) => `${index + 1}. ${action.title}`,
    ),
  ].join("\n");
}

export default function ActionPlanShareControl({
  plan,
  workspace,
  variant = "icon",
}: {
  plan: PersistableActionPlan;
  workspace?: ActionPlanWorkspaceState;
  variant?: "icon" | "menu";
}) {
  const [copied, setCopied] = useState(false);

  async function sharePlan() {
    const text = buildShareText(plan, workspace);

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
      className={variant === "menu"
        ? "block w-full whitespace-nowrap px-3 py-2 text-left text-sm font-normal text-brand-blue transition hover:text-dema-forest"
        : "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted transition hover:border-dema-forest/30 hover:text-dema-forest"}
      aria-label={copied ? "Plan copié" : "Partager le plan"}
      title={copied ? "Plan copié" : "Partager le plan"}
      aria-live="polite"
    >
      {variant === "icon" ? (
        copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden="true" />
        )
      ) : null}
      <span className={variant === "menu" ? undefined : "sr-only"}>
        {copied ? "Plan copié" : "Partager"}
      </span>
    </button>
  );
}
