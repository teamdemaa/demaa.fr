import {
  associationProfile,
  generateAssociationDraft,
} from "@/lib/association-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; step: string };

export type AssociationPublicationStaging = {
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

const associationPattern =
  /association|associatif|statuts|assemblée générale|conseil d’administration|bureau|président|trésorier|secrétaire|adhérent|membre|bénévole|subvention|don|reçu fiscal|financeur|bénéficiaire/i;

export function buildAssociationPublicationStaging(): AssociationPublicationStaging {
  const draft = generateAssociationDraft();
  const audit = auditProcessDraft(draft, {
    processCount: associationProfile.processCount,
    contentCount: 74,
  });
  const current = (processSteps.steps as CurrentStep[]).filter(
    (step) => step.métierId === "metier.association",
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

  return {
    slug: associationProfile.slug,
    name: associationProfile.name,
    currentContentCount: current.length,
    currentPlaceholderCount: current.filter((step) =>
      /support associé|à personnaliser|modèle à préparer/i.test(step.step),
    ).length,
    targetProcessCount: audit.processCount,
    targetContentCount: audit.contentCount,
    targetTypeCounts,
    distinctiveContentCount: targetItems.filter((entry) =>
      associationPattern.test(entry.label),
    ).length,
    labelsAdded,
    labelsRemoved,
    auditErrors: audit.errors,
    synchronized,
    readyForHumanApproval:
      !synchronized &&
      audit.errors.length === 0 &&
      current.length > 0 &&
      targetItems.filter((entry) => associationPattern.test(entry.label))
        .length >= 20,
  };
}
