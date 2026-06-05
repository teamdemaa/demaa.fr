import Link from "next/link";

const mainLinks = [
  { label: "Systèmes", href: "/" },
  { label: "Kit du dirigeant", href: "/outils" },
  { label: "Assistants", href: "/assistants" },
  { label: "Annuaire logiciels", href: "/annuaire-logiciel" },
];

const kitLinks = [
  { label: "Outils du quotidien", href: "/outils#outils-du-quotidien" },
  { label: "Ressources", href: "/outils#ressources" },
  { label: "Newsletter", href: "/newsletter" },
];

const sectorLinks = [
  { label: "Logiciels Services & conseil", href: "/annuaire-logiciel?secteur=Services%20%26%20conseil" },
  { label: "Logiciels Commerce local", href: "/annuaire-logiciel?secteur=Commerce%20local" },
  { label: "Logiciels Restaurant", href: "/annuaire-logiciel?secteur=Restauration" },
  { label: "Logiciels BTP", href: "/annuaire-logiciel?secteur=Artisanat%20%26%20BTP" },
  { label: "Logiciels Immobilier", href: "/annuaire-logiciel?secteur=Immobilier" },
  { label: "Logiciels Santé & bien-être", href: "/annuaire-logiciel?secteur=Sant%C3%A9%20%26%20bien-%C3%AAtre" },
];

const categoryLinks = [
  { label: "Logiciels CRM & ventes", href: "/annuaire-logiciel?categorie=CRM%20%26%20ventes" },
  { label: "Logiciels Marketing", href: "/annuaire-logiciel?categorie=Marketing%20%26%20visibilit%C3%A9" },
  { label: "Logiciels Automatisation", href: "/annuaire-logiciel?categorie=Automatisation" },
  { label: "Logiciels Finance & paiement", href: "/annuaire-logiciel?categorie=Finance%20%26%20paiement" },
  { label: "Logiciels métier", href: "/annuaire-logiciel?categorie=Outils%20m%C3%A9tier" },
  { label: "Logiciels IA bureautique", href: "/annuaire-logiciel?categorie=IA%20bureautique" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const linkClass = "text-sm text-neutral-500 transition-colors hover:text-neutral-950";
  const legalLinkClass = "transition-colors hover:text-neutral-950";

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white py-16 text-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          
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
              Kit du dirigeant
            </h3>
            <ul className="space-y-3">
              {kitLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Logiciels par secteur
            </h3>
            <ul className="space-y-3">
              {sectorLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Logiciels par catégorie
            </h3>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {currentYear} Demaa. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="/mentions-legales" className={legalLinkClass}>Mentions légales</Link>
            <Link href="/politique-de-confidentialite" className={legalLinkClass}>Politique de confidentialité</Link>
            <Link href="/politique-de-cookies" className={legalLinkClass}>Cookies</Link>
            <Link href="/cgv" className={legalLinkClass}>CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
