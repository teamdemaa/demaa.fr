import { NextResponse } from "next/server";
import { composePublicSolutionSectionsForSystem } from "@/lib/canonical-services-system-section.server";
import {
  getActivePublishedRenderableSolutionSectionsForSystem,
  getActiveRenderableSolutionSectionsForSystem,
  getLocalPublishedRenderableSolutionSectionsForSystem,
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
  EUR_CURRENCY_CODE,
  FRANCE_CONTEXT,
  createInternationalContext,
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
  const localeParam = searchParams.get("locale");
  const marketParam = searchParams.get("market");
  const hasExplicitContext = localeParam !== null || marketParam !== null;
  if (
    hasExplicitContext
    && (!isInterfaceLocaleCode(localeParam) || !isMarketCode(marketParam))
  ) {
    return NextResponse.json({ error: "Invalid international context." }, { status: 400 });
  }
  const internationalContext = hasExplicitContext
    ? createInternationalContext(localeParam as "fr" | "en", {
        countryCode: null,
        currencyCode: EUR_CURRENCY_CODE,
        marketCode: marketParam as "fr-fr" | "global-en-beta",
      })
    : FRANCE_CONTEXT;
  const isEnglish = internationalContext.localeCode === "en";
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
      ? isEnglish
        ? getLocalPublishedRenderableSolutionSectionsForSystem(slug)
        : getLocalRenderableSolutionSectionsForSystem(slug)
      : isEnglish
        ? getActivePublishedRenderableSolutionSectionsForSystem(slug)
        : getActiveRenderableSolutionSectionsForSystem(slug),
  ]);

  if (!data) {
    return NextResponse.json(
      { error: isEnglish ? "Business system not found." : "Système métier introuvable." },
      { status: 404 },
    );
  }

  const visibleSolutionSections = composePublicSolutionSectionsForSystem(
    slug,
    mergeRenderableSolutionSections(solutionSections),
    internationalContext,
  );
  const englishSystem = englishActionPlanSystemOptions.find((option) => option.id === slug);
  if (isEnglish && !englishSystem) {
    return NextResponse.json({ error: "Business system not found." }, { status: 404 });
  }
  const englishSystemDescription = `Tools and support selected for ${englishSystem?.label}.`;

  return NextResponse.json(
    {
      system: isEnglish ? {
        ...data.system,
        category: "Business system",
        description: englishSystemDescription,
        name: englishSystem?.label ?? data.system.name,
        shortDescription: englishSystemDescription,
        tags: [],
      } : data.system,
      // The operational guide remains French-only until its canonical content
      // has a complete English projection. Never leak it through an English DTO.
      systeme: isEnglish ? null : data.detail.systeme,
      intro: isEnglish
        ? englishSystemDescription
        : buildSystemPageIntro(data),
      resources: isEnglish ? [] : getAvailableSystemTemplatesForSystem(slug),
      solutionSections: isEnglish
        ? projectEnglishSolutionSections(visibleSolutionSections, internationalContext)
        : visibleSolutionSections,
      internationalContext: {
        localeCode: internationalContext.localeCode,
        marketCode: internationalContext.marketCode,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
