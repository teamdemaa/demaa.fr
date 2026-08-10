"use client";

import { MoreHorizontal } from "lucide-react";
import ActionPlanSaveControl from "@/components/ActionPlanSaveControl";
import ActionPlanShareControl from "@/components/ActionPlanShareControl";
import type { ActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

function UtilityControls({
  plan,
  sourceText,
  workspace,
  demoMode,
  onReset,
}: {
  plan: ActionPlan;
  sourceText: string;
  workspace: ActionPlanWorkspaceState;
  demoMode: boolean;
  onReset: () => void;
}) {
  return (
    <>
      <ActionPlanSaveControl
        plan={plan}
        sourceText={sourceText}
        workspace={workspace}
        demoMode={demoMode}
      />
      <ActionPlanShareControl plan={plan} />
      <button
        type="button"
        onClick={onReset}
        className="demaa-secondary-button min-h-11 shrink-0"
      >
        Nouvelle situation
      </button>
    </>
  );
}

export default function ActionPlanUtilityActions({
  plan,
  sourceText,
  workspace,
  demoMode,
  onReset,
}: {
  plan: ActionPlan;
  sourceText: string;
  workspace: ActionPlanWorkspaceState;
  demoMode: boolean;
  onReset: () => void;
}) {
  const controls = {
    plan,
    sourceText,
    workspace,
    demoMode,
    onReset,
  };

  return (
    <>
      <div className="hidden flex-wrap items-center justify-end gap-2 sm:flex">
        <UtilityControls {...controls} />
      </div>
      <details className="relative pb-1 sm:hidden">
        <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted marker:content-none" aria-label="Actions du plan">
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </summary>
        <div className="absolute right-0 top-full z-50 mt-2 flex w-[min(21rem,calc(100vw-2rem))] flex-wrap gap-2 rounded-2xl border border-dema-line bg-dema-paper p-3 shadow-[0_18px_46px_rgba(23,35,29,0.14)]">
          <UtilityControls {...controls} />
        </div>
      </details>
    </>
  );
}
