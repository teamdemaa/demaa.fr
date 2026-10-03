import Link from "next/link";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import Navbar from "@/components/Navbar";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { getAcademyPreviewCards, getAcademyPracticeCards } from "@/lib/academy-preview-catalog";

const title = "Academy — cours pratiques pour entrepreneurs | Demaa";
const description =
  "Des cours concrets, des modèles et des solutions pour structurer, organiser et piloter son entreprise.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/tutoriels",
});

export default function TutorialsPage() {
  const cards = getAcademyPreviewCards();
  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" publicNavigationVariant="demaa" />
      <main className="min-h-screen bg-background">
        <ResourcesNavigation activeView="tutorials" />
        <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-dema-muted">Academy · Organisation et structuration</p>
          <h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}>
            <span className="block text-brand-blue/62">Structurer son entreprise,</span>
            <span className="demaa-hero-title block text-dema-forest">une question à la fois.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-dema-muted">Des réponses concrètes, une méthode pas à pas et un exercice pour avancer dans votre activité.</p>
        </header>
        <AcademyPreviewLibrary cards={cards} />
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="pratiques-airtable">
          <h2 id="pratiques-airtable" className="demaa-section-title text-3xl">Mettre en pratique avec Airtable</h2>
          <p className="mt-3 text-dema-muted">Les tutoriels pour construire vos tableaux de suivi, quand vous avez choisi votre fonctionnement.</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">{getAcademyPracticeCards().map(card => <li key={card.href}><Link href={card.href} className="block border-t border-dema-line py-4 text-lg text-dema-forest underline decoration-dema-line underline-offset-4">{card.title}</Link></li>)}</ul>
        </section>
      </main>
    </>
  );
}
