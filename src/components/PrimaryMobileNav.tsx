"use client";

import Link from "next/link";
import { Boxes, HandHelping, Handshake, Search, type LucideIcon } from "lucide-react";
import {
  visiblePrimaryNavigationItems,
  type PrimaryNavigationId,
} from "@/lib/navigation";

export type PrimaryNavTab = PrimaryNavigationId;

const tabIcons: Record<PrimaryNavigationId, LucideIcon> = {
  analyser: Search,
  structurer: Boxes,
  deleguer: HandHelping,
  developper: Handshake,
};

export default function PrimaryMobileNav({
  activeTab,
  onSelect,
}: {
  activeTab?: PrimaryNavTab;
  onSelect?: (tab: PrimaryNavTab) => void;
}) {
  const gridClass =
    visiblePrimaryNavigationItems.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <nav
      className="md:hidden"
      aria-label="Navigation principale mobile"
    >
      <div className={`mx-auto grid w-full max-w-[24rem] ${gridClass} items-center gap-1 rounded-full border border-dema-line/75 bg-dema-paper/95 px-1.5 py-1.5 shadow-[0_3px_8px_rgba(23,35,29,0.016)] backdrop-blur`}>
        {visiblePrimaryNavigationItems.map((tab) => {
          const Icon = tabIcons[tab.id];
          const isActive = activeTab === tab.id;
          const className = `demaa-nav-item flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] transition min-[380px]:text-sm ${
            isActive
              ? "bg-dema-forest font-semibold text-white shadow-[0_3px_8px_rgba(49,95,70,0.08)]"
              : "font-medium text-brand-blue/56 hover:bg-dema-sage/70 hover:text-brand-blue/72"
          }`;

          if (onSelect && tab.id === "analyser") {
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
