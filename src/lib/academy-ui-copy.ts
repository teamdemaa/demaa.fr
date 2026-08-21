import type { InterfaceLocaleCode } from "@/lib/international-context";

type AcademyUiCopy = {
  index: {
    all: string;
    academy: string;
    heroLead: string;
    heroEmphasis: string;
    tutorials: string;
    content: string;
    courses: string;
    search: string;
    searchPlaceholder: string;
    hideCategories: string;
    showCategories: string;
    filterByCategory: string;
    showLess: string;
    showMore: string;
    noContent: string;
    noContentHint: string;
    open: (title: string) => string;
    guidedTutorial: (sector: string, durationMinutes: number) => string;
  };
  player: {
    questionProgress: (index: number, total: number) => string;
    questionStep: (index: number, total: number) => string;
    correct: string;
    incorrect: string;
    situation: string;
    stepProgress: (index: number, total: number) => string;
    lessonProgress: (index: number, total: number) => string;
    recap: string;
    complete: string;
    back: string;
    knowledgeQuiz: string;
    courseContent: string;
    keyIdea: string;
    keyTakeaway: string;
    courseComplete: string;
    essentials: string;
    finishDescription: string;
    practice: string;
    navigation: string;
    previous: string;
    startCourse: string;
    nextQuestion: string;
    next: string;
  };
  panel: {
    loadFailed: string;
    retry: string;
    loading: string;
  };
  diagram: {
    revenue: string;
    costs: string;
    profit: string;
    priceStructure: string;
    margin: string;
    price: string;
    attract: string;
    rightClients: string;
    enable: string;
    purchase: string;
    retain: string;
    longTerm: string;
    problem: string;
    clearOffer: string;
    resultScope: string;
    choice: string;
    start: string;
    deliver: string;
    review: string;
    close: string;
    enquiries: string;
    conversations: string;
    clients: string;
    goal: string;
    autonomy: string;
    followUp: string;
    result: string;
  };
};

const ACADEMY_UI_COPY = {
  fr: {
    index: {
      all: "Tous",
      academy: "Académie",
      heroLead: "Apprendre à",
      heroEmphasis: "entreprendre",
      tutorials: "Tutoriels",
      content: "Contenus de l’Académie",
      courses: "Cours",
      search: "Rechercher dans l’Académie",
      searchPlaceholder: "Rechercher un cours ou une question…",
      hideCategories: "Masquer les catégories",
      showCategories: "Afficher les catégories",
      filterByCategory: "Filtrer les contenus par catégorie",
      showLess: "Voir moins",
      showMore: "Voir plus de cours",
      noContent: "Aucun contenu trouvé",
      noContentHint: "Essayez un mot plus simple ou un autre sujet.",
      open: (title) => `Ouvrir ${title}`,
      guidedTutorial: (sector, durationMinutes) => `Tutoriel guidé · ${sector} · ${durationMinutes} min`,
    },
    player: {
      questionProgress: (index, total) => `Question ${index} sur ${total}`,
      questionStep: (index, total) => `Question ${index} / ${total}`,
      correct: "Oui, c’est ça.",
      incorrect: "Pas tout à fait.",
      situation: "Situation",
      stepProgress: (index, total) => `Étape ${index} / ${total}`,
      lessonProgress: (index, total) => `Notion ${index} / ${total}`,
      recap: "Récapitulatif",
      complete: "Terminé",
      back: "Retour à l’Académie",
      knowledgeQuiz: "Quiz de connaissances",
      courseContent: "Contenu du cours",
      keyIdea: "L’idée à retenir",
      keyTakeaway: "À retenir",
      courseComplete: "Cours terminé",
      essentials: "Vous avez l’essentiel.",
      finishDescription: "Vous pouvez revenir à l’Académie ou passer directement à l’action.",
      practice: "Pour passer à l’action",
      navigation: "Navigation du cours",
      previous: "Précédent",
      startCourse: "Commencer le cours",
      nextQuestion: "Question suivante",
      next: "Suivant",
    },
    panel: {
      loadFailed: "Impossible de charger l’Académie.",
      retry: "Réessayer",
      loading: "Chargement de l’Académie…",
    },
    diagram: {
      revenue: "CHIFFRE D’AFFAIRES",
      costs: "CHARGES",
      profit: "BÉNÉFICE",
      priceStructure: "COMPOSITION DU PRIX",
      margin: "MARGE",
      price: "PRIX",
      attract: "ATTIRER",
      rightClients: "LES BONS CLIENTS",
      enable: "FACILITER",
      purchase: "L’ACHAT",
      retain: "FIDÉLISER",
      longTerm: "SUR LE LONG TERME",
      problem: "PROBLÈME",
      clearOffer: "OFFRE CLAIRE",
      resultScope: "RÉSULTAT · PÉRIMÈTRE",
      choice: "CHOIX",
      start: "DÉMARRER",
      deliver: "PRODUIRE",
      review: "VALIDER",
      close: "CLÔTURER",
      enquiries: "DEMANDES",
      conversations: "ÉCHANGES",
      clients: "CLIENTS",
      goal: "OBJECTIF",
      autonomy: "AUTONOMIE",
      followUp: "SUIVI",
      result: "RÉSULTAT",
    },
  },
  en: {
    index: {
      all: "All",
      academy: "Academy",
      heroLead: "Learn how to",
      heroEmphasis: "run your business",
      tutorials: "Tutorials",
      content: "Academy content",
      courses: "Courses",
      search: "Search the Academy",
      searchPlaceholder: "Search courses or questions…",
      hideCategories: "Hide categories",
      showCategories: "Show categories",
      filterByCategory: "Filter content by category",
      showLess: "Show less",
      showMore: "Show more courses",
      noContent: "No content found",
      noContentHint: "Try a simpler word or another topic.",
      open: (title) => `Open ${title}`,
      guidedTutorial: (sector, durationMinutes) => `Guided tutorial · ${sector} · ${durationMinutes} min`,
    },
    player: {
      questionProgress: (index, total) => `Question ${index} of ${total}`,
      questionStep: (index, total) => `Question ${index} / ${total}`,
      correct: "That’s right.",
      incorrect: "Not quite.",
      situation: "Situation",
      stepProgress: (index, total) => `Step ${index} / ${total}`,
      lessonProgress: (index, total) => `Lesson ${index} / ${total}`,
      recap: "Recap",
      complete: "Complete",
      back: "Back to the Academy",
      knowledgeQuiz: "Knowledge quiz",
      courseContent: "Course content",
      keyIdea: "Key idea",
      keyTakeaway: "Key takeaway",
      courseComplete: "Course complete",
      essentials: "You have the essentials.",
      finishDescription: "You can return to the Academy or put the course into practice.",
      practice: "Put it into practice",
      navigation: "Course navigation",
      previous: "Previous",
      startCourse: "Start course",
      nextQuestion: "Next question",
      next: "Next",
    },
    panel: {
      loadFailed: "Unable to load the Academy.",
      retry: "Try again",
      loading: "Loading the Academy…",
    },
    diagram: {
      revenue: "REVENUE",
      costs: "COSTS",
      profit: "PROFIT",
      priceStructure: "PRICE STRUCTURE",
      margin: "MARGIN",
      price: "PRICE",
      attract: "ATTRACT",
      rightClients: "THE RIGHT CLIENTS",
      enable: "ENABLE",
      purchase: "THE PURCHASE",
      retain: "RETAIN",
      longTerm: "FOR THE LONG TERM",
      problem: "PROBLEM",
      clearOffer: "CLEAR OFFER",
      resultScope: "RESULT · SCOPE",
      choice: "CHOICE",
      start: "START",
      deliver: "DELIVER",
      review: "REVIEW",
      close: "CLOSE",
      enquiries: "ENQUIRIES",
      conversations: "CONVERSATIONS",
      clients: "CLIENTS",
      goal: "GOAL",
      autonomy: "AUTONOMY",
      followUp: "FOLLOW-UP",
      result: "RESULT",
    },
  },
} satisfies Record<InterfaceLocaleCode, AcademyUiCopy>;

export function getAcademyUiCopy(localeCode: InterfaceLocaleCode): AcademyUiCopy {
  return ACADEMY_UI_COPY[localeCode];
}
