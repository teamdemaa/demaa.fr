import "server-only";

import { getAdminFirestore } from "./firebase-admin";
import rawProcessTemplates from "./system-process-templates.json";

export type SystemPillar =
  | "Stratégie"
  | "Marketing & Vente"
  | "Opérations"
  | "Finance & administration"
  | "Équipe";

export type SystemProcessTemplate = {
  id: string;
  pillar: Exclude<SystemPillar, "Opérations">;
  title: string;
  description: string;
  sort_order?: number;
};

type SystemProcessTemplatesPayload = {
  templates: SystemProcessTemplate[];
};

const SYSTEM_PROCESS_TEMPLATES_COLLECTION = "system_process_templates";
const processTemplates = rawProcessTemplates as SystemProcessTemplatesPayload;

export const fallbackSystemProcessTemplates = processTemplates.templates;
const fallbackSystemProcessTemplateById = new Map(
  fallbackSystemProcessTemplates.map((template) => [template.id, template]),
);

const PILLAR_ORDER: Record<SystemProcessTemplate["pillar"], number> = {
  Stratégie: 1,
  "Marketing & Vente": 2,
  "Finance & administration": 3,
  Équipe: 4,
};

function sortProcessTemplates(templates: SystemProcessTemplate[]): SystemProcessTemplate[] {
  return [...templates].sort((left, right) => {
    const leftOrder = typeof left.sort_order === "number" ? left.sort_order : Number.POSITIVE_INFINITY;
    const rightOrder = typeof right.sort_order === "number" ? right.sort_order : Number.POSITIVE_INFINITY;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    const leftPillarOrder = PILLAR_ORDER[left.pillar] ?? Number.POSITIVE_INFINITY;
    const rightPillarOrder = PILLAR_ORDER[right.pillar] ?? Number.POSITIVE_INFINITY;

    if (leftPillarOrder !== rightPillarOrder) {
      return leftPillarOrder - rightPillarOrder;
    }

    return left.title.localeCompare(right.title, "fr");
  });
}

function normalizeTemplate(data: unknown): SystemProcessTemplate | null {
  const template = data as Partial<SystemProcessTemplate>;

  if (!template.id || !template.pillar || !template.title || !template.description) {
    return null;
  }

  return {
    id: template.id,
    pillar: template.pillar,
    title: template.title,
    description: template.description,
    sort_order: typeof template.sort_order === "number" ? template.sort_order : undefined,
  };
}

function applyLocalTemplateCopy(template: SystemProcessTemplate): SystemProcessTemplate {
  const localTemplate = fallbackSystemProcessTemplateById.get(template.id);

  if (!localTemplate) {
    return template;
  }

  return {
    ...template,
    pillar: localTemplate.pillar,
    title: localTemplate.title,
    description: localTemplate.description,
  };
}

export async function getSystemProcessTemplates(): Promise<SystemProcessTemplate[]> {
  try {
    const firestore = getAdminFirestore();
    const snapshot = await firestore.collection(SYSTEM_PROCESS_TEMPLATES_COLLECTION).get();

    if (snapshot.empty) {
      return sortProcessTemplates(fallbackSystemProcessTemplates);
    }

    const templates = snapshot.docs
      .map((doc) => normalizeTemplate({ id: doc.id, ...doc.data() }))
      .filter((template): template is SystemProcessTemplate => Boolean(template));

    return sortProcessTemplates(
      templates.length ? templates.map(applyLocalTemplateCopy) : fallbackSystemProcessTemplates,
    );
  } catch {
    return sortProcessTemplates(fallbackSystemProcessTemplates);
  }
}
