import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import MentoratAutomationCta from "@/components/MentoratAutomationCta";
import Navbar from "@/components/Navbar";
import SystemDetailContent from "@/components/SystemDetailContent";
import { composePublicSolutionSectionsForSystem } from "@/lib/canonical-services-system-section.server";
import { hasEditableOperationalSystemAsset } from "@/lib/editable-operational-system-assets.server";
import { getActiveFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry.server";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import { getFirebaseToolComparisonViewForRevision } from "@/lib/firebase-tool-comparison.server";
import { filterPublicSystemRecommendationSections } from "@/lib/public-solution-section-visibility";
import { mergeRenderableSolutionSections } from "@/lib/system-solutions-ui-dto";
import { normalizeSystemDetailTab } from "@/lib/system-detail-tabs";
import {
  buildSystemPageIntro,
  buildSystemPageJsonLd,
  buildSystemPageMetadata,
  getSystemDetailPageData,
} from "@/lib/system-detail-page";

type SolutionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    resource?: string | string[];
    tab?: string | string[];
    toolSource?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: SolutionPageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const [data, revision] = await Promise.all([
    getSystemDetailPageData(slug),
    getActiveFirebaseSolutionRegistryRevision(),
  ]);

  if (!data) {
    return {
      title: "Solutions métier introuvables - Demaa",
      robots: { index: false, follow: false },
    };
  }

  return buildSystemPageMetadata(
    data,
    filterPublicSystemRecommendationSections(
      selectRenderableSolutionSectionsFromRevision(revision, slug, {
        publishedOnly: true,
      }),
    ),
  );
}

export default async function SolutionPage({ params, searchParams }: SolutionPageProps) {
  await connection();
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [data, revision] = await Promise.all([
    getSystemDetailPageData(slug),
    getActiveFirebaseSolutionRegistryRevision(),
  ]);

  if (!data) notFound();

  const solutionSections = selectRenderableSolutionSectionsFromRevision(
    revision,
    slug,
  );
  const publishedSolutionSections = selectRenderableSolutionSectionsFromRevision(
    revision,
    slug,
    { publishedOnly: true },
  );
  const visibleSolutionSections = filterPublicSystemRecommendationSections(
    composePublicSolutionSectionsForSystem(
      slug,
      mergeRenderableSolutionSections(solutionSections),
    ),
  );
  const visiblePublishedSolutionSections =
    filterPublicSystemRecommendationSections(publishedSolutionSections);
  const jsonLd = buildSystemPageJsonLd(data, visiblePublishedSolutionSections);
  const comparison = await getFirebaseToolComparisonViewForRevision({
    revision,
    systemSlug: slug,
    sections: visibleSolutionSections,
  });

  if (!hasEditableOperationalSystemAsset(data.system.slug)) notFound();
  if (normalizeSystemDetailTab(getParamValue(resolvedSearchParams.tab)) === "process") {
    redirect(`/systemes/${data.system.slug}/processus`);
  }
  const legacyResource = getParamValue(resolvedSearchParams.resource);
  if (legacyResource === "processus-metier") {
    redirect(`/systemes/${data.system.slug}/processus`);
  }
  if (legacyResource === "suivi-previsionnel-financier") {
    redirect("/modeles/suivi-previsionnel-financier");
  }
  if (legacyResource === "crm-suivi-commercial") {
    redirect("/modeles");
  }

  return (
    <>
      <Navbar minimal publicNavigationActiveView="solutions" />
      <main className="min-h-screen bg-background pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-3 sm:px-6 lg:px-8">
          <SystemDetailContent
            system={data.system}
            intro={buildSystemPageIntro(data)}
            initialResourceSlug={getParamValue(resolvedSearchParams.resource)}
            headingAs="h1"
            solutionSections={visibleSolutionSections}
            comparisonHref={
              comparison
                ? `/solutions/${data.system.slug}/comparatif-outils`
                : undefined
            }
            toolOutboundSurface={
              getParamValue(resolvedSearchParams.toolSource) === "action_recommendation"
                ? "action_recommendation"
                : "solutions"
            }
          />
          <div className="mt-12 max-w-[67.5rem]">
            <MentoratAutomationCta
              systemName={data.system.name}
              systemSlug={data.system.slug}
              variant="metier"
            />
          </div>
        </div>
      </main>
    </>
  );
}
