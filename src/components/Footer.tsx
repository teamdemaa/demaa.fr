"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";

const mainLinks = [
  { label: "Systèmes", href: "/" },
  { label: "Annuaire outils", href: "/annuaire-outils" },
  { label: "Annuaire financement", href: "/annuaire-financement" },
  { label: "Annuaire fournisseurs", href: "/annuaire-fournisseurs" },
];

const contentLinks = [
  { label: "Modèles de documents", href: "/modeles-de-documents" },
  { label: "Cours", href: "/cours" },
  { label: "Annuaire newsletters", href: "/annuaire-newsletters" },
  { label: "Aides & subventions", href: "/aides-et-subventions" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const linkClass = "text-sm text-neutral-500 transition-colors hover:text-neutral-950";

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white py-16 text-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex">
              <DemaaWordmark
                className="text-[2.55rem]"
                colorClassName="text-brand-blue/56"
              />
            </Link>
            <p className="demaa-section-title max-w-xs text-lg leading-snug text-neutral-500">
              Structurez votre entreprise pour qu’elle avance avec plus d’autonomie, même lorsque vous n’êtes pas là.
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
              <li><Link href="/conditions-d-utilisation" className={linkClass}>Conditions d&apos;utilisation</Link></li>
              <li><Link href="/politique-de-confidentialite" className={linkClass}>Politique de confidentialité</Link></li>
              <li><Link href="/politique-de-cookies" className={linkClass}>Cookies</Link></li>
              <li><Link href="/cgv" className={linkClass}>CGV</Link></li>
            </ul>
          </div>
          
        </div>

        <div className="mt-16 border-t border-neutral-200 pt-8">
          <div className="flex justify-center">
            <Link
              href="/mon-espace"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue/56 transition hover:border-dema-forest/24 hover:text-brand-blue/72"
              aria-label="Espace membre"
            >
              <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Mon espace</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between text-xs text-gray-500 sm:flex-row">
            <p>© {currentYear} Demaa. Tous droits réservés.</p>
            <p className="mt-4 sm:mt-0">Structure simplifiée pour une navigation plus claire.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
