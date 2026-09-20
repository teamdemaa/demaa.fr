import Link from "next/link";

const journeyLinks = [
  { label: "Reprendre", href: "/" },
  { label: "Vendre", href: "/transmettre" },
  { label: "Conseil", href: "/conseil" },
] as const;

const informationLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/politique-de-confidentialite" },
] as const;

export default function SiniFooter() {
  return (
    <footer
      data-site-footer
      data-brand="sini"
      className="mt-auto border-t border-[#d8e0e7] bg-[#fbfcfe] px-5 py-12 text-[#17283e] sm:px-8 sm:py-16"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Link href="/" aria-label="sini, accueil" className="inline-flex font-sans text-2xl font-medium tracking-[0.16em] text-[#17283e]">
            sini
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#627181]">
            Reprendre, vendre et préparer la suite d’une entreprise avec clarté.
          </p>
          <a className="mt-3 inline-block text-sm text-[#244a68] hover:underline" href="mailto:contact@sini.fr">contact@sini.fr</a>
        </div>
        <nav aria-label="Explorer sini">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#597391]">Explorer</h2>
          <ul className="mt-4 space-y-3">
            {journeyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-[#17283e] transition hover:text-[#597391]">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informations légales">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#597391]">Informations</h2>
          <ul className="mt-4 space-y-3">
            {informationLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-[#17283e] transition hover:text-[#597391]">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-7xl flex-col gap-2 border-t border-[#d8e0e7] pt-6 text-xs text-[#627181] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} sini</p>
        <p>Des projets qui trouvent une suite.</p>
      </div>
    </footer>
  );
}
