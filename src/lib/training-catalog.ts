export type TrainingFamily =
  | "Réglementaire"
  | "Sécurité & terrain"
  | "Management & équipe"
  | "Commerce & relation client"
  | "Numérique & IA"
  | "Qualité & conformité"
  | "Métier"
  | "Développement commercial"
  | "Pilotage d'entreprise"
  | "Support opérationnel"
  | "Formation continue";

export type TrainingRecommendationGroup = "metier" | "transverse";

export type DemaaTraining = {
  slug: string;
  name: string;
  provider: string;
  family: TrainingFamily;
  category: string;
  shortDescription: string;
  description: string;
  bestFor: string;
  tags: string[];
  icon: string;
  usefulFor: string[];
  sectors: string[];
  href: string;
  cta: string;
  format?: string;
  location?: string;
};

export const trainingFamilies = [
  "Réglementaire",
  "Sécurité & terrain",
  "Management & équipe",
  "Commerce & relation client",
  "Numérique & IA",
  "Qualité & conformité",
  "Métier",
  "Développement commercial",
  "Pilotage d'entreprise",
  "Support opérationnel",
  "Formation continue",
] as const satisfies readonly TrainingFamily[];

const demaaTrainings = [
  {
    slug: "formation-organisation-systeme-process",
    name: "Formation organisation, système et process",
    provider: "Demaa",
    family: "Pilotage d'entreprise",
    category: "Organisation",
    shortDescription:
      "Une formation Demaa en 1 jour pour structurer l'organisation, clarifier les rôles et poser des process afin que l'entreprise ne repose pas uniquement sur le dirigeant.",
    description:
      "Programme Demaa sur 1 jour pour aider les entreprises à poser une organisation plus stable, formaliser leurs process, clarifier leur système de travail et réduire la dépendance au dirigeant dans l'exécution du quotidien.",
    bestFor:
      "Les dirigeants de TPE et PME qui veulent rendre leur fonctionnement plus autonome, mieux répartir l'exécution et sortir d'une organisation trop dépendante d'eux.",
    tags: ["Organisation", "Process", "Système", "Autonomie"],
    icon: "FolderKanban",
    usefulFor: ["Organisation", "Process", "Autonomie", "Délégation"],
    sectors: [
      "Conseil & services aux entreprises",
      "Tech & Digital",
      "BTP & services techniques",
      "Immobilier",
      "Hébergement & tourisme",
      "Patrimoine",
      "Mobilité & logistique",
      "Restauration",
      "Commerce & retail",
      "Santé, bien-être & esthétique",
      "Services aux particuliers",
      "Éducation & formation",
      "Industrie & production",
      "Automobile & réparation",
      "Associations & événements",
    ],
    href: "https://wa.me/33782842435",
    cta: "Demander la formation",
    format: "1 jour · 950 EUR",
  },
  {
    slug: "feebat-renove-rge",
    name: "RENO PERF, les clés d'une rénovation énergétique de qualité",
    provider: "FEEBAT",
    family: "Qualité & conformité",
    category: "BTP",
    shortDescription: "Un parcours FEEBAT concret pour les entreprises travaux qui veulent monter en compétence sur la rénovation énergétique.",
    description:
      "Module FEEBAT dédié aux professionnels du bâtiment, centré sur les clés d'une rénovation énergétique de qualité et sur les attentes du marché.",
    bestFor:
      "Les artisans et entreprises du bâtiment qui veulent accéder à des chantiers rénovation énergétique ou renforcer leur crédibilité sur ces sujets.",
    tags: ["RGE", "Rénovation énergétique", "BTP"],
    icon: "Hammer",
    usefulFor: ["BTP", "RGE", "Crédibilité"],
    sectors: ["BTP & services techniques"],
    href: "https://www.feebat.org/formations/modules-de-formation-batiment-feebat/renoperf/",
    cta: "Voir la formation",
    format: "Organismes de formation sélectionnés par FEEBAT",
  },
  {
    slug: "habilitation-electrique-b0-h0v",
    name: "Habilitations électriques",
    provider: "Bureau Veritas Formation",
    family: "Sécurité & terrain",
    category: "Sécurité",
    shortDescription: "Une famille de formations très concrète pour les équipes qui interviennent sur chantier ou à proximité d'installations électriques.",
    description:
      "Catalogue de formations en habilitation électrique, en initial et en recyclage, à suivre en présentiel ou à distance selon les sessions.",
    bestFor:
      "Les entreprises du bâtiment, de maintenance et de services techniques qui doivent sécuriser les interventions terrain.",
    tags: ["Habilitation", "Électricité", "Sécurité"],
    icon: "Shield",
    usefulFor: ["Terrain", "Sécurité", "Conformité"],
    sectors: ["BTP & services techniques", "Industrie & production", "Automobile & réparation"],
    href: "https://formation.bureauveritas.fr/formation/electricite",
    cta: "Voir la formation",
    format: "Présentiel ou distanciel selon session",
  },
  {
    slug: "travail-hauteur-echafaudage",
    name: "Travaux en hauteur",
    provider: "Bureau Veritas Formation",
    family: "Sécurité & terrain",
    category: "Sécurité",
    shortDescription: "Une entrée claire pour les équipes chantier qui ont besoin de cadrer les risques liés au travail en hauteur.",
    description:
      "Catalogue de formations dédiées aux travaux en hauteur et à la prévention des risques associés, accessible partout en France.",
    bestFor:
      "Les équipes BTP, maintenance et second oeuvre qui interviennent sur des postes à risque.",
    tags: ["Sécurité", "Chantier", "Prévention"],
    icon: "Shield",
    usefulFor: ["Chantier", "Prévention", "Conformité"],
    sectors: ["BTP & services techniques", "Industrie & production"],
    href: "https://formation.bureauveritas.fr/formation/travaux-en-hauteur",
    cta: "Voir la formation",
    format: "Sessions partout en France",
  },
  {
    slug: "aipr-chantier",
    name: "AIPR",
    provider: "Bureau Veritas Formation",
    family: "Réglementaire",
    category: "BTP",
    shortDescription: "Une formation très concrète pour les équipes qui interviennent à proximité des réseaux sur chantier.",
    description:
      "Page catalogue Bureau Veritas dédiée aux formations AIPR pour cadrer les obligations liées aux interventions à proximité des réseaux.",
    bestFor:
      "Les dirigeants, encadrants et opérateurs BTP qui doivent intervenir sur chantier dans un cadre conforme.",
    tags: ["AIPR", "Réseaux", "Chantier"],
    icon: "Hammer",
    usefulFor: ["Chantier", "Conformité", "Travaux publics"],
    sectors: ["BTP & services techniques"],
    href: "https://formation.bureauveritas.fr/formation/aipr",
    cta: "Voir la formation",
    format: "Catalogue Bureau Veritas Formation",
  },
  {
    slug: "amiante-prevention-chantier",
    name: "Amiante",
    provider: "Bureau Veritas Formation",
    family: "Réglementaire",
    category: "BTP",
    shortDescription: "Une brique importante pour les activités qui croisent le risque amiante en rénovation, maintenance ou démolition.",
    description:
      "Page catalogue Bureau Veritas dédiée aux formations amiante, utile pour identifier les parcours adaptés aux interventions et obligations du terrain.",
    bestFor:
      "Les entreprises de rénovation, maintenance, second oeuvre, démolition ou réhabilitation exposées au risque amiante.",
    tags: ["Amiante", "Rénovation", "Sécurité"],
    icon: "Shield",
    usefulFor: ["Rénovation", "Conformité", "Prévention"],
    sectors: ["BTP & services techniques"],
    href: "https://formation.bureauveritas.fr/formation/amiante",
    cta: "Voir la formation",
    format: "Catalogue Bureau Veritas Formation",
  },
  {
    slug: "haccp-hygiene-alimentaire",
    name: "Formation spécifique en hygiène alimentaire",
    provider: "UMIH Formation",
    family: "Réglementaire",
    category: "Restauration",
    shortDescription:
      "La formation réglementaire UMIH pour maîtriser les bonnes pratiques d'hygiène et le cadre HACCP en restauration.",
    description:
      "Fiche officielle UMIH Formation dédiée à l'hygiène alimentaire en restauration commerciale, avec objectifs, contenu, validation et sessions.",
    bestFor:
      "Les restaurants, fast-foods, traiteurs et établissements qui manipulent ou servent des denrées alimentaires.",
    tags: ["HACCP", "Hygiène", "Restauration"],
    icon: "Utensils",
    usefulFor: ["Restauration", "Conformité", "Équipe"],
    sectors: ["Restauration", "Commerce & retail"],
    href: "https://www.umihformation.fr/nos-formations/82-HYGIENE-ALIMENTAIRE",
    cta: "Voir la formation",
    format: "Présentiel avec sessions UMIH",
  },
  {
    slug: "permis-exploitation",
    name: "Permis d'exploitation",
    provider: "UMIH Formation",
    family: "Réglementaire",
    category: "Restauration",
    shortDescription:
      "La formation réglementaire UMIH pour exploiter un établissement servant de l'alcool dans un cadre conforme.",
    description:
      "Fiche officielle UMIH Formation consacrée au permis d'exploitation, avec objectifs, contenu, validation et accès aux sessions en visio ou présentiel.",
    bestFor:
      "Les bars, cafés, restaurants et établissements qui servent de l'alcool.",
    tags: ["Réglementation", "Restaurant", "Bar"],
    icon: "CupSoda",
    usefulFor: ["Conformité", "Exploitation", "Direction"],
    sectors: ["Restauration", "Hébergement & tourisme"],
    href: "https://www.umihformation.fr/nos-formations/15-PERMIS-D-EXPLOITATION-INITIAL",
    cta: "Voir la formation",
    format: "Présentiel ou visio selon session",
  },
  {
    slug: "management-operationnel-restauration",
    name: "Gestion et encadrement des équipes",
    provider: "UMIH Formation",
    family: "Management & équipe",
    category: "Restauration",
    shortDescription:
      "Une formation UMIH pensée pour les exploitants et responsables qui encadrent des équipes en hôtellerie-restauration.",
    description:
      "Fiche officielle UMIH Formation sur le management opérationnel et l'encadrement des équipes, avec objectifs, validation et sessions.",
    bestFor:
      "Les exploitants, directeurs et managers de restaurants qui veulent structurer l'encadrement et le pilotage d'équipe.",
    tags: ["Management", "Restaurant", "Équipe"],
    icon: "Users",
    usefulFor: ["Équipe", "Management", "Organisation"],
    sectors: ["Restauration", "Hébergement & tourisme"],
    href: "https://www.umihformation.fr/nos-formations/136-GESTION-ET-ENCADREMENT-DES-EQUIPES-MANAGEMENT-OPERATIONNEL",
    cta: "Voir la formation",
    format: "Sessions UMIH Formation",
  },
  {
    slug: "accueil-relation-client-restauration",
    name: "Accueil et relation client",
    provider: "UMIH Formation",
    family: "Commerce & relation client",
    category: "Restauration",
    shortDescription:
      "Une formation UMIH centrée sur l'accueil client et la gestion des situations délicates en service.",
    description:
      "Fiche officielle UMIH Formation dédiée à l'accueil, à la relation client et à la gestion des conflits dans les métiers de service.",
    bestFor:
      "Les équipes de salle, d'accueil et de service qui sont en contact quotidien avec la clientèle.",
    tags: ["Accueil", "Relation client", "Restaurant"],
    icon: "Users",
    usefulFor: ["Service", "Client", "Fidélisation"],
    sectors: ["Restauration", "Hébergement & tourisme"],
    href: "https://www.umihformation.fr/nos-formations/147-ACCUEIL-ET-RELATION-CLIENT-GESTION-DES-CONFLITS",
    cta: "Voir la formation",
    format: "Sessions UMIH Formation",
  },
  {
    slug: "bases-cuisine-restauration",
    name: "Les bases et perfectionnement en cuisine",
    provider: "UMIH Formation",
    family: "Sécurité & terrain",
    category: "Restauration",
    shortDescription:
      "Une formation métier UMIH pour renforcer les bases opérationnelles en cuisine professionnelle.",
    description:
      "Fiche officielle UMIH Formation autour des bases et du perfectionnement en cuisine, avec mise en pratique et validation.",
    bestFor:
      "Les commis, apprentis, employés polyvalents et équipes cuisine qui veulent consolider leurs fondamentaux.",
    tags: ["Cuisine", "Restaurant", "Technique"],
    icon: "Utensils",
    usefulFor: ["Cuisine", "Technique", "Montée en compétence"],
    sectors: ["Restauration"],
    href: "https://www.umihformation.fr/nos-formations/126-LES-BASES-ET-PERFECTIONNEMENT-EN-CUISINE",
    cta: "Voir la formation",
    format: "Sessions UMIH Formation",
  },
  {
    slug: "vente-relation-client-terrain",
    name: "Vente et relation client terrain",
    provider: "CCI France",
    family: "Commerce & relation client",
    category: "Commerce",
    shortDescription: "Un tronc commun très utile pour les équipes en contact client.",
    description:
      "Formation orientée accueil, écoute, argumentation et conversion dans des contextes de vente ou de devis.",
    bestFor:
      "Les commerces, services de proximité, activités locales et équipes d'accueil.",
    tags: ["Vente", "Accueil", "Relation client"],
    icon: "Users",
    usefulFor: ["Commerce", "Accueil", "Conversion"],
    sectors: [
      "Commerce & retail",
      "Services aux particuliers",
      "Hébergement & tourisme",
      "Santé, bien-être & esthétique",
    ],
    href: "https://www.cci.fr/formation",
    cta: "Voir les sessions",
  },
  {
    slug: "management-equipe-proximite",
    name: "Management d'équipe de proximité",
    provider: "Cegos",
    family: "Management & équipe",
    category: "Management",
    shortDescription: "Pour clarifier les rôles, cadrer le quotidien et faire monter l'équipe en autonomie.",
    description:
      "Formation centrée sur l'animation d'équipe, la priorisation, le recadrage et le suivi opérationnel.",
    bestFor:
      "Les dirigeants et managers de TPE/PME qui encadrent une équipe terrain ou support.",
    tags: ["Management", "Organisation", "Équipe"],
    icon: "Users",
    usefulFor: ["Management", "Encadrement", "Organisation"],
    sectors: [
      "Conseil & services aux entreprises",
      "BTP & services techniques",
      "Commerce & retail",
      "Restauration",
      "Services aux particuliers",
      "Industrie & production",
    ],
    href: "https://www.cegos.fr/formations/management",
    cta: "Voir la formation",
  },
  {
    slug: "communication-professionnelle-equipe",
    name: "Communication professionnelle en équipe",
    provider: "Cegos",
    family: "Management & équipe",
    category: "Communication",
    shortDescription: "Mieux transmettre, mieux recadrer et éviter les frictions du quotidien.",
    description:
      "Formation utile pour améliorer les échanges internes, les feedbacks, les consignes et la coordination.",
    bestFor:
      "Les équipes qui ont besoin de fluidifier les interactions entre bureau, terrain, accueil ou production.",
    tags: ["Communication", "Équipe", "Coordination"],
    icon: "Users",
    usefulFor: ["Équipe", "Communication", "Coordination"],
    sectors: [
      "Conseil & services aux entreprises",
      "BTP & services techniques",
      "Commerce & retail",
      "Restauration",
      "Santé, bien-être & esthétique",
      "Services aux particuliers",
    ],
    href: "https://www.cegos.fr/formations/efficacite-professionnelle",
    cta: "Voir la formation",
  },
  {
    slug: "ia-pour-tpe-pme",
    name: "IA pour TPE et PME",
    provider: "CCI France",
    family: "Numérique & IA",
    category: "Numérique",
    shortDescription: "Des usages concrets de l'IA pour gagner du temps au quotidien.",
    description:
      "Formation orientée cas d'usage simples: rédaction, support client, synthèse, préparation commerciale et automatisation légère.",
    bestFor:
      "Les dirigeants et équipes qui veulent intégrer l'IA sans projet technique complexe.",
    tags: ["IA", "Productivité", "Numérique"],
    icon: "Sparkles",
    usefulFor: ["IA", "Productivité", "Organisation"],
    sectors: [
      "Conseil & services aux entreprises",
      "Tech & Digital",
      "Commerce & retail",
      "Éducation & formation",
      "Services aux particuliers",
    ],
    href: "https://www.cci.fr/formation",
    cta: "Voir la formation",
    format: "Souvent atelier court ou classe virtuelle",
  },
  {
    slug: "cybersecurite-sensibilisation-equipes",
    name: "Sensibilisation cybersécurité des équipes",
    provider: "CNFCE",
    family: "Qualité & conformité",
    category: "Numérique",
    shortDescription: "Une base utile pour réduire les erreurs humaines et les risques simples.",
    description:
      "Formation de sensibilisation autour des mots de passe, emails, fraude, pièces jointes et bonnes pratiques du quotidien.",
    bestFor:
      "Toutes les TPE/PME qui manipulent des emails, documents, devis, données clients ou accès sensibles.",
    tags: ["Cybersécurité", "Sensibilisation", "Conformité"],
    icon: "Shield",
    usefulFor: ["Sécurité", "Équipe", "Numérique"],
    sectors: [
      "Conseil & services aux entreprises",
      "Tech & Digital",
      "Commerce & retail",
      "Santé, bien-être & esthétique",
      "Immobilier",
      "Patrimoine",
    ],
    href: "https://www.cnfce.com/formations/securite-des-personnes-entreprise/formation-cybersecurite",
    cta: "Voir la formation",
  },
  {
    slug: "ia-bpifrance-universite",
    name: "Formations intelligence artificielle",
    provider: "Bpifrance Université",
    family: "Numérique & IA",
    category: "Tech & digital",
    shortDescription:
      "L'entrée officielle Bpifrance Université pour accéder à de vraies formations IA pensées pour dirigeants et équipes.",
    description:
      "Page thématique Bpifrance Université consacrée à l'intelligence artificielle, avec catalogue associé, webinaires et formats en ligne gratuits.",
    bestFor:
      "Les agences web, SaaS et entreprises digitales qui veulent structurer une culture IA avec des usages concrets et des formations faciles à activer.",
    tags: ["IA", "Bpifrance", "Digital"],
    icon: "Sparkles",
    usefulFor: ["IA", "Veille", "Montée en compétence"],
    sectors: ["Tech & Digital", "Conseil & services aux entreprises"],
    href: "https://www.bpifrance-universite.fr/thematique/intelligence-artificielle/",
    cta: "Voir la formation",
    format: "Catalogue et webinaires en ligne",
  },
  {
    slug: "cybersecurite-bpifrance-universite",
    name: "Formations cybersécurité",
    provider: "Bpifrance Université",
    family: "Qualité & conformité",
    category: "Tech & digital",
    shortDescription:
      "Une entrée Bpifrance Université claire pour renforcer la sécurité numérique des équipes et de l'entreprise.",
    description:
      "Page thématique Bpifrance Université dédiée à la cybersécurité, avec parcours associés pour dirigeants et équipes sur les réflexes, risques et protections.",
    bestFor:
      "Les SaaS, agences web et entreprises numériques qui manipulent des accès, données client, outils collaboratifs et infrastructures en ligne.",
    tags: ["Cybersécurité", "Bpifrance", "Conformité"],
    icon: "Shield",
    usefulFor: ["Cybersécurité", "Équipe", "Protection"],
    sectors: ["Tech & Digital", "Conseil & services aux entreprises"],
    href: "https://www.bpifrance-universite.fr/thematique/cybersecurite/",
    cta: "Voir la formation",
    format: "Catalogue et webinaires en ligne",
  },
  {
    slug: "transformation-digitale-bpifrance",
    name: "Formations transformation digitale",
    provider: "Bpifrance Université",
    family: "Numérique & IA",
    category: "Tech & digital",
    shortDescription:
      "Une porte d'entrée Bpifrance Université pour cadrer outils, process et priorités de transformation digitale.",
    description:
      "Page thématique Bpifrance Université sur la transformation digitale, avec formations associées pour comprendre les leviers, les outils et l'organisation.",
    bestFor:
      "Les dirigeants et équipes de structures digitales qui veulent mieux piloter leurs évolutions d'outils, de process et de positionnement numérique.",
    tags: ["Transformation digitale", "Organisation", "Bpifrance"],
    icon: "Laptop",
    usefulFor: ["Transformation", "Organisation", "Numérique"],
    sectors: ["Tech & Digital", "Conseil & services aux entreprises"],
    href: "https://www.bpifrance-universite.fr/thematique/transformation-digitale/",
    cta: "Voir la formation",
    format: "Catalogue et webinaires en ligne",
  },
  {
    slug: "marketing-ia-bpifrance",
    name: "Comment adapter sa stratégie marketing avec l'IA ?",
    provider: "Bpifrance Université",
    family: "Numérique & IA",
    category: "Tech & digital",
    shortDescription:
      "Un webinaire Bpifrance Université très concret sur les usages marketing de l'IA pour rester compétitif.",
    description:
      "Fiche officielle Bpifrance Université autour de l'impact de l'IA sur la segmentation, la personnalisation, la création de contenu et l'optimisation des campagnes.",
    bestFor:
      "Les agences web, structures SaaS et équipes marketing qui veulent appliquer des cas d'usage IA sans passer par un projet complexe.",
    tags: ["Marketing digital", "IA", "Webinaire"],
    icon: "Target",
    usefulFor: ["Marketing", "IA", "Cas d'usage"],
    sectors: ["Tech & Digital"],
    href: "https://www.bpifrance-universite.fr/formation/comment-adapter-sa-strategie-marketing-avec-lia/",
    cta: "Voir la formation",
    format: "Webinaire en ligne",
  },
  {
    slug: "vente-bpifrance-universite",
    name: "Formations vente",
    provider: "Bpifrance Université",
    family: "Commerce & relation client",
    category: "Conseil & B2B",
    shortDescription:
      "Une porte d'entrée Bpifrance Université pour structurer la vente, la prospection et le développement commercial B2B.",
    description:
      "Page thématique Bpifrance Université dédiée à la vente, avec catalogue associé et formations autour de la stratégie commerciale, des grands comptes et du développement business.",
    bestFor:
      "Les activités de conseil, services B2B et freelances qui veulent mieux cadrer leur prospection, leur discours de valeur et leur conversion commerciale.",
    tags: ["Vente", "B2B", "Bpifrance"],
    icon: "Target",
    usefulFor: ["Prospection", "Commercial", "Croissance"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://www.bpifrance-universite.fr/thematique/vente/",
    cta: "Voir la formation",
    format: "Catalogue et formations en ligne",
  },
  {
    slug: "vendre-grands-comptes-bpifrance",
    name: "Vendre aux grands comptes",
    provider: "Bpifrance Université",
    family: "Commerce & relation client",
    category: "Conseil & B2B",
    shortDescription:
      "Une formation Bpifrance Université très utile pour les structures qui vendent des missions ou services à forte valeur ajoutée.",
    description:
      "Fiche officielle Bpifrance Université sur la vente aux grands comptes, avec angle croissance, référence client et retour sur investissement commercial.",
    bestFor:
      "Les cabinets de conseil, prestations B2B et structures de service qui cherchent à mieux aborder les comptes stratégiques.",
    tags: ["Grands comptes", "Vente B2B", "Croissance"],
    icon: "TrendingUp",
    usefulFor: ["Grands comptes", "Stratégie commerciale", "B2B"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://www.bpifrance-universite.fr/formation/vendre-aux-grands-comptes/",
    cta: "Voir la formation",
    format: "Formation en ligne",
  },
  {
    slug: "management-bpifrance-universite",
    name: "Formations management",
    provider: "Bpifrance Université",
    family: "Management & équipe",
    category: "Conseil & B2B",
    shortDescription:
      "L'entrée Bpifrance Université pour renforcer le pilotage d'équipe, la coopération et la performance managériale.",
    description:
      "Page thématique Bpifrance Université sur le management, avec formations associées autour de la coopération, de l'humain et de l'organisation.",
    bestFor:
      "Les dirigeants de cabinets, structures de service et petites équipes qui veulent mieux cadrer la production, les échanges et les responsabilités.",
    tags: ["Management", "Équipe", "Organisation"],
    icon: "Users",
    usefulFor: ["Management", "Organisation", "Équipe"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://www.bpifrance-universite.fr/thematique/management/",
    cta: "Voir la formation",
    format: "Catalogue et formations en ligne",
  },
  {
    slug: "leadership-bpifrance-universite",
    name: "Formations leadership",
    provider: "Bpifrance Université",
    family: "Management & équipe",
    category: "Conseil & B2B",
    shortDescription:
      "Une porte d'entrée claire pour les dirigeants qui veulent muscler leur posture de pilotage et d'entraînement.",
    description:
      "Page thématique Bpifrance Université consacrée au leadership, pensée pour aider les dirigeants à développer leurs capacités de guidage, de décision et d'animation.",
    bestFor:
      "Les freelances en croissance, dirigeants de cabinets et responsables de petites structures qui passent d'expert métier à pilote d'activité.",
    tags: ["Leadership", "Dirigeant", "Pilotage"],
    icon: "Lightbulb",
    usefulFor: ["Leadership", "Posture dirigeant", "Décision"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://www.bpifrance-universite.fr/thematique/leadership/",
    cta: "Voir la formation",
    format: "Catalogue et formations en ligne",
  },
  {
    slug: "marketing-digital-bpifrance",
    name: "Formations marketing digital",
    provider: "Bpifrance Université",
    family: "Commerce & relation client",
    category: "Commerce & retail",
    shortDescription:
      "Une porte d'entrée Bpifrance Université pour travailler visibilité, acquisition et animation commerciale en ligne.",
    description:
      "Page thématique Bpifrance Université dédiée au marketing digital, avec catalogue associé pour structurer communication, acquisition et performance commerciale.",
    bestFor:
      "Les commerces, boutiques spécialisées et activités e-commerce qui veulent mieux piloter leur présence digitale et leur croissance commerciale.",
    tags: ["Marketing digital", "E-commerce", "Bpifrance"],
    icon: "Target",
    usefulFor: ["Acquisition", "Visibilité", "Commerce"],
    sectors: ["Commerce & retail"],
    href: "https://www.bpifrance-universite.fr/thematique/marketing-digital/",
    cta: "Voir la formation",
    format: "Catalogue et formations en ligne",
  },
  {
    slug: "catalogue-hotels-palaces-umih",
    name: "Catalogue Hôtels / Palaces",
    provider: "UMIH Formation",
    family: "Management & équipe",
    category: "Hébergement & tourisme",
    shortDescription:
      "Une vraie porte d'entrée UMIH Formation pour les établissements d'hébergement qui veulent former leurs équipes.",
    description:
      "Catalogue officiel UMIH Formation dédié aux hôtels et palaces, utile pour repérer les formations adaptées à l'accueil, au management et aux opérations d'hébergement.",
    bestFor:
      "Les hôtels, hébergements indépendants et structures d'accueil qui veulent une source claire pour orienter les formations du front office et de l'exploitation.",
    tags: ["Hôtellerie", "Accueil", "Management"],
    icon: "Building2",
    usefulFor: ["Hébergement", "Accueil", "Équipe"],
    sectors: ["Hébergement & tourisme"],
    href: "https://www.umihformation.fr/download/catalog/pdf/CATALOGUE-UF-HOTELS-PALACES?f=CATALOGUE-UF-HOTELS-PALACES.996004e0.pdf",
    cta: "Voir la formation",
    format: "Catalogue PDF UMIH Formation",
  },
  {
    slug: "operateurs-voyage-umih",
    name: "Formations opérateurs de voyage",
    provider: "TravelPro Formations by UMIH Formation",
    family: "Commerce & relation client",
    category: "Hébergement & tourisme",
    shortDescription:
      "Une source spécialisée pour les agences de voyage et professionnels du tourisme avec catalogue et dates de formation.",
    description:
      "Site TravelPro Formations by UMIH Formation, consacré aux métiers du tourisme et du voyage, avec catalogue, dates de formation et modalités de financement.",
    bestFor:
      "Les agences de voyage, activités touristiques et structures qui vendent, conçoivent ou coordonnent des prestations de voyage.",
    tags: ["Voyage", "Tourisme", "Catalogue"],
    icon: "Map",
    usefulFor: ["Agence de voyage", "Tourisme", "Formation métier"],
    sectors: ["Hébergement & tourisme"],
    href: "https://travel.umihformation.fr/",
    cta: "Voir la formation",
    format: "Catalogue et dates de formation",
  },
  {
    slug: "qualiopi-pour-organismes-formation",
    name: "Qualité en formation",
    provider: "Centre Inffo",
    family: "Qualité & conformité",
    category: "Formation",
    shortDescription:
      "L'entrée Centre Inffo dédiée à la qualité en formation, avec offres autour de Qualiopi, audits et structuration qualité.",
    description:
      "Page officielle Centre Inffo consacrée à la qualité en formation, avec accès aux offres liées à Qualiopi, à la préparation des audits et à l'amélioration des process.",
    bestFor:
      "Les organismes de formation, CFA et structures éducatives qui veulent cadrer ou faire vivre leur dispositif qualité.",
    tags: ["Qualiopi", "Formation", "Qualité"],
    icon: "GraduationCap",
    usefulFor: ["Qualité", "Conformité", "Structuration"],
    sectors: ["Éducation & formation"],
    href: "https://www.centre-inffo.fr/offre-formation-produits-services/offre-centre-inffo-par-thematiques/qualite-en-formation",
    cta: "Voir la formation",
    format: "Offre Centre Inffo par thématique",
  },
  {
    slug: "reglementation-organismes-formation",
    name: "Réglementation des organismes de formation",
    provider: "Centre Inffo",
    family: "Réglementaire",
    category: "Formation",
    shortDescription:
      "Une entrée Centre Inffo très utile pour sécuriser obligations, contractualisation, BPF et cadre d'exercice des OF.",
    description:
      "Page officielle Centre Inffo dédiée à la réglementation des organismes de formation, avec offres sur obligations, sous-traitance, BPF et conformité.",
    bestFor:
      "Les organismes de formation qui veulent sécuriser leur cadre juridique et leurs pratiques opérationnelles.",
    tags: ["Organisme de formation", "Réglementation", "BPF"],
    icon: "Scale",
    usefulFor: ["Conformité", "Réglementation", "Pilotage"],
    sectors: ["Éducation & formation"],
    href: "https://www.centre-inffo.fr/offre-formation-produits-services/offre-centre-inffo-par-thematiques/reglementation-des-organismes-de-formation",
    cta: "Voir la formation",
    format: "Offre Centre Inffo par thématique",
  },
  {
    slug: "certification-professionnelle-centre-inffo",
    name: "Certification professionnelle",
    provider: "Centre Inffo",
    family: "Réglementaire",
    category: "Certification",
    shortDescription:
      "Une entrée Centre Inffo pour les structures qui veulent rendre leur offre certifiante ou travailler l'ingénierie RNCP/RS.",
    description:
      "Page officielle Centre Inffo consacrée à la certification professionnelle, avec offres autour des référentiels, de l'enregistrement et de la vie des certifications.",
    bestFor:
      "Les organismes de formation et certificateurs qui veulent construire, enregistrer ou faire vivre une certification professionnelle.",
    tags: ["Certification", "RNCP", "RS"],
    icon: "GraduationCap",
    usefulFor: ["Certification", "RNCP", "Ingénierie"],
    sectors: ["Éducation & formation"],
    href: "https://www.centre-inffo.fr/offre-formation-produits-services/offre-centre-inffo-par-thematiques/ingenierie-de-certification",
    cta: "Voir la formation",
    format: "Offre Centre Inffo par thématique",
  },
  {
    slug: "apprentissage-cfa-centre-inffo",
    name: "Apprentissage et CFA",
    provider: "Centre Inffo",
    family: "Réglementaire",
    category: "Apprentissage",
    shortDescription:
      "L'entrée Centre Inffo pour structurer l'activité apprentissage, le financement CFA et la pédagogie de l'alternance.",
    description:
      "Page officielle Centre Inffo dédiée à l'apprentissage, avec offres sur création et développement de CFA, financement et ingénierie de l'alternance.",
    bestFor:
      "Les CFA et acteurs de l'apprentissage qui veulent cadrer financement, réglementation et développement de leur activité.",
    tags: ["CFA", "Apprentissage", "Alternance"],
    icon: "GraduationCap",
    usefulFor: ["CFA", "Apprentissage", "Alternance"],
    sectors: ["Éducation & formation"],
    href: "https://www.centre-inffo.fr/offre-formation-produits-services/offre-centre-inffo-par-thematiques/apprentissage",
    cta: "Voir la formation",
    format: "Offre Centre Inffo par thématique",
  },
  {
    slug: "parcours-profession-comptable-2030",
    name: 'Parcours "Profession Comptable 2030"',
    provider: "CFPC",
    family: "Management & équipe",
    category: "Cabinet comptable",
    shortDescription: "Un parcours officiel du CFPC pour aider les collaborateurs de cabinet à s'adapter aux évolutions de la profession.",
    description:
      "Parcours mis en avant par le CFPC pour accompagner les cabinets et leurs collaborateurs face aux transformations du métier et de leur environnement professionnel.",
    bestFor:
      "Les cabinets comptables qui veulent faire évoluer leurs équipes et mieux préparer les transformations de la profession.",
    tags: ["Profession comptable", "Cabinet", "Transformation"],
    icon: "Calculator",
    usefulFor: ["Cabinet comptable", "Équipe", "Transformation"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://www.cfpc.net/autre-formation/parcours-profession-comptable-2030",
    cta: "Voir la formation",
    format: "Parcours CFPC",
  },
  {
    slug: "cap-durabilite-cfpc",
    name: "Parcours Cap Durabilité",
    provider: "CFPC",
    family: "Qualité & conformité",
    category: "Durabilité",
    shortDescription: "Un parcours officiel du CFPC pour développer de nouvelles missions autour de la durabilité et de la CSRD.",
    description:
      "Parcours mis en avant par le CFPC pour développer l'accompagnement au rapport de durabilité et les compétences liées à la certification du rapport de durabilité.",
    bestFor:
      "Les cabinets comptables qui veulent structurer une offre autour de la durabilité, de la CSRD et des nouvelles missions associées.",
    tags: ["Durabilité", "CSRD", "Cabinet comptable"],
    icon: "GraduationCap",
    usefulFor: ["Durabilité", "Nouvelles missions", "Cabinet comptable"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://catalogue.cfpc.net/fiche/01.01DUR0063",
    cta: "Voir la formation",
    format: "Catalogue CFPC",
  },
  {
    slug: "deontologie-reglementation-cfpc",
    name: "Pack Accompagnement Déontologie et Réglementation professionnelle (e-learning)",
    provider: "CFPC",
    family: "Réglementaire",
    category: "Déontologie",
    shortDescription: "Une formation officielle du CFPC sur la déontologie et le cadre réglementaire de la profession.",
    description:
      "Pack e-learning du CFPC dédié à la déontologie et à la réglementation professionnelle, publié dans les formations mises en avant du centre.",
    bestFor:
      "Les cabinets et professionnels de l'expertise comptable qui veulent consolider leur cadre d'exercice et leurs réflexes réglementaires.",
    tags: ["Déontologie", "Réglementation", "Cabinet comptable"],
    icon: "Scale",
    usefulFor: ["Conformité", "Déontologie", "Cabinet comptable"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://catalogue.cfpc.net/fiche/01.01DDN0020.25",
    cta: "Voir la formation",
    format: "E-learning CFPC",
  },
  {
    slug: "evaluation-entreprise-cfpc",
    name: "Formation en Evaluation d’entreprise",
    provider: "CFPC",
    family: "Commerce & relation client",
    category: "Évaluation",
    shortDescription: "Une formation officielle proposée par le CFPC autour de l'évaluation d'entreprise.",
    description:
      "Formation mise en avant par le CFPC en partenariat avec l'ACCA, utile pour développer les compétences d'évaluation d'entreprise en cabinet.",
    bestFor:
      "Les cabinets comptables qui veulent renforcer leur savoir-faire en évaluation d'entreprise et développer des missions de conseil à plus forte valeur.",
    tags: ["Évaluation d'entreprise", "Conseil", "Cabinet comptable"],
    icon: "BadgeEuro",
    usefulFor: ["Conseil", "Valorisation", "Cabinet comptable"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://www.cfpc.net/autre-formation/formation-evaluation-entreprise",
    cta: "Voir la formation",
    format: "Formation partenaire relayée par le CFPC",
  },
  {
    slug: "paie-cabinet-expertise-comptable-cfpc",
    name: "Pratiquer la paie en cabinet d'expertise comptable",
    provider: "CFPC",
    family: "Réglementaire",
    category: "Social & paie",
    shortDescription: "Une formation certifiante CFPC explicitement listée dans les certifications officielles du centre.",
    description:
      "Formation citée par le CFPC dans sa page officielle Certifications, destinée à faire reconnaître des compétences directement utiles aux cabinets comptables.",
    bestFor:
      "Les cabinets comptables qui veulent renforcer ou certifier les compétences paie et social de leurs collaborateurs.",
    tags: ["Paie", "Social", "Cabinet comptable"],
    icon: "Calculator",
    usefulFor: ["Paie", "Social", "Cabinet comptable"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://catalogue.cfpc.net/?certifiant=true",
    cta: "Voir les certifications",
    format: "Certifications CFPC",
  },
  {
    slug: "dossier-tpe-presentation-cfpc",
    name: "Traiter un dossier TPE dans le cadre d'une mission de présentation en cabinet d'expertise comptable",
    provider: "CFPC",
    family: "Qualité & conformité",
    category: "Dossier TPE",
    shortDescription: "Une formation certifiante CFPC explicitement listée pour la pratique opérationnelle en cabinet.",
    description:
      "Formation citée par le CFPC dans sa page officielle Certifications, centrée sur le traitement d'un dossier TPE dans une mission de présentation en cabinet.",
    bestFor:
      "Les cabinets comptables qui veulent structurer la montée en compétence de leurs collaborateurs sur le traitement opérationnel des dossiers TPE.",
    tags: ["TPE", "Mission de présentation", "Cabinet comptable"],
    icon: "FileSearch",
    usefulFor: ["Dossier TPE", "Production cabinet", "Cabinet comptable"],
    sectors: ["Conseil & services aux entreprises"],
    href: "https://catalogue.cfpc.net/?certifiant=true",
    cta: "Voir les certifications",
    format: "Certifications CFPC",
  },
  {
    slug: "merchandising-vente-magasin",
    name: "Merchandising et vente en magasin",
    provider: "CCI France",
    family: "Commerce & relation client",
    category: "Commerce",
    shortDescription: "Pour mieux vendre en boutique et structurer l'expérience client.",
    description:
      "Formation pratique sur l'accueil, la mise en avant des produits, le conseil et la conversion en point de vente.",
    bestFor:
      "Les commerces de détail, boutiques spécialisées et réseaux retail.",
    tags: ["Commerce", "Merchandising", "Vente"],
    icon: "Package",
    usefulFor: ["Vente", "Magasin", "Fidélisation"],
    sectors: ["Commerce & retail"],
    href: "https://www.cci.fr/formation",
    cta: "Voir la formation",
  },
  {
    slug: "service-client-hotellerie-tourisme",
    name: "Service client en hôtellerie et tourisme",
    provider: "UMIH Formation",
    family: "Commerce & relation client",
    category: "Hospitalité",
    shortDescription: "Pour fluidifier l'accueil, les standards de service et la fidélisation.",
    description:
      "Formation utile pour les équipes d'accueil, de réservation ou de service dans les activités d'hospitalité.",
    bestFor:
      "Les hôtels indépendants, hébergements, conciergeries et activités touristiques.",
    tags: ["Accueil", "Hospitalité", "Service client"],
    icon: "Globe2",
    usefulFor: ["Accueil", "Avis clients", "Fidélisation"],
    sectors: ["Hébergement & tourisme"],
    href: "https://www.umihformation.fr/",
    cta: "Voir la formation",
  },
  {
    slug: "qvct-prevention-rh",
    name: "QVCT et prévention des risques RH",
    provider: "Cegos",
    family: "Management & équipe",
    category: "RH",
    shortDescription: "Pour mieux encadrer l'équipe et réduire les tensions récurrentes.",
    description:
      "Formation utile pour les dirigeants qui veulent stabiliser l'équipe, améliorer le cadre de travail et prévenir les irritants du quotidien.",
    bestFor:
      "Les structures avec recrutement, encadrement ou difficultés d'organisation interne.",
    tags: ["QVCT", "RH", "Management"],
    icon: "HeartPulse",
    usefulFor: ["RH", "Équipe", "Organisation"],
    sectors: [
      "Conseil & services aux entreprises",
      "Commerce & retail",
      "Restauration",
      "Services aux particuliers",
      "Industrie & production",
    ],
    href: "https://www.cegos.fr/formations/ressources-humaines",
    cta: "Voir la formation",
  },
  {
    slug: "lean-amelioration-continue",
    name: "Lean et amélioration continue",
    provider: "AFNOR Compétences",
    family: "Qualité & conformité",
    category: "Performance",
    shortDescription: "Pour mieux organiser les flux, la qualité et les routines d'équipe.",
    description:
      "Formation axée amélioration continue, réduction des gaspillages, qualité d'exécution et routines opérationnelles.",
    bestFor:
      "Les activités industrielles, ateliers, production, logistique et équipes multi-étapes.",
    tags: ["Lean", "Qualité", "Production"],
    icon: "Workflow",
    usefulFor: ["Organisation", "Production", "Qualité"],
    sectors: ["Industrie & production", "Mobilité & logistique"],
    href: "https://competences.afnor.org/",
    cta: "Voir la formation",
  },
  {
    slug: "documents-obligations-rgpd",
    name: "RGPD et gestion des données clients",
    provider: "CNIL",
    family: "Qualité & conformité",
    category: "Conformité",
    shortDescription: "Une base utile pour les activités qui collectent des données clients ou prospects.",
    description:
      "Formation de sensibilisation aux principes RGPD, aux données personnelles et aux réflexes de base à mettre en place.",
    bestFor:
      "Les entreprises qui collectent des formulaires, dossiers clients, données santé ou données RH.",
    tags: ["RGPD", "Données", "Conformité"],
    icon: "Shield",
    usefulFor: ["Conformité", "Données", "Organisation"],
    sectors: [
      "Conseil & services aux entreprises",
      "Tech & Digital",
      "Immobilier",
      "Santé, bien-être & esthétique",
      "Éducation & formation",
    ],
    href: "https://atelier-rgpd.cnil.fr/",
    cta: "Voir la ressource",
    format: "Autoformation",
  },
  {
    slug: "esthetique-hygiene-protocoles",
    name: "Pack formation beauté",
    provider: "C3 Paris",
    family: "Métier",
    category: "Beauté",
    shortDescription: "Parcours pratique sur les soins du visage, l'épilation et la beauté des mains et des pieds.",
    description:
      "Parcours de quatre modules pour apprendre des protocoles de soin directement applicables en institut ou en activité indépendante.",
    bestFor:
      "Les instituts et professionnels de la beauté qui veulent consolider leurs protocoles de base.",
    tags: ["Beauté", "Soins", "Protocoles"],
    icon: "Sparkles",
    usefulFor: ["Soins", "Pratique", "Institut"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://c3paris.com/pack-formation-beaute/",
    cta: "Voir la formation",
  },
  {
    slug: "head-spa-cnaib",
    name: "Head Spa",
    provider: "CNAIB SPA Formation Pro",
    family: "Métier",
    category: "Esthétique",
    shortDescription:
      "Une formation métier visible dans l'offre officielle CNAIB SPA Formation Pro pour enrichir la carte de soins en institut.",
    description:
      "Formation présente dans le catalogue officiel CNAIB SPA Formation Pro, dédiée au Head Spa et à l'élargissement de l'offre de soins en institut.",
    bestFor:
      "Les instituts de beauté, spas et activités esthétiques qui veulent développer une prestation Head Spa.",
    tags: ["Head Spa", "Esthétique", "Soin"],
    icon: "Sparkles",
    usefulFor: ["Carte de soins", "Différenciation", "Beauté"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.cnaibspaformationpro.fr/formations-presentielles.php#row_SECTION_3EC17UYBS4",
    cta: "Voir la formation",
    format: "Formation présentielle",
  },
  {
    slug: "beaute-regard-cnaib",
    name: "Beauté du regard",
    provider: "CNAIB SPA Formation Pro",
    family: "Métier",
    category: "Esthétique",
    shortDescription:
      "Une entrée officielle CNAIB SPA Formation Pro pour les prestations beauté du regard en institut.",
    description:
      "Formation référencée dans le catalogue officiel CNAIB SPA Formation Pro pour développer des prestations autour de la beauté du regard.",
    bestFor:
      "Les instituts de beauté et activités esthétiques qui veulent structurer ou élargir leur offre regard.",
    tags: ["Beauté du regard", "Esthétique", "Prestation"],
    icon: "Sparkles",
    usefulFor: ["Prestation", "Beauté", "Montée en gamme"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.cnaibspaformationpro.fr/formations-presentielles.php#row_SECTION_XTTI8BP7EG",
    cta: "Voir la formation",
    format: "Formation présentielle",
  },
  {
    slug: "marketing-vente-esthetique-cnaib",
    name: "Marketing / Vente",
    provider: "CNAIB SPA Formation Pro",
    family: "Développement commercial",
    category: "Esthétique",
    shortDescription:
      "Une formation officielle CNAIB SPA Formation Pro pour mieux vendre, animer et développer l'activité en institut.",
    description:
      "Formation identifiée dans l'offre CNAIB SPA Formation Pro autour du marketing et de la vente pour les professionnelles de l'esthétique.",
    bestFor:
      "Les instituts de beauté, spas et activités esthétiques qui veulent améliorer le panier moyen et la transformation en cabine.",
    tags: ["Marketing", "Vente", "Institut"],
    icon: "Target",
    usefulFor: ["Vente", "Développement", "Fidélisation"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.cnaibspaformationpro.fr/formations-presentielles.php#row_SECTION_LUYO377TAA",
    cta: "Voir la formation",
    format: "Formation présentielle",
  },
  {
    slug: "epilation-ipl-laser-cnaib",
    name: "Épilation à la lumière pulsée intense et au laser",
    provider: "CNAIB / Med Tech Academy",
    family: "Réglementaire",
    category: "Esthétique",
    shortDescription:
      "Une entrée officielle CNAIB pour le cadre et les formations liées à l'IPL et au laser à visée non thérapeutique.",
    description:
      "Page CNAIB consacrée à la réglementation et aux formations du partenaire Med Tech Academy pour l'épilation à la lumière pulsée intense et au laser.",
    bestFor:
      "Les instituts et activités esthétiques qui veulent proposer l'IPL ou le laser dans un cadre conforme et sécurisé.",
    tags: ["IPL", "Laser", "Réglementation"],
    icon: "Shield",
    usefulFor: ["Conformité", "Beauté", "Sécurité"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.cnaib.fr/ipl-laser-reglementationformation/",
    cta: "Voir la formation",
    format: "Page CNAIB / partenaire externe",
  },
  {
    slug: "creer-reprendre-salon-coiffure-unec",
    name: "Créer / reprendre un salon de coiffure",
    provider: "UNEC / I2CR",
    family: "Pilotage d'entreprise",
    category: "Coiffure",
    shortDescription:
      "La formation UNEC pensée pour cadrer un projet d'ouverture ou de reprise de salon.",
    description:
      "Formation I2CR portée par l'UNEC pour accompagner les porteurs de projet sur les étapes de création ou reprise d'un salon de coiffure.",
    bestFor:
      "Les coiffeurs et dirigeants qui veulent ouvrir, reprendre ou structurer un salon de coiffure.",
    tags: ["Coiffure", "Création", "Reprise"],
    icon: "Scissors",
    usefulFor: ["Pilotage", "Création", "Structuration"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://unec.fr/formation-creer-reprendre-un-salon-de-coiffure/",
    cta: "Voir la formation",
    format: "Formation I2CR",
  },
  {
    slug: "cqp-manager-salon-coiffure",
    name: "CQP manager un salon de coiffure",
    provider: "UNEC",
    family: "Management & équipe",
    category: "Coiffure",
    shortDescription:
      "Le CQP UNEC pour structurer l'organisation, le management et la performance d'un salon.",
    description:
      "Certification UNEC enregistrée au Répertoire spécifique pour les coiffeurs qui veulent exercer ou renforcer une fonction de management en salon.",
    bestFor:
      "Les salons de coiffure qui veulent faire monter un responsable ou un manager en compétence.",
    tags: ["CQP", "Management", "Coiffure"],
    icon: "Users",
    usefulFor: ["Management", "Équipe", "Performance"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://unec.fr/cqp-manager-en-salon-de-coiffure/",
    cta: "Voir la formation",
    format: "Certification",
  },
  {
    slug: "certificat-cheveux-boucles-crepus-unec",
    name: "Certificat cheveux bouclés à crépus",
    provider: "UNEC",
    family: "Métier",
    category: "Coiffure",
    shortDescription:
      "Une certification métier reconnue pour les techniques de coiffure sur cheveux bouclés à crépus.",
    description:
      "Certificat UNEC dédié aux techniques de coiffage, coloration et mise en forme sur cheveux spécifiques, bouclés à crépus.",
    bestFor:
      "Les salons de coiffure qui veulent renforcer leur maîtrise des cheveux bouclés à crépus avec une formation reconnue.",
    tags: ["Coiffure", "Bouclés", "Crépus"],
    icon: "Scissors",
    usefulFor: ["Technique", "Expertise", "Différenciation"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://unec.fr/certificat-realiser-des-techniques-de-coiffure-pour-cheveux-specifiques-boucles-a-crepus/",
    cta: "Voir la formation",
    format: "Certification",
  },
  {
    slug: "bpjeps-af-encp",
    name: "BPJEPS AF",
    provider: "ENCP",
    family: "Métier",
    category: "Fitness",
    shortDescription:
      "Le parcours diplômant ENCP pour former des coachs sportifs sur les activités de la forme.",
    description:
      "Page ENCP dédiée au BPJEPS Activités de la Forme, avec entrée en formation, rythme, contenus et dossier d'inscription.",
    bestFor:
      "Les salles de sport et dirigeants qui recrutent ou veulent faire évoluer un coach vers un diplôme d'État en fitness.",
    tags: ["BPJEPS", "Fitness", "Coach sportif"],
    icon: "Dumbbell",
    usefulFor: ["Coaching", "Recrutement", "Montée en compétences"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.encp.fr/formation/bpjeps-af/",
    cta: "Voir la formation",
    format: "Formation diplômante",
  },
  {
    slug: "cqp-if-encp",
    name: "CQP Instructeur Fitness",
    provider: "ENCP",
    family: "Métier",
    category: "Fitness",
    shortDescription:
      "Une certification ENCP courte et très connue pour former des coachs sur la remise en forme.",
    description:
      "Page ENCP consacrée au CQP IF, avec rythme, options, débouchés et prochaines rentrées pour exercer comme éducateur sportif.",
    bestFor:
      "Les salles de sport qui veulent recruter, former ou faire évoluer un coach sur l'encadrement fitness.",
    tags: ["CQP IF", "Fitness", "Coach"],
    icon: "Dumbbell",
    usefulFor: ["Encadrement", "Fitness", "Professionnalisation"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.encp.fr/formation/cqp-if/",
    cta: "Voir la formation",
    format: "Certification",
  },
  {
    slug: "accueil-gestion-club-sport-encp",
    name: "Chargé d'accueil et de gestion administrative",
    provider: "ENCP",
    family: "Support opérationnel",
    category: "Fitness",
    shortDescription:
      "Une formation ENCP utile pour structurer l'accueil, la relation client et l'administratif d'un club.",
    description:
      "Titre professionnel ENCP centré sur l'accueil, la relation client et la gestion administrative dans des structures sport, loisirs et services.",
    bestFor:
      "Les salles de sport qui veulent professionnaliser l'accueil, le suivi adhérents et l'administratif du club.",
    tags: ["Accueil", "Gestion", "Club"],
    icon: "Briefcase",
    usefulFor: ["Accueil", "Organisation", "Relation client"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.encp.fr/formation/charge-daccueil-et-de-gestion-administrative/",
    cta: "Voir la formation",
    format: "Titre professionnel",
  },
  {
    slug: "recherche-action-dpc-officiel",
    name: "Rechercher une action de DPC",
    provider: "Agence nationale du DPC",
    family: "Réglementaire",
    category: "Santé",
    shortDescription:
      "L'entrée officielle pour rechercher des actions de DPC adaptées à sa profession de santé.",
    description:
      "Page officielle de l'Agence DPC donnant accès au moteur de recherche des actions de DPC pour les professionnels de santé éligibles.",
    bestFor:
      "Les cabinets médicaux et paramédicaux qui veulent identifier des formations DPC reconnues selon la profession exercée.",
    tags: ["DPC", "Santé", "Formation continue"],
    icon: "Stethoscope",
    usefulFor: ["Conformité", "Veille", "Formation continue"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.agencedpc.fr/formations-dpc-rechercher-un-dpc",
    cta: "Voir la formation",
    format: "Moteur officiel DPC",
  },
  {
    slug: "adf-dpc-chirurgien-dentiste",
    name: "Formations DPC pour chirurgiens-dentistes",
    provider: "ADFDPC-Formation",
    family: "Formation continue",
    category: "Santé",
    shortDescription:
      "L'offre métier de l'Association dentaire française pour suivre des formations DPC conçues pour la pratique du chirurgien-dentiste.",
    description:
      "Espace d'inscription d'ADFDPC-Formation, la structure dédiée de l'Association dentaire française, pour consulter et suivre ses actions de développement professionnel continu.",
    bestFor:
      "Les chirurgiens-dentistes qui veulent choisir une formation continue réellement conçue pour leur profession et suivre leurs inscriptions DPC.",
    tags: ["Chirurgien-dentiste", "DPC", "Formation continue"],
    icon: "HeartPulse",
    usefulFor: ["Pratique dentaire", "DPC", "Mise à jour des compétences"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.adfdpc.fr/nos-formations/",
    cta: "Voir les formations",
    format: "E-learning et présentiel selon la session",
  },
  {
    slug: "utip-formation-pharmacie-officine",
    name: "Formations pour la pharmacie d'officine",
    provider: "UTIP Association",
    family: "Formation continue",
    category: "Santé",
    shortDescription:
      "Un catalogue métier destiné aux pharmaciens, préparateurs et équipes officinales, avec des sujets directement liés à la pratique en pharmacie.",
    description:
      "Catalogue de l'UTIP Association consacré à la formation des équipes officinales, avec des sessions et contenus adaptés aux enjeux concrets de la pharmacie.",
    bestFor:
      "Les titulaires de pharmacie qui veulent former leur équipe sur des sujets réellement liés à l'officine.",
    tags: ["Pharmacie", "Officine", "Formation continue"],
    icon: "HeartPulse",
    usefulFor: ["Pratique officinale", "Équipe", "Mise à jour des compétences"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.utip-association.org/formations",
    cta: "Voir les formations",
    format: "Sessions et contenus métier",
  },
  {
    slug: "envf-formation-continue-veterinaire",
    name: "Catalogue de formation continue vétérinaire",
    provider: "Écoles nationales vétérinaires de France",
    family: "Formation continue",
    category: "Santé",
    shortDescription:
      "Le catalogue commun des quatre Écoles nationales vétérinaires françaises pour approfondir une pratique clinique ou développer une compétence métier.",
    description:
      "Catalogue de formation continue porté par l'ENVA, VetAgro Sup, Oniris et l'ENVT, avec des parcours qualifiants, certifiants et diplômants pour les vétérinaires.",
    bestFor:
      "Les cabinets et cliniques vétérinaires qui recherchent une offre académique structurée et directement liée à leur profession.",
    tags: ["Vétérinaire", "Formation continue", "Écoles nationales"],
    icon: "HeartPulse",
    usefulFor: ["Pratique vétérinaire", "Compétences cliniques", "Équipe"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://formation-continue.envf.fr/",
    cta: "Voir les formations",
    format: "Présentiel et parcours spécialisés",
  },
  {
    slug: "afvac-formation-veterinaire",
    name: "Formations pour vétérinaires praticiens",
    provider: "AFVAC",
    family: "Formation continue",
    category: "Santé",
    shortDescription:
      "Une offre de formation continue centrée sur la pratique quotidienne des vétérinaires pour animaux de compagnie.",
    description:
      "Catalogue de l'Association française des vétérinaires pour animaux de compagnie, avec des formations cliniques et pratiques destinées aux vétérinaires.",
    bestFor:
      "Les cabinets vétérinaires qui veulent des formats concrets et directement applicables à la prise en charge de leurs patients.",
    tags: ["Vétérinaire", "Animaux de compagnie", "Formation pratique"],
    icon: "HeartPulse",
    usefulFor: ["Pratique clinique", "Animaux de compagnie", "Formation continue"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://afvac.com/les-formations",
    cta: "Voir les formations",
    format: "Présentiel, distanciel et congrès",
  },
  {
    slug: "ico-formation-continue-opticien",
    name: "Formation continue pour opticiens",
    provider: "ICO-CMO",
    family: "Formation continue",
    category: "Santé",
    shortDescription:
      "Un catalogue métier pour les opticiens, de la réfraction à la basse vision, la législation, le montage et la relation client.",
    description:
      "Offre de formation continue de l'ICO-CMO destinée aux professionnels de l'optique-lunetterie, avec des formats en présentiel, classe virtuelle et e-learning.",
    bestFor:
      "Les magasins d'optique qui veulent développer les compétences techniques, réglementaires ou commerciales de leur équipe.",
    tags: ["Opticien", "Optique-lunetterie", "DPC"],
    icon: "GraduationCap",
    usefulFor: ["Optique", "DPC", "Compétences magasin"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://ico.asso.fr/formation-continue-opticien/la-formation-continue-a-lico/",
    cta: "Voir les formations",
    format: "Présentiel, classe virtuelle et e-learning",
  },
  {
    slug: "catalogue-medecin-santeacademie",
    name: "Formations pour médecins",
    provider: "Santé Académie",
    family: "Métier",
    category: "Santé",
    shortDescription:
      "Un catalogue Santé Académie dédié aux médecins, avec des formations DPC pensées pour la pratique clinique quotidienne.",
    description:
      "Entrée de catalogue Santé Académie pour les médecins, avec des cas cliniques, formats e-learning et formations finançables selon les dispositifs mobilisables.",
    bestFor:
      "Les cabinets médicaux qui veulent orienter leur veille formation vers des contenus directement liés à la pratique du médecin.",
    tags: ["Médecin", "DPC", "Cabinet"],
    icon: "Stethoscope",
    usefulFor: ["Pratique clinique", "Formation continue", "Médecin"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.santeacademie.com/formation?metier=MED",
    cta: "Voir la formation",
    format: "Catalogue métier",
  },
  {
    slug: "medecin-liberal-santeacademie",
    name: "Formations pour médecin libéral",
    provider: "Santé Académie",
    family: "Métier",
    category: "Santé",
    shortDescription:
      "Une entrée métier orientée exercice libéral pour les médecins qui se forment autour de leur pratique en cabinet.",
    description:
      "Page Santé Académie dédiée aux médecins libéraux, avec une sélection de formations e-learning et DPC orientées pratique quotidienne.",
    bestFor:
      "Les médecins installés en cabinet qui cherchent des formations adaptées à l'exercice libéral.",
    tags: ["Médecin libéral", "Cabinet", "DPC"],
    icon: "Stethoscope",
    usefulFor: ["Cabinet", "Libéral", "Pratique quotidienne"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.santeacademie.com/formation/medecin-liberal",
    cta: "Voir la formation",
    format: "Catalogue métier",
  },
  {
    slug: "infirmier-liberal-santeacademie",
    name: "Formations pour infirmier libéral",
    provider: "Santé Académie",
    family: "Métier",
    category: "Santé",
    shortDescription:
      "Une entrée très utilisée sur le marché pour les IDEL qui veulent former leur pratique et valider leurs obligations.",
    description:
      "Page Santé Académie dédiée aux infirmiers libéraux, avec un catalogue de formations autour du DPC, de la prise en charge patient et du cadre d'exercice.",
    bestFor:
      "Les cabinets paramédicaux ou structures avec activité infirmière qui veulent des formations directement utiles à l'exercice libéral.",
    tags: ["Infirmier libéral", "IDEL", "DPC"],
    icon: "Stethoscope",
    usefulFor: ["IDEL", "Pratique", "Formation continue"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.santeacademie.com/formation/infirmier-liberal",
    cta: "Voir la formation",
    format: "Catalogue métier",
  },
  {
    slug: "catalogue-soignants-santeacademie",
    name: "Formations DPC pour soignants",
    provider: "Santé Académie",
    family: "Formation continue",
    category: "Santé",
    shortDescription:
      "Une porte d'entrée simple vers un catalogue santé structuré par métier, format et financement.",
    description:
      "Page principale Santé Académie présentant son offre DPC pour soignants, avec accès aux métiers, modalités et prises en charge.",
    bestFor:
      "Les cabinets de santé qui veulent un annuaire formation clair avant d'affiner par profession et mode d'exercice.",
    tags: ["Soignants", "DPC", "Catalogue"],
    icon: "Stethoscope",
    usefulFor: ["Catalogue", "Veille", "Financement"],
    sectors: ["Santé, bien-être & esthétique"],
    href: "https://www.santeacademie.com/",
    cta: "Voir la formation",
    format: "Catalogue général",
  },
  {
    slug: "relation-familles-services-personne",
    name: "Relation familles et qualité de service",
    provider: "IPERIA",
    family: "Management & équipe",
    category: "Services",
    shortDescription: "Une formation utile pour les activités de service récurrent et d'accompagnement.",
    description:
      "Formation autour de la communication, des attentes familles, de la posture de service et des situations délicates.",
    bestFor:
      "Les services à la personne, aide à domicile, ménage et activités d'accompagnement.",
    tags: ["Service", "Familles", "Communication"],
    icon: "Users",
    usefulFor: ["Service", "Communication", "Fidélisation"],
    sectors: ["Services aux particuliers"],
    href: "https://www.iperia.eu/",
    cta: "Voir la formation",
  },
  {
    slug: "prevention-risques-domicile-iperia",
    name: "Prévenir les risques professionnels et sécuriser son intervention",
    provider: "IPERIA",
    family: "Sécurité & terrain",
    category: "Services à domicile",
    shortDescription:
      "Une formation IPERIA très concrète pour sécuriser les gestes, les postures et les interventions au domicile.",
    description:
      "Fiche officielle IPERIA dédiée à la prévention des risques professionnels dans l'emploi à domicile, avec objectifs, contenus et accès aux renseignements.",
    bestFor:
      "Les structures d'aide à domicile, de ménage et d'accompagnement qui veulent renforcer la sécurité des interventions et prévenir l'usure professionnelle.",
    tags: ["Aide à domicile", "Prévention", "Sécurité"],
    icon: "Shield",
    usefulFor: ["Sécurité", "Terrain", "Équipe"],
    sectors: ["Services aux particuliers"],
    href: "https://iperia.eu/fr/formations/prevenir-risques-professionnels-securiser-intervention",
    cta: "Voir la formation",
    format: "Module IPERIA 21 heures",
  },
  {
    slug: "entretien-cadre-vie-iperia",
    name: "Entretien du cadre de vie et pratiques écoresponsables",
    provider: "IPERIA",
    family: "Sécurité & terrain",
    category: "Services à domicile",
    shortDescription:
      "Une formation métier IPERIA pour les activités de ménage et d'entretien au domicile.",
    description:
      "Fiche officielle IPERIA consacrée à l'entretien du domicile, aux techniques de nettoyage et aux pratiques écoresponsables dans le cadre de l'emploi à domicile.",
    bestFor:
      "Les structures de ménage, d'aide à domicile et de services aux particuliers qui veulent cadrer les gestes métier et les protocoles d'entretien.",
    tags: ["Ménage", "Entretien", "Domicile"],
    icon: "Sparkles",
    usefulFor: ["Ménage", "Qualité de service", "Terrain"],
    sectors: ["Services aux particuliers"],
    href: "https://iperia.eu/fr/formations/entretien-cadre-vie-pratiques-ecoresponsables",
    cta: "Voir la formation",
    format: "Module IPERIA 21 heures",
  },
  {
    slug: "accompagnement-hygiene-confort-iperia",
    name: "Accompagner une personne en situation de dépendance dans les actes d'hygiène et de confort",
    provider: "IPERIA",
    family: "Sécurité & terrain",
    category: "Services à domicile",
    shortDescription:
      "Une vraie formation métier IPERIA pour les équipes qui accompagnent des personnes dépendantes à domicile.",
    description:
      "Fiche officielle IPERIA sur l'accompagnement aux actes d'hygiène et de confort, avec posture professionnelle, gestes techniques et respect de la dignité de la personne.",
    bestFor:
      "Les structures d'aide à domicile et d'accompagnement qui interviennent auprès de personnes âgées, fragiles ou en situation de dépendance.",
    tags: ["Dépendance", "Aide à domicile", "Accompagnement"],
    icon: "HeartHandshake",
    usefulFor: ["Accompagnement", "Métier", "Qualité"],
    sectors: ["Services aux particuliers"],
    href: "https://iperia.eu/fr/formations/accompagner-personne-dependance-actes-hygiene-confort",
    cta: "Voir la formation",
    format: "Module IPERIA 21 heures",
  },
  {
    slug: "relations-professionnelles-domicile-iperia",
    name: "Créer et entretenir de bonnes relations professionnelles : communiquer et s'organiser",
    provider: "IPERIA",
    family: "Commerce & relation client",
    category: "Services à domicile",
    shortDescription:
      "Une formation IPERIA utile pour mieux communiquer avec les particuliers employeurs et structurer l'organisation au quotidien.",
    description:
      "Fiche officielle IPERIA dédiée à la communication, à la posture professionnelle et à l'organisation de l'activité dans les métiers du domicile.",
    bestFor:
      "Les structures de services à domicile qui veulent renforcer la qualité relationnelle, les transmissions et le professionnalisme des équipes.",
    tags: ["Communication", "Organisation", "Service à domicile"],
    icon: "Users",
    usefulFor: ["Communication", "Organisation", "Service"],
    sectors: ["Services aux particuliers"],
    href: "https://iperia.eu/fr/formations/creer-entretenir-bonnes-relations-professionnelles",
    cta: "Voir la formation",
    format: "Module IPERIA 14 heures",
  },
  {
    slug: "loi-alur-immobilier",
    name: "Obligation de formation des professionnels de l'immobilier",
    provider: "UNIS / UN+ Formations",
    family: "Réglementaire",
    category: "Immobilier",
    shortDescription: "Le socle réglementaire à connaître pour les activités immobilières soumises à l'obligation de formation continue.",
    description:
      "Page officielle UNIS dédiée à l'obligation de formation des professionnels de l'immobilier, avec rappel des modalités et accès au catalogue UN+.",
    bestFor:
      "Les agences immobilières, administrateurs de biens, syndics et professionnels concernés par le renouvellement de leur carte professionnelle.",
    tags: ["Loi ALUR", "Immobilier", "Réglementation"],
    icon: "Building2",
    usefulFor: ["Immobilier", "Conformité", "Crédibilité"],
    sectors: ["Immobilier"],
    href: "https://www.unis-immo.fr/formations-metiers-de-limmobilier/",
    cta: "Voir la formation",
  },
  {
    slug: "snpi-campus-immobilier",
    name: "Formations des professionnels de l'immobilier",
    provider: "SNPI Campus",
    family: "Réglementaire",
    category: "Immobilier",
    shortDescription: "Une entrée officielle SNPI pour accéder au catalogue de formations des professionnels de l'immobilier.",
    description:
      "Page officielle SNPI consacrée aux formations des professionnels de l'immobilier, avec accès au catalogue SNPI Campus et aux formats présentiel, distance et webinaire.",
    bestFor:
      "Les agences immobilières, administrateurs de biens et professionnels qui veulent un catalogue métier structuré et validant.",
    tags: ["Immobilier", "Formation continue", "SNPI"],
    icon: "Building2",
    usefulFor: ["Immobilier", "Formation continue", "Carte professionnelle"],
    sectors: ["Immobilier"],
    href: "https://www.snpi.fr/nos-formations-pour-les-professionnels",
    cta: "Voir la formation",
    format: "Catalogue SNPI Campus",
  },
  {
    slug: "universite-copropriete-unis",
    name: "Université de la copropriété",
    provider: "UNIS",
    family: "Réglementaire",
    category: "Copropriété",
    shortDescription: "Une offre UNIS centrée copropriété, utile surtout pour les activités de syndic et l'environnement conseil en copropriété.",
    description:
      "Programme UNIS autour de la copropriété, présenté comme un espace pour s'informer et se former dans un cadre législatif en évolution constante.",
    bestFor:
      "Les syndics, administrateurs de biens et professionnels qui travaillent régulièrement sur des sujets de copropriété.",
    tags: ["Copropriété", "Syndic", "Immobilier"],
    icon: "Building2",
    usefulFor: ["Copropriété", "Syndic", "Veille métier"],
    sectors: ["Immobilier"],
    href: "https://www.unis-immo.fr/luniversite-de-la-copropriete/",
    cta: "Voir la formation",
    format: "Programme UNIS",
  },
  {
    slug: "prospection-commerciale-b2b",
    name: "Prospection commerciale B2B",
    provider: "Cegos",
    family: "Commerce & relation client",
    category: "Développement commercial",
    shortDescription: "Pour mieux qualifier, relancer et transformer dans les activités de conseil et services.",
    description:
      "Formation orientée prospection, qualification, relance, rendez-vous et structuration d'un pipe commercial B2B.",
    bestFor:
      "Les agences, cabinets, indépendants et services B2B qui veulent rendre leur développement commercial plus régulier.",
    tags: ["Prospection", "B2B", "Commercial"],
    icon: "Target",
    usefulFor: ["Prospection", "Vente", "Régularité commerciale"],
    sectors: ["Conseil & services aux entreprises", "Tech & Digital"],
    href: "https://www.cegos.fr/formations/commercial-ventes",
    cta: "Voir la formation",
  },
  {
    slug: "conseil-patrimonial-conformite",
    name: "Conformité et devoir de conseil patrimonial",
    provider: "ANACOFI",
    family: "Qualité & conformité",
    category: "Patrimoine",
    shortDescription: "Une formation utile pour sécuriser la pratique et les échanges client en patrimoine.",
    description:
      "Formation autour du devoir de conseil, de la conformité, de la traçabilité des recommandations et de la relation client patrimoniale.",
    bestFor:
      "Les gestionnaires de patrimoine, courtiers et activités patrimoniales qui doivent sécuriser leurs recommandations et leur cadre documentaire.",
    tags: ["Patrimoine", "Conformité", "Conseil"],
    icon: "BadgeEuro",
    usefulFor: ["Patrimoine", "Conformité", "Relation client"],
    sectors: ["Patrimoine"],
    href: "https://www.anacofi.asso.fr/",
    cta: "Voir la formation",
  },
  {
    slug: "anacofi-presentiels-patrimoine",
    name: "Présentiels ANACOFI",
    provider: "ANACOFI",
    family: "Réglementaire",
    category: "Patrimoine",
    shortDescription:
      "Le portail ANACOFI pour accéder aux formations présentielles proposées à ses adhérents et professionnels du patrimoine.",
    description:
      "Page officielle Formations ANACOFI dédiée aux sessions présentielles, avec catalogue et inscriptions aux formations métier.",
    bestFor:
      "Les cabinets de gestion de patrimoine qui cherchent des sessions en présentiel autour de la conformité, de la veille réglementaire et des sujets métier.",
    tags: ["Patrimoine", "Formation présentielle", "ANACOFI"],
    icon: "BadgeEuro",
    usefulFor: ["Patrimoine", "Conformité", "Veille métier"],
    sectors: ["Patrimoine"],
    href: "https://www.formations-anacofi.fr/all_formation_page_anacofi.php",
    cta: "Voir la formation",
    format: "Catalogue ANACOFI",
  },
  {
    slug: "anacofi-elearning-patrimoine",
    name: "Formations E-learning ANACOFI",
    provider: "ANACOFI",
    family: "Réglementaire",
    category: "Patrimoine",
    shortDescription:
      "L'entrée e-learning ANACOFI pour suivre des formations à distance adaptées aux métiers du patrimoine.",
    description:
      "Accès officiel aux formations e-learning de l'ANACOFI, utile pour suivre les obligations de mise à jour et les sujets métier à distance.",
    bestFor:
      "Les cabinets de gestion de patrimoine qui veulent un format plus flexible pour former les équipes ou suivre leurs obligations.",
    tags: ["Patrimoine", "E-learning", "ANACOFI"],
    icon: "BadgeEuro",
    usefulFor: ["Patrimoine", "Formation continue", "Souplesse"],
    sectors: ["Patrimoine"],
    href: "https://anacofi-elearning.mesformations.fr/",
    cta: "Voir la formation",
    format: "E-learning",
  },
  {
    slug: "cncgp-formation-patrimoine",
    name: "Formation CNCGP",
    provider: "CNCGP",
    family: "Réglementaire",
    category: "Patrimoine",
    shortDescription:
      "L'espace formation de la CNCGP avec guides, carnet de formation et accès aux démarches formation.",
    description:
      "Page officielle CNCGP consacrée à la formation, avec FAQ, guides, carnet de formation et accès au calendrier des formations.",
    bestFor:
      "Les conseillers en gestion de patrimoine et cabinets adhérents qui veulent structurer leur suivi formation et accéder à l'environnement CNCGP.",
    tags: ["Patrimoine", "CNCGP", "Formation continue"],
    icon: "BadgeEuro",
    usefulFor: ["Patrimoine", "Suivi formation", "Cadre pro"],
    sectors: ["Patrimoine"],
    href: "https://www.cncgp.fr/espace-adherent/formation",
    cta: "Voir la formation",
    format: "Espace formation CNCGP",
  },
  {
    slug: "cncgp-calendrier-formation",
    name: "Calendrier formation CNCGP",
    provider: "CNCGP",
    family: "Réglementaire",
    category: "Patrimoine",
    shortDescription:
      "Le calendrier officiel CNCGP pour consulter les sessions et s'orienter vers les inscriptions formation.",
    description:
      "Page officielle CNCGP dédiée au calendrier formation, avec accès aux informations pratiques et à l'organisation des sessions.",
    bestFor:
      "Les cabinets de gestion de patrimoine qui veulent identifier rapidement les prochaines sessions disponibles.",
    tags: ["Patrimoine", "Calendrier", "CNCGP"],
    icon: "BadgeEuro",
    usefulFor: ["Patrimoine", "Sessions", "Planification"],
    sectors: ["Patrimoine"],
    href: "https://www.cncgp.fr/espace-adherent/formation/calendrier-formation",
    cta: "Voir la formation",
    format: "Calendrier de sessions",
  },
  {
    slug: "caces-logistique-manutention",
    name: "CACES logistique et manutention",
    provider: "Apave",
    family: "Sécurité & terrain",
    category: "Logistique",
    shortDescription: "Une formation utile pour sécuriser la manutention et les opérations logistiques.",
    description:
      "Parcours de formation autour des engins de manutention, des règles de sécurité et des réflexes opérationnels en entrepôt ou exploitation.",
    bestFor:
      "Les activités de logistique, transport, production, ateliers et structures avec manutention ou stockage.",
    tags: ["CACES", "Logistique", "Sécurité"],
    icon: "Boxes",
    usefulFor: ["Logistique", "Sécurité", "Terrain"],
    sectors: ["Mobilité & logistique", "Industrie & production"],
    href: "https://france.apave.com/Vos-besoins/Former-vos-equipes/CACES-LEVAGE-MANUTENTION",
    cta: "Voir la formation",
  },
  {
    slug: "habilitation-vehicules-electriques",
    name: "Habilitation véhicules électriques et hybrides",
    provider: "Bureau Veritas",
    family: "Sécurité & terrain",
    category: "Automobile",
    shortDescription: "Une base métier très concrète pour les ateliers qui interviennent sur véhicules électrifiés.",
    description:
      "Formation sur la sécurité, les procédures d'intervention et les précautions spécifiques aux véhicules électriques et hybrides.",
    bestFor:
      "Les garages, carrossiers et activités de réparation qui doivent suivre l'évolution du parc automobile.",
    tags: ["Automobile", "Véhicule électrique", "Sécurité"],
    icon: "Car",
    usefulFor: ["Garage", "Sécurité", "Compétence métier"],
    sectors: ["Automobile & réparation"],
    href: "https://formation.bureauveritas.fr/formation/electricite/habilitation-electrique-vehicules-ou-engins-electrique",
    cta: "Voir la formation",
  },
  {
    slug: "maintenance-automobile-mobipolis",
    name: "Maintenance automobile",
    provider: "Mobipolis",
    family: "Sécurité & terrain",
    category: "Automobile",
    shortDescription:
      "L'entrée officielle Mobipolis pour les équipes d'atelier qui doivent monter en compétence sur la maintenance automobile.",
    description:
      "Page domaine Mobipolis dédiée à la maintenance automobile, avec formations sur les motorisations thermiques, l'hybridation, l'électrification, le diagnostic et les ADAS.",
    bestFor:
      "Les garages et ateliers qui veulent former mécaniciens, techniciens et techniciens experts sur les évolutions techniques du parc.",
    tags: ["Garage", "Maintenance", "Automobile"],
    icon: "Car",
    usefulFor: ["Atelier", "Diagnostic", "Montée en compétence"],
    sectors: ["Automobile & réparation"],
    href: "https://www.mobipolis.fr/domaine/maintenance",
    cta: "Voir la formation",
    format: "Planning de sessions Mobipolis",
  },
  {
    slug: "risques-vehicules-electriques-mobipolis",
    name: "Prévention des risques sur véhicules électriques et hybrides",
    provider: "Mobipolis",
    family: "Sécurité & terrain",
    category: "Automobile",
    shortDescription:
      "Une formation Mobipolis très concrète pour intervenir en sécurité sur les véhicules électriques et hybrides.",
    description:
      "Fiche officielle Mobipolis sur le maintien de qualification et la prévention des risques sur véhicules électriques et hybrides, avec objectifs, programme et sessions.",
    bestFor:
      "Les garages, ateliers et dépanneurs qui doivent maintenir les compétences des équipes face aux véhicules électrifiés.",
    tags: ["VE/VH", "Sécurité", "Atelier"],
    icon: "Car",
    usefulFor: ["Sécurité", "Conformité", "Maintenance"],
    sectors: ["Automobile & réparation"],
    href: "https://www.mobipolis.fr/formation-continue/53245-maintien-de-qualification-prevention-des-risques-sur-vehicules-electriques-et-hybrides-b0l-bcl-b2l-b2vl-b2xl-depanneur-remorqueur",
    cta: "Voir la formation",
    format: "Présentiel 1 jour",
  },
  {
    slug: "service-apres-vente-mobipolis",
    name: "Service après-vente automobile",
    provider: "Mobipolis",
    family: "Commerce & relation client",
    category: "Automobile",
    shortDescription:
      "Une entrée officielle Mobipolis pour mieux former l'accueil atelier, l'expérience client et la vente après-vente.",
    description:
      "Page domaine Mobipolis consacrée au service après-vente automobile, avec formations sur la relation commerciale, le pilotage d'activité et la législation métier.",
    bestFor:
      "Les garages et ateliers qui veulent faire progresser l'accueil client, le conseil après-vente et la fidélisation.",
    tags: ["Après-vente", "Relation client", "Garage"],
    icon: "Users",
    usefulFor: ["Accueil", "Fidélisation", "Front office"],
    sectors: ["Automobile & réparation"],
    href: "https://www.mobipolis.fr/domaine/service-apres-vente",
    cta: "Voir la formation",
    format: "Planning de sessions Mobipolis",
  },
  {
    slug: "carrosserie-mobipolis",
    name: "Carrosserie",
    provider: "Mobipolis",
    family: "Sécurité & terrain",
    category: "Automobile",
    shortDescription:
      "L'entrée officielle Mobipolis pour les ateliers carrosserie qui veulent progresser sur les méthodes de réparation et les nouveaux matériaux.",
    description:
      "Page domaine Mobipolis dédiée à la carrosserie, avec formations sur tôlerie, peinture, vitrage, matériaux composites, relation expertise et pilotage d'atelier.",
    bestFor:
      "Les carrosseries et ateliers collision qui veulent former les équipes sur des pratiques de réparation plus actuelles et conformes.",
    tags: ["Carrosserie", "Réparation", "Atelier"],
    icon: "CarFront",
    usefulFor: ["Carrosserie", "Réparation", "Atelier"],
    sectors: ["Automobile & réparation"],
    href: "https://www.mobipolis.fr/domaine/carrosserie",
    cta: "Voir la formation",
    format: "Planning de sessions Mobipolis",
  },
  {
    slug: "subventions-appels-projets-association",
    name: "Subventions et appels à projets pour associations",
    provider: "Le Mouvement associatif",
    family: "Qualité & conformité",
    category: "Association",
    shortDescription: "Pour mieux structurer les dossiers de financement et les réponses à projets.",
    description:
      "Formation utile pour cadrer les demandes de subventions, les pièces, le récit du projet et le suivi des financeurs.",
    bestFor:
      "Les associations et structures événementielles qui dépendent de financements, partenariats ou appels à projets.",
    tags: ["Association", "Subvention", "Appels à projets"],
    icon: "Gift",
    usefulFor: ["Association", "Financement", "Structuration"],
    sectors: ["Associations & événements"],
    href: "https://lemouvementassociatif.org/",
    cta: "Voir la formation",
  },
  {
    slug: "portail-formation-benevoles",
    name: "Portail national de formation des bénévoles",
    provider: "Le Mouvement associatif",
    family: "Management & équipe",
    category: "Association",
    shortDescription:
      "La meilleure porte d'entrée nationale pour trouver des formations associatives avec offres régionales et agenda.",
    description:
      "Portail national de formation des bénévoles porté par Le Mouvement associatif, avec accès par région à des catalogues, structures formatrices et prochaines sessions.",
    bestFor:
      "Les associations qui veulent orienter leurs bénévoles et dirigeants vers de vraies formations proches de chez eux, avec dates et thèmes disponibles.",
    tags: ["Bénévoles", "Association", "Agenda"],
    icon: "Users",
    usefulFor: ["Bénévoles", "Formation", "Organisation"],
    sectors: ["Associations & événements"],
    href: "https://formations-benevoles.org/",
    cta: "Voir la formation",
    format: "Portail national avec offres régionales",
  },
  {
    slug: "formation-benevoles-associations-gouv",
    name: "Formation des bénévoles",
    provider: "Associations.gouv.fr",
    family: "Qualité & conformité",
    category: "Association",
    shortDescription:
      "L'entrée officielle de l'État pour comprendre l'accès à la formation des bénévoles et les dispositifs associés.",
    description:
      "Page officielle Associations.gouv.fr consacrée à la formation des bénévoles, avec explications sur le portail national et le soutien public via le FDVA.",
    bestFor:
      "Les associations qui veulent cadrer proprement leur politique de montée en compétence bénévole et comprendre les appuis disponibles.",
    tags: ["Bénévolat", "FDVA", "Vie associative"],
    icon: "GraduationCap",
    usefulFor: ["Cadre officiel", "Bénévoles", "Financement"],
    sectors: ["Associations & événements"],
    href: "https://www.associations.gouv.fr/formation-des-benevoles",
    cta: "Voir la formation",
    format: "Information officielle et orientation",
  },
  {
    slug: "webinaires-mouvement-associatif",
    name: "Webinaires du Mouvement associatif",
    provider: "Le Mouvement associatif",
    family: "Management & équipe",
    category: "Association",
    shortDescription:
      "Une bibliothèque de webinaires associatifs sur la fonction employeur, le financement et la vie de l'association.",
    description:
      "Page du Mouvement associatif regroupant ses webinaires et replays pour accompagner les associations sur l'emploi, les ressources utiles et les enjeux de structuration.",
    bestFor:
      "Les dirigeants et bénévoles associatifs qui veulent se former sur des sujets transverses sans alourdir l'organisation.",
    tags: ["Webinaire", "Association", "Gouvernance"],
    icon: "Video",
    usefulFor: ["Webinaire", "Montée en compétence", "Vie associative"],
    sectors: ["Associations & événements"],
    href: "https://lemouvementassociatif.org/nos-webinaires/",
    cta: "Voir la formation",
    format: "Webinaires et replays",
  },
  {
    slug: "secourisme-sst",
    name: "SST - Sauveteur secouriste du travail",
    provider: "INRS",
    family: "Sécurité & terrain",
    category: "Prévention",
    shortDescription: "Un grand classique pour renforcer les réflexes sécurité dans de nombreuses activités.",
    description:
      "Formation de prévention et de premiers secours utile pour les équipes terrain, ateliers, chantiers et environnements à risque.",
    bestFor:
      "Les équipes BTP, industrie, logistique, commerce ou services qui veulent renforcer leur cadre sécurité.",
    tags: ["SST", "Premiers secours", "Sécurité"],
    icon: "HeartPulse",
    usefulFor: ["Prévention", "Équipe", "Sécurité"],
    sectors: [
      "BTP & services techniques",
      "Industrie & production",
      "Mobilité & logistique",
      "Commerce & retail",
      "Services aux particuliers",
    ],
    href: "https://www.inrs.fr/services/formation/demarche/sst.html",
    cta: "Voir la formation",
  },
] satisfies readonly DemaaTraining[];

export type DemaaTrainingSlug = (typeof demaaTrainings)[number]["slug"];

const HIDDEN_TRAINING_SLUGS = new Set<DemaaTrainingSlug>([
  "formation-organisation-systeme-process",
]);

const trainingBySlug = Object.fromEntries(
  demaaTrainings.map((training) => [training.slug, training]),
) as Partial<Record<DemaaTrainingSlug, DemaaTraining>>;

export function getDemaaTrainings(): DemaaTraining[] {
  return demaaTrainings.filter(
    (training) => !HIDDEN_TRAINING_SLUGS.has(training.slug as DemaaTrainingSlug),
  );
}

export function getDemaaTrainingBySlug(slug: string): DemaaTraining | null {
  if (HIDDEN_TRAINING_SLUGS.has(slug as DemaaTrainingSlug)) {
    return null;
  }

  return trainingBySlug[slug as DemaaTrainingSlug] ?? null;
}

const METIER_TRAINING_FAMILIES = new Set<TrainingFamily>([
  "Métier",
  "Réglementaire",
  "Sécurité & terrain",
  "Formation continue",
]);

const METIER_TRAINING_CATEGORIES = new Set([
  "BTP",
  "Restauration",
  "Formation",
  "Certification",
  "Apprentissage",
  "Cabinet comptable",
  "Social & paie",
  "Esthétique",
  "Coiffure",
  "Fitness",
  "Santé",
  "Services à domicile",
  "Immobilier",
  "Copropriété",
  "Patrimoine",
  "Logistique",
  "Automobile",
  "Association",
  "Prévention",
]);

const METIER_TRAINING_SLUGS = new Set<DemaaTrainingSlug>([
  "formation-organisation-systeme-process",
  "catalogue-hotels-palaces-umih",
  "merchandising-vente-magasin",
  "operateurs-voyage-umih",
  "service-client-hotellerie-tourisme",
]);

export function getTrainingRecommendationGroup(
  training: DemaaTraining,
): TrainingRecommendationGroup {
  if (METIER_TRAINING_SLUGS.has(training.slug as DemaaTrainingSlug)) {
    return "metier";
  }

  if (METIER_TRAINING_FAMILIES.has(training.family)) {
    return "metier";
  }

  if (METIER_TRAINING_CATEGORIES.has(training.category)) {
    return "metier";
  }

  return "transverse";
}
