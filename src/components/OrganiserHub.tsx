import CopyableModelCard from "@/components/CopyableModelCard";
import MentoratAutomationCta from "@/components/MentoratAutomationCta";
import ModelProcessesBridge from "@/components/ModelProcessesBridge";
import Navbar from "@/components/Navbar";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import { getPublishedCopyableModels } from "@/lib/copyable-model-catalog";

export default function OrganiserHub() {
  const models = getPublishedCopyableModels();

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="min-h-screen bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pb-16 pt-12 text-center sm:px-6 md:pb-20 md:pt-16 lg:px-8">
          <h1
            aria-label="Des modèles et des cas concrets pour organiser votre activité"
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span aria-hidden="true">
              <span className="block text-brand-blue/62">Des modèles et des cas concrets</span>
              <span className="demaa-hero-title block text-dema-forest">pour organiser votre activité</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-dema-muted md:text-lg">
            Copiez une structure prête à l’emploi, puis voyez comment l’adapter à votre façon de travailler.
          </p>
        </header>

        <section aria-labelledby="organiser-models-heading" className="px-4 pb-16 sm:px-6 md:pb-20 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <h2 id="organiser-models-heading" className="demaa-catalog-section-title text-brand-blue">
                Tous les modèles prêts à copier
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {models.map((model) => (
                <div key={model.slug} className="min-w-0">
                  <CopyableModelCard model={model} titleLevel={3} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <ModelProcessesBridge />

        <div className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 md:pt-20 lg:px-8">
          <MentoratAutomationCta variant="modele" />
        </div>
        <div className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
