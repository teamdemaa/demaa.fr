import ResourcesNavigation from "@/components/ResourcesNavigation";
import Navbar from "@/components/Navbar";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";

const title = "Academy · cours pratiques pour entrepreneurs | Demaa";
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
          <h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}>
            <span className="block text-brand-blue/62">Structurer son entreprise,</span>
            <span className="demaa-hero-title block text-dema-forest">une question à la fois.</span>
          </h1>
        </header>
        <AcademyPreviewLibrary cards={cards} />
      </main>
    </>
  );
}
