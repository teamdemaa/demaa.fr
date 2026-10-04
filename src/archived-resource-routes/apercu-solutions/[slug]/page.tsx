import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import SystemDetailContent from "@/components/SystemDetailContent";
import { composeCanonicalServicesForSystem } from "@/lib/canonical-services-system-section.server";
import localRegistrySnapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
import { parseFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import { getActiveFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry.server";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import { filterSolutionsPreviewSections } from "@/lib/public-solution-section-visibility";
import { buildSystemPageIntro, getSystemDetailPageData } from "@/lib/system-detail-page";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Solutions par métier | Demaa",
  robots: { index: false, follow: false },
};

export default async function SolutionPreviewDetailPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const [data, registryResult] = await Promise.all([
    getSystemDetailPageData(slug),
    getActiveFirebaseSolutionRegistryRevision().then(
      (revision) => ({ revision, source: "active" as const }),
      (error: unknown) => {
        if (process.env.NODE_ENV !== "development") throw error;
        return {
          revision: parseFirebaseSolutionRegistryRevision(localRegistrySnapshot),
          source: "local-snapshot" as const,
        };
      },
    ),
  ]);
  const registry = registryResult.revision;
  if (!data || !registry.knownSystemSlugs.includes(slug)) notFound();

  const sections = filterSolutionsPreviewSections(
    composeCanonicalServicesForSystem(
      slug,
      selectRenderableSolutionSectionsFromRevision(registry, slug, { publishedOnly: true }),
    ),
  );

  return (
    <>
      <Navbar minimal publicNavigationActiveView="solutions" publicNavigationVariant="demaa" />
      <main className="min-h-screen bg-dema-cream pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {registryResult.source === "local-snapshot" ? (
            <p className="mb-8 max-w-3xl rounded-xl border border-dema-line bg-dema-paper px-4 py-3 text-sm leading-6 text-dema-muted" role="status">
              Aperçu local issu du snapshot éditorial. Le registre actif peut différer.
            </p>
          ) : null}
          <SystemDetailContent system={data.system} intro={buildSystemPageIntro(data)} headingAs="h1" solutionSections={sections} backHref="/apercu-solutions" backLabel="Tous les métiers" showDailyTools />
        </div>
      </main>
    </>
  );
}
