import type { InterfaceLocaleCode } from "@/lib/international-context";
import type {
  CompanyMonth,
  CompanyStrategyAnswerKey,
  CompanyStrategyPillar,
} from "@/lib/company-pilotage-contract";

type StrategyPillarCopy = {
  key: CompanyStrategyPillar;
  label: string;
  framing: string;
  questions: readonly { key: CompanyStrategyAnswerKey; label: string }[];
};

const copy = {
  fr: {
    sections: { actions: "Plan d’action", figures: "Chiffres", strategy: "Stratégie" },
    pilotageLabel: "Pilotage de l’entreprise",
    sectionNavigationLabel: "Sections du plan et du pilotage",
    figures: {
      period: "Période", current: "Ce mois", months3: "3 mois", months6: "6 mois", months12: "12 mois", custom: "Période…",
      from: "Du", to: "Au", enterMonth: "Saisir un mois", invalidPeriod: "Choisissez une période valide de 24 mois maximum.",
      loadError: "Impossible de charger les chiffres.", retry: "Réessayer", loading: "Chargement des chiffres…",
      revenue: "Chiffre d’affaires", revenueShort: "CA", expenses: "Charges", result: "Résultat de pilotage", cash: "Dernière trésorerie", cashShort: "Trésorerie",
      nonAccounting: "Indicateur de pilotage, non comptable.", monthlyChange: "Évolution mensuelle", compare: "Comparer",
      keyboardInstructions: "Utilisez la touche Tab pour parcourir les mois et entendre leurs valeurs.", chart: "Graphique", overMonths: "sur {count} mois",
      monthlyDetail: "Détail mensuel", edit: "Modifier", add: "Ajouter",
    },
    metricDialog: {
      title: "Saisir les chiffres du mois", description: "Les montants sont enregistrés en euros, au niveau de l’entreprise.", close: "Fermer",
      month: "Mois", revenue: "Chiffre d’affaires (€)", expenses: "Charges (€)", cash: "Trésorerie en fin de mois (€)", placeholder: "0,00",
      invalidMonth: "Choisissez un mois valide.", decimals: "Saisissez un montant avec deux décimales maximum.", invalidAmount: "Montant invalide.", nonNegative: "Ce montant ne peut pas être négatif.",
      conflict: "Ce mois a été modifié ailleurs.", saveError: "Impossible d’enregistrer ce mois.", keep: "Garder mes valeurs", recent: "Utiliser la version récente", retry: "Réessayer", update: "Mettre à jour", add: "Ajouter",
    },
    strategy: {
      title: "Stratégie", description: "Quatre repères pour garder un cap clair.", newCycle: "Nouveau cycle", close: "Fermer", loading: "Chargement de la stratégie…",
      loadError: "Impossible de charger la stratégie.", initializeError: "Impossible d’initialiser la stratégie.", savePending: "Sauvegarde en attente", saving: "Sauvegarde en cours", saved: "Sauvegarde terminée", saveError: "Impossible d’enregistrer la stratégie.",
      conflict: "Certaines réponses ont été modifiées ailleurs.", conflictStatus: "Conflit de sauvegarde", failedStatus: "Échec de la sauvegarde", conflictsInstruction: "Choisissez une version pour chaque réponse en conflit.", retry: "Réessayer",
      cycleBlocked: "Résolvez ou réessayez la sauvegarde en cours avant de créer un cycle.", cycleCreateError: "Impossible de créer le nouveau cycle.", cycleCreated: "Nouveau cycle créé", rangeSeparator: "à",
      answerConflict: "Cette réponse a aussi été modifiée ailleurs.", recentVersion: "Version récente :", emptyAnswer: "Réponse vide", keep: "Garder ma version", recent: "Utiliser la version récente",
      history: "Historique des cycles", historyError: "Impossible de charger l’historique.", createdOn: "Créé le", hide: "Masquer", view: "Consulter", loadMore: "Afficher 10 cycles de plus",
      dialogTitle: "Créer un nouveau cycle ?", nextPeriod: "Prochaine période ·", dialogDescription: "Le nouveau cycle commencera vide. Le cycle en cours restera disponible dans l’historique.", cancel: "Annuler", create: "Créer le cycle",
    },
    pillars: [
      { key: "alignment", label: "Alignement", framing: "Vos ambitions, vos forces et vos contraintes.", questions: [
        { key: "alignment_1", label: "Qu’est-ce que vous voulez que cette entreprise vous apporte ?" },
        { key: "alignment_2", label: "Qu’est-ce que vous faites particulièrement bien, et comment le savez-vous ?" },
        { key: "alignment_3", label: "Avec quelles contraintes composez-vous en ce moment : temps, argent, énergie ?" },
      ] },
      { key: "positioning", label: "Positionnement", framing: "Pour qui et avec quel angle ?", questions: [
        { key: "positioning_1", label: "Qui voulez-vous servir en priorité ?" },
        { key: "positioning_2", label: "Quel problème important résolvez-vous pour eux ?" },
        { key: "positioning_3", label: "Que fait le client aujourd’hui à la place, et qu’est-ce qui distingue votre manière de résoudre ce problème ?" },
      ] },
      { key: "offer", label: "Offre", framing: "Quel résultat est vendu et comment gagne-t-on de l’argent ?", questions: [
        { key: "offer_1", label: "Quel résultat concret le client vient-il chercher ?" },
        { key: "offer_2", label: "Que comprend exactement l’offre ?" },
        { key: "offer_3", label: "À quel prix, comment est-elle facturée, et est-ce validé ou encore une hypothèse ?" },
      ] },
      { key: "promotion", label: "Promotion", framing: "Comment attirer, convertir et fidéliser ?", questions: [
        { key: "promotion_1", label: "Comment les bons clients vous découvrent-ils ?" },
        { key: "promotion_2", label: "Qu’est-ce qui les aide à passer à l’achat ?" },
        { key: "promotion_3", label: "Comment entretenez-vous la relation pour favoriser le réachat et la recommandation ?" },
      ] },
    ] satisfies readonly StrategyPillarCopy[],
  },
  en: {
    sections: { actions: "Action plan", figures: "Key figures", strategy: "Strategy" },
    pilotageLabel: "Business planning", sectionNavigationLabel: "Action plan and business planning sections",
    figures: {
      period: "Period", current: "This month", months3: "3 months", months6: "6 months", months12: "12 months", custom: "Custom period…",
      from: "From", to: "To", enterMonth: "Enter a month", invalidPeriod: "Choose a valid period of no more than 24 months.", loadError: "Your figures could not be loaded.", retry: "Try again", loading: "Loading your figures…",
      revenue: "Revenue", revenueShort: "Revenue", expenses: "Expenses", result: "Operating result", cash: "Latest cash balance", cashShort: "Cash balance", nonAccounting: "A management indicator, not an official accounting result.",
      monthlyChange: "Monthly change", compare: "Compare", keyboardInstructions: "Use the Tab key to move through the months and hear their values.", chart: "Chart", overMonths: "over {count} months", monthlyDetail: "Monthly detail", edit: "Edit", add: "Add",
    },
    metricDialog: {
      title: "Enter monthly figures", description: "Amounts are stored in euros for the company.", close: "Close", month: "Month", revenue: "Revenue (€)", expenses: "Expenses (€)", cash: "End-of-month cash balance (€)", placeholder: "0.00",
      invalidMonth: "Choose a valid month.", decimals: "Enter an amount with no more than two decimal places.", invalidAmount: "Invalid amount.", nonNegative: "This amount cannot be negative.", conflict: "This month was changed elsewhere.", saveError: "This month could not be saved.", keep: "Keep my values", recent: "Use the latest version", retry: "Try again", update: "Update", add: "Add",
    },
    strategy: {
      title: "Strategy", description: "Four areas to keep your direction clear.", newCycle: "New cycle", close: "Close", loading: "Loading your strategy…", loadError: "Your strategy could not be loaded.", initializeError: "Your strategy could not be initialized.", savePending: "Save pending", saving: "Saving", saved: "Saved", saveError: "Your strategy could not be saved.", conflict: "Some answers were also changed elsewhere.", conflictStatus: "Save conflict", failedStatus: "Save failed", conflictsInstruction: "Choose a version for each conflicting answer.", retry: "Try again", cycleBlocked: "Resolve or retry the current save before creating a cycle.", cycleCreateError: "The new cycle could not be created.", cycleCreated: "New cycle created", rangeSeparator: "to", answerConflict: "This answer was also changed elsewhere.", recentVersion: "Latest version:", emptyAnswer: "Empty answer", keep: "Keep my version", recent: "Use the latest version", history: "Cycle history", historyError: "The cycle history could not be loaded.", createdOn: "Created on", hide: "Hide", view: "View", loadMore: "Show 10 more cycles", dialogTitle: "Create a new cycle?", nextPeriod: "Next period ·", dialogDescription: "The new cycle will start empty. The current cycle will remain available in the history.", cancel: "Cancel", create: "Create cycle",
    },
    pillars: [
      { key: "alignment", label: "Alignment", framing: "Your ambitions, strengths and constraints.", questions: [
        { key: "alignment_1", label: "What do you want this business to give you?" },
        { key: "alignment_2", label: "What do you do particularly well, and how do you know?" },
        { key: "alignment_3", label: "What constraints are you working with right now: time, money or energy?" },
      ] },
      { key: "positioning", label: "Positioning", framing: "Who is it for, and what is your angle?", questions: [
        { key: "positioning_1", label: "Who do you most want to serve?" },
        { key: "positioning_2", label: "What important problem do you solve for them?" },
        { key: "positioning_3", label: "What do customers do instead today, and what makes your way of solving the problem different?" },
      ] },
      { key: "offer", label: "Offer", framing: "What result do you sell, and how does the business make money?", questions: [
        { key: "offer_1", label: "What specific result is the customer looking for?" },
        { key: "offer_2", label: "What exactly does the offer include?" },
        { key: "offer_3", label: "What is the price, how is it charged, and is this validated or still a hypothesis?" },
      ] },
      { key: "promotion", label: "Promotion", framing: "How do you attract, convert and retain customers?", questions: [
        { key: "promotion_1", label: "How do the right customers discover you?" },
        { key: "promotion_2", label: "What helps them decide to buy?" },
        { key: "promotion_3", label: "How do you maintain the relationship to encourage repeat business and referrals?" },
      ] },
    ] satisfies readonly StrategyPillarCopy[],
  },
} as const;

export function getCompanyPilotageUiCopy(localeCode: InterfaceLocaleCode) { return copy[localeCode]; }

export function formatCompanyMonth(period: CompanyMonth, localeCode: InterfaceLocaleCode) {
  const [year, month] = period.split("-").map(Number);
  const label = new Intl.DateTimeFormat(localeCode === "fr" ? "fr-FR" : "en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  return localeCode === "fr" ? label.charAt(0).toUpperCase() + label.slice(1) : label;
}

export function formatCompanyMetricCents(value: number | null, localeCode: InterfaceLocaleCode) {
  if (value === null) return "-";
  return new Intl.NumberFormat(localeCode === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value / 100);
}
