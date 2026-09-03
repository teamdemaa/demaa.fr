import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/accompagnement";

export const mentoratAutomationContent = {
  hero: {
    title: "Mettez de l’ordre dans votre entreprise. Et des systèmes pour que ça dure.",
    description:
      "En un mois, nous clarifions votre fonctionnement puis mettons en place les systèmes opérationnels prioritaires définis avec vous, pour que les demandes, les documents et les tâches avancent sans que vous ayez à tout suivre vous-même.",
  },
  offer: {
    duration: AUTOMATION_OFFER.durationLabel,
    price: AUTOMATION_OFFER.price.label,
  },
  examples: [
    {
      title: "Gestion structurée des emails",
      description: "Tri, classement, attribution, brouillons de réponse et relances.",
    },
    {
      title: "Suivi des demandes clients",
      description: "Chaque demande est centralisée, priorisée, attribuée et suivie jusqu’à sa clôture.",
    },
    {
      title: "Devis et grille tarifaire",
      description: "Les tarifs sont clarifiés et les devis préparés, validés, envoyés puis relancés.",
    },
    {
      title: "Facturation et règlements",
      description: "Les factures sont préparées, les pièces classées et les paiements suivis.",
    },
    {
      title: "Réunions et comptes rendus",
      description: "Ordre du jour, compte rendu, décisions, responsables et tâches à suivre.",
    },
    {
      title: "Drive et documents structurés",
      description: "Arborescence, nommage, droits d’accès, modèles et archivage.",
    },
    {
      title: "Planning opérationnel partagé",
      description: "Interventions, responsables, échéances et alertes réunis au même endroit.",
    },
    {
      title: "Prospection commerciale organisée",
      description: "Fichiers, messages, validations, envois et relances sont suivis.",
    },
  ],
  operationalBrain: {
    title: "Nous construisons le cerveau opérationnel de votre entreprise.",
    description:
      "Nous rassemblons les informations, les règles, les modèles et les responsabilités dont votre équipe a besoin. Puis nous les transformons en systèmes clairs pour que chacun sache quoi faire et que rien ne se perde.",
    levels: [
      {
        title: "Ce que votre entreprise sait",
        description: "Documents, tarifs, modèles et informations clients.",
      },
      {
        title: "Comment le travail avance",
        description: "Étapes, responsables, validations et relances.",
      },
      {
        title: "Les outils qui le font fonctionner",
        description: "Messagerie, Drive, agenda, Notion, CRM et facturation.",
      },
    ],
  },
  tools: {
    title: "Nous travaillons dans vos outils actuels.",
    description:
      "Nous intervenons directement dans les outils que votre équipe utilise déjà. Un nouvel outil n’est proposé que si l’existant ne permet pas d’obtenir le résultat attendu.",
    examples: [
      "Gmail ou Outlook",
      "Google Drive ou OneDrive",
      "Notion",
      "Votre CRM",
      "Votre outil de devis ou de facturation",
    ],
    access:
      "Vous nous accordez uniquement les accès nécessaires à la mission et vous pouvez les retirer à tout moment.",
  },
  method: [
    {
      title: "Identifier ce qui repose sur vous",
      description:
        "Avant l’atelier, nous vous aidons à réunir les informations utiles. Puis, pendant un atelier de travail de deux heures, nous examinons vos outils, vos méthodes et ce qui ralentit votre équipe.",
    },
    {
      title: "Choisir les systèmes prioritaires",
      description:
        "Nous définissons avec vous les systèmes à mettre en place en priorité, leur résultat attendu, leur périmètre et les personnes concernées.",
    },
    {
      title: "Mettre en place et transmettre",
      description:
        "Nous construisons les systèmes, configurons les outils, testons leur fonctionnement et formons les personnes qui devront les utiliser.",
    },
  ],
  testimonials: [
    {
      quote:
        "En mettant en place ces systèmes, nous avons gagné environ 30 % de temps. Maîtriser les outils et savoir les relier a vraiment changé notre manière de travailler.",
      attribution: "Chef de mission comptable",
    },
    {
      quote:
        "Les outils évoluent vite. C’est le type d’accompagnement qu’il faut reprendre régulièrement pour rester à jour et continuer à améliorer nos façons de travailler.",
      attribution: "Assistante de direction · Entreprise du bâtiment",
    },
  ],
  offerIncludes: [
    "Analyse de votre fonctionnement actuel",
    "Identification des blocages et dépendances au dirigeant",
    "Définition d’un périmètre prioritaire validé avec vous",
    "Conception et mise en place de ces systèmes",
    "Configuration des outils et automatisations nécessaires",
    "Tests, documentation et formation de l’équipe",
  ],
  ongoing: {
    title: "Après le premier mois, vous choisissez.",
    description:
      "Votre équipe peut reprendre les systèmes en main ou nous pouvons continuer à les faire vivre avec vous.",
    options: [
      {
        title: "Votre équipe prend la suite",
        description:
          "Les systèmes sont documentés et les personnes responsables sont formées pour les utiliser et les faire évoluer.",
      },
      {
        title: "Demaa reste à vos côtés",
        description:
          "Nous prenons en charge les actions confiées, surveillons le fonctionnement et améliorons les systèmes dans un périmètre mensuel défini.",
      },
    ],
    note: "Le suivi est optionnel. Son périmètre et ses modalités sont définis avec vous après la mission initiale.",
  },
  faq: [
    {
      question: "Je ne sais pas par où commencer. Est-ce un problème ?",
      answer:
        "Non. La préparation et l’atelier de travail servent justement à comprendre votre fonctionnement, repérer ce qui vous fait perdre du temps et définir les priorités avec vous.",
    },
    {
      question: "Est-ce adapté à notre activité ?",
      answer:
        "Nous ne partons pas d’une méthode toute faite. Nous examinons la manière dont votre entreprise travaille réellement, puis nous adaptons l’organisation et les solutions à votre activité.",
    },
    {
      question: "Combien de temps cela demande-t-il à mon équipe ?",
      answer:
        "Nous prenons en charge la conception et la mise en place. Votre équipe intervient aux moments utiles pour nous expliquer la réalité du terrain, valider les choix et tester le nouveau fonctionnement.",
    },
    {
      question: "Devons-nous changer nos outils ?",
      answer:
        "Non. Nous partons de votre fonctionnement et des outils déjà utilisés par votre équipe. Nous recommandons un changement uniquement lorsque l’existant ne permet pas d’atteindre le résultat recherché.",
    },
    {
      question: "Que peut-on réellement mettre en place en un mois ?",
      answer:
        "Après l’atelier, nous définissons précisément les systèmes à mettre en place et leur niveau de complexité. Le périmètre, les livrables et le résultat attendu sont écrits et validés avec vous avant le début de l’exécution.",
    },
    {
      question: "Mon équipe pourra-t-elle continuer sans vous ?",
      answer:
        "Oui. Nous transmettons un fonctionnement utilisable et modifiable, puis nous montrons aux personnes concernées comment s’en servir et le faire évoluer au quotidien.",
    },
    {
      question: "Pouvez-vous également faire fonctionner les systèmes pour nous ?",
      answer:
        "Oui. À la fin de la mission initiale, votre équipe peut prendre la suite ou Demaa peut continuer à exploiter et améliorer les systèmes dans le cadre d’un suivi mensuel au périmètre défini.",
    },
  ],
} as const;
