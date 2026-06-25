"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import NavbarCartIndicator from "@/components/NavbarCartIndicator";
import ServiceCartTray from "@/components/ServiceCartTray";
import DemaaWordmark from "@/components/DemaaWordmark";
const WHATSAPP_NUMBER = "33782842435";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function Navbar({
  minimal = false,
}: {
  minimal?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const showDelegationWhatsapp =
    !minimal &&
    (pathname === "/" ||
      pathname === "/annuaire-services" ||
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
              {showDelegationWhatsapp ? (
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-dema-forest/45 bg-dema-paper px-3 py-2 text-sm font-medium text-brand-blue/78 transition hover:border-dema-forest hover:text-dema-forest sm:px-4"
                  aria-label="Des questions ? Contactez-nous sur WhatsApp au +33 7 82 84 24 35"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="hidden lg:inline">Des questions ? Contactez-nous sur WhatsApp</span>
                  <span className="lg:hidden">WhatsApp</span>
                </a>
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
