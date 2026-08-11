"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ActionPlanSaveControl from "@/components/ActionPlanSaveControl";
import ActionPlanShareControl from "@/components/ActionPlanShareControl";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

export default function ActionPlanUtilityActions({
  plan,
  sourceText,
  workspace,
  demoMode,
  onReset,
}: {
  plan: PersistableActionPlan;
  sourceText: string;
  workspace: ActionPlanWorkspaceState;
  demoMode: boolean;
  onReset: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuContainerRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-end gap-2">
        <ActionPlanSaveControl
          plan={plan}
          sourceText={sourceText}
          workspace={workspace}
          demoMode={demoMode}
        />
        <div ref={menuContainerRef} className="relative pb-1">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted"
            aria-label="Actions du plan"
            aria-expanded={menuOpen}
            aria-controls="action-plan-utility-menu"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </button>
          {menuOpen ? (
            <div id="action-plan-utility-menu" className="absolute right-0 top-full z-50 mt-2 rounded-2xl border border-dema-line bg-dema-paper px-2 py-1 shadow-[0_18px_46px_rgba(23,35,29,0.14)]">
              <ActionPlanShareControl plan={plan} variant="menu" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onReset();
                }}
                className="inline-flex min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-medium text-brand-blue transition hover:bg-dema-sage/55"
              >
                Nouvelle situation
              </button>
            </div>
          ) : null}
        </div>
    </div>
  );
}
