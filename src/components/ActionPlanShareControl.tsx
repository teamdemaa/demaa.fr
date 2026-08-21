"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import { getActionPlanUiCopy } from "@/lib/action-plan-ui-copy";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import { getActionPlanActions } from "@/lib/action-plan-view-model";
import type { InterfaceLocaleCode } from "@/lib/international-context";

function buildShareText(
  plan: PersistableActionPlan,
  workspace?: ActionPlanWorkspaceState,
  localeCode: InterfaceLocaleCode = "fr",
) {
  const copy = getActionPlanUiCopy(localeCode).share;
  const actions = [
    ...getActionPlanActions(plan),
    ...(workspace?.addedActions || []),
  ];
  const visibleActions = workspace
    ? actions.filter(
        (action) => !workspace.deletedActionIds.includes(action.id),
      )
    : actions;
  const legacySummary = "summary" in plan ? plan.summary.trim() : "";

  return [
    copy.title,
    ...(legacySummary ? ["", legacySummary, ""] : [""]),
    copy.thisWeek,
    ...visibleActions.map(
      (action, index) => `${index + 1}. ${action.title}`,
    ),
  ].join("\n");
}

export default function ActionPlanShareControl({
  plan,
  workspace,
  variant = "icon",
  localeCode = "fr",
}: {
  plan: PersistableActionPlan;
  workspace?: ActionPlanWorkspaceState;
  variant?: "icon" | "menu";
  localeCode?: InterfaceLocaleCode;
}) {
  const copy = getActionPlanUiCopy(localeCode).share;
  const [copied, setCopied] = useState(false);

  async function sharePlan() {
    const text = buildShareText(plan, workspace, localeCode);

    try {
      if (navigator.share) {
        await navigator.share({
          title: copy.title,
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
        ? "block w-full appearance-none whitespace-nowrap border-0 bg-transparent px-2 py-1.5 text-left text-sm font-normal leading-6 text-brand-blue transition-colors hover:text-dema-forest focus-visible:outline-none focus-visible:underline"
        : "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted transition hover:border-dema-forest/30 hover:text-dema-forest"}
      aria-label={copied
        ? copy.copied
        : copy.sharePlan}
      title={variant === "icon"
        ? copied
          ? copy.copied
          : copy.sharePlan
        : undefined}
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
        {copied
          ? copy.copied
          : copy.share}
      </span>
    </button>
  );
}
