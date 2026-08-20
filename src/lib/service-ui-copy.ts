import { defineLocaleDictionary } from "@/lib/international-publication";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const copy = defineLocaleDictionary({
  fr: {
    packagesHeading: "Forfaits",
    packagesDescription: "Choisissez le périmètre le plus proche de votre besoin. La Team confirme son adéquation avant tout démarrage.",
    monthlyBenefit: "Avantage accompagnement mensuel : −12 % sur les prestations Demaa éligibles.",
    expectedResult: "Résultat attendu",
    included: "Ce qui est inclus",
    conditions: "Conditions",
    notIncluded: "Non inclus",
  },
  en: {
    packagesHeading: "Packages",
    packagesDescription: "Choose the scope closest to your needs. The team confirms that it is suitable before any work starts.",
    monthlyBenefit: "Monthly support benefit: 12% off eligible Demaa services.",
    expectedResult: "Expected outcome",
    included: "What is included",
    conditions: "Conditions",
    notIncluded: "Not included",
  },
});

export function getServiceUiCopy(localeCode: InterfaceLocaleCode) {
  return copy[localeCode];
}
