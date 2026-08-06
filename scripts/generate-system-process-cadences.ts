import fs from "node:fs";
import path from "node:path";
import {
  agencyTradeProfiles,
  generateAgencyTradeProcessDraft,
} from "@/lib/agency-process-industrialization";
import {
  associationProfile,
  generateAssociationDraft,
} from "@/lib/association-process-industrialization";
import {
  autoSchoolProfile,
  generateAutoSchoolDraft,
} from "@/lib/auto-school-process-industrialization";
import {
  btpTradeProfiles,
  generateBtpTradeProcessDraft,
} from "@/lib/btp-process-industrialization";
import {
  commerceTradeProfiles,
  generateCommerceTradeProcessDraft,
} from "@/lib/commerce-process-industrialization";
import {
  consultingTradeProfiles,
  generateConsultingTradeProcessDraft,
} from "@/lib/consulting-process-industrialization";
import {
  crecheProfile,
  generateCrecheDraft,
} from "@/lib/creche-process-industrialization";
import {
  digitalCommerceProfiles,
  generateDigitalCommerceDraft,
} from "@/lib/digital-commerce-process-industrialization";
import {
  fieldServicesProfiles,
  generateFieldServicesDraft,
} from "@/lib/field-services-process-industrialization";
import {
  financeServicesProfiles,
  generateFinanceServicesDraft,
} from "@/lib/finance-services-process-industrialization";
import {
  fastFoodTradeProfiles,
  generateFastFoodTradeProcessDraft,
} from "@/lib/fast-food-process-industrialization";
import {
  generateHealthBeautyDraft,
  healthBeautyProfiles,
} from "@/lib/health-beauty-process-industrialization";
import {
  generateHealthPracticeDraft,
  healthPracticeProfiles,
} from "@/lib/health-practice-process-industrialization";
import {
  generateHomeSupportDraft,
  homeSupportProfiles,
} from "@/lib/home-support-process-industrialization";
import {
  generateHospitalityEventsDraft,
  hospitalityEventsProfiles,
} from "@/lib/hospitality-events-process-industrialization";
import {
  generateHrSupportDraft,
  hrSupportProfiles,
} from "@/lib/hr-support-process-industrialization";
import {
  generateInvestmentDraft,
  investmentProfiles,
} from "@/lib/investment-process-industrialization";
import {
  generateLogisticsTradeProcessDraft,
  logisticsTradeProfiles,
} from "@/lib/logistics-process-industrialization";
import {
  generatePharmacyDraft,
  pharmacyProfile,
} from "@/lib/pharmacy-process-industrialization";
import {
  plumbingPilotContentByProcessId,
  plumbingPilotProcessDefinitionsById,
} from "@/lib/plumbing-process-pilot";
import type { ProcessDraft } from "@/lib/process-industrialization";
import {
  generateProductionWorkshopDraft,
  productionWorkshopProfiles,
} from "@/lib/production-workshop-process-industrialization";
import {
  generatePropertyOperationsDraft,
  propertyOperationsProfiles,
} from "@/lib/property-operations-process-industrialization";
import {
  generateRealEstateExpertiseDraft,
  realEstateExpertiseProfiles,
} from "@/lib/real-estate-expertise-process-industrialization";
import {
  generateRealEstateInvestmentDraft,
  realEstateInvestmentProfiles,
} from "@/lib/real-estate-investment-process-industrialization";
import {
  generateRealEstateTransactionDraft,
  realEstateTransactionProfiles,
} from "@/lib/real-estate-transaction-process-industrialization";
import {
  generateRegulatedPracticeDraft,
  regulatedPracticeProfiles,
} from "@/lib/regulated-practice-process-industrialization";
import {
  generateSportFitnessDraft,
  sportFitnessProfiles,
} from "@/lib/sport-fitness-process-industrialization";
import {
  generateTechServicesTradeProcessDraft,
  techServicesTradeProfiles,
} from "@/lib/tech-services-process-industrialization";
import {
  generateTextileCareDraft,
  textileCareProfiles,
} from "@/lib/textile-care-process-industrialization";
import {
  generateTrainingDraft,
  trainingProfiles,
} from "@/lib/training-process-industrialization";
import {
  generateWelcomeServicesDraft,
  welcomeServicesProfiles,
} from "@/lib/welcome-services-process-industrialization";
import processRegistry from "@/lib/process-registry.generated.json";

type Profile = Readonly<{ slug: string }>;

type GeneratedCadenceRegistry = Readonly<{
  metadata: Readonly<{
    cadenceCount: number;
    systemCount: number;
    version: string;
  }>;
  cadencesBySystem: Readonly<Record<string, Readonly<Record<string, string>>>>;
}>;

const rootDir = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(
  rootDir,
  "src/lib/system-process-cadences.generated.json",
);
const cadencesBySystem = new Map<string, Record<string, string>>();

function addDraft(systemSlug: string, draft: ProcessDraft) {
  if (cadencesBySystem.has(systemSlug)) {
    throw new Error(`Cadences dupliquées pour ${systemSlug}.`);
  }

  cadencesBySystem.set(
    systemSlug,
    Object.fromEntries(
      Object.entries(draft.definitionsById)
        .sort(([left], [right]) => left.localeCompare(right, "fr"))
        .map(([processId, definition]) => {
          const cadence = definition.cadence.trim();
          if (!cadence) {
            throw new Error(`Cadence vide pour ${systemSlug}: ${processId}.`);
          }
          return [processId, cadence];
        }),
    ),
  );
}

function addProfiles<T extends Profile>(
  profiles: Readonly<Record<string, T>>,
  generateDraft: (profile: T) => ProcessDraft,
) {
  for (const profile of Object.values(profiles)) {
    addDraft(profile.slug, generateDraft(profile));
  }
}

addProfiles(agencyTradeProfiles, generateAgencyTradeProcessDraft);
addDraft(associationProfile.slug, generateAssociationDraft());
addDraft(autoSchoolProfile.slug, generateAutoSchoolDraft());
addProfiles(btpTradeProfiles, generateBtpTradeProcessDraft);
addProfiles(commerceTradeProfiles, generateCommerceTradeProcessDraft);
addProfiles(consultingTradeProfiles, generateConsultingTradeProcessDraft);
addDraft(crecheProfile.slug, generateCrecheDraft());
addProfiles(digitalCommerceProfiles, generateDigitalCommerceDraft);
addProfiles(fastFoodTradeProfiles, generateFastFoodTradeProcessDraft);
addProfiles(fieldServicesProfiles, generateFieldServicesDraft);
addProfiles(financeServicesProfiles, generateFinanceServicesDraft);
addProfiles(healthBeautyProfiles, generateHealthBeautyDraft);
addProfiles(healthPracticeProfiles, generateHealthPracticeDraft);
addProfiles(homeSupportProfiles, generateHomeSupportDraft);
addProfiles(hospitalityEventsProfiles, generateHospitalityEventsDraft);
addProfiles(hrSupportProfiles, generateHrSupportDraft);
addProfiles(investmentProfiles, generateInvestmentDraft);
addProfiles(logisticsTradeProfiles, generateLogisticsTradeProcessDraft);
addDraft(pharmacyProfile.slug, generatePharmacyDraft());
addDraft("plomberie-chauffage", {
  contentByProcessId: plumbingPilotContentByProcessId,
  definitionsById: plumbingPilotProcessDefinitionsById,
});
addProfiles(productionWorkshopProfiles, generateProductionWorkshopDraft);
addProfiles(propertyOperationsProfiles, generatePropertyOperationsDraft);
addProfiles(realEstateExpertiseProfiles, generateRealEstateExpertiseDraft);
addProfiles(realEstateInvestmentProfiles, generateRealEstateInvestmentDraft);
addProfiles(realEstateTransactionProfiles, generateRealEstateTransactionDraft);
addProfiles(regulatedPracticeProfiles, generateRegulatedPracticeDraft);
addProfiles(sportFitnessProfiles, generateSportFitnessDraft);
addProfiles(techServicesTradeProfiles, generateTechServicesTradeProcessDraft);
addProfiles(textileCareProfiles, generateTextileCareDraft);
addProfiles(trainingProfiles, generateTrainingDraft);
addProfiles(welcomeServicesProfiles, generateWelcomeServicesDraft);

const activeSystems = processRegistry.métiers.filter((system) => system.active);
const activeSystemSlugs = new Set(activeSystems.map((system) => system.slug));

for (const generatedSlug of cadencesBySystem.keys()) {
  if (!activeSystemSlugs.has(generatedSlug)) {
    throw new Error(`Cadences générées pour un système inactif : ${generatedSlug}.`);
  }
}

for (const system of activeSystems) {
  const generatedCadences = cadencesBySystem.get(system.slug);
  if (!generatedCadences) {
    throw new Error(`Cadences absentes pour ${system.slug}.`);
  }

  const expectedProcessIds = processRegistry.processes
    .filter(
      (process) =>
        process.familyId === system.familyId && process.status === "Actif",
    )
    .map((process) => process.processId)
    .sort((left, right) => left.localeCompare(right, "fr"));
  const generatedProcessIds = Object.keys(generatedCadences);

  if (JSON.stringify(generatedProcessIds) !== JSON.stringify(expectedProcessIds)) {
    throw new Error(`Couverture Process incohérente pour ${system.slug}.`);
  }
}

const sortedCadences = Object.fromEntries(
  [...cadencesBySystem.entries()].sort(([left], [right]) =>
    left.localeCompare(right, "fr"),
  ),
);
const cadenceCount = Object.values(sortedCadences).reduce(
  (count, cadences) => count + Object.keys(cadences).length,
  0,
);
const payload: GeneratedCadenceRegistry = {
  metadata: {
    cadenceCount,
    systemCount: activeSystems.length,
    version: "1.0.0",
  },
  cadencesBySystem: sortedCadences,
};
const serializedPayload = `${JSON.stringify(payload, null, 2)}\n`;

if (process.argv.includes("--write")) {
  fs.writeFileSync(outputPath, serializedPayload);
} else if (process.argv.includes("--check")) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== serializedPayload) {
    throw new Error(
      "Le registre des cadences Process doit être régénéré avec npm run generate:process-cadences.",
    );
  }
} else {
  process.stdout.write(serializedPayload);
}

console.log(
  `[process-cadences] ${activeSystems.length} systèmes, ${cadenceCount} cadences.`,
);
