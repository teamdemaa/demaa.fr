import {
  autoSchoolProfile,
  generateAutoSchoolDraft,
} from "@/lib/auto-school-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; processId: string; step: string };

export type AutoSchoolPublicationStagingEntry = {
  slug: string;
  name: string;
  currentContentCount: number;
  currentPlaceholderCount: number;
  targetProcessCount: number;
  targetContentCount: number;
  targetTypeCounts: Record<OperationalContentType, number>;
  distinctiveTradeContentCount: number;
  labelsAdded: number;
  labelsRemoved: number;
  auditErrors: string[];
  synchronized: boolean;
  readyForHumanApproval: boolean;
};

const distinctiveTradePattern =
  /agrément|ANTS|France Titres|NEPH|RdvPermis|livret d’apprentissage|moniteur|enseignant|véhicule|leçon|permis|conduite|examen|code valide|CPF|e-photo|double commande/i;

export function buildAutoSchoolPublicationStaging(): AutoSchoolPublicationStagingEntry {
  const draft = generateAutoSchoolDraft();
  const audit = auditProcessDraft(draft, {
    processCount: 17,
    contentCount: 74,
  });
  const currentSteps = processSteps.steps as CurrentStep[];
  const current = currentSteps.filter(
    (step) => step.métierId === `metier.${autoSchoolProfile.slug}`,
  );
  const currentLabels = new Set(current.map((step) => step.step));
  const targetItems = Object.values(draft.contentByProcessId).flat();
  const targetLabels = new Set(targetItems.map((entry) => entry.label));
  const targetTypeCounts = Object.fromEntries(
    operationalContentTypes.map((type) => [
      type,
      targetItems.filter((entry) => entry.type === type).length,
    ]),
  ) as Record<OperationalContentType, number>;
  const labelsAdded = [...targetLabels].filter(
    (label) => !currentLabels.has(label),
  ).length;
  const labelsRemoved = [...currentLabels].filter(
    (label) => !targetLabels.has(label),
  ).length;
  const distinctiveTradeContentCount = targetItems.filter((entry) =>
    distinctiveTradePattern.test(entry.label),
  ).length;
  const synchronized =
    current.length === targetItems.length &&
    labelsAdded === 0 &&
    labelsRemoved === 0;

  return {
    slug: autoSchoolProfile.slug,
    name: autoSchoolProfile.name,
    currentContentCount: current.length,
    currentPlaceholderCount: current.filter((step) =>
      /support associé|à personnaliser|modèle à préparer/i.test(step.step),
    ).length,
    targetProcessCount: audit.processCount,
    targetContentCount: audit.contentCount,
    targetTypeCounts,
    distinctiveTradeContentCount,
    labelsAdded,
    labelsRemoved,
    auditErrors: audit.errors,
    synchronized,
    readyForHumanApproval:
      !synchronized &&
      audit.errors.length === 0 &&
      current.length > 0 &&
      distinctiveTradeContentCount >= 15,
  };
}
