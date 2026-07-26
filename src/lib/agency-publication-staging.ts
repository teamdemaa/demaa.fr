import {
  agencyFamilyCoreDraft,
  agencyTradeProfiles,
  generateAgencyTradeProcessDraft,
} from "@/lib/agency-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = {
  métierId: string;
  processId: string;
  step: string;
};

export type AgencyPublicationStagingEntry = {
  slug: string;
  name: string;
  reviewState: "internal_review_complete";
  currentContentCount: number;
  currentPlaceholderCount: number;
  targetProcessCount: number;
  targetContentCount: number;
  targetTypeCounts: Record<OperationalContentType, number>;
  explicitTradeDifferences: number;
  labelsAdded: number;
  labelsRemoved: number;
  auditErrors: string[];
  synchronized: boolean;
  readyForHumanApproval: boolean;
};

function countTradeDifferences(
  draft: ReturnType<typeof generateAgencyTradeProcessDraft>,
) {
  return Object.entries(draft.contentByProcessId).reduce(
    (differenceCount, [processId, items]) =>
      differenceCount +
      items.filter(
        (item, index) =>
          item.label !==
          agencyFamilyCoreDraft.contentByProcessId[processId]?.[index]?.label,
      ).length,
    0,
  );
}

export function buildAgencyPublicationStaging(): AgencyPublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];

  return Object.values(agencyTradeProfiles)
    .map((profile) => {
      const draft = generateAgencyTradeProcessDraft(profile);
      const audit = auditProcessDraft(draft, {
        contentCount: 74,
        processCount: 19,
      });
      const current = currentSteps.filter(
        (step) => step.métierId === `metier.${profile.slug}`,
      );
      const currentLabels = new Set(current.map((step) => step.step));
      const targetItems = Object.values(draft.contentByProcessId).flat();
      const targetLabels = new Set(targetItems.map((item) => item.label));
      const targetTypeCounts = Object.fromEntries(
        operationalContentTypes.map((type) => [
          type,
          targetItems.filter((item) => item.type === type).length,
        ]),
      ) as Record<OperationalContentType, number>;
      const currentPlaceholderCount = current.filter((step) =>
        /mettre en place et tenir à jour le support associé/i.test(step.step),
      ).length;
      const explicitTradeDifferences = countTradeDifferences(draft);
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
      const readyForHumanApproval =
        !synchronized &&
        audit.errors.length === 0 &&
        current.length > 0 &&
        explicitTradeDifferences >= 14;

      return {
        slug: profile.slug,
        name: profile.name,
        reviewState: profile.reviewState,
        currentContentCount: current.length,
        currentPlaceholderCount,
        targetProcessCount: audit.processCount,
        targetContentCount: audit.contentCount,
        targetTypeCounts,
        explicitTradeDifferences,
        labelsAdded,
        labelsRemoved,
        auditErrors: audit.errors,
        synchronized,
        readyForHumanApproval,
      };
    })
    .sort((left, right) => left.slug.localeCompare(right.slug, "fr"));
}
