import Link from "next/link";
import Navbar from "@/components/Navbar";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Nos ressources | DEMAA",
  description: "Solutions par activité, processus, guides et modèles pour structurer et développer votre entreprise.",
  path: "/ressources",
});

const resources = [
  { title: "Solutions par activité", href: "/solutions", description: "Trouvez les outils, fournisseurs, financements et réseaux adaptés à votre métier." },
  { title: "Processus et guides", href: "/organiser", description: "Des articles et des méthodes expliquées étape par étape pour organiser le travail dans votre entreprise." },
  { title: "Modèles à copier", href: "/modeles", description: "Des supports prêts à utiliser pour structurer votre activité et passer à l’action." },
];

export default function ResourcesPage() {
  return <>
    <Navbar minimal />
    <main className="min-h-screen bg-dema-cream text-brand-blue">
      <header className="mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 lg:px-16 lg:pt-20">
        <Link href="/studio" className="text-sm text-dema-muted underline underline-offset-4 hover:text-brand-blue">← Retour au Studio</Link>
        <h1 className="demaa-hero-title mt-10 text-[clamp(2.8rem,6vw,5rem)] leading-[1.05] tracking-tight">Nos ressources</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-dema-muted">Des ressources pratiques pour structurer et développer votre entreprise.</p>
      </header>
      <section aria-label="Explorer nos ressources" className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 sm:px-8 md:grid-cols-3 lg:px-16">
        {resources.map((resource) => <Link key={resource.href} href={resource.href} className="group rounded-2xl border border-dema-line bg-dema-paper p-7 transition-colors hover:border-brand-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
          <h2 className="text-2xl font-medium tracking-tight">{resource.title}</h2>
          <p className="mt-4 text-base leading-7 text-dema-muted">{resource.description}</p>
          <span className="mt-8 inline-block text-sm underline underline-offset-4">Découvrir →</span>
        </Link>)}
      </section>
    </main>
  </>;
}
