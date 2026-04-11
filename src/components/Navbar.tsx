"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SystemSetupModal from "@/components/SystemSetupModal";

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname();
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-brand-coral/10 bg-[#FFF9F8] py-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:pl-14 lg:pr-28">
          <div className="flex justify-between py-3 md:py-4 items-center">
            <Link
              href="/"
              aria-label="Retour à l'accueil"
              className="inline-flex items-center text-xl sm:text-2xl font-medium tracking-tight text-brand-blue shrink-0 z-50 cursor-pointer"
              onClick={(event) => {
                if (pathname === "/") {
                  event.preventDefault();
                  window.location.assign("/");
                }
              }}
            >
              Demaa<span className="text-brand-coral">.</span>
            </Link>

            {!minimal && (
              <div className="flex items-center gap-3 md:gap-5">
                <Link
                  href="/outils-gratuits"
                  className="text-[13px] md:text-[15px] text-brand-blue hover:text-brand-coral transition-all duration-300 font-medium whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Outils Gratuits</span>
                  <span className="sm:hidden">Outils Gratuits</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsSystemModalOpen(true)}
                  className="inline-flex items-center rounded-full border border-brand-blue/12 bg-transparent px-5 py-3 text-xs md:text-sm font-medium text-brand-blue transition-colors hover:border-brand-coral/25 hover:text-brand-coral whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Demander un audit Systèmes</span>
                  <span className="sm:hidden">Audit Systèmes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <SystemSetupModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
      />
    </>
  );
}
