import Navbar from "@/components/Navbar";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import TutorialLibrary from "@/components/TutorialLibrary";
import { getPublishedTutorials } from "@/lib/tutorial-catalog";

export default function TutorialsHub() {
  const tutorials = getPublishedTutorials();

  return (
    <>
      <Navbar minimal publicNavigationActiveView="resources" />
      <main className="min-h-screen bg-background">
        <ResourcesNavigation activeView="tutorials" />
        <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
          <h1
            aria-label="Des tutoriels concrets pour choisir, configurer et mieux utiliser vos outils"
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span aria-hidden="true">
              <span className="block text-brand-blue/62">Des tutoriels concrets pour choisir, configurer et</span>
              <span className="demaa-hero-title block font-normal text-dema-forest">mieux utiliser vos outils</span>
            </span>
          </h1>
        </header>

        <TutorialLibrary tutorials={tutorials} />

        <div className="px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
