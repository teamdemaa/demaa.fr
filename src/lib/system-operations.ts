import type { System } from "@/lib/types";
import { getEnterpriseBySlug, type EnterpriseTool } from "@/lib/enterprise-annuaire";
import { getSystemProcessTemplates, type SystemPillar } from "@/lib/system-process-templates";

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

function normalizePillar(pillar: string): SystemPillar {
  if (pillar === "Finance & Juridique") {
    return "Finance & administration";
  }

  return pillar as SystemPillar;
}

export async function buildOperationalSystemDetail(system: System): Promise<OperationalSystemDetail> {
  const enterprise = await getEnterpriseBySlug(system.slug);
  const templates = await getSystemProcessTemplates();

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
      tools: enterprise.tools,
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
