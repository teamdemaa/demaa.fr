"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { UserRound } from "lucide-react";

type HomeTabId = "systemes" | "outils" | "assistants";
type HomeTabsMode = "links" | "client";

const homeTabs = [
  { id: "systemes", label: "Structurer", href: "/" },
  { id: "outils", label: "S'équiper", href: "/outils" },
  { id: "assistants", label: "Déléguer", href: "/deleguer" },
] as const;

const HOME_TAB_SELECT_EVENT = "demaa:home-tab-select";

function getTabPath(tab: HomeTabId) {
  if (tab === "outils") return "/outils";
  if (tab === "assistants") return "/deleguer";

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
    <>
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

                <div className="flex items-center gap-2">
                  <Link
                    href="/mon-espace"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3 text-dema-forest shadow-[0_8px_24px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:bg-dema-sage/45"
                    aria-label="Accéder à l'espace membre Demaa"
                  >
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    <span className="whitespace-nowrap text-xs font-medium text-brand-blue/72 md:text-sm">
                      Espace membre
                    </span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

function DesktopHomeTabsNav({ mode }: { mode: HomeTabsMode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const activeTab =
    pathname === "/deleguer" || pathname === "/assistants"
      ? "assistants"
      : pathname === "/outils"
      ? "outils"
      : pathname === "/"
        ? urlTab === "outils" || urlTab === "systemes" || urlTab === "assistants"
          ? urlTab
          : "systemes"
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
    activeTab === "outils" || activeTab === "systemes" || activeTab === "assistants"
      ? activeTab
      : "systemes"
  );
  const currentActiveTab = mode === "client" ? clientActiveTab : activeTab;

  useEffect(() => {
    if (mode !== "client") return;

    function handleHomeTabSelect(event: Event) {
      const tab = (event as CustomEvent<{ tab?: string }>).detail?.tab;

      if (tab === "systemes" || tab === "outils" || tab === "assistants") {
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

        if (mode === "client" && tab.id !== "assistants") {
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
