"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Workflow } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";

const navbarTabBaseClassName =
  "inline-flex min-h-10 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:min-h-11 sm:px-4 sm:text-sm";

const navbarTabActiveClassName =
  "border-dema-forest/20 bg-dema-sage text-dema-forest";

const navbarTabInactiveClassName =
  "border-dema-forest/20 bg-dema-paper text-dema-muted hover:border-dema-forest/35 hover:text-brand-blue";

export type NavbarSection = "systems" | "academy" | null;

export function getNavbarActiveSection(pathname: string): NavbarSection {
  const isAcademyPage =
    pathname === "/academie" ||
    pathname.startsWith("/academie/") ||
    pathname === "/cours" ||
    pathname.startsWith("/cours/");
  const isSystemDetailPage = pathname.startsWith("/kit-operationnel/");

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

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname();
  const activeSection = getNavbarActiveSection(pathname);

  return (
    <>
      <nav
        data-minimal={minimal ? "true" : undefined}
        className="sticky top-0 z-40 border-b border-dema-line/70 bg-dema-cream/92 py-1 backdrop-blur-md"
      >
        <div className="mx-auto w-full px-6 md:px-10 lg:px-24">
          <div className="flex items-center justify-between gap-3 py-3 md:min-h-16 md:py-4">
            <Link
              href="/"
              aria-label="Retour à l'accueil"
              className="inline-flex items-center shrink-0 z-50 cursor-pointer"
            >
              <DemaaWordmark className="text-[1.4rem] sm:text-[1.7rem]" />
            </Link>
            <div
              aria-label="Navigation principale"
              className="flex min-w-0 items-center justify-end gap-2"
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
                <Workflow
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="sm:hidden">Systèmes</span>
                <span className="hidden sm:inline">Voir les systèmes</span>
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
                <BookOpen
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="sm:hidden">Académie</span>
                <span className="hidden sm:inline">Découvrir l’Académie</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
