import Link from "next/link";
import DemaaWordmark from "./DemaaWordmark";
export default function EnglishStudioFooter() {
  return <footer className="mt-auto border-t border-dema-line bg-dema-cream px-5 py-12 sm:px-8 lg:px-16">
    <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
      <div><Link href="/en/studio" aria-label="DEMAA, back to the Studio"><DemaaWordmark className="text-2xl" /></Link><p className="mt-4 max-w-xs text-sm leading-6 text-dema-muted">Businesses built with care, patience and purpose.</p></div>
      <div><h2 className="text-sm font-medium">Explore</h2><ul className="mt-4 space-y-3 text-sm text-dema-muted">{[["Studio", "/en/studio"], ["Our ventures", "/en/ventures"], ["Our team", "/en/team"], ["Build with us", "/en/studio/build-with-us"]].map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></div>
      <div><h2 className="text-sm font-medium">Insights</h2><Link href="/en/insights" className="mt-4 block text-sm text-dema-muted">What we’re learning</Link></div>
      <div><h2 className="text-sm font-medium">Contact</h2><a href="mailto:team@demaa.fr" className="mt-4 block text-sm text-dema-muted">team@demaa.fr</a></div>
    </div>
    <div className="mx-auto mt-10 flex max-w-7xl flex-wrap gap-x-6 gap-y-3 border-t border-dema-line pt-6 text-xs text-dema-muted">
      <span>© {new Date().getFullYear()} DEMAA. All rights reserved.</span>
      <Link href="/mentions-legales" hrefLang="fr">Legal notice (French)</Link>
      <Link href="/politique-de-confidentialite" hrefLang="fr">Privacy policy (French)</Link>
      <Link href="/politique-de-cookies" hrefLang="fr">Cookie policy (French)</Link>
      <Link href="/conditions-d-utilisation" hrefLang="fr">Terms of use (French)</Link>
    </div>
  </footer>;
}
