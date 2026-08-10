"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogIn, Workflow } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";

const navbarTabBaseClassName =
  "inline-flex min-h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 py-2.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:px-4 sm:text-sm";

const navbarTabActiveClassName =
  "bg-dema-sage text-dema-forest";

const navbarTabInactiveClassName =
  "text-dema-muted hover:bg-dema-sage/55 hover:text-brand-blue";

export type NavbarSection = "systems" | "academy" | null;

export function getNavbarActiveSection(pathname: string): NavbarSection {
  const isAcademyPage =
    pathname === "/academie" ||
    pathname.startsWith("/academie/") ||
    pathname === "/cours" ||
    pathname.startsWith("/cours/");
  const isSystemDetailPage = pathname.startsWith("/systemes/");

  if (
    pathname === "/systemes" ||
    pathname === "/kits-operationnels" ||
    isSystemDetailPage
  ) {
    return "systems";
  }

  if (isAcademyPage) {
    return "academy";
  }

  return null;
}

export default function Navbar({
  anonymousLanding = false,
  hideSectionSelector = false,
  minimal = false,
}: {
  anonymousLanding?: boolean;
  hideSectionSelector?: boolean;
  minimal?: boolean;
}) {
  const pathname = usePathname();
  const activeSection = getNavbarActiveSection(pathname);

  return (
    <>
      <nav
        data-minimal={minimal ? "true" : undefined}
        className="sticky top-0 z-40 border-b border-dema-line/70 bg-dema-cream/92 py-1 backdrop-blur-md"
      >
        <div className="mx-auto w-full px-3 sm:px-6 md:px-10 lg:px-24">
          <div className="relative flex items-center justify-between py-3 md:min-h-16 md:py-4">
            <Link
              href="/"
              aria-label="Retour à l'accueil"
              className="z-50 inline-flex shrink-0 cursor-pointer items-center"
            >
              <DemaaWordmark className="text-[1.2rem] sm:text-[1.7rem]" />
            </Link>
            <div
              id="action-plan-navbar-desktop"
              className="absolute left-1/2 top-1/2 hidden w-[min(52vw,48rem)] -translate-x-1/2 -translate-y-1/2 empty:hidden lg:block"
            />
            {anonymousLanding ? (
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <div
                  id="action-plan-navbar-save"
                  className="shrink-0 empty:hidden"
                />
                <Link
                  href="/mon-espace"
                  className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-dema-forest/15 bg-dema-paper px-3 text-xs font-medium text-dema-forest transition hover:border-dema-forest/28 hover:bg-dema-sage/45 sm:min-h-11 sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <LogIn className="hidden h-4 w-4 sm:block" aria-hidden="true" />
                  <span>Se connecter</span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
      <div
        id="action-plan-navbar-mobile"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-dema-line/70 bg-dema-cream/94 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_28px_rgba(23,35,29,0.06)] backdrop-blur-md empty:hidden lg:hidden"
      />
      {!anonymousLanding && !hideSectionSelector ? <div className="bg-dema-cream px-[0.84rem] pb-3 pt-3 md:px-[1.4rem] md:pb-4 md:pt-4 lg:px-[3.36rem]">
        <div
          aria-label="Navigation principale"
          data-navbar-section-selector
          className="mx-auto grid w-full max-w-[55.2rem] grid-cols-2 gap-1 rounded-full border border-dema-line bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.035)]"
        >
          <Link
            href="/systemes"
            aria-current={activeSection === "systems" ? "page" : undefined}
            className={`${navbarTabBaseClassName} ${
              activeSection === "systems"
                ? navbarTabActiveClassName
                : navbarTabInactiveClassName
            }`}
          >
            <Workflow className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Système métier</span>
          </Link>
          <Link
            href="/academie"
            aria-current={activeSection === "academy" ? "page" : undefined}
            className={`${navbarTabBaseClassName} ${
              activeSection === "academy"
                ? navbarTabActiveClassName
                : navbarTabInactiveClassName
            }`}
          >
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Académie</span>
          </Link>
        </div>
      </div> : null}
    </>
  );
}
