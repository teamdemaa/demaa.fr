import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import rawProcessRegistry from "@/lib/process-registry.generated.json";
import rawProcessSteps from "@/lib/process-steps.generated.json";
import { getOperationalWorkbookV2PilotProfile } from "@/lib/operational-workbook-v2-profiles";
import { isOperationalWorkbookV2PilotSlug } from "@/lib/operational-workbook-v2";
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

export type SystemeRoutine = {
  bullets: string[];
  frequency: string;
  routineId: string;
  support: null | {
    assetRevision: string;
    name: string;
  };
  title: string;
};

export type SystemeDetail = {
  cards: SystemePillarCard[];
  routines: SystemeRoutine[];
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

const MAX_DERIVED_ROUTINES = 12;
const MAX_ROUTINE_BULLETS = 4;

function selectRoutineItems(cards: Map<SystemePillar, SystemeProcessItem[]>) {
  const pillarQueues = [...cards.values()].map((items) => [...items]);
  const selected: SystemeProcessItem[] = [];

  while (
    selected.length < MAX_DERIVED_ROUTINES &&
    pillarQueues.some((items) => items.length > 0)
  ) {
    for (const items of pillarQueues) {
      const item = items.shift();

      if (item) {
        selected.push(item);
      }
      if (selected.length === MAX_DERIVED_ROUTINES) {
        break;
      }
    }
  }

  return selected;
}

function buildDerivedRoutines(
  enterprise: EnterpriseDefinition,
  cards: Map<SystemePillar, SystemeProcessItem[]>,
): SystemeRoutine[] {
  return selectRoutineItems(cards).map((item) => {
    const bullets = item.steps
      .slice(0, MAX_ROUTINE_BULLETS)
      .map((step) => step.step);
    const frequency = item.steps.find((step) => step.recurrence.trim())
      ?.recurrence;

    if (bullets.length < 2 || !frequency) {
      throw new Error(
        `[systeme] Routine publique incomplète pour ${enterprise.slug}: ${item.processId}`,
      );
    }

    return {
      bullets,
      frequency,
      routineId: `routine.${enterprise.slug}.${item.processId}`,
      support: null,
      title: item.process,
    };
  });
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

  const pilotProfile = isOperationalWorkbookV2PilotSlug(enterprise.slug)
    ? getOperationalWorkbookV2PilotProfile(enterprise.slug)
    : null;
  const routines = pilotProfile
    ? pilotProfile.routines.map((routine) => ({
        bullets: routine.sourceStepIds.map((stepId) => {
          const step = processSteps.steps.find(
            (candidate) =>
              candidate.stepId === stepId &&
              candidate.métierId === métier.métierId &&
              candidate.status === "Actif",
          );
          if (!step) {
            throw new Error(
              `[systeme] Contenu source v2 introuvable pour ${enterprise.slug}: ${stepId}`,
            );
          }
          return step.step;
        }),
        frequency: routine.frequency,
        routineId: routine.routineId,
        support: null,
        title: routine.title,
      }))
    : buildDerivedRoutines(enterprise, cards);

  return {
    cards: [...cards.entries()].map(([pillar, items]) => ({ pillar, items })),
    routines,
  };
}
