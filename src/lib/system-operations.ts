import type { System } from "@/lib/types";
import { publicSectorLabels } from "@/lib/public-sectors";
import { buildSystemeDetail, type SystemeDetail } from "@/lib/systeme-catalog";
import type {
  EnterpriseDefinition,
  EnterpriseTool,
  EnterpriseToolReference,
} from "@/lib/enterprise-annuaire";
import { getEnterpriseCatalog, getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import type { BusinessModelBlock, BusinessModelSignals } from "@/lib/business-models";
import { getCuratedToolRecommendationsForSystem } from "@/lib/system-tool-recommendations";
import {
  findToolDirectoryItemBySlug,
  getToolDirectoryItemBySlug,
  getToolDirectorySlug,
  type ToolDirectoryItem,
} from "@/lib/tool-directory";

export type OperationalSystemDetail = {
  slug: string;
  sectorLabel: string;
  imageTitle: string;
  imageSubtitle: string;
  systeme: SystemeDetail | null;
  businessModelId?: string;
  businessVariant?: string;
  businessBlocks: BusinessModelBlock[];
  businessSignals?: BusinessModelSignals;
  tools: EnterpriseTool[];
};

type OperationalSystemDetailSources = {
  enterprisesBySlug: Record<string, EnterpriseDefinition>;
  toolDirectory: ToolDirectoryItem[];
};

async function loadSystemOperationSources() {
  const { getUnifiedToolDirectory } = await import("@/lib/tool-directory-firestore");

  return {
    getUnifiedToolDirectory,
  };
}

function resolveEnterpriseTools(
  enterpriseTools: EnterpriseToolReference[] | undefined,
  fallbackTools: EnterpriseTool[] | undefined,
  toolDirectory: ToolDirectoryItem[],
  recommendedToolSlugs: readonly string[] | undefined,
): EnterpriseTool[] {
  const toolsBySlug = Object.fromEntries(toolDirectory.map((tool) => [getToolDirectorySlug(tool), tool]));
  const hasExplicitRecommendationSelection = recommendedToolSlugs !== undefined;
  const explicitRecommendations = new Set(recommendedToolSlugs ?? []);

  if (enterpriseTools?.length) {
    const resolvedTools: EnterpriseTool[] = [];

    for (const toolRef of enterpriseTools) {
      const directMatch = toolsBySlug[toolRef.slug];
      const aliasedMatch =
        directMatch ??
        findToolDirectoryItemBySlug(toolDirectory, toolRef.slug) ??
        getToolDirectoryItemBySlug(toolRef.slug);
      const tool = aliasedMatch ? toolsBySlug[getToolDirectorySlug(aliasedMatch)] ?? aliasedMatch : null;

      if (tool) {
        resolvedTools.push({
          slug: getToolDirectorySlug(tool),
          name: tool.name,
          type: tool.category,
          usage: toolRef.usage || tool.bestFor,
          url: tool.url,
          scope: toolRef.scope ?? tool.scope,
          recommended: explicitRecommendations.has(getToolDirectorySlug(tool)),
          detail: tool,
        });
      }
    }

    if (hasExplicitRecommendationSelection) {
      const recommendationRank = new Map(
        (recommendedToolSlugs ?? []).map((slug, index) => [slug, index]),
      );

      return resolvedTools.toSorted((left, right) => {
        const leftRank = recommendationRank.get(left.slug ?? "") ?? Number.POSITIVE_INFINITY;
        const rightRank = recommendationRank.get(right.slug ?? "") ?? Number.POSITIVE_INFINITY;

        return leftRank - rightRank;
      });
    }

    let remainingRecommendations = 3;

    return resolvedTools.map((tool) => {
      const isBusinessTool = (tool.scope ?? tool.detail?.scope) !== "transverse";
      const recommended = isBusinessTool && remainingRecommendations > 0;

      if (recommended) {
        remainingRecommendations -= 1;
      }

      return recommended ? { ...tool, recommended: true } : tool;
    });
  }

  if (hasExplicitRecommendationSelection) {
    return (fallbackTools ?? []).map((tool) => ({
      ...tool,
      recommended: Boolean(tool.slug && explicitRecommendations.has(tool.slug)),
    }));
  }

  let remainingRecommendations = 3;

  return (fallbackTools ?? []).map((tool) => {
    const isBusinessTool = (tool.scope ?? tool.detail?.scope) !== "transverse";
    const recommended = isBusinessTool && remainingRecommendations > 0;

    if (recommended) {
      remainingRecommendations -= 1;
    }

    return recommended ? { ...tool, recommended: true } : tool;
  });
}

export async function buildOperationalSystemDetail(system: System): Promise<OperationalSystemDetail> {
  const enterprise = await getEnterpriseBySlug(system.slug);
  const { getUnifiedToolDirectory } = await loadSystemOperationSources();
  const toolDirectory = await getUnifiedToolDirectory();

  return buildOperationalSystemDetailFromSources(system, {
    enterprisesBySlug: enterprise ? { [system.slug]: enterprise } : {},
    toolDirectory,
  }, {
    includeSysteme: true,
  });
}

function buildOperationalSystemDetailFromSources(
  system: System,
  sources: OperationalSystemDetailSources,
  options?: {
    includeSysteme?: boolean;
  },
): OperationalSystemDetail {
  const enterprise = sources.enterprisesBySlug[system.slug] ?? null;
  const toolDirectory = sources.toolDirectory;

  if (enterprise) {
    return {
      slug: system.slug,
      sectorLabel: enterprise.sectorLabel,
      imageTitle: enterprise.imageTitle,
      imageSubtitle: enterprise.imageSubtitle,
      systeme: options?.includeSysteme ? buildSystemeDetail(enterprise) : null,
      businessModelId: enterprise.businessModelId,
      businessVariant: enterprise.businessVariant,
      businessBlocks: enterprise.businessBlocks ?? [],
      businessSignals: enterprise.businessSignals,
      tools: resolveEnterpriseTools(
        enterprise.toolRefs,
        enterprise.tools,
        toolDirectory,
        enterprise.recommendedToolSlugs ?? getCuratedToolRecommendationsForSystem(system.slug),
      ),
    };
  }

  return {
    slug: system.slug,
    sectorLabel: publicSectorLabels[0],
    imageTitle: system.name,
    imageSubtitle: `Aperçu du système métier pour ${system.name.toLowerCase()}`,
    systeme: null,
    businessBlocks: [],
    tools: [],
  };
}

export async function buildOperationalSystemDetails(
  systems: System[],
  enterpriseCatalog?: EnterpriseDefinition[],
  loadedToolDirectory?: ToolDirectoryItem[],
): Promise<Record<string, OperationalSystemDetail>> {
  const { getUnifiedToolDirectory } = await loadSystemOperationSources();
  const [enterprises, toolDirectory] = await Promise.all([
    enterpriseCatalog ? Promise.resolve(enterpriseCatalog) : getEnterpriseCatalog(),
    loadedToolDirectory ? Promise.resolve(loadedToolDirectory) : getUnifiedToolDirectory(),
  ]);
  const sources: OperationalSystemDetailSources = {
    enterprisesBySlug: Object.fromEntries(
      enterprises.map((enterprise) => [enterprise.slug, enterprise])
    ),
    toolDirectory,
  };

  return Object.fromEntries(
    systems.map((system) => [system.slug, buildOperationalSystemDetailFromSources(system, sources)])
  );
}
