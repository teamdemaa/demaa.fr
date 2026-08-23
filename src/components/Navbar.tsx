"use client";

import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import CustomerLogoutButton from "@/components/CustomerLogoutButton";
import DemaaWordmark from "@/components/DemaaWordmark";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { getLocalizedActionPlanPath } from "@/lib/action-plan-localization";

export default function Navbar({
  adminControls = false,
  anonymousLanding = false,
  isAuthenticated = false,
  minimal = false,
  localeCode = "fr",
}: {
  adminControls?: boolean;
  anonymousLanding?: boolean;
  isAuthenticated?: boolean;
  minimal?: boolean;
  localeCode?: InterfaceLocaleCode;
}) {
  const accountAccessClassName =
    "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-dema-forest/15 bg-dema-paper px-3 text-xs font-medium text-dema-forest transition hover:border-dema-forest/28 hover:bg-dema-sage/45 sm:min-h-11 sm:gap-2 sm:px-4 sm:text-sm";
  const connectionLinkClassName =
    "inline-flex min-h-10 shrink-0 items-center px-1 text-xs font-medium text-dema-forest transition hover:text-brand-blue focus-visible:outline-none focus-visible:underline sm:min-h-11 sm:text-sm";

  return (
    <>
      <nav
        data-minimal={minimal ? "true" : undefined}
        className="sticky top-0 z-40 bg-dema-cream/92 py-1 backdrop-blur-md"
      >
        <div className="mx-auto w-full px-3 sm:px-6 md:px-10 lg:px-24">
          <div className="relative flex items-center justify-between py-3 md:min-h-16 md:py-4">
            <Link
              href={localeCode === "en" ? "/en" : "/"}
              aria-label={localeCode === "en" ? "Back to home" : "Retour à l'accueil"}
              className="z-50 inline-flex shrink-0 cursor-pointer items-center"
            >
              <DemaaWordmark className="text-[1.2rem] sm:text-[1.7rem]" />
            </Link>
            <div
              id="action-plan-navbar-desktop"
              className="absolute left-1/2 top-1/2 hidden w-[min(40vw,36rem)] -translate-x-1/2 -translate-y-1/2 empty:hidden xl:block"
            />
            {adminControls ? (
              <AdminLogoutButton />
            ) : anonymousLanding ? (
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <div
                  id="action-plan-navbar-specialist"
                  className="shrink-0 empty:hidden"
                />
                {isAuthenticated ? (
                  <details className="group relative">
                    <summary
                      aria-label={localeCode === "en" ? "Open account menu" : "Ouvrir le menu du compte"}
                      className={`${accountAccessClassName} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
                      title="Compte"
                    >
                      <CircleUserRound
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="demaa-popover-shadow absolute right-0 top-full z-50 mt-2 min-w-40 rounded-2xl border border-dema-line bg-dema-paper px-3 py-2">
                      <Link
                        href={getLocalizedActionPlanPath(localeCode, "/plans")}
                        className="block whitespace-nowrap px-2 py-1.5 text-left text-sm text-brand-blue transition hover:text-dema-forest"
                      >
                        {localeCode === "en" ? "My plans" : "Mes plans"}
                      </Link>
                      <CustomerLogoutButton localeCode={localeCode} />
                    </div>
                  </details>
                ) : (
                  <Link
                    href={`/connexion?returnTo=${encodeURIComponent(getLocalizedActionPlanPath(localeCode, "/plans/latest"))}`}
                    className={connectionLinkClassName}
                  >
                    <span>{localeCode === "en" ? "Sign in" : "Connexion"}</span>
                  </Link>
                )}
              </div>
            ) : minimal ? (
              <div
                id="action-plan-navbar-specialist"
                className="shrink-0 empty:hidden"
              />
            ) : null}
          </div>
        </div>
      </nav>
      <div
        id="action-plan-navbar-mobile"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-dema-line/70 bg-dema-cream/94 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_28px_rgba(23,35,29,0.06)] backdrop-blur-md empty:hidden xl:hidden"
      />
    </>
  );
}
