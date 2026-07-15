export type AidFamily =
  | "Création & reprise"
  | "Recrutement & alternance"
  | "Transition écologique"
  | "Innovation & R&D";

export type AidType =
  | "Exonération"
  | "Versement en capital"
  | "Aide à l'embauche"
  | "Crédit d'impôt"
  | "Convention"
  | "Orientation";

export type AidFamilyDefinition = {
  slug: string;
  name: AidFamily;
  shortDescription: string;
  description: string;
  icon: string;
  relatedSystems: string[];
};

export type DemaaAidItem = {
  slug: string;
  name: string;
  family: AidFamily;
  type: AidType;
  shortDescription: string;
  description: string;
  bestFor: string;
  tags: string[];
  icon: string;
  usefulFor: string[];
  cta: string;
  sourceLabel: string;
  sourceUrl: string;
  relatedSystems: string[];
};

export const aidFamilies: readonly AidFamilyDefinition[] = [
  {
    slug: "creation-reprise",
    name: "Création & reprise",
    shortDescription: "Les aides utiles pour démarrer, reprendre ou sécuriser les premiers mois.",
    description:
      "Une porte d'entrée simple pour les aides les plus regardées au moment de créer, reprendre ou relancer une activité.",
    icon: "Target",
    relatedSystems: [
      "cabinet-davocat",
      "cabinet-comptable",
      "restaurant",
      "batiment",
      "institut-de-beaute",
      "commerce-de-detail",
    ],
  },
  {
    slug: "recrutement-alternance",
    name: "Recrutement & alternance",
    shortDescription: "Les aides à regarder quand on veut recruter, former ou intégrer un alternant.",
    description:
      "Une sélection de dispositifs qui peuvent alléger le coût d'un recrutement ou faciliter une logique d'alternance.",
    icon: "UserRoundCheck",
    relatedSystems: [
      "batiment",
      "restaurant",
      "cabinet-comptable",
      "institut-de-beaute",
      "services-a-la-personne",
      "commerce-de-detail",
    ],
  },
  {
    slug: "transition-ecologique",
    name: "Transition écologique",
    shortDescription: "Les aides et portes d'entrée pour réduire énergie, déchets ou impact opérationnel.",
    description:
      "Une porte d'entrée vers les dispositifs publics utiles pour l'énergie, les équipements, les déchets, la mobilité et l'amélioration des locaux.",
    icon: "Zap",
    relatedSystems: [
      "batiment",
      "restaurant",
      "boulangerie",
      "traiteur",
      "institut-de-beaute",
      "commerce-de-detail",
    ],
  },
  {
    slug: "innovation-r-d",
    name: "Innovation & R&D",
    shortDescription: "Les dispositifs à explorer quand une entreprise investit vraiment dans l'innovation.",
    description:
      "Un socle simple pour comprendre les aides fiscales et conventions les plus connues quand une structure investit en R&D ou en innovation.",
    icon: "Search",
    relatedSystems: [
      "saas",
      "cabinet-de-conseil",
      "cabinet-comptable",
      "agence-web",
      "consultant-data-bi",
      "cybersecurite-pme",
    ],
  },
] as const;

export const demaaAidItems: readonly DemaaAidItem[] = [
  {
    slug: "acre",
    name: "ACRE",
    family: "Création & reprise",
    type: "Exonération",
    shortDescription: "Une exonération partielle de cotisations sociales au démarrage de l'activité.",
    description:
      "L'ACRE aide à réduire une partie des charges sociales au lancement pour soulager les premiers mois d'activité et sécuriser le démarrage.",
    bestFor:
      "Les créateurs ou repreneurs qui veulent alléger le coût du démarrage et garder un peu plus de souffle au début.",
    tags: ["Création", "Reprise", "Charges sociales"],
    icon: "BadgeEuro",
    usefulFor: ["Démarrage", "Charges", "Création"],
    cta: "Voir la source officielle",
    sourceLabel: "Bpifrance Création",
    sourceUrl:
      "https://bpifrance-creation.fr/encyclopedie/aides-a-creation-a-reprise-dentreprise/aides-sociales-financieres/acre-aide-aux",
    relatedSystems: [
      "cabinet-davocat",
      "cabinet-comptable",
      "batiment",
      "restaurant",
      "institut-de-beaute",
      "commerce-de-detail",
    ],
  },
  {
    slug: "arce",
    name: "ARCE",
    family: "Création & reprise",
    type: "Versement en capital",
    shortDescription: "Un versement en capital d'une partie des droits restants pour lancer le projet.",
    description:
      "L'ARCE permet de transformer une partie des droits restants en capital pour financer plus directement le lancement de l'activité.",
    bestFor:
      "Les porteurs de projet qui ont besoin d'un apport de départ plus lisible pour lancer ou reprendre une entreprise.",
    tags: ["Création", "Capital", "France Travail"],
    icon: "CreditCard",
    usefulFor: ["Lancement", "Trésorerie", "Apport"],
    cta: "Voir la source officielle",
    sourceLabel: "France Travail",
    sourceUrl:
      "https://www.francetravail.fr/candidat/je-creereprends-une-entreprise/les-aides-financieres-creation-d/aide-a-la-reprise-et-a-la-creati.html",
    relatedSystems: [
      "cabinet-davocat",
      "cabinet-comptable",
      "batiment",
      "restaurant",
      "institut-de-beaute",
      "commerce-de-detail",
    ],
  },
  {
    slug: "mon-pass-crea",
    name: "Mon Pass Créa",
    family: "Création & reprise",
    type: "Orientation",
    shortDescription: "Une boîte à outils et un réseau d'accompagnement pour structurer son projet de création ou reprise.",
    description:
      "Mon Pass Créa aide à faire avancer un projet étape par étape avec un parcours guidé, des outils pratiques, un business plan en ligne et l'accès à un réseau d'accompagnement proche du terrain.",
    bestFor:
      "Les porteurs de projet qui veulent être accompagnés sans partir seuls, structurer leur dossier plus proprement et trouver les bons relais avant le lancement.",
    tags: ["Accompagnement", "Création", "Business plan"],
    icon: "Map",
    usefulFor: ["Accompagnement", "Business plan", "Lancement"],
    cta: "Voir la plateforme officielle",
    sourceLabel: "Mon Pass Créa",
    sourceUrl: "https://www.monpasscrea.fr/",
    relatedSystems: [
      "cabinet-davocat",
      "cabinet-comptable",
      "batiment",
      "restaurant",
      "institut-de-beaute",
      "commerce-de-detail",
      "agence-immobiliere",
      "consultant-independant",
      "freelance",
    ],
  },
  {
    slug: "aides-apprentissage",
    name: "Aides à l’apprentissage",
    family: "Recrutement & alternance",
    type: "Aide à l'embauche",
    shortDescription: "Les aides utiles quand on recrute un apprenti ou qu'on structure une logique alternance.",
    description:
      "Une porte d'entrée simple pour comprendre les aides liées à l'apprentissage et regarder si le recrutement d'un alternant est pertinent.",
    bestFor:
      "Les TPE qui veulent recruter progressivement, transmettre un savoir-faire ou renforcer l'équipe sans déséquilibrer la structure.",
    tags: ["Apprentissage", "Alternance", "Recrutement"],
    icon: "UserRoundCheck",
    usefulFor: ["Recruter", "Former", "Transmission"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public",
    sourceUrl:
      "https://entreprendre.service-public.fr/vosdroits/F23556",
    relatedSystems: [
      "batiment",
      "restaurant",
      "boulangerie",
      "traiteur",
      "institut-de-beaute",
      "commerce-de-detail",
      "cabinet-comptable",
    ],
  },
  {
    slug: "aide-accueil-integration-handicap",
    name: "Aide à l'accueil et à l'intégration d'un salarié en situation de handicap",
    family: "Recrutement & alternance",
    type: "Aide à l'embauche",
    shortDescription: "Une aide pour financer l'accueil, l'intégration ou l'évolution professionnelle d'un salarié handicapé.",
    description:
      "Cette aide permet de financer une partie des dépenses liées à l'accueil, l'intégration ou l'accompagnement d'un salarié en situation de handicap lors d'une embauche ou d'une mobilité sur un nouveau poste.",
    bestFor:
      "Les TPE et PME qui veulent recruter plus sereinement, mieux intégrer un collaborateur en situation de handicap ou structurer un encadrement adapté dès l'arrivée.",
    tags: ["Handicap", "Intégration", "Embauche"],
    icon: "HeartPulse",
    usefulFor: ["Recruter", "Intégration", "Accompagnement"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public Entreprendre",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F15204",
    relatedSystems: [
      "batiment",
      "restaurant",
      "cabinet-comptable",
      "cabinet-davocat",
      "institut-de-beaute",
      "commerce-de-detail",
      "hotel-hebergement-independant",
      "services-a-la-personne",
      "aide-a-domicile-menage",
    ],
  },
  {
    slug: "aeth-travailleur-handicape",
    name: "Aide à l'emploi des travailleurs handicapés",
    family: "Recrutement & alternance",
    type: "Aide à l'embauche",
    shortDescription: "Une aide pour compenser les surcoûts importants liés à l'adaptation d'un poste pour un salarié handicapé.",
    description:
      "L'AETH aide à compenser des surcoûts significatifs liés à l'adaptation d'un poste de travail pour une personne en situation de handicap, après aménagement optimal du poste.",
    bestFor:
      "Les entreprises qui veulent rendre un recrutement possible ou durable quand l'adaptation du poste crée un surcoût réel qu'il faut absorber proprement.",
    tags: ["Handicap", "Poste de travail", "Compensation"],
    icon: "Shield",
    usefulFor: ["Recruter", "Adapter un poste", "Maintien"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public Entreprendre",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F15204",
    relatedSystems: [
      "batiment",
      "restaurant",
      "cabinet-comptable",
      "cabinet-davocat",
      "institut-de-beaute",
      "commerce-de-detail",
      "hotel-hebergement-independant",
      "production-industrie",
      "services-a-la-personne",
    ],
  },
  {
    slug: "adaptation-situation-travail-handicap",
    name: "Aide à l'adaptation des situations de travail",
    family: "Recrutement & alternance",
    type: "Aide à l'embauche",
    shortDescription: "Une aide pour financer les moyens techniques, humains ou organisationnels d'adaptation d'un poste à un handicap.",
    description:
      "Cette aide permet de financer les adaptations concrètes d'un poste de travail lorsqu'un handicap, son aggravation ou l'évolution du contexte de travail nécessite des moyens spécifiques pour rendre l'activité possible dans de bonnes conditions.",
    bestFor:
      "Les entreprises qui veulent recruter ou stabiliser un collaborateur en situation de handicap avec un poste réellement adapté, sans absorber seules tous les coûts d'ajustement.",
    tags: ["Handicap", "Adaptation du poste", "Organisation"],
    icon: "Wrench",
    usefulFor: ["Adapter un poste", "Recruter", "Maintien"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public Entreprendre",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F15204",
    relatedSystems: [
      "batiment",
      "production-industrie",
      "restaurant",
      "hotel-hebergement-independant",
      "services-a-la-personne",
      "aide-a-domicile-menage",
      "commerce-de-detail",
      "transport-de-marchandise",
      "transport-de-personnes",
    ],
  },
  {
    slug: "apprentissage-handicap",
    name: "Aide à l'apprentissage d'une personne en situation de handicap",
    family: "Recrutement & alternance",
    type: "Aide à l'embauche",
    shortDescription: "Une aide spécifique pour recruter un apprenti en situation de handicap, quel que soit l'effectif de l'entreprise.",
    description:
      "Cette aide spécifique simplifie le recours à l'apprentissage pour une personne en situation de handicap, avec un versement automatique après dépôt du contrat et déclaration de présence.",
    bestFor:
      "Les TPE et PME qui veulent former un futur collaborateur, transmettre un savoir-faire et ouvrir plus facilement l'alternance à un profil en situation de handicap.",
    tags: ["Apprentissage", "Handicap", "Alternance"],
    icon: "UserRoundCheck",
    usefulFor: ["Alternance", "Transmission", "Recruter"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public Entreprendre",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F15204",
    relatedSystems: [
      "batiment",
      "restaurant",
      "boulangerie",
      "traiteur",
      "institut-de-beaute",
      "commerce-de-detail",
      "cabinet-comptable",
      "production-industrie",
    ],
  },
  {
    slug: "transition-ecologique-entreprises",
    name: "Transition écologique des entreprises",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Une porte d'entrée publique pour repérer les aides selon énergie, déchets, mobilité ou locaux.",
    description:
      "Cette plateforme permet de repérer rapidement les aides publiques utiles pour engager une transition écologique plus concrète selon le type d'activité.",
    bestFor:
      "Les entreprises qui veulent réduire leurs coûts énergétiques, améliorer leurs équipements ou avancer sur les déchets, la mobilité et les locaux.",
    tags: ["Énergie", "Déchets", "Mobilité"],
    icon: "Zap",
    usefulFor: ["Énergie", "Équipements", "Locaux"],
    cta: "Voir la plateforme officielle",
    sourceLabel: "Mission Transition écologique",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/",
    relatedSystems: [
      "batiment",
      "restaurant",
      "boulangerie",
      "traiteur",
      "institut-de-beaute",
      "commerce-de-detail",
    ],
  },
  {
    slug: "sensibilisation-equipes",
    name: "Sensibilisation des équipes",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un point de départ simple pour embarquer l'équipe sur les éco-gestes, l'énergie, les déchets et la mobilité.",
    description:
      "Cette fiche aide à structurer une campagne de sensibilisation des équipes pour faire évoluer les pratiques sur les déchets, l'énergie, la mobilité et les usages du quotidien.",
    bestFor:
      "Les TPE et PME qui veulent lancer une démarche écologique simple, compréhensible par l'équipe et plus facile à faire vivre dans la durée.",
    tags: ["Équipe", "Éco-gestes", "Mobilisation"],
    icon: "UserRoundCheck",
    usefulFor: ["Équipe", "Éco-gestes", "Lancement"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/sensibilisation-equipes",
    relatedSystems: [
      "cabinet-davocat",
      "cabinet-comptable",
      "cabinet-de-conseil",
      "batiment",
      "restaurant",
      "commerce-de-detail",
      "institut-de-beaute",
      "hotel-hebergement-independant",
      "production-industrie",
    ],
  },
  {
    slug: "diagnostic-360-transition-ecologique",
    name: "Diagnostic 360°",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un diagnostic global pour repérer les priorités écologiques et bâtir un vrai plan d'action.",
    description:
      "Le Diagnostic 360° aide à faire un état des lieux large sur l'énergie, l'eau, les déchets, la mobilité, les achats ou encore les locaux pour identifier les priorités les plus utiles à l'entreprise.",
    bestFor:
      "Les TPE et PME qui veulent démarrer simplement une transition écologique, prioriser les bons sujets et passer d'une intention floue à un plan plus concret.",
    tags: ["Diagnostic", "Transition écologique", "Plan d'action"],
    icon: "ScanSearch",
    usefulFor: ["Diagnostic", "Priorisation", "Plan d'action"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/diag-360",
    relatedSystems: [
      "batiment",
      "restaurant",
      "boulangerie",
      "traiteur",
      "institut-de-beaute",
      "commerce-de-detail",
      "agence-immobiliere",
      "hotel-hebergement-independant",
      "production-industrie",
    ],
  },
  {
    slug: "plan-action-mobilite",
    name: "Plan d’action mobilité",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un cadre simple pour réduire les déplacements les plus coûteux et encourager des mobilités plus sobres.",
    description:
      "Le plan d’action mobilité aide à analyser les déplacements liés à l'activité, puis à construire des actions concrètes sur les trajets équipe, clients, fournisseurs ou livraisons.",
    bestFor:
      "Les entreprises qui ont des déplacements fréquents, une petite flotte, des équipes terrain ou des trajets domicile-travail à mieux organiser.",
    tags: ["Mobilité", "Déplacements", "Organisation"],
    icon: "Car",
    usefulFor: ["Mobilité", "Déplacements", "Plan d'action"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/plan-mobilite",
    relatedSystems: [
      "demenagement",
      "transport-de-marchandise",
      "transport-de-personnes",
      "livraison-dernier-kilometre",
      "batiment",
      "agence-immobiliere",
      "services-a-la-personne",
      "aide-a-domicile-menage",
      "hotel-hebergement-independant",
    ],
  },
  {
    slug: "plan-action-economies-energie",
    name: "Plan d’action économies d’énergie",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un point de départ concret pour repérer les postes énergivores et bâtir un plan d'économies.",
    description:
      "Le plan d’action économies d’énergie aide à identifier les consommations les plus lourdes, les actions simples à lancer et les priorités pour maîtriser durablement la facture énergétique de l’entreprise.",
    bestFor:
      "Les entreprises qui veulent réduire rapidement leurs dépenses d'énergie, structurer une démarche simple et préparer ensuite des investissements plus ciblés.",
    tags: ["Énergie", "Sobriété", "Consommation"],
    icon: "Lightbulb",
    usefulFor: ["Énergie", "Plan d'action", "Économies"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/plan-action-eco-energie",
    relatedSystems: [
      "batiment",
      "restaurant",
      "boulangerie",
      "traiteur",
      "commerce-de-detail",
      "agence-immobiliere",
      "hotel-hebergement-independant",
      "production-industrie",
      "demenagement",
    ],
  },
  {
    slug: "plan-action-dechets",
    name: "Plan d’action déchets & pertes matière",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un cadre concret pour réduire les déchets, mieux trier et limiter les pertes de matière.",
    description:
      "Cette fiche aide à faire le point sur les déchets produits par l'entreprise, à fixer des objectifs réalistes et à bâtir un plan d'action autour du tri, du réemploi et de la réduction à la source.",
    bestFor:
      "Les entreprises qui manipulent des consommables, des emballages, de la vente à emporter, des biodéchets ou des matières premières à mieux valoriser.",
    tags: ["Déchets", "Tri", "Réemploi"],
    icon: "Package",
    usefulFor: ["Déchets", "Tri", "Plan d'action"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/plan-action-dechets",
    relatedSystems: [
      "batiment",
      "restaurant",
      "boulangerie",
      "traiteur",
      "commerce-de-detail",
      "commerce-alimentaire",
      "food-truck",
      "e-commerce",
      "production-industrie",
    ],
  },
  {
    slug: "bilan-ges",
    name: "Bilan de gaz à effet de serre",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un cadre concret pour mesurer ses émissions et construire un plan de transition plus crédible.",
    description:
      "Le bilan GES permet de mesurer les émissions directes et indirectes de l'entreprise, de mieux comprendre ses principaux postes d'impact et de préparer des actions climat plus sérieuses.",
    bestFor:
      "Les PME qui veulent structurer une démarche RSE ou climat, anticiper les contraintes réglementaires et avancer avec une base plus solide sur leurs émissions.",
    tags: ["Carbone", "Climat", "RSE"],
    icon: "Search",
    usefulFor: ["Carbone", "RSE", "Transition"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/bilan-ges",
    relatedSystems: [
      "production-industrie",
      "agence-immobiliere",
      "hotel-hebergement-independant",
      "batiment",
      "restaurant",
      "commerce-de-detail",
      "demenagement",
      "transport-de-marchandise",
      "saas",
    ],
  },
  {
    slug: "audit-energetique",
    name: "Audit énergétique",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Une expertise plus précise pour repérer les travaux et financements utiles sur les locaux professionnels.",
    description:
      "L'audit énergétique permet de faire expertiser les locaux professionnels pour identifier les postes les plus coûteux, les scénarios de rénovation utiles et les leviers de financement associés.",
    bestFor:
      "Les entreprises qui exploitent des locaux énergivores, veulent mieux prioriser des travaux ou doivent avancer sur leurs obligations liées aux bâtiments tertiaires.",
    tags: ["Audit", "Énergie", "Locaux"],
    icon: "Search",
    usefulFor: ["Audit", "Locaux", "Économies"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/audit-energetique",
    relatedSystems: [
      "batiment",
      "agence-immobiliere",
      "investissement-immobilier",
      "hotel-hebergement-independant",
      "restaurant",
      "boulangerie",
      "commerce-de-detail",
      "production-industrie",
      "bureau-etudes",
    ],
  },
  {
    slug: "acquisition-voiture-propre",
    name: "Acquisition d'une voiture propre",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un point d'entrée utile pour verdir une flotte ou réduire le coût d'usage des déplacements professionnels.",
    description:
      "Cette fiche aide à repérer les leviers publics et les ressources utiles quand une entreprise veut remplacer un véhicule thermique par une solution plus propre et plus économe à l'usage.",
    bestFor:
      "Les entreprises qui ont des déplacements réguliers, une flotte légère ou des besoins terrain et qui veulent avancer sur la mobilité propre sans partir de zéro.",
    tags: ["Mobilité", "Véhicule", "Flotte"],
    icon: "Car",
    usefulFor: ["Mobilité", "Flotte", "Décarbonation"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/voiture-propre",
    relatedSystems: [
      "demenagement",
      "transport-de-marchandise",
      "transport-de-personnes",
      "livraison-dernier-kilometre",
      "batiment",
      "services-a-la-personne",
      "aide-a-domicile-menage",
      "agence-immobiliere",
      "hotel-hebergement-independant",
    ],
  },
  {
    slug: "reduction-emballages",
    name: "Réduction des emballages",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Une porte d'entrée concrète pour réduire les emballages et les déchets à la source.",
    description:
      "Cette fiche aide à repérer les leviers les plus concrets pour limiter les emballages, réduire les déchets générés par l'activité et engager une démarche plus sobre sur les achats, la vente ou la livraison.",
    bestFor:
      "Les entreprises qui manipulent des produits, de la vente à emporter, des colis ou des consommables et qui veulent réduire les déchets sans lancer un projet trop lourd.",
    tags: ["Déchets", "Emballages", "Réemploi"],
    icon: "Package",
    usefulFor: ["Déchets", "Achats", "Réemploi"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/reduction-emballages",
    relatedSystems: [
      "restaurant",
      "boulangerie",
      "traiteur",
      "food-truck",
      "commerce-de-detail",
      "commerce-alimentaire",
      "e-commerce",
      "livraison-dernier-kilometre",
      "hotel-hebergement-independant",
    ],
  },
  {
    slug: "isolation-thermique",
    name: "Isolation thermique",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un point d'entrée concret pour réduire durablement les pertes d'énergie dans les locaux.",
    description:
      "Cette fiche aide à repérer les leviers utiles pour améliorer l'isolation des locaux professionnels, réduire les déperditions thermiques et engager des travaux plus pertinents sur le bâti.",
    bestFor:
      "Les entreprises qui occupent des locaux énergivores, veulent réduire leur facture de chauffage ou de climatisation et prioriser des travaux à impact réel.",
    tags: ["Bâtiment", "Isolation", "Locaux"],
    icon: "Building2",
    usefulFor: ["Locaux", "Énergie", "Travaux"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/isolation-thermique",
    relatedSystems: [
      "batiment",
      "agence-immobiliere",
      "investissement-immobilier",
      "hotel-hebergement-independant",
      "restaurant",
      "boulangerie",
      "commerce-de-detail",
      "production-industrie",
      "bureau-etudes",
    ],
  },
  {
    slug: "eclairage-led",
    name: "Éclairage LED",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un levier simple pour réduire vite la consommation électrique des locaux professionnels.",
    description:
      "Cette fiche aide à repérer les solutions et dispositifs utiles pour remplacer un éclairage énergivore par un éclairage LED plus sobre, plus durable et souvent plus rentable à court terme.",
    bestFor:
      "Les entreprises qui accueillent du public, utilisent beaucoup leurs locaux ou veulent engager une première action énergie simple et visible.",
    tags: ["Éclairage", "Électricité", "Locaux"],
    icon: "Lightbulb",
    usefulFor: ["Énergie", "Locaux", "Économies"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/eclairage-led",
    relatedSystems: [
      "restaurant",
      "boulangerie",
      "commerce-de-detail",
      "commerce-alimentaire",
      "hotel-hebergement-independant",
      "institut-de-beaute",
      "agence-immobiliere",
      "production-industrie",
      "bureau-etudes",
    ],
  },
  {
    slug: "panneaux-solaires",
    name: "Panneaux solaires",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un levier à regarder pour produire une partie de son énergie et réduire la dépendance au réseau.",
    description:
      "Cette fiche aide à repérer les dispositifs utiles pour étudier une installation solaire, mieux comprendre les conditions d'un projet photovoltaïque et évaluer s'il est pertinent pour les locaux de l'entreprise.",
    bestFor:
      "Les entreprises qui disposent d'une toiture, de locaux adaptés ou d'un site consommateur d'énergie et qui veulent étudier une production locale plus stable dans le temps.",
    tags: ["Solaire", "Photovoltaïque", "Énergie"],
    icon: "Sun",
    usefulFor: ["Énergie", "Locaux", "Autoproduction"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/panneaux-solaires",
    relatedSystems: [
      "batiment",
      "agence-immobiliere",
      "investissement-immobilier",
      "production-industrie",
      "hotel-hebergement-independant",
      "restaurant",
      "boulangerie",
      "commerce-de-detail",
      "bureau-etudes",
    ],
  },
  {
    slug: "chauffe-eau-solaire",
    name: "Chauffe-eau solaire",
    family: "Transition écologique",
    type: "Orientation",
    shortDescription: "Un levier utile pour réduire la facture d’eau chaude dans les activités qui en consomment beaucoup.",
    description:
      "Cette fiche aide à évaluer si un chauffe-eau solaire peut être pertinent pour réduire une partie des besoins en eau chaude sanitaire et engager un projet plus cohérent sur les locaux et l'énergie.",
    bestFor:
      "Les entreprises qui consomment beaucoup d'eau chaude, accueillent du public ou exploitent des locaux où l'usage sanitaire pèse réellement dans les charges.",
    tags: ["Eau chaude", "Solaire", "Locaux"],
    icon: "Droplets",
    usefulFor: ["Eau chaude", "Énergie", "Locaux"],
    cta: "Voir la fiche officielle",
    sourceLabel: "Transition écologique des entreprises",
    sourceUrl: "https://mission-transition-ecologique.beta.gouv.fr/projets-entreprise/chauffe-eau-solaire",
    relatedSystems: [
      "hotel-hebergement-independant",
      "restaurant",
      "traiteur",
      "boulangerie",
      "institut-de-beaute",
      "salon-de-coiffure",
      "salle-de-sport",
      "batiment",
      "agence-immobiliere",
    ],
  },
  {
    slug: "cir",
    name: "CIR",
    family: "Innovation & R&D",
    type: "Crédit d'impôt",
    shortDescription: "Le crédit d’impôt recherche pour les entreprises qui mènent de vraies dépenses de R&D.",
    description:
      "Le CIR est un dispositif fiscal à regarder lorsqu'une entreprise engage réellement des dépenses de recherche et développement structurées.",
    bestFor:
      "Les structures qui ont une vraie logique R&D, des projets techniques ou des dépenses de recherche déjà cadrées.",
    tags: ["R&D", "Fiscalité", "Recherche"],
    icon: "Search",
    usefulFor: ["Recherche", "Fiscalité", "Innovation"],
    cta: "Voir la source officielle",
    sourceLabel: "Ministère de l'Économie",
    sourceUrl: "https://www.economie.gouv.fr/entreprises/credit-impot-recherche",
    relatedSystems: [
      "saas",
      "cybersecurite-pme",
      "consultant-data-bi",
      "agence-web",
      "cabinet-de-conseil",
    ],
  },
  {
    slug: "jei",
    name: "JEI",
    family: "Innovation & R&D",
    type: "Exonération",
    shortDescription: "Le statut de jeune entreprise innovante pour bénéficier d'exonérations fiscales et sociales liées à la R&D.",
    description:
      "Le statut JEI permet à une entreprise jeune qui investit réellement en recherche et développement de bénéficier, sous conditions, d'exonérations fiscales et sociales pour soutenir sa phase de croissance innovante.",
    bestFor:
      "Les PME innovantes qui ont déjà de vraies dépenses de R&D, des profils techniques ou scientifiques à recruter et besoin d'un cadre fiscal plus favorable pour accélérer.",
    tags: ["JEI", "R&D", "Exonérations"],
    icon: "Sparkles",
    usefulFor: ["Innovation", "R&D", "Croissance"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public Entreprendre",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F31188",
    relatedSystems: [
      "saas",
      "agence-web",
      "cybersecurite-pme",
      "consultant-data-bi",
      "cabinet-de-conseil",
      "bureau-etudes",
      "production-industrie",
    ],
  },
  {
    slug: "cii",
    name: "CII",
    family: "Innovation & R&D",
    type: "Crédit d'impôt",
    shortDescription: "Le crédit d’impôt innovation pour certaines dépenses liées à des produits nouveaux.",
    description:
      "Le CII peut être utile à regarder lorsqu'une PME travaille sur un produit ou un service nouveau avec une vraie logique d'innovation.",
    bestFor:
      "Les PME qui développent de nouvelles offres, veulent sécuriser leurs dépenses d'innovation et ont un projet suffisamment cadré.",
    tags: ["Innovation", "PME", "Fiscalité"],
    icon: "Target",
    usefulFor: ["Produit", "Innovation", "PME"],
    cta: "Voir la source officielle",
    sourceLabel: "Ministère de l'Économie",
    sourceUrl: "https://www.economie.gouv.fr/entreprises/credit-impot-innovation",
    relatedSystems: [
      "saas",
      "agence-web",
      "consultant-data-bi",
      "cybersecurite-pme",
      "cabinet-de-conseil",
    ],
  },
  {
    slug: "jeu",
    name: "JEU",
    family: "Innovation & R&D",
    type: "Exonération",
    shortDescription: "Le statut de jeune entreprise universitaire pour valoriser des travaux de recherche avec un cadre fiscal et social dédié.",
    description:
      "Le statut JEU s'adresse aux jeunes entreprises qui valorisent des travaux de recherche issus d'un établissement d'enseignement supérieur, avec des conditions d'éligibilité spécifiques et un accès à des exonérations fiscales et sociales.",
    bestFor:
      "Les projets issus d'une université, d'un laboratoire ou d'un parcours de recherche qui veulent transformer des travaux académiques en entreprise avec un cadre plus sécurisant.",
    tags: ["JEU", "Recherche", "Valorisation"],
    icon: "GraduationCap",
    usefulFor: ["Recherche", "Valorisation", "Spin-off"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public Entreprendre",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F31188",
    relatedSystems: [
      "saas",
      "agence-web",
      "consultant-data-bi",
      "cybersecurite-pme",
      "cabinet-de-conseil",
      "bureau-etudes",
      "organisme-de-formation",
    ],
  },
  {
    slug: "jec",
    name: "JEC",
    family: "Innovation & R&D",
    type: "Exonération",
    shortDescription: "Le statut de jeune entreprise de croissance pour les PME innovantes qui accélèrent fortement.",
    description:
      "Le statut JEC s'adresse aux jeunes entreprises innovantes en forte croissance qui remplissent des critères spécifiques et peuvent bénéficier d'un cadre fiscal et social favorable.",
    bestFor:
      "Les PME innovantes qui ont déjà trouvé une traction réelle, recrutent vite et cherchent à soutenir une phase d'accélération sans fragiliser leur structure.",
    tags: ["JEC", "Croissance", "Innovation"],
    icon: "TrendingUp",
    usefulFor: ["Croissance", "Innovation", "Recrutement"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public Entreprendre",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F31188",
    relatedSystems: [
      "saas",
      "agence-web",
      "consultant-data-bi",
      "cybersecurite-pme",
      "cabinet-de-conseil",
    ],
  },
  {
    slug: "jeii",
    name: "JEII",
    family: "Innovation & R&D",
    type: "Exonération",
    shortDescription: "Le statut de jeune entreprise innovante à impact pour les projets utiles socialement ou écologiquement.",
    description:
      "Le statut JEII vise les jeunes entreprises innovantes qui développent un projet à utilité sociale ou environnementale et ouvre, sous conditions, les mêmes avantages que la JEI.",
    bestFor:
      "Les structures innovantes qui portent un impact social ou environnemental clair et veulent articuler innovation, utilité concrète et cadre fiscal plus lisible.",
    tags: ["JEII", "Impact", "Innovation"],
    icon: "HeartPulse",
    usefulFor: ["Impact", "Innovation", "Utilité sociale"],
    cta: "Voir la source officielle",
    sourceLabel: "Service Public Entreprendre",
    sourceUrl: "https://entreprendre.service-public.gouv.fr/vosdroits/F31188",
    relatedSystems: [
      "association",
      "organisme-de-formation",
      "services-a-la-personne",
      "aide-a-domicile-menage",
      "saas",
      "consultant-data-bi",
    ],
  },
  {
    slug: "cifre",
    name: "CIFRE",
    family: "Innovation & R&D",
    type: "Convention",
    shortDescription: "Un dispositif pour recruter un doctorant autour d’un vrai sujet de recherche appliquée.",
    description:
      "La CIFRE permet de structurer un travail de recherche avec un doctorant et un laboratoire autour d'un sujet utile à l'entreprise.",
    bestFor:
      "Les structures qui ont un besoin de recherche appliquée plus poussé et un sujet qui justifie un vrai partenariat académique.",
    tags: ["Doctorat", "Recherche", "Partenariat"],
    icon: "FilePenLine",
    usefulFor: ["Doctorant", "Recherche", "Partenariat"],
    cta: "Voir la source officielle",
    sourceLabel: "ANRT",
    sourceUrl: "https://www.anrt.asso.fr/fr/le-dispositif-cifre-7844",
    relatedSystems: [
      "saas",
      "cabinet-de-conseil",
      "consultant-data-bi",
      "cybersecurite-pme",
    ],
  },
] as const;

const aidBySlug = Object.fromEntries(
  demaaAidItems.map((item) => [item.slug, item]),
) as Record<string, DemaaAidItem>;

const aidFamilyBySlug = Object.fromEntries(
  aidFamilies.map((family) => [family.slug, family]),
) as Record<string, AidFamilyDefinition>;

export function getDemaaAidItems(): DemaaAidItem[] {
  return [...demaaAidItems];
}

export function getAidFamilyDefinitions(): AidFamilyDefinition[] {
  return [...aidFamilies];
}

export function getAidFamilyBySlug(slug: string): AidFamilyDefinition | null {
  return aidFamilyBySlug[slug] ?? null;
}

export function getDemaaAidBySlug(slug: string): DemaaAidItem | null {
  return aidBySlug[slug] ?? null;
}

export function getAidItemsByFamily(family: AidFamily): DemaaAidItem[] {
  return demaaAidItems.filter((item) => item.family === family);
}
