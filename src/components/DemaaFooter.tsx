import Link from "next/link";
import DemaaWordmark from "@/components/DemaaWordmark";
import { DEMAA_DEFAULT_PUBLIC_PATH, DEMAA_PUBLIC_NAVIGATION, DEMAA_RESOURCE_NAVIGATION, DEMAA_DIRECTORY_NAVIGATION } from "@/lib/demaa-public-routes";

const exploreLinks = DEMAA_PUBLIC_NAVIGATION.map(({ label, href }) => ({ label, href }));

const usefulLinks = [
  { label: "Nous contacter", href: "mailto:team@demaa.fr" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Conditions d’utilisation", href: "/conditions-d-utilisation" },
  { label: "Confidentialité", href: "/politique-de-confidentialite" },
  { label: "Cookies", href: "/politique-de-cookies" },
];

const linkClass = "text-sm text-dema-muted transition-colors hover:text-brand-blue";

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DemaaFooter() {
  return (
    <footer data-site-footer data-footer-variant="demaa" className="mt-auto border-t border-dema-line bg-dema-paper py-16 text-brand-blue">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <Link href={DEMAA_DEFAULT_PUBLIC_PATH} className="inline-flex" aria-label="Demaa, aller au Studio">
              <DemaaWordmark className="text-[2.55rem]" colorClassName="text-brand-blue" />
            </Link>
            <p className="demaa-section-title max-w-xs text-lg leading-snug text-dema-muted">
              Des entreprises construites avec méthode, patience et intention.
            </p>
          </div>
          <FooterLinks title="Explorer" links={exploreLinks} />
          <FooterLinks title="Ressources" links={DEMAA_RESOURCE_NAVIGATION} />
          <FooterLinks title="Annuaires" links={DEMAA_DIRECTORY_NAVIGATION} />
          <div className="space-y-8"><FooterLinks title="Contact" links={usefulLinks} /><FooterLinks title="Légal" links={legalLinks} /></div>
        </div>
        <div className="mt-16 border-t border-dema-line pt-8 text-xs text-dema-muted">
          <p>© {new Date().getFullYear()} Demaa. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
