import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import ts from "typescript";
import enterprisePayload from "../src/lib/enterprise-annuaire.json" with { type: "json" };

const MAX_ITEMS_PER_GROUP = 4;
const HIDDEN_TRAINING_SLUGS = new Set(["formation-organisation-systeme-process"]);
const DEFAULT_TRAINING_ORDER = [
  "management-equipe-proximite",
  "communication-professionnelle-equipe",
  "documents-obligations-rgpd",
  "qvct-prevention-rh",
  "ia-pour-tpe-pme",
  "cybersecurite-sensibilisation-equipes",
];
const DEFAULT_RECRUITMENT_ORDER = [
  "france-travail-pro",
  "hellowork-recruteur",
  "side-recrutement-flexible",
  "la-bonne-alternance",
  "randstad-recruteurs",
];
const METIER_TRAINING_FAMILIES = new Set([
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
const METIER_TRAINING_SLUGS = new Set([
  "formation-organisation-systeme-process",
  "catalogue-hotels-palaces-umih",
  "merchandising-vente-magasin",
  "operateurs-voyage-umih",
  "service-client-hotellerie-tourisme",
]);
const FORBIDDEN_TRAINING_RECOMMENDATIONS = new Map([
  ["dentiste", new Set(["catalogue-medecin-santeacademie", "medecin-liberal-santeacademie"])],
  ["pharmacie", new Set(["catalogue-medecin-santeacademie", "medecin-liberal-santeacademie"])],
  ["veterinaire", new Set(["catalogue-medecin-santeacademie", "medecin-liberal-santeacademie", "catalogue-soignants-santeacademie"])],
  ["osteopathe", new Set(["catalogue-medecin-santeacademie", "catalogue-soignants-santeacademie"])],
  ["psychologue", new Set(["catalogue-medecin-santeacademie", "catalogue-soignants-santeacademie"])],
]);

const errors = [];
const warnings = [];
const knownSectors = new Set(enterprisePayload.enterprises.map((enterprise) => enterprise.sectorLabel));
const knownSystems = new Set(enterprisePayload.enterprises.map((enterprise) => enterprise.slug));

function unwrapExpression(node) {
  let current = node;

  while (
    ts.isSatisfiesExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function evaluateLiteral(node) {
  const current = unwrapExpression(node);

  if (ts.isStringLiteral(current) || ts.isNoSubstitutionTemplateLiteral(current)) {
    return current.text;
  }

  if (ts.isNumericLiteral(current)) {
    return Number(current.text);
  }

  if (current.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (current.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (current.kind === ts.SyntaxKind.NullKeyword) return null;

  if (ts.isArrayLiteralExpression(current)) {
    return current.elements.map(evaluateLiteral);
  }

  if (ts.isObjectLiteralExpression(current)) {
    return Object.fromEntries(
      current.properties.map((property) => {
        if (!ts.isPropertyAssignment(property)) {
          throw new Error(`Propriété TypeScript non prise en charge: ${property.getText()}`);
        }

        const name = property.name;
        const key = ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)
          ? name.text
          : name.getText();

        return [key, evaluateLiteral(property.initializer)];
      }),
    );
  }

  throw new Error(`Expression TypeScript non prise en charge: ${current.getText()}`);
}

function readVariable(filePath, variableName) {
  const absolutePath = resolve(filePath);
  const sourceText = readFileSync(absolutePath, "utf8");
  const sourceFile = ts.createSourceFile(
    absolutePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === variableName &&
        declaration.initializer
      ) {
        return evaluateLiteral(declaration.initializer);
      }
    }
  }

  throw new Error(`${variableName} est introuvable dans ${filePath}.`);
}

function validateCatalog(items, catalogLabel) {
  const bySlug = new Map();
  const seenNames = new Map();

  for (const item of items) {
    const label = `${catalogLabel}/${item.slug ?? "sans-slug"}`;

    for (const field of ["slug", "name", "provider", "family", "category", "shortDescription", "description", "bestFor", "href", "cta"]) {
      if (typeof item[field] !== "string" || item[field].trim() === "") {
        errors.push(`${label}: champ ${field} absent ou vide.`);
      }
    }

    for (const field of ["tags", "usefulFor", "sectors"]) {
      if (!Array.isArray(item[field]) || item[field].length === 0) {
        errors.push(`${label}: liste ${field} absente ou vide.`);
      }
    }

    if (bySlug.has(item.slug)) {
      errors.push(`${label}: slug dupliqué.`);
    }
    bySlug.set(item.slug, item);

    try {
      const url = new URL(item.href);
      if (url.protocol !== "https:") {
        errors.push(`${label}: le lien doit utiliser HTTPS (${item.href}).`);
      }
    } catch {
      errors.push(`${label}: lien invalide (${item.href}).`);
    }

    for (const sector of item.sectors ?? []) {
      if (!knownSectors.has(sector)) {
        errors.push(`${label}: secteur inconnu (${sector}).`);
      }
    }

    if (seenNames.has(item.name)) {
      warnings.push(`${label}: nom également utilisé par ${seenNames.get(item.name)}.`);
    } else {
      seenNames.set(item.name, item.slug);
    }

  }

  return bySlug;
}

function validateRecommendationMap(map, bySlug, label) {
  for (const [key, slugs] of Object.entries(map)) {
    if (new Set(slugs).size !== slugs.length) {
      errors.push(`${label}/${key}: recommandation dupliquée.`);
    }

    for (const slug of slugs) {
      if (!bySlug.has(slug)) {
        errors.push(`${label}/${key}: ${slug} est absent du catalogue.`);
      }
      if (HIDDEN_TRAINING_SLUGS.has(slug)) {
        errors.push(`${label}/${key}: ${slug} est masqué mais recommandé.`);
      }
    }
  }
}

function getTrainingGroup(training) {
  if (
    METIER_TRAINING_SLUGS.has(training.slug) ||
    METIER_TRAINING_FAMILIES.has(training.family) ||
    METIER_TRAINING_CATEGORIES.has(training.category)
  ) {
    return "metier";
  }

  return "transverse";
}

function groupWithLimit(items, getGroup, groups) {
  const result = Object.fromEntries(groups.map((group) => [group, []]));

  for (const item of items) {
    const group = getGroup(item);
    if (result[group].length < MAX_ITEMS_PER_GROUP) {
      result[group].push(item);
    }
  }

  return result;
}

const trainings = readVariable("src/lib/training-catalog.ts", "demaaTrainings");
const recruitmentItems = readVariable("src/lib/recruitment-catalog.ts", "demaaRecruitmentItems");
const trainingBySlug = validateCatalog(trainings, "formation");
const recruitmentBySlug = validateCatalog(recruitmentItems, "recrutement");
const trainingBySector = readVariable(
  "src/lib/training-recommendations.ts",
  "TRAINING_RECOMMENDATIONS_BY_SECTOR",
);
const trainingBySystem = readVariable(
  "src/lib/training-recommendations.ts",
  "TRAINING_OVERRIDES_BY_SYSTEM",
);
const recruitmentBySector = readVariable(
  "src/lib/recruitment-recommendations.ts",
  "RECRUITMENT_RECOMMENDATIONS_BY_SECTOR",
);

validateRecommendationMap(trainingBySector, trainingBySlug, "formation-secteur");
validateRecommendationMap(trainingBySystem, trainingBySlug, "formation-kit");
validateRecommendationMap(recruitmentBySector, recruitmentBySlug, "recrutement-secteur");

for (const sector of Object.keys(trainingBySector)) {
  if (!knownSectors.has(sector)) errors.push(`formation-secteur/${sector}: secteur inconnu.`);
}
for (const sector of Object.keys(recruitmentBySector)) {
  if (!knownSectors.has(sector)) errors.push(`recrutement-secteur/${sector}: secteur inconnu.`);
}
for (const systemSlug of Object.keys(trainingBySystem)) {
  if (!knownSystems.has(systemSlug)) errors.push(`formation-kit/${systemSlug}: kit inconnu.`);
}

const coverage = [];

for (const enterprise of enterprisePayload.enterprises) {
  const override = trainingBySystem[enterprise.slug] ?? [];
  const sectorTrainingSlugs = trainingBySector[enterprise.sectorLabel] ?? DEFAULT_TRAINING_ORDER;
  const orderedTrainingSlugs = override.length
    ? [...override]
    : sectorTrainingSlugs;
  const orderedTrainings = [...new Set(orderedTrainingSlugs)]
    .map((slug) => trainingBySlug.get(slug))
    .filter(Boolean);
  const groupedTrainings = groupWithLimit(
    orderedTrainings,
    getTrainingGroup,
    ["metier", "transverse"],
  );

  const recruitmentSlugs = [
    ...(recruitmentBySector[enterprise.sectorLabel] ?? DEFAULT_RECRUITMENT_ORDER),
    ...DEFAULT_RECRUITMENT_ORDER,
  ];
  const orderedRecruitmentItems = [...new Set(recruitmentSlugs)]
    .map((slug) => recruitmentBySlug.get(slug))
    .filter(Boolean);
  const groupedRecruitment = groupWithLimit(
    orderedRecruitmentItems,
    (item) => item.family === "Alternance" ? "alternance" : "recrutement",
    ["alternance", "recrutement"],
  );

  if (groupedTrainings.metier.length + groupedTrainings.transverse.length === 0) {
    errors.push(`${enterprise.slug}: aucune formation recommandée.`);
  }
  if (groupedRecruitment.alternance.length + groupedRecruitment.recrutement.length === 0) {
    errors.push(`${enterprise.slug}: aucune solution de recrutement recommandée.`);
  }

  const forbidden = FORBIDDEN_TRAINING_RECOMMENDATIONS.get(enterprise.slug);
  if (forbidden) {
    for (const slug of orderedTrainingSlugs) {
      if (forbidden.has(slug)) {
        errors.push(`${enterprise.slug}: formation hors métier interdite (${slug}).`);
      }
    }
  }

  coverage.push({
    slug: enterprise.slug,
    trainings: groupedTrainings.metier.length + groupedTrainings.transverse.length,
    recruitment: groupedRecruitment.alternance.length + groupedRecruitment.recrutement.length,
  });
}

console.log(JSON.stringify({
  summary: {
    kits: enterprisePayload.enterprises.length,
    trainings: trainings.length,
    recruitmentItems: recruitmentItems.length,
    trainingSystemOverrides: Object.keys(trainingBySystem).length,
    kitsWithoutTraining: coverage.filter((item) => item.trainings === 0).length,
    kitsWithoutRecruitment: coverage.filter((item) => item.recruitment === 0).length,
    errors: errors.length,
    warnings: warnings.length,
  },
  errors,
  warnings,
}, null, 2));

if (errors.length > 0) {
  process.exitCode = 1;
}
