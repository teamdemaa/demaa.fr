"use client";

import { BookOpen, BriefcaseBusiness, ListChecks, Workflow } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ActionPlanView = "plan" | "system" | "academy" | "opportunities";

const tabClassName =
  "inline-flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.1rem] px-1 text-[10px] font-medium leading-none transition xl:min-h-11 xl:flex-row xl:gap-0 xl:rounded-full xl:px-3 xl:text-sm";

const navigationItems = [
  { view: "plan", label: "Plan d’action", Icon: ListChecks },
  { view: "system", label: "Solutions", Icon: Workflow },
  { view: "opportunities", label: "Opportunités", Icon: BriefcaseBusiness },
  { view: "academy", label: "Académie", Icon: BookOpen },
] as const;

export default function ActionPlanNavbar({
  activeView,
  onViewChange,
  routeNavigation = false,
}: {
  activeView: ActionPlanView;
  onViewChange?: (view: ActionPlanView) => void;
  routeNavigation?: boolean;
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

  function selectView(view: ActionPlanView) {
    if (onViewChange) onViewChange(view);
  }

  function navigation() {
    return (
      <div
        className="grid w-full grid-cols-4 gap-1 rounded-[1.45rem] border border-dema-line bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.06)] lg:rounded-full"
        aria-label="Navigation principale"
      >
        {navigationItems.map(({ view, label, Icon }) => {
          const className = `${tabClassName} ${activeView === view ? "bg-dema-sage text-dema-forest" : "text-dema-muted hover:text-brand-blue"}`;
          const content = (
            <>
              <Icon className="h-4 w-4 shrink-0 xl:hidden" aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </>
          );

          return routeNavigation ? (
            <Link
              key={view}
              href={`/?view=${view}`}
              aria-current={activeView === view ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <button
              key={view}
              type="button"
              aria-current={activeView === view ? "page" : undefined}
              onClick={() => selectView(view)}
              className={className}
            >
              {content}
            </button>
          );
        })}
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
