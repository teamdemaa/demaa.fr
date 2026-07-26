import {
  generateTextileCareDraft,
  textileCareProfiles,
} from "@/lib/textile-care-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; step: string };

export type TextileCarePublicationStagingEntry = {
  slug: string;
  name: string;
  currentContentCount: number;
  currentPlaceholderCount: number;
  targetProcessCount: number;
  targetContentCount: number;
  targetTypeCounts: Record<OperationalContentType, number>;
  distinctiveTradeContentCount: number;
  crossTradeDuplicateCount: number;
  labelsAdded: number;
  labelsRemoved: number;
  auditErrors: string[];
  synchronized: boolean;
  readyForHumanApproval: boolean;
};

const patterns: Record<string, RegExp> = {
  "laverie-automatique":
    /laverie|lave-linge|essoreuse|séchoir|tambour|porte|couvercle|surveillance parentale|monétique|monnayeur|centrale de paiement|cycle|lessive|ronde/i,
  pressing:
    /pressing|pièce|vêtement|textile|tache|détachage|nettoyage à sec|aquanettoyage|solvant|FDS|ICPE|repassage|housse|ticket|atelier/i,
};

export function buildTextileCarePublicationStaging(): TextileCarePublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];
  const targets = Object.values(textileCareProfiles).map((profile) => ({
    profile,
    draft: generateTextileCareDraft(profile),
  }));

  return targets
    .map(({ profile, draft }) => {
      const audit = auditProcessDraft(draft, {
        processCount: profile.processCount,
        contentCount: 74,
      });
      const current = currentSteps.filter(
        (step) => step.métierId === `metier.${profile.slug}`,
      );
      const currentLabels = new Set(current.map((step) => step.step));
      const targetItems = Object.values(draft.contentByProcessId).flat();
      const targetLabels = new Set(targetItems.map((entry) => entry.label));
      const otherLabels = new Set(
        targets
          .filter((target) => target.profile.slug !== profile.slug)
          .flatMap((target) =>
            Object.values(target.draft.contentByProcessId)
              .flat()
              .map((entry) => entry.label),
          ),
      );
      const targetTypeCounts = Object.fromEntries(
        operationalContentTypes.map((type) => [
          type,
          targetItems.filter((entry) => entry.type === type).length,
        ]),
      ) as Record<OperationalContentType, number>;
      const distinctiveTradeContentCount = targetItems.filter((entry) =>
        patterns[profile.slug].test(entry.label),
      ).length;
      const crossTradeDuplicateCount = [...targetLabels].filter((label) =>
        otherLabels.has(label),
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
        distinctiveTradeContentCount,
        crossTradeDuplicateCount,
        labelsAdded,
        labelsRemoved,
        auditErrors: audit.errors,
        synchronized,
        readyForHumanApproval:
          !synchronized &&
          audit.errors.length === 0 &&
          current.length > 0 &&
          distinctiveTradeContentCount >= 12 &&
          crossTradeDuplicateCount === 0,
      };
    })
    .sort((left, right) => left.slug.localeCompare(right.slug, "fr"));
}
