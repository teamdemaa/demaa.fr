import Navbar from "@/components/Navbar";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";

const title = "Tutoriels pour organiser et piloter son entreprise | Demaa";
const description =
  "Quatre tutoriels concrets pour organiser le suivi commercial, les projets et les interventions dans Airtable.";

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
        <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
          <h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}>
            <span className="block text-brand-blue/62">Organiser et piloter son entreprise,</span>
            <span className="demaa-hero-title block text-dema-forest">un sujet à la fois.</span>
          </h1>
        </header>
        <AcademyPreviewLibrary cards={cards} />
      </main>
    </>
  );
}
