"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const homeTabs = [
  { id: "systemes", label: "Systèmes", href: "/" },
  { id: "outils", label: "Outils", href: "/outils" },
  { id: "academy", label: "Academy", href: "/academy" },
] as const;

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
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
              <Suspense fallback={<DesktopHomeTabsNavStatic />}>
                <DesktopHomeTabsNav />
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

function DesktopHomeTabsNav() {
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

  return <DesktopHomeTabsNavStatic activeTab={activeTab} />;
}

function DesktopHomeTabsNavStatic({
  activeTab,
}: {
  activeTab?: string;
}) {
  return (
    <div className="hidden items-center justify-center gap-1 rounded-full border border-brand-blue/5 bg-white p-1 shadow-[0_8px_24px_rgba(20,20,20,0.03)] md:absolute md:left-1/2 md:top-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
      {homeTabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`inline-flex min-h-10 items-center justify-center rounded-full px-6 text-sm font-medium transition lg:px-7 ${
              isActive
                ? "bg-brand-blue/[0.07] text-brand-blue"
                : "text-brand-blue/60 hover:bg-neutral-100 hover:text-brand-blue"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
