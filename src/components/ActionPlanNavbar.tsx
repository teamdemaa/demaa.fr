"use client";

import { BookOpen, Handshake, ListChecks, Workflow } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ActionPlanView = "plan" | "system" | "academy" | "accompaniment";

const tabClassName =
  "inline-flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.1rem] px-1 text-[10px] font-medium leading-none transition lg:min-h-11 lg:flex-row lg:gap-0 lg:rounded-full lg:px-3 lg:text-sm";

const navigationItems = [
  { view: "plan", label: "Plan d’action", Icon: ListChecks },
  { view: "system", label: "Système", Icon: Workflow },
  { view: "academy", label: "Académie", Icon: BookOpen },
  { view: "accompaniment", label: "Accompagnement", Icon: Handshake },
] as const;

export default function ActionPlanNavbar({
  activeView,
  onViewChange,
}: {
  activeView: ActionPlanView;
  onViewChange: (view: ActionPlanView) => void;
}) {
  const [desktopTarget, setDesktopTarget] = useState<HTMLElement | null>(null);
  const [mobileTarget, setMobileTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDesktopTarget(document.getElementById("action-plan-navbar-desktop"));
      setMobileTarget(document.getElementById("action-plan-navbar-mobile"));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function navigation() {
    return (
      <div
        className="grid w-full grid-cols-4 gap-1 rounded-[1.45rem] border border-dema-line bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.06)] lg:rounded-full"
        aria-label="Navigation de votre espace"
      >
        {navigationItems.map(({ view, label, Icon }) => (
          <button
            key={view}
            type="button"
            aria-current={activeView === view ? "page" : undefined}
            onClick={() => onViewChange(view)}
            className={`${tabClassName} ${activeView === view ? "bg-dema-sage text-dema-forest" : "text-dema-muted hover:text-brand-blue"}`}
          >
            <Icon className="h-4 w-4 shrink-0 lg:hidden" aria-hidden="true" />
            <span className="max-w-full truncate">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      {desktopTarget ? createPortal(navigation(), desktopTarget) : null}
      {mobileTarget ? createPortal(navigation(), mobileTarget) : null}
    </>
  );
}
