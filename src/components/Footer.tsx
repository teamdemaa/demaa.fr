"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HOME_DISCOVERY_UNLOCKED_EVENT,
  readHomeDiscoveryState,
} from "@/lib/home-discovery";
import { visiblePrimaryNavigationItems } from "@/lib/navigation";

const mainLinks = [
  ...visiblePrimaryNavigationItems.map(({ label, href }) => ({ label, href })),
  { label: "Annuaire systèmes", href: "/" },
  { label: "Annuaire outils", href: "/annuaire-outils" },
  { label: "Annuaire financement", href: "/annuaire-financement" },
  { label: "Annuaire services", href: "/annuaire-services" },
  { label: "Annuaire fournisseurs", href: "/annuaire-fournisseurs" },
];

const contentLinks = [
  { label: "Ressources", href: "/ressources" },
  { label: "Cours", href: "/cours" },
];

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const linkClass = "text-sm text-neutral-500 transition-colors hover:text-neutral-950";
  const [isHomeVisible, setIsHomeVisible] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const syncTimer = window.setTimeout(() => {
      setIsHomeVisible(Boolean(readHomeDiscoveryState()?.seen));
    }, 0);

    function handleHomeDiscoveryUnlocked() {
      setIsHomeVisible(true);
    }

    window.addEventListener(HOME_DISCOVERY_UNLOCKED_EVENT, handleHomeDiscoveryUnlocked);

    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener(HOME_DISCOVERY_UNLOCKED_EVENT, handleHomeDiscoveryUnlocked);
    };
  }, [pathname]);

  const isVisible = pathname !== "/" || isHomeVisible;

  if (!isVisible) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white py-16 text-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="demaa-brand-logo block text-3xl tracking-tight text-neutral-950">
              Demaa
            </Link>
            <p className="demaa-section-title max-w-xs text-lg leading-snug text-neutral-500">
              Utiliser les systèmes à votre avantage pour alléger la charge, libérer du temps et avancer avec plus de sérénité.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Demaa
            </h3>
            <ul className="space-y-3">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="mailto:team@demaa.fr" className={linkClass}>Nous contacter</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Contenus
            </h3>
            <ul className="space-y-3">
              {contentLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Légal
            </h3>
            <ul className="space-y-3">
              <li><Link href="/mentions-legales" className={linkClass}>Mentions légales</Link></li>
              <li><Link href="/politique-de-confidentialite" className={linkClass}>Politique de confidentialité</Link></li>
              <li><Link href="/politique-de-cookies" className={linkClass}>Cookies</Link></li>
              <li><Link href="/cgv" className={linkClass}>CGV</Link></li>
            </ul>
          </div>
          
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {currentYear} Demaa. Tous droits réservés.</p>
          <p className="mt-4 sm:mt-0">Structure simplifiée pour une navigation plus claire.</p>
        </div>
      </div>
    </footer>
  );
}
