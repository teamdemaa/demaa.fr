import type { ActionPlan } from "@/lib/action-plan-contract";

export const ACTION_PLAN_DEMO_SITUATION =
  "Je dirige un restaurant de quartier. Le midi fonctionne correctement, mais je manque de clients le soir et je veux mieux organiser les actions à mener chaque semaine.";

export const ACTION_PLAN_DEMO: ActionPlan = {
  version: "3",
  summary:
    "Cette semaine, clarifiez ce qui attire déjà vos meilleurs clients, rendez la réservation plus simple et testez une action locale mesurable pour le service du soir.",
  systemId: "restaurant",
  actions: [
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
      support: {
        type: "checklist",
        label: "Checklist du parcours de réservation",
        content:
          "□ Horaires exacts\n□ Menu et prix lisibles\n□ Photos récentes\n□ Bouton ou numéro testé\n□ Confirmation reçue après réservation",
      },
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
      support: {
        type: "message",
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
      support: {
        type: "template",
        label: "Fiche de test de l’offre",
        content:
          "Offre testée :\nPériode :\nPrix et marge prévue :\nRéservations attendues :\nRésultat observé :\nDécision : arrêter / ajuster / poursuivre",
      },
      strategyPillar: "offre",
    },
  ],
  strategy: {
    alignment: {
      direction:
        "Un établissement rentable, régulier et apprécié pour une expérience simple et constante.",
      startingPoint:
        "Le midi fonctionne déjà ; le point à comprendre est ce qui freine la fréquentation du soir et la réservation.",
      decisionRules:
        "Tester une seule amélioration à la fois, préserver la marge et la qualité, puis décider à partir des réservations et des retours observés.",
    },
    positioning: {
      preciseCustomer:
        "Les habitants et actifs proches qui cherchent un dîner fiable, accessible et simple à réserver.",
      importantProblem:
        "Ils doivent pouvoir comprendre rapidement ce que le restaurant propose et pourquoi il convient à leur soirée.",
      evidenceAndAlternatives:
        "Les retours des clients, les réservations et les ventes permettront de distinguer une attente réelle d’une intuition.",
    },
    offer: {
      promisedOutcome:
        "Un dîner de qualité, sans mauvaise surprise et adapté au temps disponible du client.",
      scope:
        "Une sélection claire, un prix lisible, un parcours de réservation simple et une expérience régulière.",
      priceCommitmentAndRisk:
        "Vérifier la marge de chaque test et éviter les remises permanentes qui habituent les clients à attendre une promotion.",
    },
    promotion: {
      attract:
        "Commencer par Google, les clients existants et les relais locaux déjà proches de la clientèle recherchée.",
      facilitatePurchase:
        "Afficher les informations essentielles et proposer une réservation fonctionnelle depuis un téléphone.",
      retainAndStrengthen:
        "Recueillir les retours après la visite et donner une raison utile de revenir, sans relances excessives.",
    },
  },
};
