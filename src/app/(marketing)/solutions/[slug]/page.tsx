import type { Metadata } from "next";
import { cache } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import OrganiserDiscoveryCta from "@/components/OrganiserDiscoveryCta";
import SystemDetailContent from "@/components/SystemDetailContent";
import { composeCanonicalServicesForSystem } from "@/lib/canonical-services-system-section.server";
import { hasEditableOperationalSystemAsset } from "@/lib/editable-operational-system-assets.server";
import { getActiveFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry.server";
import localRegistrySnapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
import reviewedPilotCandidate from "../../../../../docs/research/d091-tools/pilot-candidate-revision.generated.json";
import { parseFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import { filterSolutionsPreviewSections } from "@/lib/public-solution-section-visibility";
import { mergeRenderableSolutionSections } from "@/lib/system-solutions-ui-dto";
import { normalizeSystemDetailTab } from "@/lib/system-detail-tabs";
import {
  buildSystemPageIntro,
  buildSystemPageJsonLd,
  buildSystemPageMetadata,
  getSystemDetailPageData,
} from "@/lib/system-detail-page";
import { isPublishedToolComparisonSystem } from "@/lib/tool-capability-comparison-data";

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

const getRegistryForPage = cache(async function getRegistryForPage() {
  try {
    return { revision: await getActiveFirebaseSolutionRegistryRevision(), source: "active" as const };
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    return {
      revision: parseFirebaseSolutionRegistryRevision(localRegistrySnapshot),
      source: "local-snapshot" as const,
    };
  }
});

// The reviewed pilot is visible only on Vercel preview deployments. It does
// not change the active Firebase pointer or the production publication gate.
const reviewedPilotRevision = parseFirebaseSolutionRegistryRevision(reviewedPilotCandidate);

export async function generateMetadata({ params }: SolutionPageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const [data, registry] = await Promise.all([
    getSystemDetailPageData(slug),
    getRegistryForPage(),
  ]);

  if (!data) {
    return {
      title: "Outils métier introuvables - Demaa",
      robots: { index: false, follow: false },
    };
  }

  return buildSystemPageMetadata(
    data,
    filterSolutionsPreviewSections(
      composeCanonicalServicesForSystem(slug,
        selectRenderableSolutionSectionsFromRevision(registry.revision, slug, { publishedOnly: true })),
    ),
  );
}

export default async function SolutionPage({ params, searchParams }: SolutionPageProps) {
  await connection();
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [data, registry] = await Promise.all([
    getSystemDetailPageData(slug),
    getRegistryForPage(),
  ]);

  if (!data) notFound();

  const publishedSolutionSections = selectRenderableSolutionSectionsFromRevision(
    registry.revision,
    slug,
    { publishedOnly: true },
  );
  // This is the same selected software set already visible on the current
  // public site. Keep that existing exposure while moving the métier page;
  // newly surfaced providers and other categories still require publication.
  const existingPublicSoftwareSections = selectRenderableSolutionSectionsFromRevision(
    registry.revision,
    slug,
  ).filter(({ section }) => section === "software");
  const existingPublicSoftwareSlugs = new Set(
    existingPublicSoftwareSections.flatMap(({ placements }) =>
      placements.map(({ resource }) => resource.resourceSlug)
    ),
  );
  const isReviewedPilotPreview = process.env.VERCEL_ENV === "preview";
  // Keep production on the active, published registry. The protected preview
  // may add independently reviewed tools from the unpublished pilot candidate.
  const reviewedPilotSections = isReviewedPilotPreview
    ? selectRenderableSolutionSectionsFromRevision(reviewedPilotRevision, slug, { publishedOnly: true })
      .filter(({ section }) => section === "software")
      .map((group) => ({
        ...group,
        placements: group.placements.filter(({ resource }) =>
          !existingPublicSoftwareSlugs.has(resource.resourceSlug)
        ),
      }))
    : [];
  const displaySolutionSections = process.env.NODE_ENV === "development"
    ? selectRenderableSolutionSectionsFromRevision(registry.revision, slug)
    : mergeRenderableSolutionSections([
        ...publishedSolutionSections.filter(({ section }) => section !== "software"),
        ...existingPublicSoftwareSections,
        ...reviewedPilotSections,
      ]);
  const visibleSolutionSections = filterSolutionsPreviewSections(
    composeCanonicalServicesForSystem(
      slug,
      mergeRenderableSolutionSections(displaySolutionSections),
    ),
  );
  const publishedVisibleSolutionSections = filterSolutionsPreviewSections(
    composeCanonicalServicesForSystem(
      slug,
      mergeRenderableSolutionSections(publishedSolutionSections),
    ),
  );
  const jsonLd = buildSystemPageJsonLd(data, publishedVisibleSolutionSections);

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

  const existingVisibleSoftwareSections = filterSolutionsPreviewSections(
    existingPublicSoftwareSections,
  );
  const softwarePlacementCount =
    existingVisibleSoftwareSections.find(({ section }) => section === "software")
      ?.placements.length ?? 0;
  const comparisonAvailable = softwarePlacementCount >= 2 &&
    isPublishedToolComparisonSystem(data.system.slug);
  const hasProcesses = (data.detail.systeme?.routines.length ?? 0) > 0;

  return (
    <>
      <Navbar minimal publicNavigationActiveView="solutions" publicNavigationVariant="demaa" />
      <main className="min-h-screen bg-background pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-3 sm:px-6 lg:px-8">
          {registry.source === "local-snapshot" ? (
            <p className="mb-6 rounded-xl border border-dema-line bg-dema-paper px-4 py-3 text-sm text-dema-muted" role="status">
              Aperçu local : données du snapshot éditorial. Le registre actif peut différer.
            </p>
          ) : null}
          <SystemDetailContent
            system={data.system}
            intro={buildSystemPageIntro(data)}
            initialResourceSlug={getParamValue(resolvedSearchParams.resource)}
            headingAs="h1"
            solutionSections={visibleSolutionSections}
            backHref="/solutions"
            backLabel="Toutes les solutions"
            showDailyTools
            comparisonHref={
              comparisonAvailable
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
            {hasProcesses ? (
              <OrganiserDiscoveryCta
                eyebrow="Bonus"
                title="Les processus de votre métier"
                description="Consultez les étapes essentielles, les responsabilités et les points de contrôle pour mieux organiser votre activité."
                ctaLabel="Voir les processus du métier"
                href={`/systemes/${data.system.slug}/processus`}
              />
            ) : (
              <OrganiserDiscoveryCta />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
