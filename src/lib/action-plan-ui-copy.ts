import type { InterfaceLocaleCode } from "@/lib/international-context";

const copy = {
  fr: {
    situationLabel: "Décrivez les tâches, blocages ou opérations qui vous prennent du temps",
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
      "Je dirige un cabinet comptable. Je collecte encore les pièces, relance les clients et vérifie les échéances dans plusieurs dossiers avant que tout remonte vers moi.",
      "Dans mon restaurant, les plannings, les commandes et les stocks sont suivis à la main. Je passe du temps à rechercher les écarts et à vérifier que tout a été fait.",
      "Je gère une entreprise de plomberie. Les interventions, devis et relances passent par des messages, et les techniciens m’appellent souvent pour obtenir une décision.",
      "Je suis consultante indépendante. La préparation des missions, les comptes rendus, la facturation et les relances me prennent du temps alors que je veux un fonctionnement plus simple.",
    ],
  },
  en: {
    situationLabel: "Describe the tasks, blockers or operations taking up your time",
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
      "I run an accounting practice. I still collect documents, chase clients and check deadlines across several folders before every issue comes back to me.",
      "In my restaurant, schedules, orders and stock are tracked manually. I spend time finding discrepancies and checking that everything was completed.",
      "I run a plumbing business. Jobs, quotes and follow-ups are handled through messages, and technicians often call me to make a decision.",
      "I am an independent consultant. Preparing projects, writing reports, invoicing and following up take time when I need a simpler way of working.",
    ],
  },
} as const;

export function getActionPlanUiCopy(localeCode: InterfaceLocaleCode) {
  return copy[localeCode];
}
