export type AcademyVideoCategory = "Finances & pilotage";

export const ACADEMY_THUMBNAIL_CANVAS = {
  width: 1280,
  height: 720,
  aspectRatio: 16 / 9,
} as const;

export const ACADEMY_THUMBNAIL_TARGET_CROP_RATIO = 4 / 3;

export type AcademyThumbnailComposition = {
  artwork: {
    scale: number;
    offsetXPercent: number;
    offsetYPercent: number;
  };
  title: {
    scale: number;
    offsetXPercent: number;
    offsetYPercent: number;
  };
  safeZone: {
    targetAspectRatio: typeof ACADEMY_THUMBNAIL_TARGET_CROP_RATIO;
    minimumSafeAspectRatio: number;
  };
};

export const DEFAULT_ACADEMY_THUMBNAIL_COMPOSITION: AcademyThumbnailComposition =
  {
    artwork: {
      scale: 1,
      offsetXPercent: 0,
      offsetYPercent: 0,
    },
    title: {
      scale: 1,
      offsetXPercent: 0,
      offsetYPercent: 0,
    },
    safeZone: {
      targetAspectRatio: ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
      minimumSafeAspectRatio: ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
    },
  };

export type PublishedAcademyVideo = {
  status: "published";
  youtubeId: string;
  youtubeTitle: string;
  youtubeUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  uploadDate: string;
  durationIso: string;
};

export type AcademyVideoEntry = {
  id: string;
  slug: string;
  category: AcademyVideoCategory;
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  seoTitle: string;
  seoDescription: string;
  h1: string;
  cardTitle: string;
  thumbnailEyebrow: string;
  thumbnailLines: readonly string[];
  thumbnailAlt: string;
  artworkPath: string;
  artworkTheme: "forest" | "sage";
  thumbnailComposition: AcademyThumbnailComposition;
  topics: readonly string[];
  durationLabel: string;
  durationSeconds: number;
  editorialPublishedAt: string;
  updatedAt: string;
  shortAnswer: string;
  essentialPoints: readonly { title: string; description: string }[];
  example: {
    introduction: string;
    rows: readonly { label: string; amount: string; emphasis?: boolean }[];
    formula: string;
    conclusion: string;
    alert?: string;
  };
  actions: readonly string[];
  faq: readonly { question: string; answer: string }[];
  relatedSystems: readonly { slug: string; anchor: string }[];
  relatedVideoSlug: string;
  relatedVideoAnchor: string;
  publication: PublishedAcademyVideo;
};

export const academyVideoCatalog: readonly AcademyVideoEntry[] = [
  {
    id: "rentable-sans-tresorerie",
    slug: "entreprise-rentable-sans-tresorerie",
    category: "Finances & pilotage",
    searchIntent:
      "Comprendre pourquoi une entreprise bénéficiaire peut manquer d’argent disponible et identifier les décisions immédiates à prendre.",
    primaryKeyword: "entreprise rentable mais sans trésorerie",
    secondaryKeywords: [
      "entreprise rentable manque de trésorerie",
      "bénéfice mais pas de trésorerie",
      "différence bénéfice trésorerie",
      "BFR trésorerie entreprise",
    ],
    seoTitle: "Entreprise rentable mais sans trésorerie : pourquoi ?",
    seoDescription:
      "Une entreprise peut être rentable et manquer de trésorerie. Comprenez le rôle des délais clients, du BFR et les actions à prendre sur 12 semaines.",
    h1: "Pourquoi une entreprise rentable peut-elle manquer de trésorerie ?",
    cardTitle: "Rentable, mais sans trésorerie",
    thumbnailEyebrow: "Le paradoxe",
    thumbnailLines: ["Rentable.", "Mais sans trésorerie."],
    thumbnailAlt:
      "Dirigeant face à des factures rentables mais à une trésorerie insuffisante.",
    artworkPath: "/images/academy/illustration-cash.png",
    artworkTheme: "forest",
    thumbnailComposition: {
      artwork: {
        scale: 1.25,
        offsetXPercent: -10,
        offsetYPercent: 0,
      },
      title: {
        scale: 1,
        offsetXPercent: 17,
        offsetYPercent: 0,
      },
      safeZone: {
        targetAspectRatio: ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
        minimumSafeAspectRatio: 1.2722,
      },
    },
    topics: ["Trésorerie", "BFR", "Délais clients", "Prévision sur 12 semaines"],
    durationLabel: "3 min 19 s",
    durationSeconds: 199,
    editorialPublishedAt: "2026-07-27",
    updatedAt: "2026-07-28",
    shortAnswer:
      "Une entreprise peut être rentable sans disposer immédiatement de l’argent correspondant. Le bénéfice mesure la performance économique sur une période, alors que la trésorerie mesure l’argent réellement disponible aujourd’hui. Les délais de paiement des clients, les stocks et les dépenses engagées avant encaissement créent un besoin en fonds de roulement qui peut rendre le compte bancaire négatif malgré un résultat positif.",
    essentialPoints: [
      {
        title: "Bénéfice et trésorerie répondent à deux questions différentes.",
        description:
          "Le bénéfice indique ce que l’activité a gagné ; la trésorerie indique ce que l’entreprise peut payer maintenant.",
      },
      {
        title: "Facturer ne signifie pas encaisser.",
        description:
          "Pendant le délai de règlement, les salaires, charges, loyers et fournisseurs continuent de sortir.",
      },
      {
        title: "Le décalage forme le BFR.",
        description:
          "Dans les services, il vient souvent des factures clients en attente ; dans le commerce, les stocks peuvent l’amplifier.",
      },
      {
        title: "La croissance peut consommer du cash.",
        description:
          "Davantage de ventes peut imposer de financer davantage de travail ou de stock avant l’encaissement.",
      },
      {
        title: "Le bon indicateur est le point bas de trésorerie.",
        description:
          "Il faut connaître son montant, sa date et sa cause sur les douze prochaines semaines.",
      },
    ],
    example: {
      introduction:
        "Une société de services facture une mission 30 000 € HT et prévoit un bénéfice final de 8 000 €. Le client paie à 45 jours. Avant ce règlement, l’entreprise doit décaisser 16 000 €, alors qu’elle ne dispose que de 9 000 € en banque.",
      rows: [
        { label: "Trésorerie disponible", amount: "9 000 €" },
        { label: "Décaissements avant le règlement client", amount: "−16 000 €" },
        { label: "Point bas de trésorerie", amount: "−7 000 €", emphasis: true },
      ],
      formula: "9 000 € disponibles − 16 000 € à décaisser = −7 000 €",
      conclusion:
        "La mission reste rentable, mais l’entreprise doit financer un creux de trésorerie de 7 000 € avant l’arrivée du paiement client.",
    },
    actions: [
      "Facturer dès que le travail le permet, sans ajouter de délai interne inutile.",
      "Encaisser plus tôt grâce aux acomptes, échéanciers, paiements par jalons et relances préparées avant l’échéance.",
      "Mettre à jour chaque semaine un plan de trésorerie sur douze semaines.",
      "Suivre séparément créances clients, stocks et dettes fournisseurs pour comprendre l’évolution du BFR.",
      "Tester l’effet de la croissance avant de l’accepter : nouvelles ventes, délais clients et dépenses nécessaires.",
    ],
    faq: [
      {
        question:
          "Une entreprise rentable peut-elle manquer d’argent pour payer ses échéances ?",
        answer:
          "Oui. Une entreprise peut afficher un bénéfice comptable mais ne plus disposer de la trésorerie nécessaire pour régler ses salaires, fournisseurs ou charges au moment prévu.",
      },
      {
        question: "Quelle est la différence entre bénéfice et trésorerie ?",
        answer:
          "Le bénéfice correspond à la différence entre les produits et les charges sur une période. La trésorerie correspond à l’argent disponible à un instant donné.",
      },
      {
        question: "Qu’est-ce que le besoin en fonds de roulement ?",
        answer:
          "Le BFR représente le financement nécessaire pour absorber le décalage entre les dépenses de l’activité et les encaissements. Il dépend notamment des stocks, des créances clients et des dettes fournisseurs.",
      },
      {
        question: "Pourquoi la croissance peut-elle dégrader la trésorerie ?",
        answer:
          "L’entreprise doit souvent payer davantage de production, de sous-traitance, de salaires ou de stock avant de recevoir les paiements liés aux nouvelles ventes.",
      },
      {
        question: "Comment anticiper un manque de trésorerie ?",
        answer:
          "Il faut construire un plan glissant, mis à jour chaque semaine, qui projette les encaissements et décaissements sur douze semaines afin d’identifier le point bas suffisamment tôt.",
      },
    ],
    relatedSystems: [
      { slug: "daf-externalise", anchor: "Structurer le pilotage d’un DAF externalisé" },
      { slug: "cabinet-comptable", anchor: "Organiser le suivi d’un cabinet comptable" },
      { slug: "consultant-independant", anchor: "Piloter la trésorerie d’un consultant indépendant" },
      { slug: "commerce-de-detail", anchor: "Suivre stock et trésorerie d’un commerce de détail" },
      { slug: "restaurant", anchor: "Piloter caisse et échéances d’un restaurant" },
      { slug: "organisme-de-formation", anchor: "Anticiper les encaissements d’un organisme de formation" },
    ],
    relatedVideoSlug: "difference-chiffre-affaires-benefice",
    relatedVideoAnchor:
      "Comprendre la différence entre chiffre d’affaires et bénéfice",
    publication: {
      status: "published",
      youtubeId: "SMlvcrgm9Wc",
      youtubeTitle: "Gérer sa trésorerie au quotidien | Mini-cours Demaa",
      youtubeUrl: "https://youtu.be/SMlvcrgm9Wc",
      embedUrl: "https://www.youtube-nocookie.com/embed/SMlvcrgm9Wc?rel=0",
      thumbnailUrl: "https://i.ytimg.com/vi/SMlvcrgm9Wc/maxresdefault.jpg",
      thumbnailWidth: 1280,
      thumbnailHeight: 720,
      uploadDate: "2026-07-27T14:31:17-07:00",
      durationIso: "PT3M19S",
    },
  },
  {
    id: "chiffre-affaires-benefice",
    slug: "difference-chiffre-affaires-benefice",
    category: "Finances & pilotage",
    searchIntent:
      "Comprendre la différence entre le chiffre d’affaires, la marge et le bénéfice afin de savoir si l’entreprise gagne réellement de l’argent.",
    primaryKeyword: "différence chiffre d’affaires bénéfice",
    secondaryKeywords: [
      "chiffre d’affaires ou bénéfice",
      "calcul bénéfice entreprise",
      "chiffre d’affaires moins charges",
      "différence marge bénéfice",
    ],
    seoTitle: "Chiffre d’affaires et bénéfice : quelle différence ?",
    seoDescription:
      "Le chiffre d’affaires mesure les ventes, pas ce que l’entreprise gagne. Découvrez le bénéfice, la marge, le point mort et les erreurs à éviter.",
    h1: "Quelle différence entre chiffre d’affaires, marge et bénéfice ?",
    cardTitle: "Chiffre d’affaires ≠ bénéfice",
    thumbnailEyebrow: "Les essentiels",
    thumbnailLines: ["Vendre plus", "ne veut pas dire", "gagner plus."],
    thumbnailAlt:
      "Comparaison entre chiffre d’affaires, marge et bénéfice d’une petite entreprise.",
    artworkPath: "/images/academy/illustration-benefice.png",
    artworkTheme: "sage",
    thumbnailComposition: {
      artwork: {
        scale: Math.SQRT2,
        offsetXPercent: -6.3,
        offsetYPercent: 0,
      },
      title: {
        scale: 0.69,
        offsetXPercent: 15.9,
        offsetYPercent: 0,
      },
      safeZone: {
        targetAspectRatio: ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
        minimumSafeAspectRatio: 1.3056,
      },
    },
    topics: ["Chiffre d’affaires", "Marge", "Bénéfice", "Point mort"],
    durationLabel: "3 min 32 s",
    durationSeconds: 212,
    editorialPublishedAt: "2026-07-27",
    updatedAt: "2026-07-28",
    shortAnswer:
      "Le chiffre d’affaires correspond au montant des ventes réalisées par l’entreprise. Il ne dit pas ce qu’elle a gagné. Pour obtenir le bénéfice, il faut retrancher l’ensemble des charges : achats, production, sous-traitance, salaires, locaux, outils, intérêts, impôts et autres coûts. Une entreprise peut donc avoir un chiffre d’affaires élevé, une marge faible et un bénéfice nul ou négatif.",
    essentialPoints: [
      {
        title: "Le chiffre d’affaires mesure le volume des ventes.",
        description: "Il est généralement suivi hors taxes pour analyser l’activité.",
      },
      {
        title: "La marge mesure ce que les ventes conservent.",
        description: "Elle est calculée après certains coûts directement liés aux ventes.",
      },
      {
        title: "Le bénéfice mesure le résultat final.",
        description: "Il tient compte de toutes les charges de la période.",
      },
      {
        title: "Une vente supplémentaire peut réduire le bénéfice.",
        description: "C’est le cas si elle déclenche plus de coûts qu’elle n’apporte de revenus.",
      },
      {
        title: "Le point mort fixe un seuil de ventes.",
        description: "Il indique le niveau de chiffre d’affaires nécessaire pour couvrir les charges.",
      },
    ],
    example: {
      introduction:
        "Une entreprise réalise 100 000 € de chiffre d’affaires HT. Le calcul complet permet de voir ce qu’elle conserve réellement.",
      rows: [
        { label: "Chiffre d’affaires HT", amount: "100 000 €" },
        { label: "Achats, production et sous-traitance", amount: "−60 000 €" },
        { label: "Marge disponible pour la structure", amount: "40 000 €" },
        { label: "Salaires administratifs, locaux et outils", amount: "−35 000 €" },
        { label: "Bénéfice final", amount: "5 000 €", emphasis: true },
      ],
      formula: "35 000 € de charges fixes ÷ 40 % de marge = 87 500 €",
      conclusion:
        "L’entreprise a vendu 100 000 €, mais elle a réellement gagné 5 000 €. Son point mort se situe à 87 500 € de chiffre d’affaires.",
      alert:
        "Un contrat peut apporter 20 000 € de chiffre d’affaires mais déclencher 22 000 € de coûts : les ventes montent, tandis que le résultat baisse de 2 000 €.",
    },
    actions: [
      "Suivre la marge en euros et en pourcentage pour chaque offre importante.",
      "Calculer le point mort mensuel ou annuel selon le rythme de pilotage.",
      "Mesurer le résultat réel chaque mois, sans attendre uniquement la clôture annuelle.",
      "Contrôler les coûts déclenchés par chaque nouvelle vente, notamment en urgence.",
      "Conserver un tableau de trésorerie séparé, car bénéfice et disponibilité bancaire restent deux sujets différents.",
    ],
    faq: [
      {
        question: "Le chiffre d’affaires correspond-il à ce que l’entreprise gagne ?",
        answer:
          "Non. Le chiffre d’affaires représente les ventes réalisées. L’entreprise doit encore payer toutes ses charges avant de connaître son bénéfice ou sa perte.",
      },
      {
        question: "Comment calculer simplement le bénéfice d’une entreprise ?",
        answer:
          "Dans une présentation simplifiée, le résultat correspond aux produits moins les charges de la période. Positif, il s’agit d’un bénéfice ; négatif, d’une perte.",
      },
      {
        question: "Une entreprise avec un chiffre d’affaires élevé est-elle forcément rentable ?",
        answer:
          "Non. Un chiffre d’affaires important peut coexister avec des coûts directs, des charges fixes ou des remises trop élevés.",
      },
      {
        question: "Quelle est la différence entre marge et bénéfice ?",
        answer:
          "La marge mesure généralement ce qui reste des ventes après une catégorie de coûts directement liés. Le bénéfice tient compte de l’ensemble des produits et des charges.",
      },
      {
        question: "Qu’est-ce que le point mort ?",
        answer:
          "Le point mort, ou seuil de rentabilité, est le niveau de chiffre d’affaires à atteindre pour couvrir toutes les charges.",
      },
      {
        question: "Le chiffre d’affaires se calcule-t-il hors taxes ?",
        answer:
          "Pour analyser l’activité d’une entreprise assujettie à la TVA, le chiffre d’affaires est généralement présenté hors taxes : la TVA collectée n’est pas un revenu conservé.",
      },
    ],
    relatedSystems: [
      { slug: "daf-externalise", anchor: "Structurer le pilotage financier d’un DAF externalisé" },
      { slug: "cabinet-comptable", anchor: "Organiser le suivi comptable d’un cabinet" },
      { slug: "consultant-independant", anchor: "Suivre la marge d’un consultant indépendant" },
      { slug: "e-commerce", anchor: "Piloter ventes, retours et marge d’un e-commerce" },
      { slug: "restaurant", anchor: "Suivre caisse et rentabilité d’un restaurant" },
      { slug: "batiment", anchor: "Contrôler la rentabilité des chantiers du bâtiment" },
    ],
    relatedVideoSlug: "entreprise-rentable-sans-tresorerie",
    relatedVideoAnchor:
      "Voir pourquoi une entreprise rentable peut manquer de trésorerie",
    publication: {
      status: "published",
      youtubeId: "Wch_wDVu4Wc",
      youtubeTitle: "Chiffre d’affaires ≠ bénéfice | Mini-cours Demaa",
      youtubeUrl: "https://youtu.be/Wch_wDVu4Wc",
      embedUrl: "https://www.youtube-nocookie.com/embed/Wch_wDVu4Wc?rel=0",
      thumbnailUrl: "https://i.ytimg.com/vi/Wch_wDVu4Wc/maxresdefault.jpg",
      thumbnailWidth: 1280,
      thumbnailHeight: 720,
      uploadDate: "2026-07-27T14:34:48-07:00",
      durationIso: "PT3M32S",
    },
  },
];

export function getAllAcademyVideos() {
  return academyVideoCatalog;
}

export function getAcademyVideoBySlug(slug: string) {
  return academyVideoCatalog.find((video) => video.slug === slug);
}

export function getPublishedAcademyVideos() {
  return academyVideoCatalog;
}

export function getAcademyVideosForSystem(systemSlug: string) {
  return academyVideoCatalog.filter((video) =>
    video.relatedSystems.some((system) => system.slug === systemSlug),
  );
}
