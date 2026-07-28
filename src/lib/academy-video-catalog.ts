import {
  ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
  type AcademyThumbnailComposition,
} from "@/lib/academy-thumbnail";

export type AcademyContentType = "course";

export type AcademyCourseCategory =
  | "Finances & pilotage"
  | "Vente & relation client"
  | "Organisation & management";

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

export type DraftAcademyVideo = {
  status: "draft";
};

type AcademyVideoBase = {
  id: string;
  slug: string;
  contentType: AcademyContentType;
  courseCategory: AcademyCourseCategory;
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
  topics: readonly string[];
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
};

export type PublishedAcademyVideoEntry = AcademyVideoBase & {
  artworkPath: string;
  artworkTheme: "forest";
  thumbnailComposition: AcademyThumbnailComposition;
  durationLabel: string;
  durationSeconds: number;
  editorialPublishedAt: string;
  updatedAt: string;
  publication: PublishedAcademyVideo;
};

export type DraftAcademyVideoEntry = AcademyVideoBase & {
  artworkPath: null;
  artworkTheme: "forest";
  thumbnailComposition: null;
  durationLabel: null;
  durationSeconds: null;
  editorialPublishedAt: null;
  updatedAt: null;
  publication: DraftAcademyVideo;
};

export type AcademyVideoEntry =
  | PublishedAcademyVideoEntry
  | DraftAcademyVideoEntry;

export const academyVideoCatalog: readonly AcademyVideoEntry[] = [
  {
    id: "rentable-sans-tresorerie",
    slug: "entreprise-rentable-sans-tresorerie",
    contentType: "course",
    courseCategory: "Finances & pilotage",
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
    thumbnailLines: ["Rentable.", "Mais sans", "trésorerie."],
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
    contentType: "course",
    courseCategory: "Finances & pilotage",
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
    artworkTheme: "forest",
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
  {
    id: "fixer-ses-prix",
    slug: "fixer-ses-prix-sans-vendre-a-perte",
    contentType: "course",
    courseCategory: "Finances & pilotage",
    searchIntent:
      "Calculer un prix de vente hors taxes qui couvre les coûts directs, le temps de travail, les charges fixes et les commissions.",
    primaryKeyword: "comment fixer ses prix",
    secondaryKeywords: [
      "calculer un prix de vente",
      "prix plancher entreprise",
      "fixer ses tarifs",
      "éviter de vendre à perte",
      "calcul coût complet",
    ],
    seoTitle: "Fixer ses prix sans vendre à perte : méthode",
    seoDescription:
      "Calculez votre prix plancher HT avec les coûts directs, le temps, les charges fixes et les commissions, puis fixez un prix réellement rentable.",
    h1: "Comment fixer ses prix sans vendre à perte ?",
    cardTitle: "Fixer ses prix sans vendre à perte",
    thumbnailEyebrow: "Le prix plancher",
    thumbnailLines: ["Vendre.", "Sans perdre", "d’argent."],
    thumbnailAlt:
      "Calcul du prix plancher d’une offre à partir de son coût complet.",
    artworkPath: null,
    artworkTheme: "forest",
    thumbnailComposition: null,
    topics: [
      "Prix de vente",
      "Coût complet",
      "Charges fixes",
      "Commission",
    ],
    durationLabel: null,
    durationSeconds: null,
    editorialPublishedAt: null,
    updatedAt: null,
    shortAnswer:
      "Pour fixer un prix sans perdre d’argent, calculez d’abord le coût complet d’une vente hors taxes : achats directs, autres coûts variables, temps de travail valorisé et part réaliste des charges fixes. Si une commission dépend du prix, intégrez-la dans la formule. Le résultat donne un prix plancher économique, auquel il faut encore ajouter une marge pour financer les imprévus et le développement.",
    essentialPoints: [
      {
        title: "Le coût d’achat ne suffit pas.",
        description:
          "Une vente doit aussi payer la préparation, la livraison, les commissions, le temps de travail et une part des charges fixes.",
      },
      {
        title: "Le calcul se fait sur une base cohérente.",
        description:
          "Lorsqu’elle récupère la TVA, l’entreprise compare un prix HT à des coûts HT récupérables ; les règles juridiques de revente à perte restent un sujet distinct.",
      },
      {
        title: "Le volume prévu doit rester réaliste.",
        description:
          "Diviser les charges fixes par un volume trop optimiste sous-estime leur poids dans chaque vente.",
      },
      {
        title: "Une commission en pourcentage change la formule.",
        description:
          "Elle ne s’ajoute pas comme un montant fixe : le coût complet doit être divisé par un moins le taux de commission.",
      },
      {
        title: "Le prix plancher n’est pas le prix cible.",
        description:
          "Il indique seulement le seuil où la vente cesse de perdre de l’argent ; une marge reste nécessaire au-dessus.",
      },
    ],
    example: {
      introduction:
        "Un produit coûte 40 € HT à l’achat. L’emballage et la préparation coûtent 6 €, le temps de travail 12 € et la part de charges fixes 20 €. Une plateforme prélève 8 % du prix de vente.",
      rows: [
        { label: "Achat du produit", amount: "40 €" },
        { label: "Emballage et préparation", amount: "6 €" },
        { label: "Temps de travail valorisé", amount: "12 €" },
        { label: "Part de charges fixes", amount: "20 €" },
        { label: "Coût avant commission", amount: "78 €", emphasis: true },
      ],
      formula: "78 € ÷ (1 − 8 %) = 84,78 € HT",
      conclusion:
        "84,78 € HT est le prix plancher économique. Une vente à 80 € HT perdrait 4,40 € ; dix ventes produiraient 44 € de perte.",
      alert:
        "Ce calcul mesure une perte économique. La réglementation sur la revente à perte doit être vérifiée séparément selon l’activité et la situation.",
    },
    actions: [
      "Lister tous les coûts directement déclenchés par une vente.",
      "Valoriser le temps réellement consacré à produire et servir le client.",
      "Répartir les charges fixes avec un volume de vente prudent et vérifiable.",
      "Intégrer les commissions proportionnelles dans la formule du prix plancher.",
      "Comparer chaque mois le volume et les coûts réels aux hypothèses du calcul.",
    ],
    faq: [
      {
        question: "Quelle différence entre coût d’achat et coût complet ?",
        answer:
          "Le coût d’achat ne couvre que le produit ou la matière. Le coût complet ajoute notamment les coûts variables, le temps de travail et une part des charges fixes.",
      },
      {
        question: "Comment calculer un prix plancher avec une commission ?",
        answer:
          "Additionnez d’abord les coûts hors commission, puis divisez ce total par un moins le taux de commission. Avec 78 € de coûts et 8 % de commission, le plancher est de 84,78 € HT.",
      },
      {
        question: "Faut-il calculer son prix HT ou TTC ?",
        answer:
          "Une entreprise qui récupère la TVA raisonne généralement en hors taxes, en comparant un prix HT à des coûts HT récupérables. La situation fiscale exacte doit toutefois être confirmée.",
      },
      {
        question: "Pourquoi intégrer son propre temps dans le prix ?",
        answer:
          "Sans valorisation du temps de production, de préparation ou de suivi, une offre peut sembler rentable alors qu’elle rémunère mal ou pas du tout le travail réalisé.",
      },
      {
        question: "Que faire si le marché refuse le prix calculé ?",
        answer:
          "Revoyez l’offre, le temps passé, les achats, les commissions ou le segment de clientèle. Réduire le prix sans corriger les coûts ne rend pas le modèle rentable.",
      },
    ],
    relatedSystems: [
      {
        slug: "consultant-independant",
        anchor: "Structurer les tarifs d’un consultant indépendant",
      },
      {
        slug: "agence-marketing",
        anchor: "Calculer la rentabilité des offres d’une agence marketing",
      },
      {
        slug: "e-commerce",
        anchor: "Piloter prix, commissions et marge d’un e-commerce",
      },
      {
        slug: "commerce-de-detail",
        anchor: "Fixer les prix d’un commerce de détail",
      },
      {
        slug: "restaurant",
        anchor: "Contrôler le coût complet des offres d’un restaurant",
      },
      {
        slug: "batiment",
        anchor: "Sécuriser les prix et marges des chantiers du bâtiment",
      },
    ],
    relatedVideoSlug: "difference-chiffre-affaires-benefice",
    relatedVideoAnchor:
      "Comprendre la différence entre ventes, marge et bénéfice",
    publication: { status: "draft" },
  },
  {
    id: "transformer-demande-client",
    slug: "transformer-une-demande-en-client",
    contentType: "course",
    courseCategory: "Vente & relation client",
    searchIntent:
      "Mettre en place une méthode simple pour qualifier une demande entrante, conduire l’échange et décider de la prochaine étape commerciale.",
    primaryKeyword: "transformer une demande en client",
    secondaryKeywords: [
      "qualifier une demande client",
      "traiter une demande entrante",
      "transformer un prospect en client",
      "relancer un devis",
      "processus commercial TPE",
    ],
    seoTitle: "Transformer une demande en client : la méthode",
    seoDescription:
      "Répondez, qualifiez et conduisez chaque demande vers une décision claire sans envoyer un devis trop tôt ni poursuivre les mauvais prospects.",
    h1: "Comment transformer une demande en client sans perdre du temps ?",
    cardTitle: "Transformer une demande en client",
    thumbnailEyebrow: "Du contact au client",
    thumbnailLines: ["Qualifier.", "Proposer.", "Décider."],
    thumbnailAlt:
      "Parcours de qualification d’une demande jusqu’à la décision commerciale.",
    artworkPath: null,
    artworkTheme: "forest",
    thumbnailComposition: null,
    topics: ["Prospection", "Qualification", "Proposition", "Relance"],
    durationLabel: null,
    durationSeconds: null,
    editorialPublishedAt: null,
    updatedAt: null,
    shortAnswer:
      "Transformer une demande en client ne consiste pas à envoyer immédiatement un devis. Il faut d’abord confirmer la réception, clarifier le résultat recherché, le périmètre, le décideur, le délai et le budget, puis conduire un échange de découverte. Une proposition devient utile lorsqu’elle reprend ce besoin et se termine par une prochaine étape datée. Les demandes non adaptées doivent être refusées ou clôturées proprement.",
    essentialPoints: [
      {
        title: "Une demande n’est pas encore une vente.",
        description:
          "Elle représente une possibilité à qualifier avant d’engager du temps dans un rendez-vous ou une proposition.",
      },
      {
        title: "Répondre vite ne signifie pas fabriquer un devis.",
        description:
          "Un premier message peut simplement confirmer la réception, résumer le besoin compris et annoncer la prochaine étape.",
      },
      {
        title: "Cinq informations permettent de qualifier.",
        description:
          "Résultat attendu, raison d’agir maintenant, périmètre, décideur et contraintes de délai ou de budget.",
      },
      {
        title: "La proposition doit faciliter une décision.",
        description:
          "Elle relie le besoin au résultat, au périmètre, au calendrier, au prix et à ce qui n’est pas inclus.",
      },
      {
        title: "Une relance utile cherche le blocage.",
        description:
          "Elle intervient à la date convenue, pose une question claire et prévoit une clôture si aucune décision n’arrive.",
      },
    ],
    example: {
      introduction:
        "Un studio de création observe douze demandes entrantes sur un mois. Il les fait progresser selon leur adéquation réelle, sans transformer chaque contact en devis.",
      rows: [
        { label: "Demandes reçues", amount: "12" },
        { label: "Échanges de découverte utiles", amount: "7" },
        { label: "Propositions envoyées", amount: "4" },
        { label: "Clients signés", amount: "2", emphasis: true },
        { label: "Montant par client", amount: "2 500 €" },
      ],
      formula: "2 clients × 2 500 € = 5 000 € signés",
      conclusion:
        "Le parcours ne promet pas un taux de conversion. Il montre où les demandes sont écartées, où le temps est investi et à quelle étape une décision se bloque.",
    },
    actions: [
      "Accuser réception rapidement et annoncer une prochaine étape précise.",
      "Recueillir le résultat attendu, l’urgence, le périmètre, le décideur, le délai et le budget.",
      "Reformuler le besoin avant de présenter une solution ou un prix.",
      "Terminer chaque proposition par une décision ou une date de suivi.",
      "Clôturer les demandes hors cible ou sans réponse après une dernière relance.",
    ],
    faq: [
      {
        question: "Faut-il envoyer un devis dès la première demande ?",
        answer:
          "Non. Un devis établi avant de comprendre le besoin risque d’être hors sujet et consomme du temps. Une qualification courte permet de décider si une proposition est pertinente.",
      },
      {
        question: "Quelles questions poser pour qualifier un prospect ?",
        answer:
          "Demandez le résultat recherché, la raison d’agir maintenant, le périmètre, la personne qui décidera ainsi que les contraintes de calendrier et de budget.",
      },
      {
        question: "Comment conduire un échange de découverte ?",
        answer:
          "Faites préciser la situation actuelle, le problème, le résultat attendu, ce qui a déjà été essayé et les obstacles à la décision, puis reformulez ces éléments.",
      },
      {
        question: "Que doit contenir une proposition commerciale ?",
        answer:
          "Elle doit préciser le résultat visé, le périmètre, les étapes, le calendrier, le prix, les exclusions et la prochaine décision attendue.",
      },
      {
        question: "Quand arrêter de relancer un prospect ?",
        answer:
          "Après une relance à la date convenue et une dernière relance courte avec une date de clôture, fermez le dossier si aucune réponse n’arrive.",
      },
    ],
    relatedSystems: [
      {
        slug: "consultant-independant",
        anchor: "Qualifier les demandes d’un consultant indépendant",
      },
      {
        slug: "freelance",
        anchor: "Organiser le parcours commercial d’un freelance",
      },
      {
        slug: "agence-marketing",
        anchor: "Structurer les propositions d’une agence marketing",
      },
      {
        slug: "agence-web",
        anchor: "Transformer les demandes entrantes d’une agence web",
      },
      {
        slug: "cabinet-de-conseil",
        anchor: "Piloter les opportunités d’un cabinet de conseil",
      },
      {
        slug: "organisme-de-formation",
        anchor: "Qualifier les besoins d’un organisme de formation",
      },
    ],
    relatedVideoSlug: "deleguer-sans-perdre-le-controle",
    relatedVideoAnchor:
      "Structurer ensuite la délégation du suivi commercial",
    publication: { status: "draft" },
  },
  {
    id: "deleguer-sans-perdre-controle",
    slug: "deleguer-sans-perdre-le-controle",
    contentType: "course",
    courseCategory: "Organisation & management",
    searchIntent:
      "Choisir une tâche à déléguer, définir un résultat vérifiable et suivre son exécution sans microgérer ni reprendre systématiquement le travail.",
    primaryKeyword: "déléguer sans perdre le contrôle",
    secondaryKeywords: [
      "comment déléguer efficacement",
      "délégation en entreprise",
      "suivre une tâche déléguée",
      "éviter le micromanagement",
      "donner de l’autonomie",
    ],
    seoTitle: "Déléguer sans perdre le contrôle : méthode",
    seoDescription:
      "Choisissez quoi déléguer, cadrez un résultat observable, fixez l’autonomie et les alertes, puis suivez sans contrôler chaque geste.",
    h1: "Comment déléguer sans perdre le contrôle ?",
    cardTitle: "Déléguer sans perdre le contrôle",
    thumbnailEyebrow: "Le bon cadre",
    thumbnailLines: ["Déléguer.", "Sans perdre", "le contrôle."],
    thumbnailAlt:
      "Cadre de délégation associant résultat, autonomie et points de contrôle.",
    artworkPath: null,
    artworkTheme: "forest",
    thumbnailComposition: null,
    topics: ["Délégation", "Autonomie", "Management", "Suivi"],
    durationLabel: null,
    durationSeconds: null,
    editorialPublishedAt: null,
    updatedAt: null,
    shortAnswer:
      "Déléguer sans perdre le contrôle consiste à confier un résultat observable plutôt qu’une consigne vague. Choisissez une tâche explicable et réparable, précisez le livrable, l’échéance, les critères de qualité et les contraintes, puis donnez le contexte et les moyens nécessaires. L’autonomie doit être délimitée par des décisions autorisées, des validations obligatoires et des seuils d’alerte. Le suivi porte ensuite sur quelques indicateurs, pas sur chaque geste.",
    essentialPoints: [
      {
        title: "Déléguer n’est ni abandonner ni microgérer.",
        description:
          "Le responsable confie un résultat avec assez de contexte et de repères pour qu’une autre personne puisse décider.",
      },
      {
        title: "Toutes les tâches ne se délèguent pas de la même façon.",
        description:
          "Commencez par une tâche fréquente, explicable, vérifiable et dont une erreur reste détectable et réparable.",
      },
      {
        title: "Le résultat attendu doit être observable.",
        description:
          "Livrable, date, destinataire, critères de qualité et contraintes remplacent les formules vagues comme « fais au mieux ».",
      },
      {
        title: "L’autonomie a besoin de limites connues.",
        description:
          "Distinguez ce qui peut être décidé seul, ce qui doit être validé et ce qui doit simplement être signalé après décision.",
      },
      {
        title: "Le contrôle porte sur le résultat.",
        description:
          "Un jalon avant l’échéance et deux ou trois indicateurs suffisent souvent à détecter un écart sans reprendre la tâche.",
      },
    ],
    example: {
      introduction:
        "Une entreprise de maintenance délègue à son assistante le planning hebdomadaire de dix-huit interventions, avec un résultat attendu et des seuils d’alerte explicites.",
      rows: [
        { label: "Interventions à planifier", amount: "18" },
        { label: "Échéance du planning", amount: "Jeudi, 16 h" },
        { label: "Interventions réalisées", amount: "16", emphasis: true },
        { label: "Interventions reprogrammées", amount: "2" },
        { label: "Heures supplémentaires", amount: "3 h" },
      ],
      formula: "18 prévues = 16 réalisées + 2 reprogrammées",
      conclusion:
        "Ces quelques chiffres permettent de corriger le système. L’assistante décide seule des déplacements de créneaux et alerte en cas d’attente supérieure à 24 heures, de compétence manquante ou d’heures supplémentaires probables.",
    },
    actions: [
      "Choisir une tâche fréquente, explicable et dont les erreurs sont réparables.",
      "Décrire le livrable, l’échéance, les critères de qualité et les contraintes.",
      "Fournir le contexte, les exemples, les accès, les contacts et les outils utiles.",
      "Définir les décisions autonomes, les validations et les seuils d’alerte.",
      "Prévoir un jalon et deux ou trois indicateurs proportionnés au risque.",
    ],
    faq: [
      {
        question: "Quelle tâche déléguer en premier ?",
        answer:
          "Choisissez une tâche récurrente, explicable, vérifiable et dont une erreur peut être détectée puis corrigée sans risque disproportionné.",
      },
      {
        question: "Comment définir clairement le résultat attendu ?",
        answer:
          "Précisez le livrable, la date, le destinataire, les critères de qualité et les contraintes non négociables.",
      },
      {
        question: "Comment donner de l’autonomie sans perdre le contrôle ?",
        answer:
          "Définissez ce que la personne décide seule, ce qu’elle doit faire valider et ce qu’elle peut décider avant de vous en informer.",
      },
      {
        question: "Quels indicateurs suivre pour une tâche déléguée ?",
        answer:
          "Choisissez deux ou trois indicateurs liés au résultat, comme l’avancement, la qualité, le délai ou le budget, selon le niveau de risque.",
      },
      {
        question: "Que faire lorsque le résultat n’est pas satisfaisant ?",
        answer:
          "Cherchez la cause : cadre flou, contexte manquant, compétence ou alerte absente. Demandez ensuite une correction et améliorez le système avant de reprendre vous-même.",
      },
    ],
    relatedSystems: [
      {
        slug: "batiment",
        anchor: "Déléguer le suivi des chantiers du bâtiment",
      },
      {
        slug: "plomberie-chauffage",
        anchor: "Organiser les interventions d’une entreprise de plomberie",
      },
      {
        slug: "nettoyage-professionnel",
        anchor: "Suivre les équipes de nettoyage professionnel",
      },
      {
        slug: "garage-automobile",
        anchor: "Déléguer le planning d’un garage automobile",
      },
      {
        slug: "restaurant",
        anchor: "Répartir les responsabilités dans un restaurant",
      },
      {
        slug: "agence-marketing",
        anchor: "Cadrer la délégation dans une agence marketing",
      },
    ],
    relatedVideoSlug: "transformer-une-demande-en-client",
    relatedVideoAnchor:
      "Structurer le parcours avant de déléguer son suivi",
    publication: { status: "draft" },
  },
];

export function getAllAcademyVideos() {
  return academyVideoCatalog;
}

export function getAcademyVideoBySlug(slug: string) {
  return academyVideoCatalog.find((video) => video.slug === slug);
}

export function isPublishedAcademyVideo(
  video: AcademyVideoEntry,
): video is PublishedAcademyVideoEntry {
  return video.publication.status === "published";
}

export function getPublishedAcademyVideos(): readonly PublishedAcademyVideoEntry[] {
  return academyVideoCatalog.filter(isPublishedAcademyVideo);
}

export function getPublishedAcademyVideoBySlug(slug: string) {
  return getPublishedAcademyVideos().find((video) => video.slug === slug);
}

export function getAcademyVideosForSystem(systemSlug: string) {
  return getPublishedAcademyVideos().filter((video) =>
    video.relatedSystems.some((system) => system.slug === systemSlug),
  );
}
