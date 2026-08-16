"use client";

import { BookOpen, ListChecks, Wrench } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { InterfaceLocaleCode } from "@/lib/international-context";

export type ActionPlanView = "plan" | "solutions" | "academy";

const tabClassName =
  "group relative inline-flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.1rem] px-1 text-[10px] font-medium leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 xl:min-h-11 xl:flex-row xl:gap-2 xl:rounded-none xl:px-3 xl:text-sm";

const navigationItems = [
  { view: "plan", labels: { fr: "Plan d’action", en: "Action plan" }, Icon: ListChecks },
  { view: "solutions", labels: { fr: "Solutions", en: "Solutions" }, Icon: Wrench },
  { view: "academy", labels: { fr: "Académie", en: "Academy" }, Icon: BookOpen },
] as const;

export default function ActionPlanNavbar({
  activeView,
  onViewChange,
  routeNavigation = false,
  localeCode = "fr",
  visibleViews,
}: {
  activeView: ActionPlanView;
  onViewChange?: (view: ActionPlanView) => void;
  routeNavigation?: boolean;
  localeCode?: InterfaceLocaleCode;
  visibleViews?: readonly ActionPlanView[];
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
        className="grid w-full gap-1"
        style={{
          gridTemplateColumns: `repeat(${visibleViews?.length || navigationItems.length}, minmax(0, 1fr))`,
        }}
        aria-label={localeCode === "en" ? "Main navigation" : "Navigation principale"}
      >
        {navigationItems.filter(({ view }) => !visibleViews || visibleViews.includes(view)).map(({ view, labels, Icon }) => {
          const label = labels[localeCode];
          const isActive = activeView === view;
          const className = `${tabClassName} ${isActive ? "bg-dema-sage text-dema-forest xl:bg-transparent xl:font-semibold" : "text-dema-muted hover:text-brand-blue"}`;
          const content = (
            <>
              <Icon
                className={`h-4 w-4 shrink-0 transition ${isActive ? "stroke-[2.3]" : "stroke-[1.8] group-hover:stroke-2"}`}
                aria-hidden="true"
              />
              <span className="max-w-full truncate">{label}</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-3 bottom-0 hidden h-0.5 origin-center rounded-full bg-dema-forest transition-[transform,opacity] duration-200 xl:block ${
                  isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                }`}
              />
            </>
          );

          return routeNavigation ? (
            <Link
              key={view}
              href={`${localeCode === "en" ? "/en" : "/"}?view=${view}`}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <button
              key={view}
              type="button"
              aria-current={isActive ? "page" : undefined}
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

  if (visibleViews?.length === 1) return null;

  return (
    <>
      {desktopTarget ? createPortal(navigation(), desktopTarget) : null}
      {mobileTarget ? createPortal(navigation(), mobileTarget) : null}
    </>
  );
}
