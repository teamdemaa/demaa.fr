import Navbar from "@/components/Navbar";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import TutorialLibrary from "@/components/TutorialLibrary";
import { getPublishedMethods } from "@/lib/tutorial-catalog";

export default function TutorialsHub() {
  const tutorials = getPublishedMethods();

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="min-h-screen bg-background">
        <ResourcesNavigation activeView="tutorials" />
        <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
          <h1
            aria-label="Des méthodes concrètes pour reprendre, structurer ou vendre une entreprise"
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span aria-hidden="true">
              <span className="block text-brand-blue/62">Des méthodes concrètes pour reprendre,</span>
              <span className="demaa-hero-title block text-dema-forest">structurer ou vendre</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-dema-muted sm:text-lg">
            Chaque méthode répond à une question précise, cite ses sources et propose une action réalisable en moins de 30 minutes.
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
