import {
  generatePharmacyDraft,
  pharmacyProfile,
} from "@/lib/pharmacy-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; step: string };

export type PharmacyPublicationStaging = {
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

const pharmacyPattern =
  /officine|pharmac|patient|ordonnance|dispensation|prescripteur|médicament|posologie|Dossier Pharmaceutique|lot|péremption|chaîne du froid|rupture|stupéfiant|vaccin|tiers payant|Vitale|télétransmission|vigilance|grossiste/i;

export function buildPharmacyPublicationStaging(): PharmacyPublicationStaging {
  const draft = generatePharmacyDraft();
  const audit = auditProcessDraft(draft, {
    processCount: pharmacyProfile.processCount,
    contentCount: 74,
  });
  const current = (processSteps.steps as CurrentStep[]).filter(
    (step) => step.métierId === "metier.pharmacie",
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
    pharmacyPattern.test(entry.label),
  ).length;

  return {
    slug: pharmacyProfile.slug,
    name: pharmacyProfile.name,
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
