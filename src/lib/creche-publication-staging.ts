import {
  crecheProfile,
  generateCrecheDraft,
} from "@/lib/creche-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; step: string };

export type CrechePublicationStaging = {
  slug: string;
  name: string;
  currentContentCount: number;
  currentPlaceholderCount: number;
  targetProcessCount: number;
  targetContentCount: number;
  targetTypeCounts: Record<OperationalContentType, number>;
  distinctiveContentCount: number;
  labelsAdded: number;
  labelsRemoved: number;
  auditErrors: string[];
  synchronized: boolean;
  readyForHumanApproval: boolean;
};

const crechePattern =
  /crèche|enfant|famille|accueil|PMI|PAI|référent Santé|repas|allerg|sommeil|change|soin|médicament|ordonnance|ratio|professionnel|sortie|maltraitance|hospitalisation|honorabilité|facturation/i;

export function buildCrechePublicationStaging(): CrechePublicationStaging {
  const draft = generateCrecheDraft();
  const audit = auditProcessDraft(draft, {
    processCount: crecheProfile.processCount,
    contentCount: 74,
  });
  const current = (processSteps.steps as CurrentStep[]).filter(
    (step) => step.métierId === "metier.creche",
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
  const synchronized =
    current.length === targetItems.length &&
    labelsAdded === 0 &&
    labelsRemoved === 0;
  const distinctiveContentCount = targetItems.filter((entry) =>
    crechePattern.test(entry.label),
  ).length;

  return {
    slug: crecheProfile.slug,
    name: crecheProfile.name,
    currentContentCount: current.length,
    currentPlaceholderCount: current.filter((step) =>
      /support associé|à personnaliser|modèle à préparer/i.test(step.step),
    ).length,
    targetProcessCount: audit.processCount,
    targetContentCount: audit.contentCount,
    targetTypeCounts,
    distinctiveContentCount,
    labelsAdded,
    labelsRemoved,
    auditErrors: audit.errors,
    synchronized,
    readyForHumanApproval:
      !synchronized &&
      audit.errors.length === 0 &&
      current.length > 0 &&
      distinctiveContentCount >= 20,
  };
}
