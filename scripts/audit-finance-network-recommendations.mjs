import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import enterprisePayload from "../src/lib/enterprise-annuaire.json" with { type: "json" };

const currentDir = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath) => fs.readFileSync(resolve(currentDir, relativePath), "utf8");

const financeCatalogSource = readSource("../src/lib/finance-catalog.ts");
const financeRecommendationsSource = readSource("../src/lib/finance-recommendations.ts");
const networkCatalogSource = readSource("../src/lib/pro-network-catalog.ts");
const networkRecommendationsSource = readSource("../src/lib/pro-network-recommendations.ts");
const serviceIconSource = readSource("../src/components/ServiceIcon.tsx");
const serviceIconMapSource = serviceIconSource.match(/const serviceIcons = \{([\s\S]*?)\n\};/)?.[1] ?? "";
const supportedIcons = new Set(
  Array.from(serviceIconMapSource.matchAll(/^  ([A-Za-z0-9]+),$/gm), (match) => match[1]),
);

const knownSystems = new Set(
  enterprisePayload.enterprises.map((enterprise) => enterprise.slug),
);
const knownSectors = new Set(
  enterprisePayload.enterprises.map((enterprise) => enterprise.sectorLabel),
);
const errors = [];

function parseCatalog(source) {
  return Array.from(
    source.matchAll(/\{\n\s+slug: "([^"]+)",([\s\S]*?)\n\s+\},/g),
  ).map((match) => {
    const [, slug, body] = match;
    return {
      slug,
      name: body.match(/\n\s+name: "([^"]+)"/)?.[1] ?? "",
      family: body.match(/\n\s+family: "([^"]+)"/)?.[1] ?? "",
      href: body.match(/\n\s+href: "([^"]+)"/)?.[1] ?? "",
      icon: body.match(/\n\s+icon: "([^"]+)"/)?.[1] ?? "",
    };
  });
}

function parseOrderMap(source, variableName) {
  const mapSource = source.match(
    new RegExp(`const ${variableName}:[^=]+ = \\{([\\s\\S]*?)\\n\\};`),
  )?.[1];

  if (!mapSource) {
    errors.push(`Unable to parse ${variableName}.`);
    return new Map();
  }

  return new Map(
    Array.from(
      mapSource.matchAll(
        /^  ("[^"]+"|[A-Za-zÀ-ÿ0-9-]+): (?:\{\n    order: )?(\[[\s\S]*?\])(?:,\n  \})?,/gm,
      ),
    ).map((match) => [
      match[1].replaceAll('"', ""),
      Array.from(match[2].matchAll(/"([^"]+)"/g), (slugMatch) => slugMatch[1]),
    ]),
  );
}

function validateCatalog(items, label, forbiddenNames) {
  const seenSlugs = new Set();

  for (const item of items) {
    if (seenSlugs.has(item.slug)) {
      errors.push(`Duplicate ${label} slug: ${item.slug}.`);
    }
    seenSlugs.add(item.slug);

    if (!item.name) {
      errors.push(`${label} ${item.slug} has no name.`);
    }
    if (forbiddenNames.has(item.name)) {
      errors.push(`${label} ${item.slug} still uses generic name: ${item.name}.`);
    }
    if (!item.href.startsWith("https://")) {
      errors.push(`${label} ${item.slug} must use a concrete HTTPS link: ${item.href}.`);
    }
    if (!supportedIcons.has(item.icon)) {
      errors.push(`${label} ${item.slug} uses unsupported ServiceIcon ${item.icon}.`);
    }
  }

  return seenSlugs;
}

const financeItems = parseCatalog(financeCatalogSource);
const networkItems = parseCatalog(networkCatalogSource);
const financeSlugs = validateCatalog(financeItems, "Finance item", new Set());
const networkSlugs = validateCatalog(
  networkItems,
  "Pro network",
  new Set([
    "Architectes locaux",
    "Maîtres d’œuvre",
    "Agences immobilières locales",
    "Notaires",
    "Avocats d’affaires",
    "Banques professionnelles",
    "Salons habitat & BTP",
    "Offices de tourisme",
    "Réseaux assureurs auto",
    "Union de commerçants locale",
    "Salons commerce & restauration",
  ]),
);

const financeBySlug = new Map(financeItems.map((item) => [item.slug, item]));
const networkBySlug = new Map(networkItems.map((item) => [item.slug, item]));
const defaultFinanceOrder = Array.from(
  financeRecommendationsSource
    .match(/const DEFAULT_FINANCE_ORDER = \[([\s\S]*?)\n\]/)?.[1]
    ?.matchAll(/"([^"]+)"/g) ?? [],
  (match) => match[1],
);
const financeOrders = parseOrderMap(
  financeRecommendationsSource,
  "FINANCE_RECOMMENDATIONS_BY_SYSTEM",
);
const threeVisibleFinanceSystems = new Set(
  Array.from(
    financeRecommendationsSource
      .match(/const SYSTEMS_WITH_THREE_VISIBLE_FINANCE_RECOMMENDATIONS = new Set\(\[([\s\S]*?)\n\]\);/)?.[1]
      ?.matchAll(/"([^"]+)"/g) ?? [],
    (match) => match[1],
  ),
);

for (const [systemSlug, order] of financeOrders) {
  if (!knownSystems.has(systemSlug)) {
    errors.push(`Finance recommendations target unknown system: ${systemSlug}.`);
  }
  for (const financeSlug of order) {
    if (!financeSlugs.has(financeSlug)) {
      errors.push(`Unknown finance item ${financeSlug} recommended for ${systemSlug}.`);
    }
  }
}

for (const systemSlug of threeVisibleFinanceSystems) {
  if (!knownSystems.has(systemSlug)) {
    errors.push(`Three-card finance rule targets unknown system: ${systemSlug}.`);
  }
}

for (const enterprise of enterprisePayload.enterprises) {
  const order = financeOrders.get(enterprise.slug) ?? defaultFinanceOrder;
  const visibleCount = threeVisibleFinanceSystems.has(enterprise.slug) ? 3 : 2;
  const visibleItems = order
    .map((slug) => financeBySlug.get(slug))
    .filter(Boolean)
    .slice(0, visibleCount);
  const visibleFamilies = visibleItems.map((item) => item.family);

  if (new Set(visibleFamilies).size !== visibleFamilies.length) {
    errors.push(
      `${enterprise.slug} shows overlapping finance families: ${visibleFamilies.join(", ")}.`,
    );
  }
}

const sectorNetworkOrders = parseOrderMap(
  networkRecommendationsSource,
  "PRO_NETWORK_RECOMMENDATIONS_BY_SECTOR",
);
const systemNetworkOrders = parseOrderMap(
  networkRecommendationsSource,
  "PRO_NETWORK_OVERRIDES_BY_SYSTEM",
);
const defaultNetworkOrder = Array.from(
  networkRecommendationsSource
    .match(/const DEFAULT_PRO_NETWORK_ORDER = \[([\s\S]*?)\n\]/)?.[1]
    ?.matchAll(/"([^"]+)"/g) ?? [],
  (match) => match[1],
);

for (const [sectorLabel, order] of sectorNetworkOrders) {
  if (!knownSectors.has(sectorLabel)) {
    errors.push(`Pro-network recommendations target unknown sector: ${sectorLabel}.`);
  }
  for (const networkSlug of order) {
    if (!networkSlugs.has(networkSlug)) {
      errors.push(`Unknown pro network ${networkSlug} recommended for sector ${sectorLabel}.`);
    }
  }
}

for (const [systemSlug, order] of systemNetworkOrders) {
  if (!knownSystems.has(systemSlug)) {
    errors.push(`Pro-network recommendations target unknown system: ${systemSlug}.`);
  }
  for (const networkSlug of order) {
    if (!networkSlugs.has(networkSlug)) {
      errors.push(`Unknown pro network ${networkSlug} recommended for ${systemSlug}.`);
    }
  }
}

const networkOrganizationGroups = new Map([
  ["cci-locale", "cci-france"],
  ["union-commercants-locaux", "cci-france"],
  ["fnaim", "fnaim"],
  ["agences-immobilieres-locales", "fnaim"],
]);

for (const enterprise of enterprisePayload.enterprises) {
  const merged = [
    ...(systemNetworkOrders.get(enterprise.slug) ?? []),
    ...(sectorNetworkOrders.get(enterprise.sectorLabel) ?? []),
    ...defaultNetworkOrder,
  ].filter((slug, index, list) => list.indexOf(slug) === index);
  const visible = merged.slice(0, 3);
  const organizations = visible.map(
    (slug) => networkOrganizationGroups.get(slug) ?? slug,
  );

  if (new Set(organizations).size !== organizations.length) {
    errors.push(
      `${enterprise.slug} shows the same pro-network organization twice: ${visible.join(", ")}.`,
    );
  }

  for (const networkSlug of merged) {
    if (!networkBySlug.has(networkSlug)) {
      errors.push(`Unknown pro network ${networkSlug} resolves for ${enterprise.slug}.`);
    }
  }
}

const result = {
  financeItems: financeItems.length,
  financeSystemRules: financeOrders.size,
  systemsWithThreeVisibleFinanceRecommendations: threeVisibleFinanceSystems.size,
  proNetworks: networkItems.length,
  proNetworkSectorRules: sectorNetworkOrders.size,
  proNetworkSystemRules: systemNetworkOrders.size,
  errors,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
