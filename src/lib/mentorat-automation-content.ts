import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/accompagnement";

export const mentoratAutomationContent = {
  hero: {
    title: "Nous mettons de l’ordre dans votre entreprise. Pour que tout ne repose plus sur vous.",
    description:
      "En un mois, nous clarifions vos priorités et mettons en place les systèmes utiles dans vos outils actuels.",
  },
  offer: {
    duration: AUTOMATION_OFFER.durationLabel,
    price: AUTOMATION_OFFER.price.label,
  },
  examplesIntro: {
    title: "Les systèmes que nous pouvons mettre en place.",
    description: "Nous commençons par les sujets qui vous font perdre le plus de temps.",
  },
  examples: [
    {
      title: "Centraliser et suivre les demandes clients",
      description: "Centralisation, attribution et suivi jusqu’à la réponse.",
    },
    {
      title: "Trier les emails et valider les réponses",
      description: "Tri, classement, brouillons de réponse et validation avant envoi.",
    },
    {
      title: "Préparer et relancer les devis et propositions commerciales",
      description: "Grille tarifaire, modèles, préparation, envoi et relances.",
    },
    {
      title: "Facturer plus vite et suivre les règlements",
      description: "Factures à préparer, échéances, paiements reçus et retards.",
    },
    {
      title: "Rassembler les tâches et les priorités",
      description: "Ce qui doit être fait, par qui et pour quand.",
    },
    {
      title: "Organiser l’agenda et le planning",
      description: "Rendez-vous, interventions, changements et disponibilités.",
    },
    {
      title: "Classer les documents dans le Drive",
      description: "Classement, modèles, droits d’accès et bonnes versions.",
    },
    {
      title: "Préparer les réunions et suivre les décisions",
      description: "Ordre du jour, compte rendu, décisions, responsables et actions à suivre.",
    },
  ],
  cockpit: {
    title: "Un cockpit pour suivre l’essentiel.",
    description:
      "Les informations restent dans vos outils. Le cockpit rassemble ce qui demande votre attention et prépare les prochaines actions.",
    items: [
      {
        title: "À traiter",
        description: "Les demandes et les tâches du jour.",
      },
      {
        title: "À valider",
        description: "Les réponses, les devis et les décisions en attente.",
      },
      {
        title: "À relancer",
        description: "Les clients, les règlements et les actions à reprendre.",
      },
    ],
  },
  method: [
    {
      title: "Nous observons",
      description: "Vos outils, vos tâches et ce qui revient encore jusqu’à vous.",
    },
    {
      title: "Nous mettons en place",
      description: "Le classement, les modèles, les étapes et les automatisations utiles.",
    },
    {
      title: "Nous testons et transmettons",
      description:
        "Nous vérifions le fonctionnement avec l’équipe et montrons aux personnes concernées comment l’utiliser.",
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
    {
      quote:
        "Cet accompagnement m’a ouvert le champ des possibles. Je ne pensais pas qu’on pouvait aller aussi loin avec ces outils. Il y a clairement eu un avant et un après dans ma manière de travailler.",
      attribution: "Product Builder",
    },
  ],
  offerIncludes: [
    "Un fonctionnement prioritaire clarifié et documenté",
    "Les étapes, responsabilités et validations définies",
    "Les outils et automatisations nécessaires configurés",
    "Les modèles et supports prêts à être utilisés",
    "Le système testé dans votre activité réelle",
    "Les personnes concernées formées",
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
