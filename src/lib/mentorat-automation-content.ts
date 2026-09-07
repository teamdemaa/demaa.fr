import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/accompagnement";

export const mentoratAutomationContent = {
  hero: {
    title: "On met en place votre système commercial et client. Pour que tout ne repose plus sur vous.",
    lead: "On met en place votre système commercial et client.",
    emphasis: "Pour que tout ne repose plus sur vous.",
    description:
      "De la première prise de contact au suivi après la livraison, nous organisons les étapes, les outils et les modèles qui permettent à chacun de savoir quoi faire et à chaque client de savoir où en est son dossier.",
  },
  why: {
    title: "Une entreprise devient plus solide lorsque son fonctionnement peut être partagé.",
    paragraphs: [
      "Quand les étapes sont claires, l’équipe gagne en autonomie, les clients sont mieux accompagnés et les informations ne restent plus dans la tête d’une seule personne.",
      "C’est ainsi que l’entreprise peut transmettre son savoir-faire, grandir et continuer à bien fonctionner dans le temps.",
    ],
  },
  journeyIntro: {
    title: "Un parcours clair, de la prospection au suivi client.",
    description:
      "Nous relions les moments clés de la relation client pour que les informations circulent et que chaque prochaine action soit visible.",
  },
  journey: [
    {
      title: "Prospecter et vendre",
      promise: "Pour que chaque opportunité avance avec une prochaine action claire.",
      items: [
        "Process commercial",
        "Suivi des prospects",
        "Emails de prospection",
        "Séquences de relance",
        "Grille tarifaire",
        "Proposition commerciale",
      ],
    },
    {
      title: "Accueillir et cadrer",
      promise: "Pour que chaque collaboration commence sur de bonnes bases.",
      items: [
        "Email d’accueil",
        "Trame de brief",
        "Informations et documents à recueillir",
        "Checklist de démarrage",
        "Planning et prochaines étapes",
      ],
    },
    {
      title: "Réaliser et livrer",
      promise: "Pour garder le client informé et présenter le travail de manière claire.",
      items: [
        "Suivi de l’avancement",
        "Points et comptes rendus",
        "Structure des rapports",
        "Présentation des résultats",
        "Modèles de livrables",
        "Validation et livraison",
      ],
    },
    {
      title: "Suivre et fidéliser",
      promise: "Pour poursuivre la relation après la livraison.",
      items: [
        "Bilan de mission",
        "Routine de suivi client",
        "Récolte des avis",
        "Nouvelles opportunités",
        "Réactivation des anciens clients",
      ],
    },
  ],
  foundations: {
    title: "Un fonctionnement que toute l’équipe peut comprendre et utiliser.",
    description:
      "Le système relie cinq éléments simples qui permettent à l’équipe d’avancer de la même manière.",
    items: [
      { title: "Les étapes", description: "Ce qui doit se passer à chaque moment." },
      { title: "Les responsabilités", description: "Qui s’occupe de quoi." },
      { title: "Les outils", description: "Où retrouver et suivre l’information." },
      { title: "Les modèles", description: "Quoi envoyer ou produire." },
      { title: "Les routines", description: "Quand vérifier, relancer et mettre à jour." },
    ],
  },
  cockpit: {
    title: "Tout ce qui mérite votre attention, au même endroit.",
    description:
      "Les informations peuvent rester dans vos outils actuels. Le cockpit rassemble les prochaines actions utiles pour que les prospects avancent, que les clients soient bien suivis et que l’équipe puisse travailler sans attendre systématiquement le dirigeant.",
    items: [
      { title: "À contacter", description: "Les prospects et clients qui attendent un premier échange." },
      { title: "À préparer", description: "Les briefs, propositions, documents et livrables à produire." },
      { title: "À valider", description: "Les décisions et éléments qui demandent un accord." },
      { title: "À relancer", description: "Les échanges et opportunités dont la prochaine action est due." },
    ],
  },
  impacts: {
    title: "Ce que cela change.",
    items: [
      { title: "Pour le dirigeant", description: "Moins de choses à retenir et une vision plus claire de l’activité." },
      { title: "Pour l’équipe", description: "Une méthode commune et davantage d’autonomie au quotidien." },
      { title: "Pour les clients", description: "Des échanges plus fluides, des livraisons mieux préparées et un suivi plus régulier." },
      { title: "Pour l’entreprise", description: "Un fonctionnement plus facile à transmettre, à améliorer et à faire grandir." },
    ],
  },
  methodIntro: {
    title: "On construit le système avec votre réalité.",
    description: "Nous réalisons la mise en place avec vos outils, vos habitudes et les personnes concernées.",
  },
  method: [
    {
      title: "Nous découvrons votre façon de travailler",
      description:
        "Vos clients, vos outils, vos habitudes et les moments où le suivi devient plus difficile.",
    },
    {
      title: "Nous mettons le système en place",
      description:
        "Les étapes, les responsabilités, l’outil de suivi, les documents et les routines.",
    },
    {
      title: "Nous le testons et le transmettons",
      description:
        "Nous l’utilisons sur des situations réelles et accompagnons l’équipe dans sa prise en main.",
    },
  ],
  testimonialsIntro: {
    title: "Une organisation qui change vraiment le quotidien.",
  },
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
  offer: {
    duration: AUTOMATION_OFFER.durationLabel,
    price: AUTOMATION_OFFER.price.label,
    eyebrow: `Maestro · Mise en place · ${AUTOMATION_OFFER.durationLabel}`,
    title: "Votre système commercial et client, prêt à être utilisé en un mois.",
    scope:
      "Nous définissons avec vous le parcours prioritaire et le niveau de mise en place réalisable pendant la mission.",
  },
  offerIncludes: [
    "Votre parcours commercial et client structuré",
    "Votre outil de suivi configuré",
    "Vos étapes et responsabilités définies",
    "Vos emails et séquences de relance prioritaires",
    "Vos documents et modèles prioritaires",
    "Vos trames de rapports et de livrables",
    "Vos routines de suivi",
    "Votre équipe accompagnée dans la prise en main",
  ],
  ongoing: {
    title: "Vous et votre équipe êtes autonomes.",
    description:
      "Le système est documenté, testé avec vous et transmis pour que chacun sache l’utiliser, le mettre à jour et le faire évoluer au quotidien.",
    priceNote: `Le tarif de ${AUTOMATION_OFFER.price.label} est réglé une seule fois.`,
  },
  faq: [
    {
      question: "Est-ce adapté à notre activité ?",
      answer:
        "Nous partons de votre manière de prospecter, vendre et accompagner vos clients. Les étapes, les modèles et l’outil sont adaptés à votre activité, à votre équipe et à la réalité de vos missions.",
    },
    {
      question: "Devons-nous utiliser un CRM ?",
      answer:
        "Pas nécessairement. Le bon outil est celui que votre équipe peut réellement utiliser. Nous pouvons structurer le suivi dans un CRM, dans un outil déjà en place ou dans un espace plus simple lorsque cela suffit.",
    },
    {
      question: "Pouvez-vous partir de nos outils actuels ?",
      answer:
        "Oui. Nous conservons ce qui fonctionne déjà et faisons évoluer uniquement ce qui empêche le parcours d’être clair, partagé et facile à suivre.",
    },
    {
      question: "Les rapports et les modèles de livrables sont-ils inclus ?",
      answer:
        "Oui, lorsque ces documents font partie du parcours prioritaire défini ensemble. Nous préparons les trames utiles pour cadrer, informer, présenter les résultats et livrer plus clairement.",
    },
    {
      question: "Combien de temps cela demande-t-il à notre équipe ?",
      answer:
        "Nous prenons en charge la conception et la mise en place. L’équipe intervient pour nous montrer la réalité du terrain, valider les choix et tester le fonctionnement sur des situations concrètes.",
    },
    {
      question: "Que peut-on mettre en place en un mois ?",
      answer:
        "Nous sélectionnons avec vous le parcours prioritaire, les étapes à clarifier et les modèles les plus utiles. Ce périmètre, les livrables et le résultat attendu sont validés avant le début de la mise en place.",
    },
    {
      question: "Notre équipe pourra-t-elle continuer seule ?",
      answer:
        "Oui. Le système est documenté, testé avec les personnes concernées et transmis pour que l’équipe puisse l’utiliser et le faire évoluer.",
    },
    {
      question: "Demaa peut-elle rester à nos côtés ensuite ?",
      answer:
        "Oui. Après la mission initiale, nous pouvons continuer à suivre le fonctionnement et à améliorer le système avec vous dans un cadre mensuel défini.",
    },
  ],
  finalCta: {
    title: "Construisons une organisation qui ne repose plus uniquement sur vous.",
    description:
      "Commençons par votre parcours commercial et client : l’un des premiers systèmes dont une entreprise a besoin pour travailler, transmettre et grandir sereinement.",
  },
} as const;
