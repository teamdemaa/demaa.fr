import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue text-white py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-3xl font-bold tracking-tight text-white block">
              Demaa<span className="text-brand-coral">.</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              L'annuaire de services et outils nouvelle génération. Ultra-minimaliste, fiable et pensé pour propulser votre entreprise.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <span className="w-8 h-1 bg-brand-coral rounded-full mr-3"></span> Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Accueil</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Conseils & Astuces</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Nous contacter</Link>
              </li>
            </ul>
          </div>

          {/* Tools Column 1 */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <span className="w-8 h-1 bg-brand-coral rounded-full mr-3"></span> Outils Gratuits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <Link href="/outils/generation-de-document" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Génération de document</Link>
              <Link href="/outils/generation-de-qr-code-pour-card" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">QR code pour card</Link>
              <Link href="/outils/generation-de-tampon" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Génération de Tampon</Link>
              <Link href="/outils/qr-code-pour-avis-client" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">QR code pour avis client</Link>
              <Link href="/outils/creation-de-fiche-google-optimisee" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Création fiche Google optimisée</Link>
              <Link href="/outils/signature-email-pro" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Signature email pro</Link>
              <Link href="/outils/qr-code-commande-rapide" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">QR code commande rapide</Link>
              <Link href="/outils/signez-un-document-electroniquement" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Signature électronique</Link>
              <Link href="/outils/generation-de-menu-avec-qr-code" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Génération menu avec QR code</Link>
              <Link href="/outils/generation-de-qr-code" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Génération de QR code standard</Link>
            </div>
          </div>
          
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {currentYear} Demaa. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="#" className="hover:text-white transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
