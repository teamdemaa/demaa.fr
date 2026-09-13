import CopyableModelsIndex from "@/components/CopyableModelsIndex";
import MentoratAutomationCta from "@/components/MentoratAutomationCta";
import Navbar from "@/components/Navbar";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import {
  getPublishedCopyableModels,
  getPublishedCopyableModelsForSystemSlug,
} from "@/lib/copyable-model-catalog";
import { enterpriseCatalogBySlug } from "@/lib/enterprise-annuaire";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";

export const metadata = buildPublicPageMetadata({
  title: "Modèles à copier pour organiser son activité | Demaa",
  description: "Des modèles prêts à copier pour organiser votre activité.",
  path: "/modeles",
});

type ModelsPageProps = {
  searchParams: Promise<{
    from?: string | string[];
    metier?: string | string[];
  }>;
};

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const { from, metier } = await searchParams;
  const source = Array.isArray(from) ? from[0] : from;
  const systemSlug = Array.isArray(metier) ? metier[0] : metier;
  const enterprise = systemSlug ? enterpriseCatalogBySlug[systemSlug] : undefined;
  const models = enterprise
    ? getPublishedCopyableModelsForSystemSlug(enterprise.slug)
    : getPublishedCopyableModels();
  const jsonLd = buildPublicIndexJsonLd({
    name: "Modèles à copier",
    description: "Des modèles prêts à copier pour organiser votre activité.",
    path: "/modeles",
    items: models.map((model) => ({
      name: model.title,
      path: `/modeles/${model.slug}`,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializePublicJsonLd(jsonLd) }}
      />
      <Navbar minimal publicNavigationActiveView="resources" />
      <main className="min-h-screen bg-background">
        <ResourcesNavigation activeView="models" />
        <CopyableModelsIndex
          fromOrganisation={source === "organisation"}
          models={models}
          systemName={enterprise?.name}
        />
        <div className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <MentoratAutomationCta variant="modele" />
        </div>
        <div className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
