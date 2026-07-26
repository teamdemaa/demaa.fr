import {
  generatePropertyOperationsCoreDraft,
  generatePropertyOperationsDraft,
  propertyOperationsProfiles,
} from "@/lib/property-operations-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; processId: string; step: string };

export type PropertyOperationsPublicationStagingEntry = {
  slug: string;
  name: string;
  family: "syndic" | "rental" | "concierge";
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

export function buildPropertyOperationsPublicationStaging(): PropertyOperationsPublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];

  return Object.values(propertyOperationsProfiles)
    .map((profile) => {
      const coreDraft = generatePropertyOperationsCoreDraft(profile);
      const draft = generatePropertyOperationsDraft(profile);
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
        family: profile.family,
        currentContentCount: current.length,
        currentPlaceholderCount: current.filter((step) =>
          /support associé/i.test(step.step),
        ).length,
        targetProcessCount: audit.processCount,
        targetContentCount: audit.contentCount,
        targetTypeCounts,
        explicitTradeDifferences,
        labelsAdded,
        labelsRemoved,
        auditErrors: audit.errors,
        synchronized,
        readyForHumanApproval:
          !synchronized &&
          audit.errors.length === 0 &&
          current.length > 0 &&
          explicitTradeDifferences === 15,
      };
    })
    .sort((left, right) => left.slug.localeCompare(right.slug, "fr"));
}
