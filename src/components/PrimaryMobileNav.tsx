"use client";

import Link from "next/link";
import { Boxes, HandHelping } from "lucide-react";

export type PrimaryNavTab = "structurer" | "deleguer";

const primaryMobileTabs = [
  {
    id: "structurer",
    label: "Structurer",
    href: "/",
    icon: Boxes,
  },
  {
    id: "deleguer",
    label: "Déléguer",
    href: "/deleguer",
    icon: HandHelping,
  },
] as const;

export default function PrimaryMobileNav({
  activeTab,
  onSelect,
}: {
  activeTab: PrimaryNavTab;
  onSelect?: (tab: PrimaryNavTab) => void;
}) {
  return (
    <nav
      className="md:hidden"
      aria-label="Navigation principale mobile"
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-1 rounded-full border border-dema-line/75 bg-dema-paper/95 px-3 py-1.5 shadow-[0_3px_8px_rgba(23,35,29,0.016)] backdrop-blur">
        {primaryMobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const className = `flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-sm transition ${
            isActive
              ? "bg-dema-forest font-semibold text-white shadow-[0_3px_8px_rgba(49,95,70,0.08)]"
              : "font-medium text-brand-blue/56 hover:bg-dema-sage/70 hover:text-brand-blue/72"
          }`;

          if (onSelect && tab.id !== "deleguer") {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={className}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
