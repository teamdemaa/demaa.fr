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
  const showSystemNavigation =
    pathname === "/systemes-operationnels" ||
    pathname.startsWith("/systemes-operationnels/");
  const showAcademyNavigation =
    pathname === "/academie" || pathname.startsWith("/academie/");
  const showServicesNavigation = pathname === "/" || pathname === "/services";

  const secondaryLink = showAcademyNavigation
    ? {
        href: "/systemes-operationnels",
        label: "Voir les systèmes opérationnels",
        mobileLabel: "Systèmes",
        icon: BriefcaseBusiness,
      }
    : {
        href: "/academie",
        label: "Découvrir l’Académie",
        mobileLabel: "Académie",
        icon: BookOpen,
      };

  const primaryLink = showSystemNavigation
    ? { href: "/", label: "Voir les services", mobileLabel: "Services" }
    : showServicesNavigation
      ? {
          href: "/systemes-operationnels",
          label: "Voir les systèmes opérationnels",
          mobileLabel: "Systèmes",
        }
      : showAcademyNavigation
        ? { href: "/", label: "Voir les services", mobileLabel: "Services" }
        : null;

  const showCrossNavigation =
    !minimal &&
    (showSystemNavigation || showAcademyNavigation || showServicesNavigation);
  const SecondaryIcon = secondaryLink.icon;
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
              {showCrossNavigation && primaryLink ? (
                <>
                  <Link
                    href={secondaryLink.href}
                    className="demaa-secondary-button min-h-10 gap-2 px-3 text-xs sm:px-4 sm:text-sm"
                    aria-label={secondaryLink.label}
                  >
                    <SecondaryIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">{secondaryLink.label}</span>
                    <span className="sm:hidden">{secondaryLink.mobileLabel}</span>
                  </Link>
                  <Link
                    href={primaryLink.href}
                    className="demaa-primary-button min-h-10 px-3 text-xs sm:px-5 sm:text-sm"
                  >
                    <span className="hidden sm:inline">{primaryLink.label}</span>
                    <span className="sm:hidden">{primaryLink.mobileLabel}</span>
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
