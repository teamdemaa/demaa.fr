"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Workflow } from "lucide-react";
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
  const isSystemDetailPage = pathname.startsWith("/kit-operationnel/");

  if (
    pathname === "/" ||
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
  const router = useRouter();
  const pathname = usePathname();
  const activeSection = getNavbarActiveSection(pathname);

  return (
    <>
      <nav
        data-minimal={minimal ? "true" : undefined}
        className="sticky top-0 z-40 border-b border-dema-line/70 bg-dema-cream/92 py-1 backdrop-blur-md"
      >
        <div className="mx-auto w-full px-6 md:px-10 lg:px-24">
          <div className="flex items-center py-3 md:min-h-16 md:py-4">
            <Link
              href="/"
              aria-label="Retour à l'accueil"
              className="inline-flex items-center shrink-0 z-50 cursor-pointer"
              onMouseEnter={() => router.prefetch("/")}
              onFocus={() => router.prefetch("/")}
            >
              <DemaaWordmark className="text-[1.4rem] sm:text-[1.7rem]" />
            </Link>
          </div>
          <div className="pb-3 pt-1 md:pb-4 md:pt-0">
            <div
              aria-label="Navigation principale"
              data-navbar-section-selector
              className="mx-auto grid w-full max-w-[55.2rem] grid-cols-2 gap-1 rounded-full border border-dema-line bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.035)]"
            >
              <Link
                href="/"
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
                <span>Systèmes</span>
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
                <span>Academy</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
