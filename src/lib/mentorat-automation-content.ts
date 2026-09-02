import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/accompagnement";

export const mentoratAutomationContent = {
  hero: {
    title: "Organisez votre entreprise pour qu’elle dépende moins de vous.",
    description:
      "Nous clarifions votre fonctionnement et mettons en place les outils, automatisations et usages de l’IA qui vous font gagner du temps.",
  },
  offer: {
    duration: AUTOMATION_OFFER.durationLabel,
    price: AUTOMATION_OFFER.price.label,
  },
  examples: [
    "Centraliser les demandes et le suivi de vos clients",
    "Clarifier qui fait quoi dans votre équipe",
    "Organiser le planning, les interventions et les échéances",
    "Préparer les devis, documents et comptes rendus",
    "Automatiser les relances, les saisies et les tâches répétitives",
    "Rassembler les informations, rapports et indicateurs utiles",
  ],
  tools: {
    title: "Nous partons de vos outils.",
    description:
      "Nous travaillons d’abord avec les outils que votre entreprise utilise déjà. Nous organisons les informations, simplifions le travail et automatisons les étapes utiles. Un nouvel outil n’est proposé que s’il apporte un gain concret.",
  },
  method: [
    {
      title: "Comprendre votre fonctionnement",
      description:
        "Avant l’atelier, nous vous aidons à réunir les informations utiles. Puis, pendant un atelier de travail de deux heures, nous examinons vos outils, vos méthodes et ce qui ralentit votre équipe.",
    },
    {
      title: "Valider ce que nous allons mettre en place",
      description:
        "Nous transformons ces informations en un plan clair : ce que nous allons organiser, connecter ou automatiser. Vous validez le résultat attendu avant l’exécution.",
    },
    {
      title: "Mettre en place et transmettre",
      description:
        "Nous réalisons les éléments validés, votre équipe les teste et nous effectuons les derniers ajustements. Vous repartez avec un fonctionnement utilisable et modifiable.",
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
    "Plan de mise en place validé avec vous",
    "Organisation des informations et des responsabilités",
    "Mise en place des outils et automatisations retenus",
    "Tests, ajustements et transmission à l’équipe",
  ],
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
        "Le périmètre dépend de votre fonctionnement : organisation d’un suivi, circulation des informations, production de documents, automatisation d’étapes répétitives ou amélioration d’un outil interne. La feuille de route est définie et validée avec vous avant l’exécution.",
    },
    {
      question: "Mon équipe pourra-t-elle continuer sans vous ?",
      answer:
        "Oui. Nous transmettons un fonctionnement utilisable et modifiable, puis nous montrons aux personnes concernées comment s’en servir et le faire évoluer au quotidien.",
    },
  ],
} as const;
