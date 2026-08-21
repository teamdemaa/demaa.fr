"use client";

import { Check, ChevronRight, MoreVertical } from "lucide-react";
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
import { getActionPlanUiCopy } from "@/lib/action-plan-ui-copy";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { getLocalizedActionPlanPath } from "@/lib/action-plan-localization";

export type SavedActionPlanOption = {
  id: string;
  status: "active" | "failed" | "generating";
  title: string;
  updatedAt: string;
  contentLocaleCode?: InterfaceLocaleCode;
};

export function SavedActionPlanSelector({
  inputRef,
  onResetTitle,
  onTitleChange,
  title,
  localeCode = "fr",
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onResetTitle: () => void;
  onTitleChange: (title: string) => void;
  title: string;
  localeCode?: InterfaceLocaleCode;
}) {
  const copy = getActionPlanUiCopy(localeCode).savedPlan;
  return (
    <div className="flex h-11 min-w-0 flex-1 items-center rounded-full border border-dema-line bg-dema-paper px-1.5 shadow-[0_8px_24px_rgba(23,35,29,0.035)] focus-within:border-dema-forest/30 focus-within:ring-2 focus-within:ring-dema-forest/20">
      <input
        ref={inputRef}
        aria-label={copy.planName}
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
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-base font-medium text-brand-blue outline-none sm:text-lg"
      />
    </div>
  );
}

export function SavedActionPlanMenu({
  availablePlans,
  deleting,
  navigationPending,
  onNavigate,
  onDelete,
  onRename,
  openingPlanId,
  plan,
  planId,
  sourceText,
  title,
  workspace,
  localeCode = "fr",
}: {
  availablePlans: readonly SavedActionPlanOption[];
  deleting: boolean;
  navigationPending: boolean;
  onNavigate: (href: string) => void;
  onDelete: () => void;
  onRename: () => void;
  openingPlanId: string | null;
  plan: PersistableActionPlan;
  planId: string;
  sourceText?: string | null;
  title: string;
  workspace: ActionPlanWorkspaceState;
  localeCode?: InterfaceLocaleCode;
}) {
  const copy = getActionPlanUiCopy(localeCode).savedPlan;
  const [open, setOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showSourceText, setShowSourceText] = useState(false);
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
        setShowPlans(false);
        setShowSourceText(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      setShowPlans(false);
      setShowSourceText(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    router.prefetch(getLocalizedActionPlanPath(localeCode, "/plans/new"));
    if (!showPlans) return;
    for (const availablePlan of availablePlans) {
      if (availablePlan.id !== planId) {
        router.prefetch(getLocalizedActionPlanPath(
          localeCode,
          `/plans/${encodeURIComponent(availablePlan.id)}`,
        ));
      }
    }
  }, [availablePlans, localeCode, open, planId, router, showPlans]);

  const itemClassName =
    "block w-full appearance-none whitespace-nowrap border-0 bg-transparent px-2 py-1.5 text-left text-sm font-normal leading-6 text-brand-blue transition-colors hover:text-dema-forest focus-visible:outline-none focus-visible:underline disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted transition hover:border-dema-forest/30 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
        aria-label={copy.planActions}
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
          {availablePlans.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setShowPlans((current) => !current)}
                className={itemClassName}
                aria-expanded={showPlans}
              >
                <span className="flex items-center justify-between gap-4">
                  {copy.switchPlan}
                  <ChevronRight className={`h-4 w-4 transition ${showPlans ? "rotate-90" : ""}`} aria-hidden="true" />
                </span>
              </button>
              {showPlans ? (
                <div className="my-1 w-[18rem] max-w-[calc(100vw-3rem)] border-y border-dema-line py-1">
                  {availablePlans.map((availablePlan) => {
                    const isCurrent = availablePlan.id === planId;
                    const displayedTitle = isCurrent
                      ? title.trim() || availablePlan.title
                      : availablePlan.title;
                    return (
                      <button
                        key={availablePlan.id}
                        type="button"
                        disabled={isCurrent || navigationPending}
                        onClick={() => {
                          setOpen(false);
                          setShowPlans(false);
                          onNavigate(getLocalizedActionPlanPath(
                            localeCode,
                            `/plans/${encodeURIComponent(availablePlan.id)}`,
                          ));
                        }}
                        className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-dema-sage/45 disabled:opacity-100"
                      >
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 text-dema-forest ${isCurrent ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-brand-blue">{displayedTitle}</span>
                          <span className="block text-[0.7rem] text-dema-muted">
                            {openingPlanId === availablePlan.id
                              ? copy.opening
                              : availablePlan.status === "generating"
                                ? copy.generating
                                : availablePlan.status === "failed"
                                  ? copy.needsAttention
                                  : `${copy.updated} ${new Intl.DateTimeFormat(localeCode === "en" ? "en-GB" : "fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(availablePlan.updatedAt))}`}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </>
          ) : null}
          {sourceText?.trim() ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowPlans(false);
                  setShowSourceText((current) => !current);
                }}
                className={itemClassName}
                aria-expanded={showSourceText}
              >
                {copy.source}
              </button>
              {showSourceText ? (
                <div className="my-1 max-h-56 max-w-[calc(100vw-3rem)] overflow-y-auto whitespace-pre-wrap border-y border-dema-line px-2 py-2 text-xs leading-5 text-brand-blue">
                  {sourceText.trim()}
                </div>
              ) : null}
            </>
          ) : null}
          <button
            type="button"
            disabled={navigationPending}
            onClick={() => {
              setOpen(false);
              setShowPlans(false);
              onNavigate(getLocalizedActionPlanPath(localeCode, "/plans/new"));
            }}
            className={itemClassName}
          >
            {copy.newPlan}
          </button>
          <div onClick={() => setOpen(false)}>
            <ActionPlanShareControl
              plan={plan}
              workspace={workspace}
              variant="menu"
              localeCode={localeCode}
            />
          </div>
          <button
            type="button"
            disabled={navigationPending}
            onClick={() => {
              setOpen(false);
              onRename();
            }}
            className={itemClassName}
          >
            {copy.rename}
          </button>
          <button
            type="button"
            disabled={deleting || navigationPending}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className={`${itemClassName} text-red-700 hover:text-red-800`}
          >
            {deleting
              ? copy.deleting
              : copy.delete}
          </button>
        </div>
      ) : null}
    </div>
  );
}
