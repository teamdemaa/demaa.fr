import {
  btpFamilyCoreDraft,
  btpTradeProfiles,
  generateBtpTradeProcessDraft,
} from "@/lib/btp-process-industrialization";
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

export type BtpPublicationStagingEntry = {
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
  draft: ReturnType<typeof generateBtpTradeProcessDraft>,
) {
  return Object.entries(draft.contentByProcessId).reduce(
    (differenceCount, [processId, items]) =>
      differenceCount +
      items.filter(
        (item, index) =>
          item.label !==
          btpFamilyCoreDraft.contentByProcessId[processId]?.[index]?.label,
      ).length,
    0,
  );
}

export function buildBtpPublicationStaging(): BtpPublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];

  return Object.values(btpTradeProfiles)
    .map((profile) => {
      if (profile.reviewState !== "internal_review_complete") {
        throw new Error(
          `${profile.slug}: la relecture interne doit être terminée avant le staging.`,
        );
      }

      const draft = generateBtpTradeProcessDraft(profile);
      const audit = auditProcessDraft(draft, {
        contentCount: 74,
        processCount: 18,
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
        explicitTradeDifferences >= 19;

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
