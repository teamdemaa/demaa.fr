import Link from "next/link";

const resourcesLinks = [
  { label: "Le Kit du Dirigeant Organisé", href: "/outils/kit-du-dirigeant-organise" },
  { label: "L'annuaire des logiciels", href: "/annuaire-logiciels" },
  { label: "Outils Gratuits", href: "/outils-gratuits" },
  { label: "Newsletter", href: "/newsletter" },
];

const sectorLinks = [
  { label: "Logiciels Services & conseil", href: "/annuaire-logiciels?secteur=Services%20%26%20conseil" },
  { label: "Logiciels Commerce local", href: "/annuaire-logiciels?secteur=Commerce%20local" },
  { label: "Logiciels Restaurant", href: "/annuaire-logiciels?secteur=Restauration" },
  { label: "Logiciels BTP", href: "/annuaire-logiciels?secteur=Artisanat%20%26%20BTP" },
  { label: "Logiciels Immobilier", href: "/annuaire-logiciels?secteur=Immobilier" },
  { label: "Logiciels Santé & bien-être", href: "/annuaire-logiciels?secteur=Sant%C3%A9%20%26%20bien-%C3%AAtre" },
];

const categoryLinks = [
  { label: "Logiciels CRM & ventes", href: "/annuaire-logiciels?categorie=CRM%20%26%20ventes" },
  { label: "Logiciels Marketing", href: "/annuaire-logiciels?categorie=Marketing%20%26%20visibilit%C3%A9" },
  { label: "Logiciels Automatisation", href: "/annuaire-logiciels?categorie=Automatisation" },
  { label: "Logiciels Finance & paiement", href: "/annuaire-logiciels?categorie=Finance%20%26%20paiement" },
  { label: "Logiciels métier", href: "/annuaire-logiciels?categorie=Outils%20m%C3%A9tier" },
  { label: "Logiciels IA bureautique", href: "/annuaire-logiciels?categorie=IA%20bureautique" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const linkClass = "text-sm text-gray-400 transition-colors hover:text-brand-coral";

  return (
    <footer className="bg-brand-blue text-white py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-3xl font-medium tracking-tight text-white block">
              Demaa<span className="text-brand-coral">.</span>
            </Link>
            <p className="demaa-section-title max-w-xs text-lg leading-snug text-gray-400">
              On vous aide à enlever les tâches qui vous ralentissent, pour que votre activité avance plus simplement.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className={linkClass}>Accueil</Link>
              </li>
              <li>
                <Link href="/#pricing" className={linkClass}>Déléguer mes automatisations</Link>
              </li>
              <li>
                <Link href="mailto:team@demaa.fr" className={linkClass}>Nous contacter</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Ressources
            </h3>
            <ul className="space-y-3">
              {resourcesLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">
              Outils par secteur d&apos;activité
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
              Outils par catégorie
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

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {currentYear} Demaa. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/politique-de-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="/politique-de-cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
