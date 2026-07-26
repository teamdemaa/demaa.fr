import {
  generateRegulatedPracticeCoreDraft,
  generateRegulatedPracticeDraft,
  regulatedPracticeProfiles,
} from "@/lib/regulated-practice-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; processId: string; step: string };

export type RegulatedPracticePublicationStagingEntry = {
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
  "cabinet-comptable":
    /comptable|comptes|écriture|balance|grand-livre|TVA|fiscal|liasse|EDI|lettre de mission|bénéficiaire effectif|indépendance/i,
  "cabinet-davocat":
    /avocat|barreau|RIN|RPVA|e-Barreau|CARPA|juridiction|audience|conclusions|assignation|honoraires|conflit d’intérêts/i,
  notaire:
    /notaire|notarial|acte|minute|MICEN|clé Real|Télé@ctes|publicité foncière|origine des fonds|hypoth|consentement/i,
  "gestionnaire-paie-independant":
    /paie|bulletin|DSN|DPAE|Urssaf|net-entreprises|PAS|cotisation|convention collective|solde de tout compte|CRM|salarié/i,
};

export function buildRegulatedPracticePublicationStaging(): RegulatedPracticePublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];
  const coreDraft = generateRegulatedPracticeCoreDraft();

  return Object.values(regulatedPracticeProfiles)
    .map((profile) => {
      const draft = generateRegulatedPracticeDraft(profile);
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
