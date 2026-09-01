import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/automatisation";

export const mentoratAutomationContent = {
  hero: {
    title: "Faites gagner du temps à vos équipes avec l’automatisation et l’IA.",
    description:
      "Pendant 8 semaines, vos équipes apprennent avec un mentor à automatiser ce qui leur fait perdre du temps, directement dans leurs outils du quotidien.",
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
  workingRhythm: [
    {
      title: "Chaque semaine",
      points: [
        "Un rendez-vous de 45 minutes",
        "Les prochaines actions à choisir",
        "Les questions et blocages à résoudre",
      ],
    },
    {
      title: "Entre les rendez-vous",
      points: [
        "Des tutoriels ciblés",
        "Une mise en pratique dans l’entreprise",
        "Des résultats à analyser avec le mentor",
      ],
    },
    {
      title: "Selon vos besoins",
      points: [
        "Améliorer les outils existants",
        "Automatiser une ou plusieurs étapes",
        "Créer un outil interne lorsque c’est utile",
      ],
    },
  ],
  examples: [
    "Centraliser des informations aujourd’hui dispersées",
    "Automatiser les saisies, les relances et les notifications",
    "Faire circuler les informations entre plusieurs logiciels",
    "Créer des formulaires et des tableaux de suivi",
    "Analyser ou produire plus rapidement des documents avec l’IA",
    "Construire un outil interne lorsqu’aucun logiciel existant ne convient",
  ],
  academyTopics: [
    {
      title: "Trouver quoi automatiser",
      points: [
        "Repérer les tâches qui prennent du temps",
        "Estimer les gains possibles",
        "Choisir par où commencer",
      ],
    },
    {
      title: "ChatGPT et Codex",
      points: [
        "Analyser et synthétiser des informations",
        "Accélérer certaines tâches quotidiennes",
        "Prototyper un outil interne",
      ],
    },
    {
      title: "Airtable et Fillout",
      points: [
        "Structurer les informations",
        "Créer des vues et des interfaces",
        "Collecter les données avec des formulaires",
      ],
    },
    {
      title: "Make",
      points: [
        "Connecter plusieurs logiciels",
        "Automatiser plusieurs étapes",
        "Tester les scénarios et gérer les erreurs",
      ],
    },
    {
      title: "Faire évoluer ses systèmes",
      points: [
        "Tester sur des situations réelles",
        "Documenter le fonctionnement",
        "Adapter les automatisations dans le temps",
      ],
    },
  ],
  offerIncludes: [
    "8 rendez-vous de 45 minutes avec un mentor",
    "Un accompagnement adapté aux priorités de vos équipes",
    "Des tutoriels accessibles à toute l’entreprise pendant 12 mois",
    "Les nouveaux contenus inclus pendant la période d’accès",
  ],
  faq: [
    {
      question: "Faut-il savoir coder ?",
      answer:
        "Non. L’accompagnement part du travail quotidien de vos équipes. Les outils et les ressources sont choisis selon leur niveau et les sujets qu’elles souhaitent faire avancer.",
    },
    {
      question: "Faut-il déjà savoir quoi automatiser ?",
      answer:
        "Non. Les premiers échanges permettent de repérer les meilleurs points de départ. Les priorités peuvent ensuite évoluer au fil des rendez-vous et des résultats obtenus.",
    },
    {
      question: "Qui participe aux rendez-vous ?",
      answer:
        "Le dirigeant peut participer directement ou faire intervenir les membres de l’équipe concernés par les sujets abordés. Un temps de mise en pratique est à prévoir entre les rendez-vous.",
    },
    {
      question: "Quels sujets peut-on aborder pendant les huit semaines ?",
      answer:
        "L’accompagnement peut porter sur l’organisation des informations, plusieurs automatisations, des formulaires connectés, des tableaux de bord ou des outils internes simples. Les applications critiques et les intégrations très complexes nécessitent un accompagnement technique distinct.",
    },
    {
      question: "Les tutoriels sont-ils mis à jour ?",
      answer:
        "Oui. De nouvelles vidéos et démonstrations sont ajoutées lorsque les outils ou les usages évoluent, puis partagées avec les membres.",
    },
    {
      question: "Les abonnements aux outils sont-ils inclus ?",
      answer:
        "Non. Les abonnements aux outils retenus et aux éventuels logiciels connectés restent à la charge de votre entreprise.",
    },
  ],
} as const;
