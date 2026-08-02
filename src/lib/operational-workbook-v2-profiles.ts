import type {
  OperationalWorkbookV2PilotProfile,
  OperationalWorkbookV2PilotSlug,
} from "@/lib/operational-workbook-v2";
import { getCuratedSystemProcessRoutines } from "@/lib/system-process-routines";

const profiles = {
  batiment: {
    systemSlug: "batiment",
    routines: getCuratedSystemProcessRoutines("batiment"),
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
    routines: getCuratedSystemProcessRoutines("restaurant"),
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
    routines: getCuratedSystemProcessRoutines("agence-marketing"),
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
    routines: getCuratedSystemProcessRoutines("pharmacie"),
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
    routines: getCuratedSystemProcessRoutines("assistant-administratif-externalise"),
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
