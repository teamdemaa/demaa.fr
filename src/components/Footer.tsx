import Link from "next/link";
import { UserRound } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";
import { isGuestProductEnabled } from "@/lib/guest-action-plan-security.server";

const hubLinks = [
  { label: "Studio", href: "/studio" },
  { label: "Académie", href: "/academie" },
  { label: "Solutions", href: "/solutions" },
  { label: "Spécialistes", href: "/specialistes" },
];

const resourceLinks = [
  { label: "Guides pratiques", href: "/academie#guides" },
  { label: "Modèles associés", href: "/modeles" },
];

const demaaLinks = [
  { label: "Nous contacter", href: "mailto:team@demaa.fr" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const linkClass = "text-sm text-neutral-500 transition-colors hover:text-neutral-950";
  const showCustomerLogin = !isGuestProductEnabled();

  return (
    <footer data-site-footer className="mt-auto border-t border-neutral-200 bg-white py-16 text-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex">
              <DemaaWordmark
                className="text-[2.55rem]"
                colorClassName="text-brand-blue/56"
              />
            </Link>
            <p className="demaa-section-title max-w-xs text-lg leading-snug text-neutral-500">
              Des ressources utiles pour faire fonctionner son entreprise.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Explorer Demaa
            </h3>
            <ul className="space-y-3">
              {hubLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Ressources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Demaa
            </h3>
            <ul className="space-y-3">
              {demaaLinks.map((link) => (
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
          {showCustomerLogin ? (
            <div className="flex justify-center">
              <Link
                href="/connexion"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue/56 transition hover:border-dema-forest/24 hover:text-brand-blue/72"
                aria-label="Se connecter"
              >
                <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Se connecter</span>
              </Link>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col items-center justify-between text-xs text-gray-500 sm:flex-row">
            <p>© {currentYear} Demaa. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
