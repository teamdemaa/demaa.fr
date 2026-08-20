import { NextResponse } from "next/server";
import { composePublicSolutionSectionsForSystem } from "@/lib/canonical-services-system-section.server";
import {
  getActiveRenderableSolutionSectionsForSystem,
  getLocalRenderableSolutionSectionsForSystem,
} from "@/lib/firebase-solution-registry-selection.server";
import {
  enrichEnterpriseBusinessModel,
  enterpriseCatalogBySlug,
  enterpriseToSystem,
} from "@/lib/enterprise-annuaire";
import {
  buildOperationalSystemPageDetail,
  buildSystemPageIntro,
  getSystemDetailPageData,
  type SystemDetailPageData,
} from "@/lib/system-detail-page";
import { mergeRenderableSolutionSections } from "@/lib/system-solutions-ui-dto";
import { getAvailableSystemTemplatesForSystem } from "@/lib/system-resource-catalog";
import { projectEnglishSolutionSections } from "@/lib/english-solution-projections.server";
import {
  FRANCE_CONTEXT,
  isInterfaceLocaleCode,
  isMarketCode,
} from "@/lib/international-context";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { englishActionPlanSystemOptions } from "@/lib/action-plan-localization";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function getLocalSystemDetailPageData(slug: string): SystemDetailPageData | null {
  const fallback = enterpriseCatalogBySlug[slug];
  if (!fallback) return null;

  const enterprise = enrichEnterpriseBusinessModel(fallback);
  const system = enterpriseToSystem(enterprise);
  return {
    enterprise,
    system,
    detail: buildOperationalSystemPageDetail(system, enterprise),
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const searchParams = new URL(request.url).searchParams;
  const requestedLocale = searchParams.get("locale");
  const requestedMarket = searchParams.get("market");
  const hasExplicitContext = requestedLocale !== null || requestedMarket !== null;
  if (
    hasExplicitContext
    && (!isInterfaceLocaleCode(requestedLocale) || !isMarketCode(requestedMarket))
  ) {
    return NextResponse.json({ error: "Invalid international context." }, { status: 400 });
  }
  const localeCode = hasExplicitContext ? requestedLocale : FRANCE_CONTEXT.localeCode;
  const marketCode = hasExplicitContext ? requestedMarket : FRANCE_CONTEXT.marketCode;
  const isEnglish = localeCode === "en";
  if (isEnglish && !isEnglishBetaEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const useLocalDemoData =
    process.env.NODE_ENV !== "production" &&
    new URL(request.url).searchParams.get("demo") === "1";
  const [data, solutionSections] = await Promise.all([
    useLocalDemoData
      ? Promise.resolve(getLocalSystemDetailPageData(slug))
      : getSystemDetailPageData(slug),
    useLocalDemoData
      ? getLocalRenderableSolutionSectionsForSystem(slug)
      : getActiveRenderableSolutionSectionsForSystem(slug),
  ]);

  if (!data) {
    return NextResponse.json(
      { error: "Système métier introuvable." },
      { status: 404 },
    );
  }

  const visibleSolutionSections = composePublicSolutionSectionsForSystem(
    slug,
    mergeRenderableSolutionSections(solutionSections),
  );
  const englishSystem = englishActionPlanSystemOptions.find((option) => option.id === slug);
  if (isEnglish && !englishSystem) {
    return NextResponse.json({ error: "Business system not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      system: isEnglish ? {
        ...data.system,
        description: `Tools and support selected for ${englishSystem?.label}.`,
        name: englishSystem?.label ?? data.system.name,
      } : data.system,
      // The operational guide remains French-only until its canonical content
      // has a complete English projection. Never leak it through an English DTO.
      systeme: isEnglish ? null : data.detail.systeme,
      intro: isEnglish
        ? `Tools and support selected for ${englishSystem?.label}.`
        : buildSystemPageIntro(data),
      resources: isEnglish ? [] : getAvailableSystemTemplatesForSystem(slug),
      solutionSections: isEnglish
        ? projectEnglishSolutionSections(visibleSolutionSections)
        : visibleSolutionSections,
      internationalContext: {
        localeCode,
        marketCode,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
