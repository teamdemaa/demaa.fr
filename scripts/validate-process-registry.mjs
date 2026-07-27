import processRegistry from "../src/lib/process-registry.generated.json" with { type: "json" };
import processSteps from "../src/lib/process-steps.generated.json" with { type: "json" };

const EXPECTED_COUNTS = {
  metiers: 115,
  families: 37,
  processes: 526,
  steps: 8510,
  documents: 526,
  sheets: 115,
};

const errors = [];
const autonomousFilePromisePattern =
  /\b(disponible(?:s)?|fourni(?:e|es|s)?|inclus(?:e|es|s)?|télécharge(?:able|ables|ment)?|recevez|obtenez|copie modifiable|fichier(?:s)? prêt(?:e|es|s)?|prêt(?:e|es|s)? à (?:l'emploi|utiliser))\b/i;

function requireUnique(rows, key, label) {
  const values = new Set();

  for (const row of rows) {
    const value = row[key];

    if (!value) {
      errors.push(`${label}: identifiant "${key}" manquant.`);
    } else if (values.has(value)) {
      errors.push(`${label}: identifiant dupliqué "${value}".`);
    }

    values.add(value);
  }
}

function requireCount(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: ${actual} trouvé(s), ${expected} attendu(s).`);
  }
}

const metiers = processRegistry["métiers"] ?? [];
const families = processRegistry.families ?? [];
const pillars = processRegistry.pillars ?? [];
const processes = processRegistry.processes ?? [];
const documents = processRegistry.documents ?? [];
const steps = processSteps.steps ?? [];
const sheetAudit = processSteps.sheetAudit ?? [];
const unmatched = processSteps.unmatched ?? [];

requireCount("Métiers", metiers.length, EXPECTED_COUNTS.metiers);
requireCount("Familles", families.length, EXPECTED_COUNTS.families);
requireCount("Processus", processes.length, EXPECTED_COUNTS.processes);
requireCount("Étapes", steps.length, EXPECTED_COUNTS.steps);
requireCount("Documents", documents.length, EXPECTED_COUNTS.documents);
requireCount("Google Sheets audités", sheetAudit.length, EXPECTED_COUNTS.sheets);
requireCount("Étapes non rapprochées", unmatched.length, 0);

requireUnique(metiers, "métierId", "Métiers");
requireUnique(metiers, "slug", "Métiers");
requireUnique(families, "familyId", "Familles");
requireUnique(pillars, "id", "Piliers");
requireUnique(processes, "processId", "Processus");
requireUnique(documents, "documentId", "Documents");
requireUnique(steps, "stepId", "Étapes");

const metierIds = new Set(metiers.map((metier) => metier["métierId"]));
const familyIds = new Set(families.map((family) => family.familyId));
const pillarIds = new Set(pillars.map((pillar) => pillar.id));
const processIds = new Set(processes.map((process) => process.processId));
const documentIds = new Set(documents.map((document) => document.documentId));

for (const metier of metiers) {
  if (!familyIds.has(metier.familyId)) {
    errors.push(`Métier ${metier.slug}: famille inconnue "${metier.familyId}".`);
  }
}

for (const process of processes) {
  if (!familyIds.has(process.familyId)) {
    errors.push(`Processus ${process.processId}: famille inconnue "${process.familyId}".`);
  }

  if (!pillarIds.has(process.pillarId)) {
    errors.push(`Processus ${process.processId}: pilier inconnu "${process.pillarId}".`);
  }

  if (!documentIds.has(process.documentId)) {
    errors.push(`Processus ${process.processId}: document inconnu "${process.documentId}".`);
  }

  if (autonomousFilePromisePattern.test(process.process ?? "")) {
    errors.push(
      `Processus ${process.processId}: promesse de fichier autonome ambiguë dans "${process.process}".`,
    );
  }
}

for (const document of documents) {
  if (!processIds.has(document.processId)) {
    errors.push(`Document ${document.documentId}: processus inconnu "${document.processId}".`);
  }

  if (autonomousFilePromisePattern.test(document.name ?? "")) {
    errors.push(
      `Document ${document.documentId}: promesse de fichier autonome ambiguë dans "${document.name}".`,
    );
  }
}

for (const step of steps) {
  if (!metierIds.has(step["métierId"])) {
    errors.push(`Étape ${step.stepId}: métier inconnu "${step["métierId"]}".`);
  }

  if (!processIds.has(step.processId)) {
    errors.push(`Étape ${step.stepId}: processus inconnu "${step.processId}".`);
  }
}

for (const audit of sheetAudit) {
  if (audit.status !== "Analysé" || audit.unmatchedCount !== 0) {
    errors.push(
      `Google Sheet ${audit.slug}: statut=${audit.status}, non rapprochées=${audit.unmatchedCount}.`,
    );
  }
}

const upgradedBtpSlugs = [
  "plomberie-chauffage",
  "electricite-generale",
  "climatisation",
  "serrurier",
  "batiment",
  "carreleur",
  "couvreur",
  "maconnerie-gros-oeuvre",
  "menuiserie-agencement",
  "paysagiste",
  "peintre-en-batiment",
  "pisciniste",
  "renovation-interieur",
];

for (const slug of upgradedBtpSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 18 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 18 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedAgencySlugs = [
  "agence-acquisition-paid-ads",
  "agence-marketing",
  "agence-seo",
  "agence-web",
  "creation-de-contenu",
  "media",
  "photographe-videaste",
  "studio-branding-design",
];

for (const slug of upgradedAgencySlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 19 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 19 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedCommerceSlugs = [
  "boutique-specialisee",
  "commerce-alimentaire",
  "commerce-de-detail",
  "fleuriste",
  "librairie",
  "opticien",
  "tabac-presse-point-relais",
];

for (const slug of upgradedCommerceSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 17 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 17 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedFastFoodSlugs = [
  "bar-cafe",
  "boulangerie",
  "dark-kitchen",
  "fast-food",
  "food-truck",
  "restaurant",
  "traiteur",
];

for (const slug of upgradedFastFoodSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 20 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 20 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedConsultingSlugs = [
  "assistant-administratif-externalise",
  "bureau-etudes",
  "cabinet-de-conseil",
  "cabinet-etudes",
  "cabinet-qhse-conformite",
  "coach-professionnel",
  "consultant-data-bi",
  "consultant-independant",
  "daf-externalise",
  "freelance",
  "office-manager-externalise",
  "secretariat-externalise",
];

for (const slug of upgradedConsultingSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 19 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 19 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedTechServicesSlugs = [
  "cybersecurite-pme",
  "infogerance-informatique",
  "integrateur-crm-erp",
  "reparation-informatique-mobile",
  "saas",
];

for (const slug of upgradedTechServicesSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 19 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 19 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedLogisticsSlugs = [
  "demenagement",
  "livraison-dernier-kilometre",
  "transport-de-marchandise",
  "transport-de-personnes",
  "vtc",
];

for (const slug of upgradedLogisticsSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 11 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 11 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedPropertyOperationsSlugs = [
  "conciergerie-airbnb",
  "gestion-locative",
  "syndic",
];

for (const slug of upgradedPropertyOperationsSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 12 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 12 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedDigitalCommerceSystems = {
  "e-commerce": 13,
  marketplace: 12,
};

for (const [slug, expectedProcessCount] of Object.entries(
  upgradedDigitalCommerceSystems,
)) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (
    !audit ||
    audit.processCount !== expectedProcessCount ||
    audit.stepCount !== 74
  ) {
    errors.push(
      `${slug}: attendu ${expectedProcessCount} processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedTrainingSystems = {
  cfa: 20,
  "formation-en-ligne": 17,
  "organisme-de-formation": 18,
};

for (const [slug, expectedProcessCount] of Object.entries(
  upgradedTrainingSystems,
)) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (
    !audit ||
    audit.processCount !== expectedProcessCount ||
    audit.stepCount !== 74
  ) {
    errors.push(
      `${slug}: attendu ${expectedProcessCount} processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const autoSchoolAudit = sheetAudit.find(
  (entry) => entry.slug === "auto-ecole",
);

if (
  !autoSchoolAudit ||
  autoSchoolAudit.processCount !== 17 ||
  autoSchoolAudit.stepCount !== 74
) {
  errors.push(
    `auto-ecole: attendu 17 processus et 74 contenus, trouvé ${
      autoSchoolAudit
        ? `${autoSchoolAudit.processCount} processus et ${autoSchoolAudit.stepCount} étapes`
        : "aucune ligne"
    }.`,
  );
}

const upgradedHealthPracticeSlugs = [
  "cabinet-medical",
  "cabinet-paramedical",
  "dentiste",
  "osteopathe",
  "psychologue",
  "veterinaire",
];

for (const slug of upgradedHealthPracticeSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 12 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 12 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedRegulatedPracticeSlugs = [
  "cabinet-comptable",
  "cabinet-davocat",
  "gestionnaire-paie-independant",
  "notaire",
];

for (const slug of upgradedRegulatedPracticeSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 19 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 19 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedFinanceServicesSlugs = [
  "cabinet-assurance",
  "courtier-credit-assurance",
  "gestionnaire-de-patrimoine",
  "societe-recouvrement",
];

for (const slug of upgradedFinanceServicesSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 19 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 19 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedHrSupportSlugs = [
  "agence-de-recrutement",
  "cabinet-rh-externalise",
  "centre-appels-support-client",
];

for (const slug of upgradedHrSupportSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 18 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 18 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedFieldServicesSlugs = [
  "entreprise-de-securite",
  "nettoyage-professionnel",
];

for (const slug of upgradedFieldServicesSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 9 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 9 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedRealEstateTransactionSlugs = [
  "agence-immobiliere",
  "chasseur-immobilier",
];

for (const slug of upgradedRealEstateTransactionSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 13 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 13 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedRealEstateInvestmentSlugs = [
  "investissement-immobilier",
  "investissement-locatif",
  "marchand-de-biens",
];

for (const slug of upgradedRealEstateInvestmentSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 12 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 12 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedRealEstateExpertiseSlugs = [
  "architecte-maitre-oeuvre",
  "diagnostiqueur-immobilier",
  "geometre",
];

for (const slug of upgradedRealEstateExpertiseSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 14 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 14 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedProductionWorkshopSlugs = [
  "carrosserie",
  "garage-automobile",
  "production-industrie",
];

for (const slug of upgradedProductionWorkshopSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 11 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 11 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedHealthBeautySlugs = [
  "esthetique",
  "institut-de-beaute",
  "salon-de-coiffure",
];

for (const slug of upgradedHealthBeautySlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 16 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 16 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedHomeSupportSlugs = [
  "aide-a-domicile-menage",
  "infirmier-liberal",
  "services-a-la-personne",
];

for (const slug of upgradedHomeSupportSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 12 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 12 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedSportFitnessSlugs = [
  "coach-sportif",
  "salle-de-sport",
];

for (const slug of upgradedSportFitnessSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 13 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 13 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedInvestmentSlugs = [
  "investissement-entreprise",
  "investissement-financier",
];

for (const slug of upgradedInvestmentSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 12 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 12 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedWelcomeServicesSlugs = [
  "agence-de-voyage",
  "centre-affaires-coworking",
];

for (const slug of upgradedWelcomeServicesSlugs) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (!audit || audit.processCount !== 13 || audit.stepCount !== 74) {
    errors.push(
      `${slug}: attendu 13 processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedTextileCareSystems = [
  { slug: "laverie-automatique", processCount: 11 },
  { slug: "pressing", processCount: 12 },
];

for (const { slug, processCount } of upgradedTextileCareSystems) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (
    !audit ||
    audit.processCount !== processCount ||
    audit.stepCount !== 74
  ) {
    errors.push(
      `${slug}: attendu ${processCount} processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedHospitalityEventsSystems = [
  { slug: "evenementiel", processCount: 13 },
  { slug: "hotel-hebergement-independant", processCount: 9 },
];

for (const { slug, processCount } of upgradedHospitalityEventsSystems) {
  const audit = sheetAudit.find((entry) => entry.slug === slug);

  if (
    !audit ||
    audit.processCount !== processCount ||
    audit.stepCount !== 74
  ) {
    errors.push(
      `${slug}: attendu ${processCount} processus et 74 contenus, trouvé ${
        audit
          ? `${audit.processCount} processus et ${audit.stepCount} étapes`
          : "aucune ligne"
      }.`,
    );
  }
}

const upgradedAssociationAudit = sheetAudit.find(
  (entry) => entry.slug === "association",
);

if (
  !upgradedAssociationAudit ||
  upgradedAssociationAudit.processCount !== 8 ||
  upgradedAssociationAudit.stepCount !== 74
) {
  errors.push(
    `association: attendu 8 processus et 74 contenus, trouvé ${
      upgradedAssociationAudit
        ? `${upgradedAssociationAudit.processCount} processus et ${upgradedAssociationAudit.stepCount} étapes`
        : "aucune ligne"
    }.`,
  );
}

const upgradedCrecheAudit = sheetAudit.find(
  (entry) => entry.slug === "creche",
);

if (
  !upgradedCrecheAudit ||
  upgradedCrecheAudit.processCount !== 12 ||
  upgradedCrecheAudit.stepCount !== 74
) {
  errors.push(
    `creche: attendu 12 processus et 74 contenus, trouvé ${
      upgradedCrecheAudit
        ? `${upgradedCrecheAudit.processCount} processus et ${upgradedCrecheAudit.stepCount} étapes`
        : "aucune ligne"
    }.`,
  );
}

const upgradedPharmacyAudit = sheetAudit.find(
  (entry) => entry.slug === "pharmacie",
);

if (
  !upgradedPharmacyAudit ||
  upgradedPharmacyAudit.processCount !== 12 ||
  upgradedPharmacyAudit.stepCount !== 74
) {
  errors.push(
    `pharmacie: attendu 12 processus et 74 contenus, trouvé ${
      upgradedPharmacyAudit
        ? `${upgradedPharmacyAudit.processCount} processus et ${upgradedPharmacyAudit.stepCount} étapes`
        : "aucune ligne"
    }.`,
  );
}

const plumbingSteps = steps.filter(
  (step) => step["métierId"] === "metier.plomberie-chauffage",
);
const plumbingContentTypes = new Set(
  plumbingSteps.map((step) => step.contentType),
);

if (
  plumbingSteps.some(
    (step) =>
      ![
        "implementation_action",
        "operational_step",
        "operating_rule",
        "recurring_control",
      ].includes(step.contentType),
  )
) {
  errors.push("Pilote plomberie: type de contenu manquant ou invalide.");
}

if (plumbingContentTypes.size !== 4) {
  errors.push(
    `Pilote plomberie: ${plumbingContentTypes.size} types trouvés, 4 attendus.`,
  );
}

if (processRegistry.metadata?.modelBatchIncluded !== false) {
  errors.push("Le lot de nettoyage ne doit pas inclure les modèles.");
}

if (errors.length) {
  console.error("[validate-process-registry] Erreurs :");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `[validate-process-registry] OK: ${metiers.length} métiers, ${families.length} familles, ` +
    `${processes.length} processus, ${steps.length} étapes, ${documents.length} documents.`,
);
