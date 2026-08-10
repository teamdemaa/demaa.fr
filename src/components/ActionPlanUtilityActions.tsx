"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ActionPlanSaveControl from "@/components/ActionPlanSaveControl";
import ActionPlanShareControl from "@/components/ActionPlanShareControl";
import type { ActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

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
  const [saveTarget, setSaveTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSaveTarget(document.getElementById("action-plan-navbar-save"));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {saveTarget
        ? createPortal(
            <ActionPlanSaveControl
              plan={plan}
              sourceText={sourceText}
              workspace={workspace}
              demoMode={demoMode}
            />,
            saveTarget,
          )
        : null}

      <div className="flex items-center justify-end gap-2">
        <ActionPlanShareControl plan={plan} />
        <details className="relative pb-1">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted marker:content-none" aria-label="Actions du plan">
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 top-full z-50 mt-2 rounded-2xl border border-dema-line bg-dema-paper p-2 shadow-[0_18px_46px_rgba(23,35,29,0.14)]">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-medium text-brand-blue transition hover:bg-dema-sage/55"
            >
              Nouvelle situation
            </button>
          </div>
        </details>
      </div>
    </>
  );
}
