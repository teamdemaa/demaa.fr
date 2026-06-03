import type { System } from "@/lib/types";
import {
  getEnterpriseCatalog,
  getEnterpriseBySlug,
  type EnterpriseDefinition,
  type EnterpriseTool,
  type EnterpriseToolReference,
} from "@/lib/enterprise-annuaire";
import {
  getSystemProcessTemplates,
  type SystemPillar,
  type SystemProcessTemplate,
} from "@/lib/system-process-templates";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";
import { getToolDirectorySlug, type ToolDirectoryItem } from "@/lib/tool-directory";

export type { SystemPillar };

export type SystemProcessCard = {
  pillar: SystemPillar;
  title: string;
  description: string;
  examples?: string;
};

export type OperationalSystemDetail = {
  sectorLabel: string;
  editorialSubtitle: string;
  imageTitle: string;
  imageSubtitle: string;
  processes: SystemProcessCard[];
  tools: EnterpriseTool[];
};

type OperationalSystemDetailSources = {
  enterprisesBySlug: Record<string, EnterpriseDefinition>;
  templates: SystemProcessTemplate[];
  toolDirectory: ToolDirectoryItem[];
};

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
): EnterpriseTool[] {
  const toolsBySlug = Object.fromEntries(toolDirectory.map((tool) => [getToolDirectorySlug(tool), tool]));

  if (enterpriseTools?.length) {
    const resolvedTools: EnterpriseTool[] = [];

    for (const toolRef of enterpriseTools) {
      const tool = toolsBySlug[toolRef.slug];

      if (tool) {
        resolvedTools.push({
          slug: getToolDirectorySlug(tool),
          name: tool.name,
          type: tool.category,
          usage: toolRef.usage || tool.bestFor,
          url: tool.url,
        });
      }
    }

    return resolvedTools;
  }

  return fallbackTools ?? [];
}

export async function buildOperationalSystemDetail(system: System): Promise<OperationalSystemDetail> {
  const enterprise = await getEnterpriseBySlug(system.slug);
  const templates = await getSystemProcessTemplates();
  const toolDirectory = await getUnifiedToolDirectory();

  return buildOperationalSystemDetailFromSources(system, {
    enterprisesBySlug: enterprise ? { [system.slug]: enterprise } : {},
    templates,
    toolDirectory,
  });
}

function buildOperationalSystemDetailFromSources(
  system: System,
  sources: OperationalSystemDetailSources,
): OperationalSystemDetail {
  const enterprise = sources.enterprisesBySlug[system.slug] ?? null;
  const templates = sources.templates;
  const toolDirectory = sources.toolDirectory;

  if (enterprise) {
    const operationSource =
      enterprise.operationProcesses?.length
        ? enterprise.operationProcesses
        : enterprise.processes?.filter((process) => normalizePillar(process.pillar) === "Opérations") ?? [];

    const sharedProcesses: SystemProcessCard[] = templates.map((template) => ({
      pillar: template.pillar,
      title: template.title,
      description: template.description,
      examples: enterprise.processExamples?.[template.id],
    }));

    const operationProcesses: SystemProcessCard[] = operationSource.map((process) => ({
      pillar: "Opérations",
      title: process.title,
      description: process.description,
      examples: process.examples,
    }));

    return {
      sectorLabel: enterprise.sectorLabel,
      editorialSubtitle: enterprise.editorialSubtitle,
      imageTitle: enterprise.imageTitle,
      imageSubtitle: enterprise.imageSubtitle,
      processes: [...sharedProcesses, ...operationProcesses],
      tools: resolveEnterpriseTools(enterprise.toolRefs, enterprise.tools, toolDirectory),
    };
  }

  return {
    sectorLabel: "Services & conseil",
    editorialSubtitle: `Les processus essentiels à structurer pour ${system.name.toLowerCase()}.`,
    imageTitle: system.name,
    imageSubtitle: `Aperçu du système opérationnel pour ${system.name.toLowerCase()}`,
    processes: templates.map((template) => ({ ...template })),
    tools: [],
  };
}

export async function buildOperationalSystemDetails(
  systems: System[],
  enterpriseCatalog?: EnterpriseDefinition[],
  loadedToolDirectory?: ToolDirectoryItem[],
): Promise<Record<string, OperationalSystemDetail>> {
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
