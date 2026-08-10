import type { ActionPlan } from "@/lib/action-plan-contract";

export const ACTION_PLAN_DEMO_SITUATION =
  "Je dirige un restaurant de quartier. Le midi fonctionne correctement, mais je manque de clients le soir et je veux mieux organiser les actions à mener chaque semaine.";

export const ACTION_PLAN_DEMO: ActionPlan = {
  version: "2",
  summary:
    "Cette semaine, clarifiez ce qui attire déjà vos meilleurs clients, rendez la réservation plus simple et testez une action locale mesurable pour le service du soir.",
  systemId: "restaurant",
  systemReason:
    "Le système Restaurant rassemble les processus, solutions et ressources adaptés au pilotage quotidien de cette activité.",
  weeklyActions: [
    {
      id: "action-1",
      title: "Vérifier le parcours de réservation du soir",
      objective:
        "Permettre à une personne qui découvre le restaurant de comprendre l’offre et de réserver sans hésiter.",
      channelOrTool: "Google, site et téléphone",
      steps: [
        "Rechercher le restaurant sur Google depuis un téléphone comme le ferait un nouveau client.",
        "Vérifier les horaires, le menu, les prix, les photos et le moyen de réserver.",
        "Tester réellement le bouton ou le numéro de réservation.",
        "Corriger les informations manquantes ou contradictoires.",
      ],
      readyToUse: null,
      strategyPillar: "promotion",
    },
    {
      id: "action-2",
      title: "Interroger cinq clients réguliers",
      objective:
        "Comprendre ce qu’ils apprécient réellement et ce qui pourrait leur donner envie de venir le soir.",
      channelOrTool: "Conversation sur place ou WhatsApp",
      steps: [
        "Choisir cinq clients qui connaissent déjà bien le restaurant.",
        "Leur demander pourquoi ils viennent, ce qu’ils recommanderaient et ce qui freine une visite le soir.",
        "Noter leurs mots exacts sans essayer de défendre l’offre actuelle.",
        "Regrouper les réponses récurrentes en trois enseignements.",
      ],
      readyToUse: {
        label: "Message prêt à envoyer",
        content:
          "Bonjour, j’améliore actuellement notre service du soir. Vous connaissez bien le restaurant : est-ce que je peux vous poser trois questions rapides ? Vos réponses m’aideront à travailler sur les bons sujets.",
      },
      strategyPillar: "positionnement",
    },
    {
      id: "action-3",
      title: "Tester une offre du soir simple",
      objective:
        "Vérifier si une proposition plus lisible peut augmenter les réservations sans dégrader la marge.",
      channelOrTool: "Carte, équipe et communication locale",
      steps: [
        "Choisir une attente réellement observée dans les retours clients.",
        "Définir une offre courte, rentable et facile à expliquer par l’équipe.",
        "Fixer une période de test et le nombre de réservations attendu.",
        "Noter les ventes, la marge et les retours avant de décider de poursuivre.",
      ],
      readyToUse: null,
      strategyPillar: "offre",
    },
  ],
  strategy: {
    alignment: {
      headline: "Construire un restaurant de quartier stable et reconnu.",
      desiredCompany:
        "Un établissement rentable, régulier et apprécié pour une expérience simple et constante.",
      boundariesAndValues:
        "Préserver la qualité, la transparence des prix et une charge de travail soutenable pour l’équipe.",
      prioritiesAndTradeoffs:
        "Améliorer d’abord la fréquentation du soir sans multiplier les offres ni complexifier les opérations.",
    },
    positioning: {
      headline: "Donner une raison précise de choisir ce restaurant le soir.",
      preciseCustomer:
        "Les habitants et actifs proches qui cherchent un dîner fiable, accessible et simple à réserver.",
      importantProblem:
        "Ils doivent pouvoir comprendre rapidement ce que le restaurant propose et pourquoi il convient à leur soirée.",
      evidenceAndAlternatives:
        "Les retours des clients, les réservations et les ventes permettront de distinguer une attente réelle d’une intuition.",
    },
    offer: {
      headline: "Rendre l’offre du soir immédiatement compréhensible.",
      promisedOutcome:
        "Un dîner de qualité, sans mauvaise surprise et adapté au temps disponible du client.",
      scope:
        "Une sélection claire, un prix lisible, un parcours de réservation simple et une expérience régulière.",
      priceCommitmentAndRisk:
        "Vérifier la marge de chaque test et éviter les remises permanentes qui habituent les clients à attendre une promotion.",
    },
    promotion: {
      headline: "Faire connaître l’offre localement sans communication dispersée.",
      attract:
        "Commencer par Google, les clients existants et les relais locaux déjà proches de la clientèle recherchée.",
      facilitatePurchase:
        "Afficher les informations essentielles et proposer une réservation fonctionnelle depuis un téléphone.",
      retainAndStrengthen:
        "Recueillir les retours après la visite et donner une raison utile de revenir, sans relances excessives.",
    },
  },
  assumptions: [
    "Le restaurant dispose déjà d’une fiche Google et d’un moyen de réservation ou de contact.",
    "La priorité actuelle est d’améliorer le service du soir plutôt que d’ouvrir un nouveau canal de vente.",
  ],
};
