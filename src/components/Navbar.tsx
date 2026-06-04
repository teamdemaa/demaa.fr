"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type HomeTabId = "systemes" | "outils" | "academy";
type HomeTabsMode = "links" | "client";

const homeTabs = [
  { id: "systemes", label: "Systèmes", href: "/" },
  { id: "outils", label: "Outils", href: "/outils" },
  { id: "academy", label: "Academy", href: "/academy" },
] as const;

const HOME_TAB_SELECT_EVENT = "demaa:home-tab-select";

function getTabPath(tab: HomeTabId) {
  if (tab === "outils") return "/outils";
  if (tab === "academy") return "/academy";

  return "/";
}

export default function Navbar({
  minimal = false,
  homeTabsMode = "links",
}: {
  minimal?: boolean;
  homeTabsMode?: HomeTabsMode;
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-brand-coral/10 bg-[#ffffff] py-1">
      <div className="mx-auto w-full px-6 md:px-10 lg:px-24">
        <div className="relative flex justify-between gap-4 py-3 md:py-4 items-center">
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="demaa-brand-logo inline-flex items-center text-xl tracking-tight text-brand-blue shrink-0 z-50 cursor-pointer sm:text-2xl"
          >
            Demaa
          </Link>

          {!minimal && (
            <>
              <Suspense fallback={<DesktopHomeTabsNavStatic mode={homeTabsMode} />}>
                <DesktopHomeTabsNav mode={homeTabsMode} />
              </Suspense>

              <Link
                href="/assistant"
                className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full border border-brand-blue/10 bg-white px-4 text-xs font-medium text-brand-blue transition-colors hover:border-neutral-300 hover:text-neutral-700 sm:px-5 md:text-sm"
              >
                J&apos;ai besoin d&apos;un Assistant
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function DesktopHomeTabsNav({ mode }: { mode: HomeTabsMode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const activeTab =
    pathname === "/outils"
      ? "outils"
      : pathname === "/academy"
        ? "academy"
        : pathname === "/"
          ? urlTab ?? "systemes"
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
  const [clientActiveTab, setClientActiveTab] = useState<HomeTabId>(
    activeTab === "outils" || activeTab === "academy" || activeTab === "systemes"
      ? activeTab
      : "systemes"
  );
  const currentActiveTab = mode === "client" ? clientActiveTab : activeTab;

  useEffect(() => {
    if (mode !== "client") return;

    function handleHomeTabSelect(event: Event) {
      const tab = (event as CustomEvent<{ tab?: string }>).detail?.tab;

      if (tab === "systemes" || tab === "outils" || tab === "academy") {
        setClientActiveTab(tab);
      }
    }

    window.addEventListener(HOME_TAB_SELECT_EVENT, handleHomeTabSelect);

    return () => {
      window.removeEventListener(HOME_TAB_SELECT_EVENT, handleHomeTabSelect);
    };
  }, [mode]);

  function selectClientTab(tab: HomeTabId) {
    setClientActiveTab(tab);
    window.history.replaceState(null, "", getTabPath(tab));
    window.dispatchEvent(new CustomEvent(HOME_TAB_SELECT_EVENT, { detail: { tab } }));
  }

  return (
    <div className="hidden items-center justify-center gap-1 rounded-full border border-brand-blue/5 bg-white p-1 shadow-[0_8px_24px_rgba(20,20,20,0.03)] md:absolute md:left-1/2 md:top-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
      {homeTabs.map((tab) => {
        const isActive = currentActiveTab === tab.id;
        const className = `inline-flex min-h-10 items-center justify-center rounded-full px-6 text-sm font-medium transition lg:px-7 ${
          isActive
            ? "bg-brand-blue/[0.07] text-brand-blue"
            : "text-brand-blue/60 hover:bg-neutral-100 hover:text-brand-blue"
        }`;

        if (mode === "client") {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectClientTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
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
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
