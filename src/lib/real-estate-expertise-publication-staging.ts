import {
  generateRealEstateExpertiseCoreDraft,
  generateRealEstateExpertiseDraft,
  realEstateExpertiseProfiles,
} from "@/lib/real-estate-expertise-process-industrialization";
import { auditProcessDraft, operationalContentTypes, type OperationalContentType } from "@/lib/process-industrialization";
import processSteps from "@/lib/process-steps.generated.json";

type CurrentStep = { métierId: string; step: string };
export type RealEstateExpertisePublicationStagingEntry = {
  slug: string; name: string; currentContentCount: number; currentPlaceholderCount: number;
  targetProcessCount: number; targetContentCount: number;
  targetTypeCounts: Record<OperationalContentType, number>;
  explicitTradeDifferences: number; distinctiveTradeContentCount: number;
  labelsAdded: number; labelsRemoved: number; auditErrors: string[];
  synchronized: boolean; readyForHumanApproval: boolean;
};
const patterns: Record<string, RegExp> = {
  "architecte-maitre-oeuvre": /architecte|maître d’œuvre|programme|conception|permis|chantier|travaux|visa|réception|DOE|ouvrage|plan/i,
  "diagnostiqueur-immobilier": /diagnostic|DPE|Ademe|amiante|plomb|gaz|électricité|termites|mesurage|certification|étalonnage|rapport/i,
  geometre: /géomètre|topograph|foncier|bornage|limite|parcelle|riverain|GNSS|station totale|implantation|contradictoire|procès-verbal/i,
};

export function buildRealEstateExpertisePublicationStaging(): RealEstateExpertisePublicationStagingEntry[] {
  const currentSteps = processSteps.steps as CurrentStep[];
  const core = generateRealEstateExpertiseCoreDraft();
  return Object.values(realEstateExpertiseProfiles).map((profile) => {
    const draft = generateRealEstateExpertiseDraft(profile);
    const audit = auditProcessDraft(draft, { processCount: 14, contentCount: 74 });
    const current = currentSteps.filter((x) => x.métierId === `metier.${profile.slug}`);
    const currentLabels = new Set(current.map((x) => x.step));
    const targetItems = Object.values(draft.contentByProcessId).flat();
    const targetLabels = new Set(targetItems.map((x) => x.label));
    const targetTypeCounts = Object.fromEntries(operationalContentTypes.map((type) => [
      type, targetItems.filter((x) => x.type === type).length,
    ])) as Record<OperationalContentType, number>;
    const explicitTradeDifferences = Object.entries(draft.contentByProcessId).reduce(
      (n, [id, items]) => n + items.filter((x, i) => x.label !== core.contentByProcessId[id]?.[i]?.label).length, 0,
    );
    const distinctiveTradeContentCount = targetItems.filter((x) => patterns[profile.slug].test(x.label)).length;
    const labelsAdded = [...targetLabels].filter((x) => !currentLabels.has(x)).length;
    const labelsRemoved = [...currentLabels].filter((x) => !targetLabels.has(x)).length;
    const synchronized = current.length === targetItems.length && labelsAdded === 0 && labelsRemoved === 0;
    return {
      slug: profile.slug, name: profile.name, currentContentCount: current.length,
      currentPlaceholderCount: current.filter((x) => /support associé|à personnaliser|modèle à préparer/i.test(x.step)).length,
      targetProcessCount: audit.processCount, targetContentCount: audit.contentCount,
      targetTypeCounts, explicitTradeDifferences, distinctiveTradeContentCount,
      labelsAdded, labelsRemoved, auditErrors: audit.errors, synchronized,
      readyForHumanApproval: !synchronized && audit.errors.length === 0 && current.length > 0 &&
        explicitTradeDifferences === 16 && distinctiveTradeContentCount >= 10,
    };
  }).sort((a, b) => a.slug.localeCompare(b.slug, "fr"));
}
