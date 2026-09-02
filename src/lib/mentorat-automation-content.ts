import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/accompagnement";

export const mentoratAutomationContent = {
  hero: {
    title: "Gagnez du temps au quotidien avec l’automatisation et l’IA.",
    description:
      "Pendant un mois, nous avançons avec vous sur les priorités qui font perdre du temps à votre équipe. Nous améliorons l’organisation et automatisons les étapes réellement utiles.",
  },
  offer: {
    duration: AUTOMATION_OFFER.durationLabel,
    price: AUTOMATION_OFFER.price.label,
  },
  examples: [
    "Un message client devient un devis prêt à vérifier.",
    "Une réunion devient un compte rendu et un plan d’action.",
    "Vos e-mails importants sont repérés et vos réponses préparées.",
    "Votre journée devient un plan clair.",
  ],
  autonomy: {
    title: "Votre entreprise avance, même lorsque vous n’êtes pas derrière chaque tâche.",
    description:
      "Les bonnes façons de travailler ne restent plus seulement dans votre tête. Nous les transformons avec vous en méthodes simples que votre équipe peut réutiliser.",
  },
  tools: {
    title: "Nous partons de vos outils.",
    description:
      "Nous travaillons d’abord avec les outils que votre entreprise utilise déjà. Nous organisons les informations, simplifions le travail et automatisons les étapes utiles. Un nouvel outil n’est proposé que s’il apporte un gain concret.",
  },
  method: [
    {
      title: "Choisir les priorités",
      description: "Nous repérons avec vous les tâches et les étapes qui mobilisent inutilement votre équipe.",
    },
    {
      title: "Construire une meilleure méthode",
      description: "Nous améliorons le fonctionnement existant et mettons en place les automatisations utiles.",
    },
    {
      title: "Tester et transmettre",
      description: "Votre équipe teste la méthode, l’ajuste et apprend à la faire évoluer sans dépendre de nous.",
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
        "Les outils évoluent vite. C’est le type de formation qu’il faut reprendre régulièrement pour rester à jour et continuer à améliorer nos façons de travailler.",
      attribution: "Assistante de direction · Entreprise du bâtiment",
    },
    {
      quote:
        "Cette formation m’a ouvert le champ des possibles. Je ne pensais pas qu’on pouvait aller aussi loin avec ces outils. Il y a clairement eu un avant et un après dans ma manière de travailler.",
      attribution: "Product Builder",
    },
  ],
  offerIncludes: [
    "4 rendez-vous d’une heure",
    "Des situations réelles traitées ensemble",
    "Des méthodes réutilisables par votre équipe",
    "1 à 3 participants",
  ],
  faq: [
    {
      question: "Faut-il savoir coder ?",
      answer:
        "Non. Nous partons du travail quotidien de votre entreprise et adaptons la méthode au niveau des personnes qui participent.",
    },
    {
      question: "Faut-il déjà savoir quoi automatiser ?",
      answer:
        "Non. Les premiers échanges servent à repérer les tâches et les étapes qui prennent le plus de temps. Les priorités sont ensuite choisies avec vous.",
    },
    {
      question: "Devons-nous changer nos outils ?",
      answer:
        "Non. Nous partons de votre fonctionnement et des outils déjà utilisés par votre équipe. Nous recommandons un changement uniquement lorsque l’existant ne permet pas d’atteindre le résultat recherché.",
    },
    {
      question: "Qui participe aux rendez-vous ?",
      answer:
        "Le dirigeant peut participer directement ou réunir une équipe projet de 1 à 3 personnes concernées par les priorités choisies.",
    },
    {
      question: "Que peut-on améliorer en un mois ?",
      answer:
        "Nous faisons avancer une ou plusieurs priorités selon leur complexité : organisation d’un suivi, automatisation d’étapes répétitives, production de documents ou amélioration d’un outil interne. Le périmètre est défini avec vous avant de démarrer.",
    },
    {
      question: "Comment se déroule la demande de rappel ?",
      answer:
        "Vous laissez vos coordonnées et nous vous rappelons pour un échange de 30 minutes, sans engagement. Nous faisons le point sur vos priorités et vérifions si l’accompagnement est adapté.",
    },
  ],
} as const;
