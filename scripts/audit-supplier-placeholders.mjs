import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import enterprisePayload from "../src/lib/enterprise-annuaire.json" with { type: "json" };

const currentDir = dirname(fileURLToPath(import.meta.url));
const supplierCatalogPath = resolve(currentDir, "../src/lib/supplier-catalog.ts");
const supplierCatalogSource = fs.readFileSync(supplierCatalogPath, "utf8");
const supplierRecommendationsPath = resolve(
  currentDir,
  "../src/lib/supplier-recommendations.ts",
);
const supplierRecommendationsSource = fs.readFileSync(supplierRecommendationsPath, "utf8");
const serviceIconPath = resolve(currentDir, "../src/components/ServiceIcon.tsx");
const serviceIconSource = fs.readFileSync(serviceIconPath, "utf8");
const serviceIconMapSource = serviceIconSource.match(
  /const serviceIcons = \{([\s\S]*?)\n\};/,
)?.[1] ?? "";
const supportedServiceIcons = new Set(
  Array.from(serviceIconMapSource.matchAll(/^  ([A-Za-z0-9]+),$/gm), (match) => match[1]),
);

const forbiddenGenericSlugs = new Set([
  "assurance-pro",
  "protection-juridique",
  "grossiste-alimentaire",
  "fournisseur-boissons",
  "emballages-pro",
  "terminal-paiement",
  "telephonie-pro",
  "energie-pro",
  "hygiene-nettoyage",
]);

const forbiddenGenericNames = new Set([
  "Assurance pro",
  "Protection juridique",
  "Grossiste alimentaire",
  "Fournisseur boissons",
  "Emballages pro",
  "Terminal de paiement",
  "Téléphonie pro",
  "Énergie pro",
  "Hygiène & nettoyage",
]);

const supplierBlocks = Array.from(
  supplierCatalogSource.matchAll(/\{\n\s+slug: "([^"]+)",([\s\S]*?)\n\s+\},/g),
).map((match) => {
  const [, slug, body] = match;
  const name = body.match(/\n\s+name: "([^"]+)"/)?.[1] ?? "";
  const href = body.match(/\n\s+href: "([^"]+)"/)?.[1] ?? "";
  const icon = body.match(/\n\s+icon: "([^"]+)"/)?.[1] ?? "";

  return { slug, name, href, icon };
});

const errors = [];
const seenSlugs = new Set();
const knownSystemSlugs = new Set(
  enterprisePayload.enterprises.map((enterprise) => enterprise.slug),
);
const knownSectorLabels = new Set(
  enterprisePayload.enterprises.map((enterprise) => enterprise.sectorLabel),
);

if (!supplierBlocks.length) {
  errors.push("No supplier cards could be parsed from supplier-catalog.ts.");
}

for (const supplier of supplierBlocks) {
  if (seenSlugs.has(supplier.slug)) {
    errors.push(`Duplicate supplier slug: ${supplier.slug}.`);
  }

  seenSlugs.add(supplier.slug);

  if (forbiddenGenericSlugs.has(supplier.slug)) {
    errors.push(`Generic supplier slug is forbidden: ${supplier.slug}.`);
  }

  if (forbiddenGenericNames.has(supplier.name)) {
    errors.push(`Generic supplier name is forbidden: ${supplier.name}.`);
  }

  if (!supplier.name) {
    errors.push(`Supplier ${supplier.slug} has no name.`);
  }

  if (!supplier.icon) {
    errors.push(`Supplier ${supplier.slug} has no icon.`);
  } else if (!supportedServiceIcons.has(supplier.icon)) {
    errors.push(
      `Supplier ${supplier.slug} uses unsupported ServiceIcon ${supplier.icon}.`,
    );
  }

  if (!supplier.href) {
    errors.push(`Supplier ${supplier.slug} has no href.`);
    continue;
  }

  if (!supplier.href.startsWith("https://")) {
    errors.push(
      `Supplier ${supplier.slug} must link to a concrete HTTPS provider, received: ${supplier.href}.`,
    );
  }
}

function readRecommendationMap(variableName) {
  const mapMatch = supplierRecommendationsSource.match(
    new RegExp(
      `const ${variableName}:[^=]+ = \\{([\\s\\S]*?)\\n\\};`,
    ),
  );

  if (!mapMatch) {
    errors.push(`Unable to parse ${variableName}.`);
    return [];
  }

  return Array.from(
    mapMatch[1].matchAll(
      /^  ("[^"]+"|[A-Za-zÀ-ÿ0-9-]+): \{\n    order: (\[[\s\S]*?\]),\n  \},/gm,
    ),
  ).map((match) => ({
    key: match[1].replaceAll('"', ""),
    supplierSlugs: Array.from(
      match[2].matchAll(/"([^"]+)"/g),
      (slugMatch) => slugMatch[1],
    ),
  }));
}

const recommendationBlocks = readRecommendationMap("SUPPLIER_RECOMMENDATIONS_BY_SYSTEM");
const sectorRecommendationBlocks = readRecommendationMap("SUPPLIER_RECOMMENDATIONS_BY_SECTOR");

const recommendationBySystem = new Map(
  recommendationBlocks.map((block) => [block.key, block.supplierSlugs]),
);
const recommendationBySector = new Map(
  sectorRecommendationBlocks.map((block) => [block.key, block.supplierSlugs]),
);
const expectedSupplierPrefixes = {
  batiment: ["plateforme-du-batiment", "point-p", "kiloutou"],
  restaurant: ["transgourmet", "france-boissons", "sumup"],
  boulangerie: ["transgourmet", "firplast", "sumup"],
  traiteur: ["transgourmet", "firplast", "france-boissons"],
  "commerce-de-detail": ["sumup", "raja", "edf-entreprises"],
  "institut-de-beaute": ["gouiran-beaute-pro", "sumup", "bernard"],
  "salon-de-coiffure": ["gouiran-beaute-pro", "sumup", "bernard"],
  evenementiel: ["kiloutou", "france-boissons", "sumup"],
  "nettoyage-professionnel": ["bernard", "orus", "onoff-business"],
  "fast-food": ["transgourmet", "firplast", "sumup"],
  "dark-kitchen": ["transgourmet", "firplast", "bernard"],
  "bar-cafe": ["france-boissons", "sumup", "bernard"],
  "food-truck": ["firplast", "sumup", "transgourmet"],
  "commerce-alimentaire": ["transgourmet", "sumup", "bernard"],
  "electricite-generale": ["rexel", "wurth", "kiloutou"],
  "garage-automobile": ["autodistribution-pro", "wurth", "kiloutou"],
  carrosserie: ["autodistribution-pro", "wurth", "kiloutou"],
  pressing: ["edf-entreprises", "bernard", "sumup"],
  "laverie-automatique": ["edf-entreprises", "bernard", "sumup"],
  esthetique: ["gouiran-beaute-pro", "sumup", "bernard"],
  pharmacie: ["ocp-repartition", "sumup", "bernard"],
  veterinaire: ["centravet", "orus", "sumup"],
  opticien: ["bbgr-optique", "sumup", "orus"],
  pisciniste: ["scp-france-piscine", "kiloutou", "point-p"],
  fleuriste: ["france-fleurs-pro", "raja", "sumup"],
  creche: ["papouille-creche", "bernard", "orus"],
  "cabinet-medical": ["distrimed-medical", "orus", "onoff-business"],
  "cabinet-paramedical": ["distrimed-medical", "orus", "onoff-business"],
  "infirmier-liberal": ["distrimed-medical", "orus", "onoff-business"],
  dentiste: ["henry-schein-dentaire", "orus", "onoff-business"],
  osteopathe: ["distrimed-medical", "orus", "onoff-business"],
  "salle-de-sport": ["decathlon-pro", "bernard", "sumup"],
  "coach-sportif": ["decathlon-pro", "sumup", "orus"],
  "tabac-presse-point-relais": ["logista-france", "sumup", "raja"],
  librairie: ["dilisco-livres", "sumup", "raja"],
  "auto-ecole": ["codes-rousseau-pro", "orus", "onoff-business"],
  "hotel-hebergement-independant": ["metro-france", "bernard", "france-boissons"],
  "conciergerie-airbnb": ["bernard", "onoff-business", "orus"],
  "agence-de-voyage": ["onoff-business", "orus", "sumup"],
  "plomberie-chauffage": ["cedeo-pro", "wurth", "kiloutou"],
  "menuiserie-agencement": ["dispano-bois", "legallais-quincaillerie", "kiloutou"],
  couvreur: ["asturienne-toiture", "plateforme-du-batiment", "kiloutou"],
  "peintre-en-batiment": ["tollens-pro", "plateforme-du-batiment", "kiloutou"],
  serrurier: ["legallais-quincaillerie", "wurth", "kiloutou"],
  climatisation: ["clim-plus", "cedeo-pro", "kiloutou"],
  paysagiste: ["dispano-bois", "kiloutou", "point-p"],
};

for (const { key: systemSlug, supplierSlugs } of recommendationBlocks) {
  if (!knownSystemSlugs.has(systemSlug)) {
    errors.push(`Supplier recommendation targets an unknown system: ${systemSlug}.`);
  }

  if (new Set(supplierSlugs).size !== supplierSlugs.length) {
    errors.push(`Duplicate supplier recommendation for system: ${systemSlug}.`);
  }

  for (const supplierSlug of supplierSlugs) {
    if (!seenSlugs.has(supplierSlug)) {
      errors.push(`Unknown supplier ${supplierSlug} recommended for ${systemSlug}.`);
    }
  }
}

for (const { key: sectorLabel, supplierSlugs } of sectorRecommendationBlocks) {
  if (!knownSectorLabels.has(sectorLabel)) {
    errors.push(`Supplier recommendation targets an unknown sector: ${sectorLabel}.`);
  }

  if (new Set(supplierSlugs).size !== supplierSlugs.length) {
    errors.push(`Duplicate supplier recommendation for sector: ${sectorLabel}.`);
  }

  for (const supplierSlug of supplierSlugs) {
    if (!seenSlugs.has(supplierSlug)) {
      errors.push(`Unknown supplier ${supplierSlug} recommended for sector ${sectorLabel}.`);
    }
  }
}

for (const sectorLabel of knownSectorLabels) {
  if (!recommendationBySector.has(sectorLabel)) {
    errors.push(`No supplier fallback configured for sector: ${sectorLabel}.`);
  }
}

for (const enterprise of enterprisePayload.enterprises) {
  const resolved = [
    ...(recommendationBySystem.get(enterprise.slug) ?? []),
    ...(recommendationBySector.get(enterprise.sectorLabel) ?? []),
  ].filter((slug, index, list) => list.indexOf(slug) === index);

  if (resolved.length < 3) {
    errors.push(`${enterprise.slug} resolves to fewer than three supplier recommendations.`);
  }
}

for (const [systemSlug, expectedPrefix] of Object.entries(expectedSupplierPrefixes)) {
  const actualPrefix = recommendationBySystem.get(systemSlug)?.slice(0, expectedPrefix.length);

  if (JSON.stringify(actualPrefix) !== JSON.stringify(expectedPrefix)) {
    errors.push(
      `${systemSlug} must start with its operational suppliers: ${expectedPrefix.join(", ")}.`,
    );
  }
}

const result = {
  suppliers: supplierBlocks.length,
  genericPlaceholders: supplierBlocks.filter(
    (supplier) =>
      forbiddenGenericSlugs.has(supplier.slug) || forbiddenGenericNames.has(supplier.name),
  ).length,
  nonConcreteLinks: supplierBlocks.filter(
    (supplier) => !supplier.href.startsWith("https://"),
  ).length,
  unsupportedIcons: supplierBlocks.filter(
    (supplier) => !supportedServiceIcons.has(supplier.icon),
  ).length,
  recommendationRules: recommendationBlocks.length,
  sectorFallbackRules: sectorRecommendationBlocks.length,
  kitsUsingSectorFallback: enterprisePayload.enterprises.filter(
    (enterprise) => !recommendationBySystem.has(enterprise.slug),
  ).length,
  operationalPrefixesChecked: Object.keys(expectedSupplierPrefixes).length,
  errors,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
