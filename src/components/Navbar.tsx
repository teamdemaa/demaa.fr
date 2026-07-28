"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BriefcaseBusiness } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";

export default function Navbar({
  minimal = false,
}: {
  minimal?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAcademyPage =
    pathname === "/academie" || pathname.startsWith("/academie/");
  const isSystemDetailPage = pathname.startsWith("/kit-operationnel/");
  const showSystemSearchCta =
    pathname === "/kits-operationnels" || isAcademyPage;
  const showSystemsCta =
    !minimal &&
    (pathname === "/annuaire-services" ||
      pathname.startsWith("/annuaire-services/"));
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
              {isSystemDetailPage ? (
                <Link
                  href="/academie"
                  className="demaa-secondary-button min-h-10 gap-2 px-4 text-xs sm:px-5 sm:text-sm"
                >
                  <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Découvrir l’Académie</span>
                </Link>
              ) : showSystemSearchCta ? (
                <Link
                  href="/"
                  className="demaa-primary-button min-h-10 px-4 text-xs sm:px-5 sm:text-sm"
                >
                  Trouver mon système
                </Link>
              ) : showSystemsCta ? (
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
