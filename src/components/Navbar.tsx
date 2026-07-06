"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";
import NavbarCartIndicator from "@/components/NavbarCartIndicator";
import ServiceCartTray from "@/components/ServiceCartTray";
import DemaaWordmark from "@/components/DemaaWordmark";

export default function Navbar({
  minimal = false,
}: {
  minimal?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const showSystemsCta =
    !minimal &&
    (pathname === "/" ||
      pathname === "/annuaire-services" ||
      pathname.startsWith("/annuaire-services/"));
  const showDelegationCta = !minimal && pathname.startsWith("/systemes");

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
              {showSystemsCta ? (
                <Link
                  href="/systemes"
                  className="demaa-secondary-button inline-flex min-h-10 items-center justify-center gap-2 px-4 py-2 sm:px-4"
                  aria-label="Voir les bons systèmes"
                >
                  <BriefcaseBusiness className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Voir les bons systèmes</span>
                </Link>
              ) : null}
              {showDelegationCta ? (
                <Link
                  href="/"
                  className="demaa-secondary-button inline-flex min-h-10 items-center justify-center px-4 py-2 sm:px-4"
                  aria-label="Structurez votre entreprise"
                >
                  <span>Structurez votre entreprise</span>
                </Link>
              ) : null}
              <NavbarCartIndicator />
            </div>
          </div>
        </div>
      </nav>
      <ServiceCartTray />
    </>
  );
}
