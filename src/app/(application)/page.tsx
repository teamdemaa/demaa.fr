import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, BriefcaseBusiness, Wrench } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata: Metadata = buildPublicPageMetadata({
  title: "Demaa | Academy, solutions et spécialistes pour dirigeants",
  description: "Demaa rassemble des méthodes, des solutions et des spécialistes pour faire fonctionner votre entreprise avec plus de clarté.",
  path: "/",
});

const entries = [
  {
    description: "Des méthodes concrètes pour organiser, décider et piloter votre activité.",
    href: "/academie",
    icon: BookOpen,
    title: "Academy",
  },
  {
    description: "Les outils, fournisseurs, financements et repères adaptés à votre métier.",
    href: "/solutions",
    icon: Wrench,
    title: "Solutions",
  },
  {
    description: "Les professionnels à solliciter lorsque vous avez besoin d’avancer, avec le bon périmètre.",
    href: "/specialistes",
    icon: BriefcaseBusiness,
    title: "Spécialistes",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-dema-cream text-dema-forest">
      <Navbar minimal />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-28">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-dema-forest/55">Demaa</p>
          <h1 className="mt-5 max-w-4xl text-balance font-light leading-[0.96] tracking-[-0.055em] text-dema-forest" style={{ fontSize: "clamp(3rem, 7vw, 6.2rem)" }}>
            Faire fonctionner son entreprise,
            <span className="demaa-hero-title block text-brand-blue/62">avec plus de clarté.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-dema-muted sm:text-xl">
            Des ressources utiles, des solutions par métier et des spécialistes pour aider les dirigeants à avancer sereinement.
          </p>
        </section>

        <section className="border-y border-dema-line/70 bg-dema-paper/45">
          <div className="mx-auto grid w-full max-w-7xl divide-y divide-dema-line/70 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
            {entries.map(({ description, href, icon: Icon, title }) => (
              <Link
                key={href}
                href={href}
                className="group relative min-h-72 px-1 py-9 transition-colors hover:bg-dema-paper sm:p-10 md:min-h-80"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-12 text-3xl font-light tracking-[-0.04em] text-dema-forest">{title}</h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-dema-muted sm:text-base">{description}</p>
                <ArrowUpRight className="absolute bottom-10 right-8 h-5 w-5 text-dema-forest transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-dema-forest/55">Un point de départ</p>
            <p className="mt-3 max-w-xl text-xl font-light leading-snug tracking-[-0.03em] text-dema-forest sm:text-2xl">Choisissez le sujet sur lequel votre entreprise a besoin d’avancer maintenant.</p>
          </div>
          <Link href="mailto:team@demaa.fr" className="inline-flex w-fit items-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-blue">
            Nous contacter <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
