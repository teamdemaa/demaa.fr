"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Workflow } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";

const navbarTabBaseClassName =
  "inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:min-h-10 sm:gap-2 sm:px-4 sm:text-sm";

const navbarTabActiveClassName =
  "border-[#DCE9DF] bg-[#DCE9DF] text-dema-forest";

const navbarTabInactiveClassName =
  "border-[#DDD8CE] bg-white text-dema-muted hover:border-dema-forest/30 hover:text-dema-forest";

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
          <div className="relative flex items-center justify-between gap-3 py-3 md:min-h-16 md:py-4">
            <Link
              href="/"
              aria-label="Retour à l'accueil"
              className="inline-flex items-center shrink-0 z-50 cursor-pointer"
              onMouseEnter={() => router.prefetch("/")}
              onFocus={() => router.prefetch("/")}
            >
              <DemaaWordmark className="text-[1.4rem] sm:text-[1.7rem]" />
            </Link>
            <div
              aria-label="Navigation principale"
              className="flex shrink-0 items-center gap-1 rounded-full bg-dema-cream/70 p-1 md:absolute md:left-1/2 md:-translate-x-1/2"
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
                  className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
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
                  className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
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
