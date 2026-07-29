import type {
  OperationalWorkbookV2PilotProfile,
  OperationalWorkbookV2PilotSlug,
} from "@/lib/operational-workbook-v2";

const profiles = {
  batiment: {
    systemSlug: "batiment",
    routines: [
      {
        routineId: "batiment-qualifier-demande-devis",
        title: "Qualifier une demande et préparer le devis",
        frequency: "À chaque demande",
        sourceProcessIds: [
          "process.btp.marketing-vente.attirer-et-vendre-un-chantier",
        ],
        sourceStepIds: [
          "etape.batiment.297700559a",
          "etape.batiment.4d66d82687",
          "etape.batiment.9f1def05f8",
        ],
      },
      {
        routineId: "batiment-lancer-cloturer-chantier",
        title: "Préparer le lancement et la clôture du chantier",
        frequency: "À chaque chantier",
        sourceProcessIds: [
          "process.btp.operations.demarrer-et-cloturer-un-chantier",
        ],
        sourceStepIds: [
          "etape.batiment.dd16786684",
          "etape.batiment.a6579a2773",
          "etape.batiment.6ad9ff9f5e",
        ],
      },
      {
        routineId: "batiment-planifier-equipes",
        title: "Planifier les équipes et les interventions",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.btp.equipe.organiser-les-equipes-remplacer-un-absent",
        ],
        sourceStepIds: [
          "etape.batiment.a27389f5aa",
          "etape.batiment.e5bad216f6",
          "etape.batiment.7bc92e53bc",
        ],
      },
      {
        routineId: "batiment-suivre-avancement",
        title: "Suivre l’avancement et les écarts",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.btp.operations.suivre-lavancement-dun-chantier",
        ],
        sourceStepIds: [
          "etape.batiment.05697249d6",
          "etape.batiment.b52f0fd177",
          "etape.batiment.c3a5701eee",
        ],
      },
      {
        routineId: "batiment-piloter-rentabilite",
        title: "Contrôler la rentabilité par chantier",
        frequency: "À chaque clôture, puis chaque mois",
        sourceProcessIds: [
          "process.btp.finance-admin.suivre-la-rentabilite",
        ],
        sourceStepIds: [
          "etape.batiment.64b2f4c3eb",
          "etape.batiment.45682b265a",
          "etape.batiment.730468282d",
        ],
      },
      {
        routineId: "batiment-facturer-relancer",
        title: "Facturer et relancer les encaissements",
        frequency: "Chaque semaine",
        sourceProcessIds: ["process.btp.finance-admin.se-faire-payer"],
        sourceStepIds: [
          "etape.batiment.9d2dfe6aea",
          "etape.batiment.068e1f8429",
          "etape.batiment.74303f46e9",
          "etape.batiment.b0276860f6",
        ],
      },
      {
        routineId: "batiment-securite-assurances",
        title: "Contrôler la sécurité et les assurances",
        frequency: "Chaque mois et avant un chantier sensible",
        sourceProcessIds: [
          "process.btp.conformite-metier.securite-et-couverture-assurance",
        ],
        sourceStepIds: [
          "etape.batiment.1065503d5a",
          "etape.batiment.e4eef1305d",
          "etape.batiment.34ea6ed59a",
        ],
      },
      {
        routineId: "batiment-stocks-fournisseurs",
        title: "Piloter les stocks, commandes et fournisseurs",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.btp.materiel-approvisionnement.materiel-et-fournisseurs",
        ],
        sourceStepIds: [
          "etape.batiment.5e5a1d2ab3",
          "etape.batiment.df5f623a5f",
          "etape.batiment.5113f15370",
          "etape.batiment.ff59e48415",
        ],
      },
    ],
    team: [
      {
        role: "Dirigeant",
        manager: "",
        site: "Bureau et chantiers",
        responsibility: "Piloter la marge, la trésorerie et les priorités.",
        operatingModes: "Revue mensuelle et arbitrage des écarts.",
      },
      {
        role: "Responsable de chantier",
        manager: "Dirigeant",
        site: "Chantiers",
        responsibility: "Coordonner l’exécution, la qualité et les délais.",
        operatingModes: "Planning hebdomadaire et suivi chantier.",
      },
      {
        role: "Responsable administratif",
        manager: "Dirigeant",
        site: "Bureau",
        responsibility: "Tenir les dossiers, facturer et suivre les échéances.",
        operatingModes: "Revue des factures et encaissements chaque semaine.",
      },
      {
        role: "Référent sécurité",
        manager: "Dirigeant",
        site: "Chantiers",
        responsibility: "Contrôler habilitations, EPI, assurances et preuves.",
        operatingModes: "Contrôle mensuel et avant chantier sensible.",
      },
      {
        role: "Responsable achats",
        manager: "Dirigeant",
        site: "Dépôt et chantiers",
        responsibility: "Sécuriser les stocks, commandes et livraisons.",
        operatingModes: "Revue hebdomadaire des seuils et fournisseurs.",
      },
    ],
    calendar: [
      {
        category: "Visibilité locale",
        action: "Mettre à jour les réalisations et zones couvertes.",
        channel: "Google Business Profile",
        owner: "Responsable commercial",
        timing: "Semaine 1",
      },
      {
        category: "Conversion",
        action: "Relancer les devis sans réponse depuis sept jours.",
        channel: "E-mail et téléphone",
        owner: "Responsable commercial",
        timing: "Chaque semaine",
      },
      {
        category: "Preuve",
        action: "Demander un avis après une réception sans réserve.",
        channel: "SMS et Google",
        owner: "Responsable de chantier",
        timing: "Après chaque réception",
      },
    ],
    finance: {
      activityDriver: {
        label: "Chantiers facturés",
        unit: "chantiers",
        demoVolumes: [3, 3, 4, 4, 4, 5, 4, 5, 5, 5, 6, 5],
      },
      demoAssumptions: {
        averageRevenuePerUnit: 15_000,
        variableCostDrivers: [
          { label: "Matériaux", rate: 0.38, vatDeductible: true },
          { label: "Sous-traitance chantier", rate: 0.08, vatDeductible: true },
        ],
        monthlyFixedCosts: [
          { label: "Salaires et charges", value: 14_000 },
          { label: "Véhicules, assurances et locaux", value: 5_000 },
          { label: "Commercial et frais généraux", value: 3_000 },
        ],
        openingCash: 42_000,
        openingReceivables: 54_000,
        openingPayables: 21_000,
        openingVatPayable: 4_500,
        customerCollectionDelayMonths: 1,
        supplierPaymentDelayMonths: 1,
        averageVatRate: 0.2,
        monthlyDebtService: 3_500,
        investmentPerMonth: 2_500,
      },
    },
  },
  restaurant: {
    systemSlug: "restaurant",
    routines: [
      {
        routineId: "restaurant-piloter-activite",
        title: "Piloter les ventes, la marge et la capacité",
        frequency: "Chaque mois",
        sourceProcessIds: [
          "process.fast-food.direction.garder-une-visibilite-sans-reprendre-la-main",
        ],
        sourceStepIds: [
          "etape.restaurant.0aa444cfce",
          "etape.restaurant.95ad512e82",
          "etape.restaurant.269c92905d",
          "etape.restaurant.7b0c9bd387",
        ],
      },
      {
        routineId: "restaurant-ouvrir-fermer",
        title: "Ouvrir et fermer le restaurant",
        frequency: "Chaque service",
        sourceProcessIds: [
          "process.fast-food.operations.ouvrir-et-fermer-le-point-de-vente",
        ],
        sourceStepIds: [
          "etape.restaurant.e1051b9e5e",
          "etape.restaurant.f3987e5e96",
          "etape.restaurant.1d55e0741a",
          "etape.restaurant.8d3e46d197",
        ],
      },
      {
        routineId: "restaurant-standardiser-production",
        title: "Standardiser la préparation des plats",
        frequency: "Chaque service",
        sourceProcessIds: [
          "process.fast-food.operations.preparer-les-plats-de-facon-identique",
        ],
        sourceStepIds: [
          "etape.restaurant.2720fddbd5",
          "etape.restaurant.7b556991f6",
          "etape.restaurant.b581c3f2c0",
        ],
      },
      {
        routineId: "restaurant-stocks",
        title: "Contrôler les stocks et déclencher le réassort",
        frequency: "Chaque jour",
        sourceProcessIds: [
          "process.fast-food.operations.ne-jamais-manquer-de-stock",
        ],
        sourceStepIds: [
          "etape.restaurant.265909fd92",
          "etape.restaurant.4f196b2a1f",
          "etape.restaurant.914df5a73f",
          "etape.restaurant.87764c5f20",
        ],
      },
      {
        routineId: "restaurant-qualite-hygiene",
        title: "Contrôler la qualité et l’hygiène",
        frequency: "Chaque service",
        sourceProcessIds: [
          "process.fast-food.operations.verifier-la-qualite-en-continu",
          "process.fast-food.conformite-metier.respecter-lhygiene-alimentaire",
        ],
        sourceStepIds: [
          "etape.restaurant.86f5d70c56",
          "etape.restaurant.640ff00be4",
          "etape.restaurant.8ad0fe13ed",
          "etape.restaurant.bdd83b0d1d",
        ],
      },
      {
        routineId: "restaurant-planifier-equipe",
        title: "Planifier l’équipe et les remplacements",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.fast-food.equipe.organiser-les-equipes-remplacer-un-absent",
        ],
        sourceStepIds: [
          "etape.restaurant.78ec27d591",
          "etape.restaurant.fbec3ff92c",
          "etape.restaurant.b569661b9c",
        ],
      },
      {
        routineId: "restaurant-piloter-tresorerie",
        title: "Piloter la trésorerie et la marge",
        frequency: "Chaque semaine, synthèse mensuelle",
        sourceProcessIds: [
          "process.fast-food.finance-admin.suivre-largent-et-les-encaissements",
        ],
        sourceStepIds: [
          "etape.restaurant.f5de104a63",
          "etape.restaurant.6a0315674d",
          "etape.restaurant.bfd438710c",
          "etape.restaurant.39e20bae71",
        ],
      },
      {
        routineId: "restaurant-acquisition",
        title: "Planifier les actions d’acquisition locale",
        frequency: "Chaque mois",
        sourceProcessIds: [
          "process.fast-food.marketing-vente.attirer-de-nouveaux-clients",
        ],
        sourceStepIds: [
          "etape.restaurant.79dce82922",
          "etape.restaurant.772fae00c1",
          "etape.restaurant.a5f59c79e4",
        ],
      },
    ],
    team: [
      {
        role: "Dirigeant",
        manager: "",
        site: "Restaurant",
        responsibility: "Piloter la rentabilité, la trésorerie et les priorités.",
        operatingModes: "Revue mensuelle du cockpit.",
      },
      {
        role: "Responsable d’exploitation",
        manager: "Dirigeant",
        site: "Restaurant",
        responsibility: "Coordonner les services, l’équipe et les incidents.",
        operatingModes: "Brief avant service et clôture quotidienne.",
      },
      {
        role: "Chef de cuisine",
        manager: "Responsable d’exploitation",
        site: "Cuisine",
        responsibility: "Garantir production, qualité, hygiène et coût matière.",
        operatingModes: "Fiches techniques et contrôles par service.",
      },
      {
        role: "Responsable de salle",
        manager: "Responsable d’exploitation",
        site: "Salle",
        responsibility: "Piloter accueil, vente, qualité et encaissement.",
        operatingModes: "Checklist d’ouverture et de fermeture.",
      },
      {
        role: "Référent hygiène",
        manager: "Responsable d’exploitation",
        site: "Cuisine et réserves",
        responsibility: "Tracer les contrôles et traiter les non-conformités.",
        operatingModes: "Contrôle quotidien et revue mensuelle.",
      },
    ],
    calendar: [
      {
        category: "Visibilité locale",
        action: "Mettre à jour les horaires, menus et photos.",
        channel: "Google Business Profile",
        owner: "Responsable d’exploitation",
        timing: "Semaine 1",
      },
      {
        category: "Période creuse",
        action: "Programmer une offre compatible avec la capacité disponible.",
        channel: "Réservation directe et réseaux sociaux",
        owner: "Dirigeant",
        timing: "Semaine 2",
      },
      {
        category: "Fidélisation",
        action: "Analyser les retours et inviter les clients satisfaits à revenir.",
        channel: "E-mail et programme fidélité",
        owner: "Responsable de salle",
        timing: "Chaque mois",
      },
    ],
    finance: {
      activityDriver: {
        label: "Couverts servis",
        unit: "couverts",
        demoVolumes: [
          2_200, 2_300, 2_350, 2_400, 2_450, 2_500, 2_450, 2_550, 2_600,
          2_650, 2_700, 2_750,
        ],
      },
      demoAssumptions: {
        averageRevenuePerUnit: 32,
        variableCostDrivers: [
          { label: "Matières premières", rate: 0.31, vatDeductible: true },
          { label: "Emballages et commissions", rate: 0.03, vatDeductible: true },
        ],
        monthlyFixedCosts: [
          { label: "Salaires et charges", value: 26_000 },
          { label: "Loyer, énergie et entretien", value: 10_000 },
          { label: "Frais généraux", value: 3_000 },
        ],
        openingCash: 28_000,
        openingReceivables: 0,
        openingPayables: 20_000,
        openingVatPayable: 2_400,
        customerCollectionDelayMonths: 0,
        supplierPaymentDelayMonths: 0,
        averageVatRate: 0.1,
        monthlyDebtService: 2_500,
        investmentPerMonth: 1_500,
      },
    },
  },
  "agence-marketing": {
    systemSlug: "agence-marketing",
    routines: [
      {
        routineId: "agence-piloter-charge",
        title: "Piloter la charge et les priorités",
        frequency: "Chaque semaine, synthèse mensuelle",
        sourceProcessIds: [
          "process.agences-digitales-creation.direction.garder-une-visibilite-sur-la-charge",
        ],
        sourceStepIds: [
          "etape.agence-marketing.30f8b87aea",
          "etape.agence-marketing.ab0ee7d0f5",
          "etape.agence-marketing.1367d86fdf",
          "etape.agence-marketing.eeab00fe32",
        ],
      },
      {
        routineId: "agence-qualifier-proposition",
        title: "Qualifier et chiffrer une prestation",
        frequency: "À chaque opportunité",
        sourceProcessIds: [
          "process.agences-digitales-creation.marketing-vente.vendre-une-prestation-creative-ou-digitale",
        ],
        sourceStepIds: [
          "etape.agence-marketing.b4ed13ce90",
          "etape.agence-marketing.f2e3fa1380",
          "etape.agence-marketing.0aa6bd735b",
          "etape.agence-marketing.3767223417",
        ],
      },
      {
        routineId: "agence-cadrer-brief",
        title: "Cadrer le brief et le périmètre",
        frequency: "À chaque projet",
        sourceProcessIds: [
          "process.agences-digitales-creation.operations.cadrer-un-brief-et-un-perimetre",
        ],
        sourceStepIds: [
          "etape.agence-marketing.d0c8b6a6fb",
          "etape.agence-marketing.f8da598731",
          "etape.agence-marketing.87427d15ee",
        ],
      },
      {
        routineId: "agence-produire-livrables",
        title: "Planifier et contrôler les livrables",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.agences-digitales-creation.operations.produire-les-livrables",
        ],
        sourceStepIds: [
          "etape.agence-marketing.f1f19818df",
          "etape.agence-marketing.53c9b94d30",
          "etape.agence-marketing.38ddbda49b",
          "etape.agence-marketing.9a18d1d903",
        ],
      },
      {
        routineId: "agence-valider-livrer",
        title: "Organiser la validation et la livraison",
        frequency: "À chaque jalon",
        sourceProcessIds: [
          "process.agences-digitales-creation.operations.faire-valider-et-livrer",
        ],
        sourceStepIds: [
          "etape.agence-marketing.dfcac73ca2",
          "etape.agence-marketing.3e0d559ffe",
          "etape.agence-marketing.5f121b5418",
        ],
      },
      {
        routineId: "agence-organiser-equipe",
        title: "Organiser l’équipe et les remplacements",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.agences-digitales-creation.equipe.organiser-lequipe-et-les-remplacements",
        ],
        sourceStepIds: [
          "etape.agence-marketing.c068df77f9",
          "etape.agence-marketing.f997bfba7c",
          "etape.agence-marketing.12dd270542",
        ],
      },
      {
        routineId: "agence-suivre-marge",
        title: "Suivre la marge des projets",
        frequency: "Chaque semaine, synthèse mensuelle",
        sourceProcessIds: [
          "process.agences-digitales-creation.finance-admin.suivre-la-marge-projet",
        ],
        sourceStepIds: [
          "etape.agence-marketing.6bff16e734",
          "etape.agence-marketing.5443157411",
          "etape.agence-marketing.a96134868d",
          "etape.agence-marketing.9e7f83d2b7",
        ],
      },
      {
        routineId: "agence-facturer-relancer",
        title: "Facturer et suivre les encaissements",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.agences-digitales-creation.finance-admin.se-faire-payer",
        ],
        sourceStepIds: [
          "etape.agence-marketing.c2a71c5d9a",
          "etape.agence-marketing.b9d2a71a1c",
          "etape.agence-marketing.c9e1a2010e",
        ],
      },
    ],
    team: [
      {
        role: "Dirigeant d’agence",
        manager: "",
        site: "Agence",
        responsibility: "Piloter portefeuille, marge, charge et développement.",
        operatingModes: "Revue hebdomadaire et arbitrage mensuel.",
      },
      {
        role: "Responsable conseil",
        manager: "Dirigeant d’agence",
        site: "Agence et client",
        responsibility: "Cadrer les objectifs, briefs et validations.",
        operatingModes: "Brief écrit et validation par jalon.",
      },
      {
        role: "Chef de projet",
        manager: "Responsable conseil",
        site: "Agence",
        responsibility: "Planifier, coordonner et sécuriser les livrables.",
        operatingModes: "Planning de production et revue des risques.",
      },
      {
        role: "Responsable production",
        manager: "Chef de projet",
        site: "Agence",
        responsibility: "Garantir qualité, cohérence et respect du périmètre.",
        operatingModes: "Checklist qualité avant livraison.",
      },
      {
        role: "Responsable administratif",
        manager: "Dirigeant d’agence",
        site: "Agence",
        responsibility: "Suivre facturation, temps, marge et encaissements.",
        operatingModes: "Revue financière hebdomadaire.",
      },
    ],
    calendar: [
      {
        category: "Expertise",
        action: "Publier un cas client avec résultat et méthode.",
        channel: "LinkedIn et site",
        owner: "Responsable conseil",
        timing: "Semaine 1",
      },
      {
        category: "Prospection",
        action: "Relancer les opportunités dont la prochaine action est échue.",
        channel: "CRM, e-mail et téléphone",
        owner: "Dirigeant d’agence",
        timing: "Chaque semaine",
      },
      {
        category: "Fidélisation",
        action: "Préparer les bilans et opportunités de suite pertinentes.",
        channel: "Rendez-vous client",
        owner: "Responsable conseil",
        timing: "Chaque mois",
      },
    ],
    finance: {
      activityDriver: {
        label: "Projets facturés",
        unit: "projets",
        demoVolumes: [10, 11, 11, 12, 12, 13, 12, 13, 13, 14, 14, 14],
      },
      demoAssumptions: {
        averageRevenuePerUnit: 4_500,
        variableCostDrivers: [
          {
            label: "Sous-traitance de production",
            rate: 0.14,
            vatDeductible: true,
          },
          { label: "Achats projet et médias", rate: 0.04, vatDeductible: true },
        ],
        monthlyFixedCosts: [
          { label: "Salaires et charges", value: 20_000 },
          { label: "Locaux et logiciels", value: 4_000 },
          { label: "Développement commercial et structure", value: 3_000 },
        ],
        openingCash: 36_000,
        openingReceivables: 46_000,
        openingPayables: 8_000,
        openingVatPayable: 6_000,
        customerCollectionDelayMonths: 1,
        supplierPaymentDelayMonths: 0,
        averageVatRate: 0.2,
        monthlyDebtService: 1_200,
        investmentPerMonth: 1_000,
      },
    },
  },
  pharmacie: {
    systemSlug: "pharmacie",
    routines: [
      {
        routineId: "pharmacie-piloter-officine",
        title: "Piloter l’activité et les risques de l’officine",
        frequency: "Chaque mois",
        sourceProcessIds: [
          "process.pharmacie.direction.savoir-ou-va-lofficine",
        ],
        sourceStepIds: [
          "etape.pharmacie.5e5d384eec",
          "etape.pharmacie.3a34d97a87",
          "etape.pharmacie.d526463077",
          "etape.pharmacie.2afb4b069f",
        ],
      },
      {
        routineId: "pharmacie-securiser-acces",
        title: "Contrôler les accès et la continuité",
        frequency: "Chaque mois et à chaque départ",
        sourceProcessIds: [
          "process.pharmacie.direction.donner-acces-a-lessentiel",
        ],
        sourceStepIds: [
          "etape.pharmacie.d09bff4f6f",
          "etape.pharmacie.7b241ff1d0",
          "etape.pharmacie.ef9e696b5d",
        ],
      },
      {
        routineId: "pharmacie-servir-demandes",
        title: "Sécuriser le traitement des ordonnances et demandes",
        frequency: "À chaque demande",
        sourceProcessIds: [
          "process.pharmacie.operations.servir-ordonnances-et-demandes-comptoir",
        ],
        sourceStepIds: [
          "etape.pharmacie.dbf3dbf6a9",
          "etape.pharmacie.4fc290c79f",
          "etape.pharmacie.eb8cb528ea",
          "etape.pharmacie.ea9cfa8a88",
        ],
      },
      {
        routineId: "pharmacie-stock-ruptures",
        title: "Suivre les stocks, commandes et ruptures",
        frequency: "Chaque jour",
        sourceProcessIds: [
          "process.pharmacie.operations.suivre-stock-commandes-et-ruptures",
        ],
        sourceStepIds: [
          "etape.pharmacie.376ee34edb",
          "etape.pharmacie.f624c60213",
          "etape.pharmacie.baca148df6",
          "etape.pharmacie.f0d68c2a36",
        ],
      },
      {
        routineId: "pharmacie-tracabilite",
        title: "Piloter les missions santé et la traçabilité",
        frequency: "Chaque jour, synthèse mensuelle",
        sourceProcessIds: [
          "process.pharmacie.operations.piloter-missions-sante-et-tracabilite",
        ],
        sourceStepIds: [
          "etape.pharmacie.0e90dd7269",
          "etape.pharmacie.2af399dd88",
          "etape.pharmacie.668c3d1c50",
          "etape.pharmacie.b3df7bf6fa",
        ],
      },
      {
        routineId: "pharmacie-equipe-remplacements",
        title: "Organiser l’équipe et les remplacements",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.pharmacie.equipe.organiser-lequipe-et-les-remplacements",
        ],
        sourceStepIds: [
          "etape.pharmacie.c41fcee956",
          "etape.pharmacie.f084a3ccaf",
          "etape.pharmacie.f90d288e9a",
        ],
      },
      {
        routineId: "pharmacie-encaissements",
        title: "Rapprocher les encaissements et le tiers payant",
        frequency: "Chaque jour, synthèse mensuelle",
        sourceProcessIds: [
          "process.pharmacie.finance-admin.suivre-encaissements-et-tiers-payant",
        ],
        sourceStepIds: [
          "etape.pharmacie.90376de433",
          "etape.pharmacie.f73ed76691",
          "etape.pharmacie.93d452298c",
          "etape.pharmacie.bebda01efa",
        ],
      },
      {
        routineId: "pharmacie-conformite",
        title: "Tenir les obligations de l’officine en règle",
        frequency: "Chaque mois et selon échéance",
        sourceProcessIds: [
          "process.pharmacie.conformite-metier.tenir-lofficine-et-les-obligations-en-regle",
        ],
        sourceStepIds: [
          "etape.pharmacie.5dd77cc208",
          "etape.pharmacie.bb658387d3",
          "etape.pharmacie.dbe04744e4",
          "etape.pharmacie.eafff4562d",
        ],
      },
    ],
    team: [
      {
        role: "Pharmacien titulaire",
        manager: "",
        site: "Officine",
        responsibility: "Piloter l’activité, la conformité et la continuité.",
        operatingModes: "Revue mensuelle et arbitrage des risques.",
      },
      {
        role: "Pharmacien adjoint",
        manager: "Pharmacien titulaire",
        site: "Officine",
        responsibility: "Sécuriser les délivrances et décisions pharmaceutiques.",
        operatingModes: "Contrôle au comptoir et traçabilité.",
      },
      {
        role: "Responsable stock",
        manager: "Pharmacien titulaire",
        site: "Réserve et officine",
        responsibility: "Piloter commandes, ruptures, retours et périmés.",
        operatingModes: "Contrôle quotidien et inventaire tournant.",
      },
      {
        role: "Référent tiers payant",
        manager: "Pharmacien titulaire",
        site: "Back-office",
        responsibility: "Suivre rejets, rapprochements et créances.",
        operatingModes: "Rapprochement quotidien et revue mensuelle.",
      },
      {
        role: "Référent qualité",
        manager: "Pharmacien titulaire",
        site: "Officine",
        responsibility: "Tenir les procédures, contrôles et actions correctives.",
        operatingModes: "Audit mensuel documenté.",
      },
    ],
    calendar: [],
    finance: {
      activityDriver: {
        label: "Passages facturés",
        unit: "passages",
        demoVolumes: [
          7_400, 7_600, 7_800, 7_900, 8_000, 8_100, 8_050, 8_200, 8_300,
          8_350, 8_450, 8_500,
        ],
      },
      demoAssumptions: {
        averageRevenuePerUnit: 30,
        variableCostDrivers: [
          {
            label: "Achats de marchandises",
            rate: 0.7,
            vatDeductible: true,
          },
        ],
        monthlyFixedCosts: [
          { label: "Salaires et charges", value: 38_000 },
          { label: "Loyer, logiciels et maintenance", value: 12_000 },
          { label: "Services et frais de structure", value: 5_000 },
        ],
        openingCash: 95_000,
        openingReceivables: 18_000,
        openingPayables: 145_000,
        openingVatPayable: 9_000,
        customerCollectionDelayMonths: 0,
        supplierPaymentDelayMonths: 1,
        averageVatRate: 0.1,
        monthlyDebtService: 6_500,
        investmentPerMonth: 3_000,
      },
    },
  },
  "assistant-administratif-externalise": {
    systemSlug: "assistant-administratif-externalise",
    routines: [
      {
        routineId: "assistant-piloter-missions",
        title: "Piloter le portefeuille de missions",
        frequency: "Chaque semaine, synthèse mensuelle",
        sourceProcessIds: [
          "process.conseil-expert.direction.garder-une-visibilite-sur-les-missions",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.e3a3c2cb66",
          "etape.assistant-administratif-externalise.068a91daad",
          "etape.assistant-administratif-externalise.9bae24ef82",
          "etape.assistant-administratif-externalise.be3dc41098",
        ],
      },
      {
        routineId: "assistant-qualifier-mission",
        title: "Qualifier et proposer une mission claire",
        frequency: "À chaque opportunité",
        sourceProcessIds: [
          "process.conseil-expert.marketing-vente.vendre-une-mission-claire",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.d284e2b7cf",
          "etape.assistant-administratif-externalise.baa187f0ee",
          "etape.assistant-administratif-externalise.835120bb5e",
        ],
      },
      {
        routineId: "assistant-cadrer-mission",
        title: "Cadrer la mission, les accès et les responsabilités",
        frequency: "À chaque démarrage",
        sourceProcessIds: [
          "process.conseil-expert.operations.cadrer-une-mission-ou-une-etude",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.d8274919f3",
          "etape.assistant-administratif-externalise.2f374d48c3",
          "etape.assistant-administratif-externalise.c6645fc66c",
          "etape.assistant-administratif-externalise.7989cfaf98",
        ],
      },
      {
        routineId: "assistant-collecter-informations",
        title: "Collecter et contrôler les informations utiles",
        frequency: "À chaque dossier",
        sourceProcessIds: [
          "process.conseil-expert.operations.collecter-les-informations-utiles",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.c27feb68a9",
          "etape.assistant-administratif-externalise.ac1c889ed7",
          "etape.assistant-administratif-externalise.94c84ba2f2",
          "etape.assistant-administratif-externalise.87666ff06c",
        ],
      },
      {
        routineId: "assistant-produire-controler",
        title: "Produire et contrôler les livrables",
        frequency: "À chaque livrable",
        sourceProcessIds: [
          "process.conseil-expert.operations.produire-lanalyse-ou-le-livrable",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.b6fa50e4f6",
          "etape.assistant-administratif-externalise.94d14b11d3",
          "etape.assistant-administratif-externalise.b9ef4e5b01",
        ],
      },
      {
        routineId: "assistant-organiser-equipe",
        title: "Organiser les missions et les remplacements",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.conseil-expert.equipe.organiser-les-missions-et-remplacements",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.6d71670029",
          "etape.assistant-administratif-externalise.161c1d6d39",
          "etape.assistant-administratif-externalise.76b1a91e6a",
        ],
      },
      {
        routineId: "assistant-suivre-marge",
        title: "Suivre la marge des missions",
        frequency: "Chaque mois",
        sourceProcessIds: [
          "process.conseil-expert.finance-admin.suivre-la-marge-des-missions",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.141398a25b",
          "etape.assistant-administratif-externalise.1fd2b43413",
          "etape.assistant-administratif-externalise.7cdaadc290",
          "etape.assistant-administratif-externalise.d5c58df135",
        ],
      },
      {
        routineId: "assistant-facturer-relancer",
        title: "Facturer et relancer les encaissements",
        frequency: "Chaque semaine",
        sourceProcessIds: [
          "process.conseil-expert.finance-admin.se-faire-payer",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.e43aed64bf",
          "etape.assistant-administratif-externalise.fd3df840f5",
          "etape.assistant-administratif-externalise.493cffc8f2",
          "etape.assistant-administratif-externalise.e733f4e051",
        ],
      },
      {
        routineId: "assistant-confidentialite",
        title: "Contrôler les contrats, accès et données",
        frequency: "À chaque mission",
        sourceProcessIds: [
          "process.conseil-expert.conformite-metier.securiser-contrats-et-confidentialite",
        ],
        sourceStepIds: [
          "etape.assistant-administratif-externalise.7c18f422bc",
          "etape.assistant-administratif-externalise.ef8b0af612",
          "etape.assistant-administratif-externalise.4ebf042b7d",
          "etape.assistant-administratif-externalise.9d97638b9c",
        ],
      },
    ],
    team: [
      {
        role: "Responsable de mission",
        manager: "",
        site: "À distance et client",
        responsibility: "Piloter portefeuille, qualité, charge et marge.",
        operatingModes: "Revue hebdomadaire des missions.",
      },
      {
        role: "Assistant administratif",
        manager: "Responsable de mission",
        site: "À distance et client",
        responsibility: "Traiter les dossiers dans le périmètre validé.",
        operatingModes: "Checklist de dossier et journal des exceptions.",
      },
      {
        role: "Référent facturation",
        manager: "Responsable de mission",
        site: "À distance",
        responsibility: "Préparer factures, preuves et relances.",
        operatingModes: "Revue hebdomadaire des échéances.",
      },
      {
        role: "Référent qualité",
        manager: "Responsable de mission",
        site: "À distance",
        responsibility: "Contrôler versions, données et livrables.",
        operatingModes: "Contrôle avant chaque remise.",
      },
      {
        role: "Référent confidentialité",
        manager: "Responsable de mission",
        site: "À distance et client",
        responsibility: "Sécuriser contrats, accès et conservation.",
        operatingModes: "Contrôle au démarrage et à la clôture.",
      },
    ],
    calendar: [
      {
        category: "Partenariats",
        action: "Partager une ressource utile avec les prescripteurs ciblés.",
        channel: "E-mail et réseau professionnel",
        owner: "Responsable de mission",
        timing: "Semaine 1",
      },
      {
        category: "Prospection",
        action: "Relancer les opportunités avec prochaine action échue.",
        channel: "CRM, e-mail et téléphone",
        owner: "Responsable de mission",
        timing: "Chaque semaine",
      },
      {
        category: "Fidélisation",
        action: "Préparer un bilan des résultats et priorités suivantes.",
        channel: "Rendez-vous client",
        owner: "Responsable de mission",
        timing: "Chaque mois",
      },
    ],
    finance: {
      activityDriver: {
        label: "Dossiers clients actifs",
        unit: "dossiers",
        demoVolumes: [16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 20],
      },
      demoAssumptions: {
        averageRevenuePerUnit: 1_700,
        variableCostDrivers: [
          {
            label: "Sous-traitance de dossiers",
            rate: 0.1,
            vatDeductible: true,
          },
        ],
        monthlyFixedCosts: [
          { label: "Salaires et charges", value: 18_000 },
          { label: "Logiciels et abonnements", value: 4_000 },
          { label: "Structure et développement commercial", value: 2_000 },
        ],
        openingCash: 18_000,
        openingReceivables: 29_000,
        openingPayables: 3_000,
        openingVatPayable: 3_200,
        customerCollectionDelayMonths: 1,
        supplierPaymentDelayMonths: 0,
        averageVatRate: 0.2,
        monthlyDebtService: 500,
        investmentPerMonth: 500,
      },
    },
  },
} satisfies Record<OperationalWorkbookV2PilotSlug, OperationalWorkbookV2PilotProfile>;

export function getOperationalWorkbookV2PilotProfile(
  systemSlug: string,
): OperationalWorkbookV2PilotProfile | null {
  return profiles[systemSlug as OperationalWorkbookV2PilotSlug] ?? null;
}

export function getOperationalWorkbookV2PilotProfiles() {
  return Object.values(profiles);
}
