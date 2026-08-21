import type { InterfaceLocaleCode } from "@/lib/international-context";

const copy = {
  fr: {
    heroDescription: "On vous aide à clarifier les priorités, à structurer une activité plus rentable et moins dépendante de vous.",
    situationLabel: "Décrivez la situation de votre entreprise",
    createPlan: "Créer mon plan d’action",
    creatingPlan: "Création du plan…",
    blankPlan: "Commencer avec un plan vierge",
    dictate: "Dicter ma situation",
    stopDictation: "Arrêter la dictée",
    savePlan: "Enregistrez votre plan",
    close: "Fermer",
    expired: "Votre demande a expiré. Décrivez à nouveau votre situation.",
    tooShort: "Décrivez votre situation en quelques phrases pour obtenir un plan utile.",
    alreadyGenerating: "Une génération est déjà en cours.",
    generationFailed: "Impossible de générer le plan pour le moment.",
    autoSaveFailed: "La sauvegarde automatique a échoué.",
    examples: [
      "Je dirige un cabinet comptable de 6 personnes. Les dossiers avancent, mais tout remonte encore vers moi et les échéances sont suivies dans plusieurs fichiers.",
      "Mon restaurant fonctionne bien le midi, mais la marge baisse. Les achats, les plannings et les pertes ne sont pas suivis de façon régulière.",
      "Je développe une entreprise de plomberie avec 4 techniciens. Je veux mieux organiser les interventions, les devis et les relances sans ajouter un outil compliqué.",
      "Je suis consultante indépendante. J’ai des missions, mais mon offre manque de clarté et je veux trouver des clients de manière plus régulière sans démarchage de masse.",
    ],
  },
  en: {
    heroDescription: "Clarify your priorities and build a more profitable business that depends less on you.",
    situationLabel: "Describe what is happening in your business",
    createPlan: "Create my action plan",
    creatingPlan: "Creating your plan…",
    blankPlan: "Start with a blank plan",
    dictate: "Dictate my situation",
    stopDictation: "Stop dictation",
    savePlan: "Save your plan",
    close: "Close",
    expired: "Your request has expired. Please describe your situation again.",
    tooShort: "Describe your situation in a few sentences so the plan can be useful.",
    alreadyGenerating: "A plan is already being generated.",
    generationFailed: "Your plan could not be generated right now.",
    autoSaveFailed: "Automatic saving failed.",
    examples: [
      "I run a SaaS company with a small team. Sales are growing, but every customer decision and product priority still comes back to me.",
      "My web agency is busy, but projects overrun and client feedback is scattered across messages, meetings and documents.",
      "I am an independent consultant with steady projects, but my offer is unclear and new business still depends almost entirely on referrals.",
      "My online training business attracts learners, but completion and repeat sales are inconsistent and I do not have a reliable operating rhythm.",
    ],
  },
} as const;

export function getActionPlanUiCopy(localeCode: InterfaceLocaleCode) {
  return copy[localeCode];
}
