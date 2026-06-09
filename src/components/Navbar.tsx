"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Boxes, HandHelping, Handshake, type LucideIcon } from "lucide-react";

type HomeTabId = "systemes" | "assistants" | "developper";
type HomeTabsMode = "links" | "client";

const homeTabs: readonly {
  id: HomeTabId;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { id: "systemes", label: "Structurer", href: "/", icon: Boxes },
  { id: "assistants", label: "Déléguer", href: "/deleguer", icon: HandHelping },
  { id: "developper", label: "Développer", href: "/developper", icon: Handshake },
];

const HOME_TAB_SELECT_EVENT = "demaa:home-tab-select";

function getTabPath(tab: HomeTabId) {
  if (tab === "assistants") return "/deleguer";
  if (tab === "developper") return "/developper";

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
        <div className="relative flex justify-center gap-4 py-3 md:justify-between md:py-4 items-center">
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="demaa-brand-logo inline-flex items-center text-xl tracking-tight text-brand-blue shrink-0 z-50 cursor-pointer sm:text-2xl"
          >
            Demaa
          </Link>

          {!minimal && (
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
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const activeTab =
    pathname === "/developper"
      ? "developper"
      : pathname === "/deleguer" || pathname === "/assistants"
      ? "assistants"
      : pathname === "/"
        ? urlTab === "systemes" || urlTab === "assistants" || urlTab === "developper"
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
    activeTab === "systemes" || activeTab === "assistants" || activeTab === "developper"
      ? activeTab
      : "systemes"
  );
  const currentActiveTab = mode === "client" ? clientActiveTab : activeTab;

  useEffect(() => {
    if (mode !== "client") return;

    function handleHomeTabSelect(event: Event) {
      const tab = (event as CustomEvent<{ tab?: string }>).detail?.tab;

      if (tab === "systemes" || tab === "assistants" || tab === "developper") {
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
        const Icon = tab.icon;
        const isActive = currentActiveTab === tab.id;
        const className = `demaa-nav-item inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-base transition lg:px-6 ${
          isActive
            ? "bg-dema-forest font-semibold text-white shadow-[0_6px_16px_rgba(49,95,70,0.14)]"
            : "font-medium text-brand-blue/56 hover:bg-dema-sage/70 hover:text-brand-blue/72"
        }`;

        if (mode === "client" && tab.id === "systemes") {
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
