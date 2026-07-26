import {
  generateHealthPracticeCoreDraft,
  generateHealthPracticeDraft,
  healthPracticeProfiles,
} from "@/lib/health-practice-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
  type OperationalContentType,
} from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; processId: string; step: string };

export type HealthPracticePublicationStagingEntry = {
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
  "cabinet-medical":
    /DMP|Mon espace santé|MSSanté|CPS|e-CPS|Assurance Maladie|parcours de soins|cotation|prescription|résultat|patient|prévention|soins non programmés|DPC/i,
  "cabinet-paramedical":
    /paramédical|prescription|séance|domicile|NGAP|MSSanté|CPS|e-CPS|télétransmission|bilan initial|prescripteur/i,
  dentiste:
    /dentaire|odontogramme|radiograph|prothèse|stérilisation|autoclave|CCAM|fauteuil|dispositif médical sur mesure|radioprotection/i,
  veterinaire:
    /animal|détenteur|vétérinaire|vaccin|zoonose|hospitalisation|ordonnance|médicament|permanence|continuité des soins/i,
  osteopathe:
    /ostéopath|drapeau rouge|anamnèse|examen fonctionnel|manipulation|mobilisation|orientation médicale|acte interdit|complémentaire|grossesse|traumatisme|table|linge|charge physique/i,
  psychologue:
    /psycholog|risque suicidaire|violence|maltraitance|cadre|test|RPPS|Mon soutien psy|notes personnelles|psychiatrique|supervision|charge émotionnelle|téléconsultation/i,
};

export function buildHealthPracticePublicationStaging(): HealthPracticePublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];
  const coreDraft = generateHealthPracticeCoreDraft();

  return Object.values(healthPracticeProfiles)
    .map((profile) => {
      const draft = generateHealthPracticeDraft(profile);
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
          explicitTradeDifferences === 15 &&
          distinctiveTradeContentCount >= 10,
      };
    })
    .sort((left, right) => left.slug.localeCompare(right.slug, "fr"));
}
