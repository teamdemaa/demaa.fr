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
            aria-label="Mieux utiliser ses outils, étape par étape"
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span aria-hidden="true">
              <span className="block text-brand-blue/62">Mieux utiliser ses outils</span>
              <span className="demaa-hero-title block text-dema-forest">étape par étape</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-dema-muted md:text-lg">
            Des tutoriels concrets pour choisir, configurer et mieux utiliser vos outils, gagner du temps et faire avancer votre entreprise.
          </p>
        </header>

        <TutorialLibrary tutorials={tutorials} />

        <div className="px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
