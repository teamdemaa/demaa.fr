"use client";

import { BookOpen, BriefcaseBusiness, LayoutGrid, ListChecks, Workflow } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { InterfaceLocaleCode } from "@/lib/international-context";

export type ActionPlanView = "plan" | "solutions" | "services" | "academy" | "opportunities";

const tabClassName =
  "group relative inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-full px-1 text-xs font-medium leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 xl:gap-2 xl:rounded-none xl:px-3 xl:text-sm";

const navigationItems = {
  plan: { view: "plan", labels: { fr: "Plan d’action", en: "Action plan" }, Icon: ListChecks },
  solutions: { view: "solutions", labels: { fr: "Solutions", en: "Solutions" }, Icon: LayoutGrid },
  services: { view: "services", labels: { fr: "Automatiser", en: "Automate" }, Icon: Workflow },
  academy: { view: "academy", labels: { fr: "Organiser", en: "Organise" }, Icon: BookOpen },
  opportunities: { view: "opportunities", labels: { fr: "Annonces", en: "Opportunities" }, Icon: BriefcaseBusiness },
} as const;

const publicNavigationOrder: readonly ActionPlanView[] = [
  "solutions",
  "academy",
  "services",
];

const embeddedNavigationOrder: readonly ActionPlanView[] = [
  "solutions",
  "academy",
  "services",
];

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

  const navigationOrder = routeNavigation ? publicNavigationOrder : embeddedNavigationOrder;
  const displayedItems = navigationOrder
    .map((view) => navigationItems[view])
    .filter(({ view }) => view === "solutions" || !visibleViews || visibleViews.includes(view));

  function navigation() {
    return (
      <div
        className="grid w-full gap-1 rounded-full border border-dema-line/70 bg-dema-paper p-1 shadow-[0_3px_12px_rgba(23,35,29,0.035)] xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none"
        style={{
          gridTemplateColumns: `repeat(${displayedItems.length}, minmax(0, 1fr))`,
        }}
        aria-label={localeCode === "en" ? "Main navigation" : "Navigation principale"}
      >
        {displayedItems.map(({ view, labels, Icon }) => {
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

          const routeHref = localeCode === "en"
            ? `/en?view=${view}`
            : view === "solutions"
              ? "/solutions"
              : view === "plan"
              ? "/"
              : view === "academy"
                ? "/organiser"
                : "/automatisation";
          const usesPublicRoute = routeNavigation
            || (localeCode === "fr" && (view === "solutions" || view === "academy" || view === "services"));

          return usesPublicRoute ? (
            <Link
              key={view}
              href={routeHref}
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

  if (displayedItems.length <= 1) return null;

  return (
    <>
      {desktopTarget ? createPortal(navigation(), desktopTarget) : null}
      {mobileTarget ? createPortal(navigation(), mobileTarget) : null}
    </>
  );
}
