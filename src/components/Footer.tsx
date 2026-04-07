import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue text-white py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-3xl font-bold tracking-tight text-white block">
              Demaa<span className="text-brand-coral">.</span>
            </Link>
            <p className="demaa-section-title max-w-xs text-lg leading-snug text-gray-400">
              On vous aide à enlever les tâches qui vous ralentissent, pour que votre activité avance plus simplement.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Accueil</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-brand-coral transition-colors text-sm">Nous contacter</Link>
              </li>
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
