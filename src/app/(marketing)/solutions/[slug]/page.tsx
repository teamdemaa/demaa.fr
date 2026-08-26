import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import Navbar from "@/components/Navbar";
import SystemDetailContent from "@/components/SystemDetailContent";
import { composePublicSolutionSectionsForSystem } from "@/lib/canonical-services-system-section.server";
import { hasEditableOperationalSystemAsset } from "@/lib/editable-operational-system-assets.server";
import {
  getActivePublishedRenderableSolutionSectionsForSystem,
  getActivePublicRenderableSolutionSectionsForSystem,
} from "@/lib/firebase-solution-registry-selection.server";
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
  const { slug } = await params;
  const [data, solutionSections] = await Promise.all([
    getSystemDetailPageData(slug),
    getActivePublishedRenderableSolutionSectionsForSystem(slug),
  ]);

  if (!data) {
    return {
      title: "Solutions métier introuvables - Demaa",
      robots: { index: false, follow: false },
    };
  }

  return buildSystemPageMetadata(
    data,
    filterPublicSystemRecommendationSections(solutionSections),
  );
}

export default async function SolutionPage({ params, searchParams }: SolutionPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [data, solutionSections, publishedSolutionSections] = await Promise.all([
    getSystemDetailPageData(slug),
    getActivePublicRenderableSolutionSectionsForSystem(slug),
    getActivePublishedRenderableSolutionSectionsForSystem(slug),
  ]);

  if (!data) notFound();

  const visibleSolutionSections = filterPublicSystemRecommendationSections(
    composePublicSolutionSectionsForSystem(
      slug,
      mergeRenderableSolutionSections(solutionSections),
    ),
  );
  const visiblePublishedSolutionSections =
    filterPublicSystemRecommendationSections(publishedSolutionSections);
  const jsonLd = buildSystemPageJsonLd(data, visiblePublishedSolutionSections);

  if (!hasEditableOperationalSystemAsset(data.system.slug)) notFound();
  if (normalizeSystemDetailTab(getParamValue(resolvedSearchParams.tab)) === "process") {
    redirect(`/systemes/${data.system.slug}/processus`);
  }

  return (
    <>
      <Navbar minimal />
      <ActionPlanNavbar activeView="solutions" routeNavigation />
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
            toolOutboundSurface={
              getParamValue(resolvedSearchParams.toolSource) === "action_recommendation"
                ? "action_recommendation"
                : "solutions"
            }
          />
        </div>
      </main>
    </>
  );
}
