import {
  generateRealEstateInvestmentCoreDraft,
  generateRealEstateInvestmentDraft,
  realEstateInvestmentProfiles,
} from "@/lib/real-estate-investment-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; step: string };

export type RealEstateInvestmentPublicationStagingEntry = {
  slug: string;
  name: string;
  currentContentCount: number;
  currentPlaceholderCount: number;
  targetProcessCount: number;
  targetContentCount: number;
  targetTypeCounts: Record<OperationalContentType, number>;
  explicitTradeDifferences: number;
  distinctiveTradeContentCount: number;
  labelsAdded: number;
  labelsRemoved: number;
  auditErrors: string[];
  synchronized: boolean;
  readyForHumanApproval: boolean;
};

const distinctiveTradePatterns: Record<string, RegExp> = {
  "marchand-de-biens":
    /marchand|achat-revente|revendre|revente|stock|portage|division|urbanisme|travaux|TVA|marge|cession|commercialisation/i,
  "investissement-locatif":
    /locatif|loyer|locataire|bail|vacance|impayé|DPE|décence|charges|dépôt|quittance|meublée|rendement/i,
  "investissement-immobilier":
    /portefeuille|allocation|détention|structure|associé|dette|cash-flow|valorisation|concentration|liquidité|refinancement|arbitrage/i,
};

export function buildRealEstateInvestmentPublicationStaging(): RealEstateInvestmentPublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];
  const coreDraft = generateRealEstateInvestmentCoreDraft();

  return Object.values(realEstateInvestmentProfiles)
    .map((profile) => {
      const draft = generateRealEstateInvestmentDraft(profile);
      const audit = auditProcessDraft(draft, {
        processCount: 12,
        contentCount: 74,
      });
      const current = currentSteps.filter(
        (step) => step.métierId === `metier.${profile.slug}`,
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
      const explicitTradeDifferences = Object.entries(
        draft.contentByProcessId,
      ).reduce(
        (total, [processId, items]) =>
          total +
          items.filter(
            (entry, index) =>
              entry.label !==
              coreDraft.contentByProcessId[processId]?.[index]?.label,
          ).length,
        0,
      );
      const distinctiveTradeContentCount = targetItems.filter((entry) =>
        distinctiveTradePatterns[profile.slug].test(entry.label),
      ).length;
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
        slug: profile.slug,
        name: profile.name,
        currentContentCount: current.length,
        currentPlaceholderCount: current.filter((step) =>
          /support associé|à personnaliser|modèle à préparer/i.test(step.step),
        ).length,
        targetProcessCount: audit.processCount,
        targetContentCount: audit.contentCount,
        targetTypeCounts,
        explicitTradeDifferences,
        distinctiveTradeContentCount,
        labelsAdded,
        labelsRemoved,
        auditErrors: audit.errors,
        synchronized,
        readyForHumanApproval:
          !synchronized &&
          audit.errors.length === 0 &&
          current.length > 0 &&
          explicitTradeDifferences === 16 &&
          distinctiveTradeContentCount >= 10,
      };
    })
    .sort((left, right) => left.slug.localeCompare(right.slug, "fr"));
}
