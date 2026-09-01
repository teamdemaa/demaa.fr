import { notFound } from "next/navigation";
import { connection } from "next/server";
import ToolComparisonContextShell from "@/components/ToolComparisonContextShell";
import { composePublicSolutionSectionsForSystem } from "@/lib/canonical-services-system-section.server";
import { getActiveFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry.server";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import { getFirebaseToolComparisonViewForRevision } from "@/lib/firebase-tool-comparison.server";
import { filterPublicSystemRecommendationSections } from "@/lib/public-solution-section-visibility";
import { mergeRenderableSolutionSections } from "@/lib/system-solutions-ui-dto";
import { getSystemDetailPageData } from "@/lib/system-detail-page";

export default async function ToolComparisonRoute({
  slug,
  closeWithBack,
}: {
  slug: string;
  closeWithBack: boolean;
}) {
  await connection();
  const [data, revision] = await Promise.all([
    getSystemDetailPageData(slug),
    getActiveFirebaseSolutionRegistryRevision(),
  ]);

  if (!data) notFound();

  const sections = selectRenderableSolutionSectionsFromRevision(revision, slug);
  const visibleSections = filterPublicSystemRecommendationSections(
    composePublicSolutionSectionsForSystem(
      slug,
      mergeRenderableSolutionSections(sections),
    ),
  );
  const comparison = await getFirebaseToolComparisonViewForRevision({
    revision,
    systemSlug: slug,
    sections: visibleSections,
  });

  if (!comparison) notFound();

  return (
    <ToolComparisonContextShell
      comparison={comparison}
      closeHref={`/solutions/${slug}`}
      closeWithBack={closeWithBack}
    />
  );
}
