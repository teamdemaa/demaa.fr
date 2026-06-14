import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, SearchCheck, Store } from "lucide-react";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Repriz - Demaa",
  description:
    "Repriz est l'outil dédié à la reprise d'entreprise : annuaire d'opportunités et future marketplace d'entreprises à reprendre.",
  alternates: {
    canonical: "/outils/repriz",
  },
  openGraph: {
    title: "Repriz - Demaa",
    description:
      "Repriz est l'outil dédié à la reprise d'entreprise : annuaire d'opportunités et future marketplace d'entreprises à reprendre.",
    url: "/outils/repriz",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

const pillars = [
  {
    title: "Annuaire d'opportunités",
    description:
      "Un point d'entrée simple pour repérer des entreprises à reprendre et filtrer plus vite les pistes intéressantes.",
    icon: SearchCheck,
  },
  {
    title: "Qualification plus propre",
    description:
      "Un cadre plus clair pour regarder les dossiers, vérifier les bases et éviter de partir dans tous les sens.",
    icon: Building2,
  },
  {
    title: "Marketplace à terme",
    description:
      "La logique cible est d'aller vers une vraie marketplace d'entreprises à reprendre, plus lisible et plus utile.",
    icon: Store,
  },
];

export default function ReprizPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex rounded-full bg-dema-sage px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-dema-forest">
              Outil métier
            </span>
            <h1 className="text-[clamp(2.7rem,7vw,4.8rem)] leading-[0.96] tracking-tight">
              Repriz
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-dema-muted md:text-lg">
              Repriz est la brique dédiée à la reprise d&apos;entreprise : d&apos;abord un annuaire
              d&apos;opportunités, puis une marketplace plus structurée pour repérer, qualifier
              et suivre les bons dossiers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article
                  key={pillar.title}
                  className="rounded-[1.4rem] border border-dema-line bg-dema-paper p-5 shadow-[0_8px_26px_rgba(23,35,29,0.03)]"
                >
                  <div className="inline-flex rounded-full bg-dema-sage p-3 text-dema-forest">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight">{pillar.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_8px_30px_rgba(23,35,29,0.03)]">
            <p className="text-sm leading-relaxed text-dema-muted">
              Pour l&apos;instant, Repriz est référencé proprement dans l&apos;écosystème Demaa comme
              outil métier dédié à la reprise. L&apos;objectif est de garder Demaa propre, tout en
              rendant cette brique visible au bon endroit.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/annuaire-outils" className="demaa-primary-button gap-2 px-5 py-3">
                Retour à l&apos;annuaire outils
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cours/facture-electronique"
                className="demaa-secondary-button gap-2 px-5 py-3"
              >
                Voir un cours exemple
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
