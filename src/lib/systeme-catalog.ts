import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import rawProcessRegistry from "@/lib/process-registry.generated.json";
import rawProcessSteps from "@/lib/process-steps.generated.json";
import type { SystemePillar } from "@/lib/system-canon";

export type SystemeProcessStep = {
  stepId: string;
  order: number;
  step: string;
  defaultOwner: string;
  recurrence: string;
  contentType?: string;
};

export type SystemeProcessItem = {
  processId: string;
  process: string;
  documentId: string;
  document: string;
  steps: SystemeProcessStep[];
};

export type SystemePillarCard = {
  pillar: SystemePillar;
  items: SystemeProcessItem[];
};

export type SystemeDetail = {
  cards: SystemePillarCard[];
};

type ProcessRegistryMétier = {
  métierId: string;
  slug: string;
  familyId: string;
  active: boolean;
};

type ProcessRegistryProcess = {
  processId: string;
  familyId: string;
  pillarLabel: string;
  pillarSpecialization: string;
  process: string;
  documentId: string;
  status: string;
};

type ProcessRegistryDocument = {
  documentId: string;
  name: string;
  sourceUrl: string;
  copyUrl: string;
  status: string;
};

type ProcessRegistryPayload = {
  métiers: ProcessRegistryMétier[];
  processes: ProcessRegistryProcess[];
  documents: ProcessRegistryDocument[];
};

type ProcessStepsPayload = {
  steps: Array<{
    stepId: string;
    métierId: string;
    processId: string;
    order: number;
    step: string;
    defaultOwner: string;
    recurrence: string;
    status: string;
    contentType?: string;
  }>;
};

const processRegistry = rawProcessRegistry as ProcessRegistryPayload;
const processSteps = rawProcessSteps as ProcessStepsPayload;
const métierBySlug = new Map(
  processRegistry.métiers.map((métier) => [métier.slug, métier]),
);
const documentById = new Map(
  processRegistry.documents.map((document) => [document.documentId, document]),
);
const stepsByMétierAndProcess = new Map<string, SystemeProcessStep[]>();

for (const step of processSteps.steps) {
  if (step.status !== "Actif") {
    continue;
  }

  const key = `${step.métierId}::${step.processId}`;
  const steps = stepsByMétierAndProcess.get(key) ?? [];

  steps.push({
    stepId: step.stepId,
    order: step.order,
    step: step.step,
    defaultOwner: step.defaultOwner,
    recurrence: step.recurrence,
    contentType: step.contentType,
  });
  stepsByMétierAndProcess.set(key, steps);
}

for (const steps of stepsByMétierAndProcess.values()) {
  steps.sort((left, right) => left.order - right.order);
}

function assertValidProcess(
  enterprise: EnterpriseDefinition,
  process: ProcessRegistryProcess,
  document: ProcessRegistryDocument | undefined,
) {
  if (
    !process.processId ||
    !process.pillarLabel ||
    !process.process ||
    !process.documentId ||
    !document?.name
  ) {
    throw new Error(
      `[systeme] Process canonique incomplet pour ${enterprise.slug}: ${process.processId}`,
    );
  }
}

export function buildSystemeDetail(
  enterprise: EnterpriseDefinition,
): SystemeDetail | null {
  const métier = métierBySlug.get(enterprise.slug);

  if (!métier?.active || !métier.familyId) {
    return null;
  }

  const cards = new Map<SystemePillar, SystemeProcessItem[]>();

  for (const process of processRegistry.processes) {
    if (process.familyId !== métier.familyId || process.status !== "Actif") {
      continue;
    }

    const document = documentById.get(process.documentId);
    assertValidProcess(enterprise, process, document);

    const pillar = (process.pillarSpecialization ||
      process.pillarLabel) as SystemePillar;
    const item: SystemeProcessItem = {
      processId: process.processId,
      process: process.process,
      documentId: process.documentId,
      document: document?.name ?? "",
      steps:
        stepsByMétierAndProcess.get(
          `${métier.métierId}::${process.processId}`,
        ) ?? [],
    };
    const existingItems = cards.get(pillar);

    if (existingItems) {
      existingItems.push(item);
    } else {
      cards.set(pillar, [item]);
    }
  }

  if (!cards.size) {
    return null;
  }

  return {
    cards: [...cards.entries()].map(([pillar, items]) => ({ pillar, items })),
  };
}
