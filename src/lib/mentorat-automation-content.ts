import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/automatisation";

export const mentoratAutomationContent = {
  hero: {
    title: "Gagnez du temps avec l’automatisation et l’IA.",
    description:
      "Pendant un mois, nous travaillons avec vous pour mieux organiser votre entreprise, automatiser ce qui vous ralentit et utiliser l’IA là où elle est vraiment utile.",
  },
  offer: {
    duration: AUTOMATION_OFFER.durationLabel,
    price: AUTOMATION_OFFER.price.label,
  },
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
  approachPillars: [
    {
      title: "Les tutoriels",
      points: [
        "Des contenus organisés par outil",
        "Des démonstrations réalisées directement à l’écran",
        "Des cas d’usage directement applicables",
        "Un accès pendant 12 mois",
      ],
    },
    {
      title: "Le mentor",
      points: [
        "Un rendez-vous d’une heure chaque semaine",
        "Une équipe projet de 1 à 3 personnes aux rendez-vous",
        "Un point sur ce qui a réellement été réalisé",
        "Les questions et les blocages résolus ensemble",
        "La prochaine étape choisie selon l’avancement",
      ],
    },
  ],
  examples: [
    {
      title: "Organisation et suivi de l’activité",
      description: "Centraliser les informations aujourd’hui dispersées et donner à chacun une vue claire de l’avancement.",
    },
    {
      title: "Parcours clients et traitement des demandes",
      description: "Relier les formulaires, les confirmations, le suivi et les relances sans ressaisie inutile.",
    },
    {
      title: "Documents, synthèses et reportings",
      description: "Produire plus rapidement des synthèses et des livrables avec ChatGPT.",
    },
    {
      title: "Outils internes adaptés à votre entreprise",
      description: "Construire avec Codex un outil adapté lorsque les logiciels existants ne suffisent pas.",
    },
  ],
  tutorialTracks: [
    {
      title: "ChatGPT",
      outcome: "Produire, analyser et structurer plus rapidement.",
    },
    {
      title: "Codex",
      outcome: "Créer et adapter des outils internes.",
    },
    {
      title: "Airtable",
      outcome: "Centraliser et organiser les informations.",
    },
    {
      title: "Fillout",
      outcome: "Collecter les bonnes données avec des formulaires reliés à vos outils.",
    },
    {
      title: "Make",
      outcome: "Relier vos outils et automatiser plusieurs étapes.",
    },
  ],
  offerIncludes: [
    "4 rendez-vous d’une heure avec un mentor pour une équipe projet de 1 à 3 personnes",
    "Des priorités définies au fil de l’accompagnement",
    "Une mise en pratique entre chaque rendez-vous",
    "Des tutoriels pratiques accessibles pendant 12 mois",
    "Des outils et des cas d’usage choisis selon votre entreprise",
  ],
  faq: [
    {
      question: "Faut-il savoir coder ?",
      answer:
        "Non. L’accompagnement part de votre travail quotidien. Les outils et les tutoriels sont choisis selon votre niveau et les améliorations que vous souhaitez faire avancer.",
    },
    {
      question: "Faut-il déjà savoir quoi automatiser ?",
      answer:
        "Non. Les premiers échanges permettent de repérer les meilleurs points de départ. Les priorités peuvent ensuite évoluer au fil des rendez-vous et des résultats obtenus.",
    },
    {
      question: "Qui participe aux rendez-vous ?",
      answer:
        "Les rendez-vous réunissent une équipe projet de 1 à 3 personnes : le dirigeant peut participer directement ou désigner les collaborateurs concernés. Les tutoriels restent accessibles à l’entreprise pendant 12 mois.",
    },
    {
      question: "Que peut-on améliorer en un mois ?",
      answer:
        "L’accompagnement peut faire avancer plusieurs améliorations : mieux organiser un suivi, automatiser des étapes répétitives, accélérer la production de documents ou construire un outil interne simple. Le périmètre évolue selon vos priorités et votre avancement entre les rendez-vous.",
    },
    {
      question: "Combien de temps les tutoriels restent-ils accessibles ?",
      answer:
        "Les tutoriels inclus restent accessibles à votre entreprise pendant 12 mois à compter du démarrage de l’accompagnement.",
    },
    {
      question: "Comment se déroule la demande de rappel ?",
      answer:
        "Vous laissez votre numéro et nous vous rappelons pour un échange de 30 minutes, sans engagement. Nous faisons le point sur vos priorités et vérifions ensemble si l’accompagnement est adapté à votre entreprise.",
    },
    {
      question: "Les abonnements aux outils sont-ils inclus ?",
      answer:
        "Non. Les abonnements aux outils retenus et aux éventuels logiciels connectés restent à la charge de votre entreprise.",
    },
  ],
} as const;
