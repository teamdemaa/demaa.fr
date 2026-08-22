import type { InterfaceLocaleCode } from "@/lib/international-context";

const dictionaries = {
  fr: {
    betaDescription:
      "Clarifiez vos priorités et structurez une activité plus rentable et moins dépendante de vous.",
    betaHeading: "Qu’est-ce qui vous prend trop de temps aujourd’hui ?",
    betaLabel: "Bêta anglaise privée",
  },
  en: {
    betaDescription:
      "Clarify your priorities and build a more profitable business that depends less on you.",
    betaHeading: "What takes too much of your time today?",
    betaLabel: "Private English beta",
  },
} as const;

export type InterfaceDictionary = (typeof dictionaries)[InterfaceLocaleCode];

export function getInterfaceDictionary(
  localeCode: InterfaceLocaleCode,
): InterfaceDictionary {
  return dictionaries[localeCode];
}
