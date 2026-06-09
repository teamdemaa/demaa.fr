"use client";

import Link from "next/link";
import { Boxes, HandHelping, Handshake } from "lucide-react";

export type PrimaryNavTab = "structurer" | "deleguer" | "developper";

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
  {
    id: "developper",
    label: "Développer",
    href: "/developper",
    icon: Handshake,
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
      <div className="mx-auto grid w-full max-w-[24rem] grid-cols-3 items-center gap-1 rounded-full border border-dema-line/75 bg-dema-paper/95 px-1.5 py-1.5 shadow-[0_3px_8px_rgba(23,35,29,0.016)] backdrop-blur">
        {primaryMobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const className = `demaa-nav-item flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] transition min-[380px]:text-sm ${
            isActive
              ? "bg-dema-forest font-semibold text-white shadow-[0_3px_8px_rgba(49,95,70,0.08)]"
              : "font-medium text-brand-blue/56 hover:bg-dema-sage/70 hover:text-brand-blue/72"
          }`;

          if (onSelect && tab.id === "structurer") {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={className}
              >
                <Icon className="demaa-nav-icon h-[15px] w-[15px] shrink-0 min-[380px]:h-4 min-[380px]:w-4" aria-hidden="true" />
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
              <Icon className="demaa-nav-icon h-[15px] w-[15px] shrink-0 min-[380px]:h-4 min-[380px]:w-4" aria-hidden="true" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
