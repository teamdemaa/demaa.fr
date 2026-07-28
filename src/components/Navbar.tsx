"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BriefcaseBusiness } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";

const navbarPillClassName =
  "demaa-secondary-button min-h-10 gap-2 whitespace-nowrap px-4 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:px-5 sm:text-sm";

export type NavbarAction =
  | "academy"
  | "system-search"
  | "systems"
  | null;

export function getNavbarAction(
  pathname: string,
  minimal = false,
): NavbarAction {
  const isAcademyPage =
    pathname === "/academie" || pathname.startsWith("/academie/");
  const isSystemDetailPage = pathname.startsWith("/kit-operationnel/");

  if (
    pathname === "/" ||
    pathname === "/kits-operationnels" ||
    isSystemDetailPage
  ) {
    return "academy";
  }

  if (isAcademyPage) {
    return "system-search";
  }

  if (
    !minimal &&
    (pathname === "/annuaire-services" ||
      pathname.startsWith("/annuaire-services/"))
  ) {
    return "systems";
  }

  return null;
}

export default function Navbar({
  minimal = false,
}: {
  minimal?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const navbarAction = getNavbarAction(pathname, minimal);

  return (
    <>
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
            <div className="flex items-center gap-2 sm:gap-3">
              {navbarAction === "academy" ? (
                <Link
                  href="/academie"
                  className={navbarPillClassName}
                >
                  <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Découvrir l’Académie</span>
                </Link>
              ) : navbarAction === "system-search" ? (
                <Link
                  href="/"
                  className={navbarPillClassName}
                >
                  <BriefcaseBusiness
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Trouver mon système</span>
                </Link>
              ) : navbarAction === "systems" ? (
                <Link
                  href="/kits-operationnels"
                  className="demaa-secondary-button hidden min-h-10 items-center justify-center gap-2 px-4 py-2 md:inline-flex"
                  aria-label="Voir les systèmes opérationnels"
                >
                  <BriefcaseBusiness className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Voir les systèmes opérationnels</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
