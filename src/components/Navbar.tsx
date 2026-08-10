"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";

export default function Navbar({
  anonymousLanding = false,
  minimal = false,
}: {
  anonymousLanding?: boolean;
  minimal?: boolean;
}) {
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
              className="absolute left-1/2 top-1/2 hidden w-[min(40vw,36rem)] -translate-x-1/2 -translate-y-1/2 empty:hidden xl:block"
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
        className="fixed inset-x-0 bottom-0 z-50 border-t border-dema-line/70 bg-dema-cream/94 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_28px_rgba(23,35,29,0.06)] backdrop-blur-md empty:hidden xl:hidden"
      />
    </>
  );
}
