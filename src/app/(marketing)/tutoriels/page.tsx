import LearningSubscription from "@/components/LearningSubscription";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import Navbar from "@/components/Navbar";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";

const title = "Apprentissages du Studio | Demaa";
const description =
  "Des cas concrets et des méthodes pour construire et développer une entreprise.";

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
            <span className="block text-brand-blue/62">On partage</span>
            <span className="demaa-hero-title block text-dema-forest">nos apprentissages.</span>
          </h1>
        </header>
        <AcademyPreviewLibrary cards={cards} showControls={false} />
        <div className="mx-auto max-w-4xl px-5 pb-16"><LearningSubscription /></div>
      </main>
    </>
  );
}
