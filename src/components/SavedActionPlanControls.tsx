"use client";

import { ChevronDown, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import ActionPlanShareControl from "@/components/ActionPlanShareControl";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

export type SavedActionPlanOption = {
  id: string;
  title: string;
  updatedAt: string;
};

export function SavedActionPlanSelector({
  availablePlans,
  inputRef,
  onResetTitle,
  onTitleChange,
  planId,
  title,
}: {
  availablePlans: readonly SavedActionPlanOption[];
  inputRef: RefObject<HTMLInputElement | null>;
  onResetTitle: () => void;
  onTitleChange: (title: string) => void;
  planId: string;
  title: string;
}) {
  const router = useRouter();
  const hasSeveralPlans = availablePlans.length > 1;

  return (
    <div className="flex w-full max-w-xl items-center rounded-full border border-dema-line bg-dema-paper px-1.5 py-1 shadow-[0_8px_24px_rgba(23,35,29,0.035)] focus-within:border-dema-forest/30">
      <input
        ref={inputRef}
        aria-label="Nom du plan"
        value={title}
        onChange={(event) => onTitleChange(event.target.value.slice(0, 120))}
        onBlur={() => {
          if (!title.trim()) onResetTitle();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            onResetTitle();
            event.currentTarget.blur();
          }
        }}
        className="min-h-10 min-w-0 flex-1 bg-transparent px-3 text-base font-medium text-brand-blue outline-none sm:text-lg"
      />
      <div className="relative h-10 w-10 shrink-0">
        <ChevronDown
          className={`pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 ${hasSeveralPlans ? "text-dema-forest" : "text-dema-muted/45"}`}
          aria-hidden="true"
        />
        <select
          aria-label="Changer de plan"
          value={planId}
          disabled={!hasSeveralPlans}
          onChange={(event) => {
            if (event.target.value === planId) return;
            router.push(`/plans/${encodeURIComponent(event.target.value)}`);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-default"
        >
          {availablePlans.map((availablePlan) => (
            <option key={availablePlan.id} value={availablePlan.id}>
              {availablePlan.id === planId ? title.trim() || availablePlan.title : availablePlan.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function SavedActionPlanMenu({
  deleting,
  onDelete,
  onRename,
  plan,
  workspace,
}: {
  deleting: boolean;
  onDelete: () => void;
  onRename: () => void;
  plan: PersistableActionPlan;
  workspace: ActionPlanWorkspaceState;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node
        && !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const itemClassName =
    "block w-full appearance-none whitespace-nowrap border-0 bg-transparent px-2 py-1.5 text-left text-sm font-normal leading-6 text-brand-blue transition-colors hover:text-dema-forest focus-visible:outline-none focus-visible:underline disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted transition hover:border-dema-forest/30 hover:text-dema-forest sm:h-11 sm:w-11"
        aria-label="Actions du plan"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <MoreVertical className="h-5 w-5" aria-hidden="true" />
      </button>
      {open ? (
        <div
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] rounded-2xl border border-dema-line bg-dema-paper px-3 py-2 shadow-[0_18px_46px_rgba(23,35,29,0.14)]"
        >
          <div onClick={() => setOpen(false)}>
            <ActionPlanShareControl
              plan={plan}
              workspace={workspace}
              variant="menu"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/?new=1");
            }}
            className={itemClassName}
          >
            Nouveau plan
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onRename();
            }}
            className={itemClassName}
          >
            Renommer
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className={`${itemClassName} text-red-700 hover:text-red-800`}
          >
            {deleting ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
