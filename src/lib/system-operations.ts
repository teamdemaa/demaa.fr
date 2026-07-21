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
import type { SystemPillar, SystemProcessTemplate } from "@/lib/system-process-types";
import { getCuratedToolRecommendationsForSystem } from "@/lib/system-tool-recommendations";
import {
  findToolDirectoryItemBySlug,
  getToolDirectoryItemBySlug,
  getToolDirectorySlug,
  type ToolDirectoryItem,
} from "@/lib/tool-directory";


type SystemProcessCard = {
  pillar: SystemPillar;
  title: string;
  description: string;
  examples?: string;
};

export type OperationalSystemDetail = {
  slug: string;
  sectorLabel: string;
  imageTitle: string;
  imageSubtitle: string;
  processes: SystemProcessCard[];
  systeme: SystemeDetail | null;
  businessModelId?: string;
  businessVariant?: string;
  businessBlocks: BusinessModelBlock[];
  businessSignals?: BusinessModelSignals;
  tools: EnterpriseTool[];
};

type OperationalSystemDetailSources = {
  enterprisesBySlug: Record<string, EnterpriseDefinition>;
  templates: SystemProcessTemplate[];
  toolDirectory: ToolDirectoryItem[];
};

async function loadSystemOperationSources() {
  const [{ getSystemProcessTemplates }, { getUnifiedToolDirectory }] = await Promise.all([
    import("@/lib/system-process-templates"),
    import("@/lib/tool-directory-firestore"),
  ]);

  return {
    getSystemProcessTemplates,
    getUnifiedToolDirectory,
  };
}

function normalizePillar(pillar: string): SystemPillar {
  if (pillar === "Finance & Juridique") {
    return "Finance & administration";
  }

  return pillar as SystemPillar;
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
  const { getSystemProcessTemplates, getUnifiedToolDirectory } = await loadSystemOperationSources();
  const [templates, toolDirectory] = await Promise.all([
    getSystemProcessTemplates(),
    getUnifiedToolDirectory(),
  ]);

  return buildOperationalSystemDetailFromSources(system, {
    enterprisesBySlug: enterprise ? { [system.slug]: enterprise } : {},
    templates,
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
  const templates = sources.templates;
  const toolDirectory = sources.toolDirectory;

  if (enterprise) {
    const operationSource =
      enterprise.operationProcesses?.length
        ? enterprise.operationProcesses
        : enterprise.processes?.filter((process) => normalizePillar(process.pillar) === "Opérations") ?? [];

    const operationProcesses: SystemProcessCard[] = operationSource.map((process) => ({
      pillar: "Opérations",
      title: process.title,
      description: process.description,
      examples: process.examples,
    }));
    const hasBusinessBlocks = Boolean(enterprise.businessBlocks?.length);
    const sharedProcesses: SystemProcessCard[] = hasBusinessBlocks
      ? []
      : templates.map((template) => ({
          pillar: template.pillar,
          title: template.title,
          description: template.description,
          examples: enterprise.processExamples?.[template.id],
        }));

    return {
      slug: system.slug,
      sectorLabel: enterprise.sectorLabel,
      imageTitle: enterprise.imageTitle,
      imageSubtitle: enterprise.imageSubtitle,
      processes: [...sharedProcesses, ...operationProcesses],
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
    imageSubtitle: `Aperçu du kit opérationnel pour ${system.name.toLowerCase()}`,
    processes: templates.map((template) => ({ ...template })),
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
  const { getSystemProcessTemplates, getUnifiedToolDirectory } = await loadSystemOperationSources();
  const [enterprises, templates, toolDirectory] = await Promise.all([
    enterpriseCatalog ? Promise.resolve(enterpriseCatalog) : getEnterpriseCatalog(),
    getSystemProcessTemplates(),
    loadedToolDirectory ? Promise.resolve(loadedToolDirectory) : getUnifiedToolDirectory(),
  ]);
  const sources: OperationalSystemDetailSources = {
    enterprisesBySlug: Object.fromEntries(
      enterprises.map((enterprise) => [enterprise.slug, enterprise])
    ),
    templates,
    toolDirectory,
  };

  return Object.fromEntries(
    systems.map((system) => [system.slug, buildOperationalSystemDetailFromSources(system, sources)])
  );
}
