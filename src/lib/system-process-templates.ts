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
};

type SystemProcessTemplatesPayload = {
  templates: SystemProcessTemplate[];
};

const SYSTEM_PROCESS_TEMPLATES_COLLECTION = "system_process_templates";
const processTemplates = rawProcessTemplates as SystemProcessTemplatesPayload;

export const fallbackSystemProcessTemplates = processTemplates.templates;

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
  };
}

export async function getSystemProcessTemplates(): Promise<SystemProcessTemplate[]> {
  try {
    const firestore = getAdminFirestore();
    const snapshot = await firestore.collection(SYSTEM_PROCESS_TEMPLATES_COLLECTION).get();

    if (snapshot.empty) {
      return fallbackSystemProcessTemplates;
    }

    const templates = snapshot.docs
      .map((doc) => normalizeTemplate({ id: doc.id, ...doc.data() }))
      .filter((template): template is SystemProcessTemplate => Boolean(template));

    return templates.length ? templates : fallbackSystemProcessTemplates;
  } catch {
    return fallbackSystemProcessTemplates;
  }
}
