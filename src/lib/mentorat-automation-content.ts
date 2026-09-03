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
      title: "Emails",
      description: "Trier, attribuer, préparer les réponses et relancer.",
    },
    {
      title: "Demandes clients",
      description: "Centraliser, suivre et clôturer chaque demande.",
    },
    {
      title: "Devis et tarifs",
      description: "Préparer, faire valider, envoyer et relancer.",
    },
    {
      title: "Facturation",
      description: "Émettre, classer et suivre les règlements.",
    },
    {
      title: "Réunions",
      description: "Préparer, rédiger le compte rendu et distribuer les tâches.",
    },
    {
      title: "Documents et Drive",
      description: "Organiser le classement, les accès et l’archivage.",
    },
    {
      title: "Planning et interventions",
      description: "Planifier, attribuer et suivre les échéances.",
    },
    {
      title: "Prospection",
      description: "Préparer les listes et messages, envoyer et relancer.",
    },
  ],
  systemDefinition: {
    title: "Un système, ce n’est pas seulement un outil.",
    description:
      "C’est un fonctionnement complet qui permet à chacun de savoir quoi faire, quand et avec quelles informations.",
    parts: ["Un déclencheur", "Des étapes claires", "Un responsable", "Les bons outils", "Une validation", "Un suivi"],
  },
  tools: {
    title: "Nous partons de vos outils.",
    description:
      "Nous commençons par définir le bon fonctionnement. Nous configurons ensuite vos outils actuels pour le faire vivre. Un nouvel outil n’est proposé que si l’existant ne permet pas d’obtenir le résultat attendu.",
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
