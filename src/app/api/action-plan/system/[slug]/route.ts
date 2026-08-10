import { NextResponse } from "next/server";
import { composeCanonicalServicesForSystem } from "@/lib/canonical-services-system-section.server";
import { getActiveRenderableSolutionSectionsForSystem } from "@/lib/firebase-solution-registry-selection.server";
import { filterPublicSolutionSections } from "@/lib/public-solution-section-visibility";
import { buildSystemPageIntro, getSystemDetailPageData } from "@/lib/system-detail-page";
import { mergeRenderableSolutionSections } from "@/lib/system-solutions-ui-dto";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    return NextResponse.json(
      { error: "Système métier introuvable." },
      { status: 404 },
    );
  }

  const solutionSections = await getActiveRenderableSolutionSectionsForSystem(slug);
  const visibleSolutionSections = composeCanonicalServicesForSystem(
    slug,
    filterPublicSolutionSections(mergeRenderableSolutionSections(solutionSections)),
  );

  return NextResponse.json(
    {
      system: data.system,
      systeme: data.detail.systeme,
      intro: buildSystemPageIntro(data),
      solutionSections: visibleSolutionSections,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
