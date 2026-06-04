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
    <nav className="sticky top-0 z-40 border-b border-dema-line/70 bg-dema-cream/92 py-1 backdrop-blur-md">
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
                className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full border border-dema-forest bg-dema-forest px-4 text-xs font-light text-dema-paper/90 shadow-[0_6px_16px_rgba(49,95,70,0.14)] transition-colors hover:border-[#284f3a] hover:bg-[#284f3a] hover:text-dema-paper sm:px-5 md:border-dema-forest/18 md:bg-dema-paper md:text-sm md:text-dema-forest md:shadow-none md:hover:border-dema-forest/32 md:hover:bg-dema-sage/60 md:hover:text-dema-forest"
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
    <div className="hidden items-center justify-center gap-1 rounded-full border border-dema-line/75 bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.04)] md:absolute md:left-1/2 md:top-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
      {homeTabs.map((tab) => {
        const isActive = currentActiveTab === tab.id;
        const className = `inline-flex min-h-10 items-center justify-center rounded-full px-6 text-sm transition lg:px-7 ${
          isActive
            ? "bg-dema-forest font-semibold text-white shadow-[0_6px_16px_rgba(49,95,70,0.14)]"
            : "font-light text-brand-blue/56 hover:bg-dema-sage/70 hover:text-brand-blue/72"
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
