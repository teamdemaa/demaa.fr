"use client";

import { MoreVertical } from "lucide-react";
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
    <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
        <ActionPlanSaveControl
          plan={plan}
          sourceText={sourceText}
          workspace={workspace}
          demoMode={demoMode}
        />
        <div ref={menuContainerRef} className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted sm:h-11 sm:w-11"
            aria-label="Actions du plan"
            aria-expanded={menuOpen}
            aria-controls="action-plan-utility-menu"
          >
            <MoreVertical className="h-5 w-5" aria-hidden="true" />
          </button>
          {menuOpen ? (
            <div id="action-plan-utility-menu" className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] rounded-2xl border border-dema-line bg-dema-paper p-2 shadow-[0_18px_46px_rgba(23,35,29,0.14)]">
              <ActionPlanShareControl plan={plan} workspace={workspace} variant="menu" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onReset();
                }}
                className="block w-full whitespace-nowrap px-3 py-2 text-left text-sm font-normal text-brand-blue transition hover:text-dema-forest"
              >
                Nouvelle situation
              </button>
            </div>
          ) : null}
        </div>
    </div>
  );
}
