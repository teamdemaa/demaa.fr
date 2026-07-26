import {
  financeServicesProfiles,
  generateFinanceServicesCoreDraft,
  generateFinanceServicesDraft,
} from "@/lib/finance-services-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; processId: string; step: string };

export type FinanceServicesPublicationStagingEntry = {
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
  "courtier-credit-assurance":
    /IOBSP|IAS|ORIAS|crédit|prêt|emprunteur|banque|assureur|offre|financement|condition suspensive|commission/i,
  "cabinet-assurance":
    /assurance|garantie|sinistre|prime|avenant|résiliation|compagnie|DDA|ORIAS|exigences et besoins|franchise|indemnisation/i,
  "gestionnaire-de-patrimoine":
    /patrimoine|CIF|ORIAS|adéquation|allocation|risque|durabilité|lettre de mission|DER|actifs|passifs|placement|rachat/i,
  "societe-recouvrement":
    /créance|débiteur|créancier|recouvrement|mise en demeure|amiable|forcé|prescription|contestation|reversement|frais|paiement/i,
};

export function buildFinanceServicesPublicationStaging(): FinanceServicesPublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];
  const coreDraft = generateFinanceServicesCoreDraft();

  return Object.values(financeServicesProfiles)
    .map((profile) => {
      const draft = generateFinanceServicesDraft(profile);
      const audit = auditProcessDraft(draft, {
        processCount: 19,
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
