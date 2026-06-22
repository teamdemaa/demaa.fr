"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, HandHelping, Search, type LucideIcon } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";
import { readHomeDiscoveryState } from "@/lib/home-discovery";
import {
  visiblePrimaryNavigationItems,
  type PrimaryNavigationId,
} from "@/lib/navigation";

type HomeTabsMode = "links" | "client";

const tabIcons: Record<PrimaryNavigationId, LucideIcon> = {
  analyser: Search,
  structurer: Boxes,
  deleguer: HandHelping,
};

const HOME_TAB_SELECT_EVENT = "demaa:home-tab-select";
function getVisibleTab(tabId: string) {
  return visiblePrimaryNavigationItems.find((tab) => tab.id === tabId);
}

export default function Navbar({
  minimal = false,
  homeTabsMode = "links",
}: {
  minimal?: boolean;
  homeTabsMode?: HomeTabsMode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hasDesktopTabs = !minimal && visiblePrimaryNavigationItems.length > 0;
  const [showOnHome, setShowOnHome] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname === "/") {
      const syncTimer = window.setTimeout(() => {
        setShowOnHome(Boolean(readHomeDiscoveryState()?.seen));
      }, 0);

      return () => {
        window.clearTimeout(syncTimer);
      };
    }

    router.prefetch("/");
  }, [pathname, router]);

  if (pathname === "/" && !showOnHome) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-dema-line/70 bg-dema-cream/92 py-1 backdrop-blur-md">
      <div className="mx-auto w-full px-6 md:px-10 lg:px-24">
        <div className="relative flex items-center justify-between gap-4 py-3 md:py-4">
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="inline-flex items-center shrink-0 z-50 cursor-pointer"
            onMouseEnter={() => router.prefetch("/")}
            onFocus={() => router.prefetch("/")}
          >
            <DemaaWordmark className="text-[1.4rem] sm:text-[1.7rem]" />
          </Link>

          {hasDesktopTabs && (
            <Suspense fallback={<DesktopHomeTabsNavStatic mode={homeTabsMode} />}>
              <DesktopHomeTabsNav mode={homeTabsMode} />
            </Suspense>
          )}

        </div>
      </div>
    </nav>
  );
}

function DesktopHomeTabsNav({ mode }: { mode: HomeTabsMode }) {
  const pathname = usePathname();
  const activeTab =
    pathname === "/annuaire-services"
      ? "deleguer"
      : pathname === "/organisation-automatisation"
        ? "structurer"
      : pathname === "/"
        ? "analyser"
        : undefined;

  return <DesktopHomeTabsNavStatic activeTab={activeTab} mode={mode} />;
}

function DesktopHomeTabsNavStatic({
  activeTab,
  mode = "links",
}: {
  activeTab?: string;
  mode?: HomeTabsMode;
}) {
  const [clientActiveTab, setClientActiveTab] = useState<PrimaryNavigationId>(
    getVisibleTab(activeTab ?? "")?.id ?? "analyser"
  );
  const currentActiveTab = mode === "client" ? clientActiveTab : activeTab;

  useEffect(() => {
    if (mode !== "client") return;

    function handleHomeTabSelect(event: Event) {
      const tab = (event as CustomEvent<{ tab?: string }>).detail?.tab;

      const visibleTab = getVisibleTab(tab ?? "");

      if (visibleTab) {
        setClientActiveTab(visibleTab.id);
      }
    }

    window.addEventListener(HOME_TAB_SELECT_EVENT, handleHomeTabSelect);

    return () => {
      window.removeEventListener(HOME_TAB_SELECT_EVENT, handleHomeTabSelect);
    };
  }, [mode]);

  function selectClientTab(tab: PrimaryNavigationId) {
    const visibleTab = getVisibleTab(tab);
    if (!visibleTab) return;

    setClientActiveTab(tab);
    window.history.replaceState(null, "", visibleTab.href);
    window.dispatchEvent(new CustomEvent(HOME_TAB_SELECT_EVENT, { detail: { tab } }));
  }

  if (visiblePrimaryNavigationItems.length === 0) {
    return null;
  }

  return (
    <div className="hidden items-center justify-center gap-1 rounded-full border border-dema-line/75 bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.04)] md:absolute md:left-1/2 md:top-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
      {visiblePrimaryNavigationItems.map((tab) => {
        const Icon = tabIcons[tab.id];
        const isActive = currentActiveTab === tab.id;
        const className = `demaa-nav-item inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-base transition lg:px-6 ${
          isActive
            ? "bg-dema-forest font-semibold text-white shadow-[0_6px_16px_rgba(49,95,70,0.14)]"
            : "font-medium text-brand-blue/56 hover:bg-dema-sage/70 hover:text-brand-blue/72"
        }`;

        if (mode === "client" && tab.id === "analyser") {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectClientTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              <Icon className="demaa-nav-icon h-4 w-4 shrink-0" aria-hidden="true" />
              {tab.label}
            </button>
          );
        }

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={className}
          >
            <Icon className="demaa-nav-icon h-4 w-4 shrink-0" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
