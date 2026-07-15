import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import enterprisePayload from "../src/lib/enterprise-annuaire.json" with { type: "json" };

const currentDir = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath) => fs.readFileSync(resolve(currentDir, relativePath), "utf8");
const catalogSource = readSource("../src/lib/aid-catalog.ts");
const recommendationsSource = readSource("../src/lib/aid-recommendations.ts");
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

const aidItems = Array.from(
  catalogSource.matchAll(/\{\n\s+slug: "([^"]+)",([\s\S]*?)\n\s+\},/g),
)
  .map((match) => {
    const [, slug, body] = match;
    return {
      slug,
      name: body.match(/\n\s+name: "([^"]+)"/)?.[1] ?? "",
      family: body.match(/\n\s+family: "([^"]+)"/)?.[1] ?? "",
      icon: body.match(/\n\s+icon: "([^"]+)"/)?.[1] ?? "",
      sourceLabel: body.match(/\n\s+sourceLabel: "([^"]+)"/)?.[1] ?? "",
      sourceUrl: body.match(/\n\s+sourceUrl:\s*\n?\s+"([^"]+)"/)?.[1] ?? "",
    };
  })
  .filter((item) => item.family);

const aidBySlug = new Map(aidItems.map((item) => [item.slug, item]));
const seenSlugs = new Set();

for (const aid of aidItems) {
  if (seenSlugs.has(aid.slug)) {
    errors.push(`Duplicate aid slug: ${aid.slug}.`);
  }
  seenSlugs.add(aid.slug);

  if (!aid.name) {
    errors.push(`Aid ${aid.slug} has no name.`);
  }
  if (!aid.sourceLabel) {
    errors.push(`Aid ${aid.slug} has no source label.`);
  }
  if (!aid.sourceUrl.startsWith("https://")) {
    errors.push(`Aid ${aid.slug} must use an official HTTPS source: ${aid.sourceUrl}.`);
  }
  if (!supportedIcons.has(aid.icon)) {
    errors.push(`Aid ${aid.slug} uses unsupported ServiceIcon ${aid.icon}.`);
  }
}

function parseArrayMap(variableName) {
  const source = recommendationsSource.match(
    new RegExp(`const ${variableName}:[^=]+ = \\{([\\s\\S]*?)\\n\\};`),
  )?.[1];

  if (!source) {
    errors.push(`Unable to parse ${variableName}.`);
    return new Map();
  }

  return new Map(
    Array.from(
      source.matchAll(/^  ("[^"]+"|[A-Za-zÀ-ÿ0-9-]+): (\[[\s\S]*?\]),$/gm),
    ).map((match) => [
      match[1].replaceAll('"', ""),
      Array.from(match[2].matchAll(/"([^"]+)"/g), (slugMatch) => slugMatch[1]),
    ]),
  );
}

const sectorOrders = parseArrayMap("AID_RECOMMENDATIONS_BY_SECTOR");
const systemOrders = parseArrayMap("AID_RECOMMENDATIONS_BY_SYSTEM");
const defaultOrder = Array.from(
  recommendationsSource
    .match(/const DEFAULT_AID_ORDER = \[([\s\S]*?)\n\]/)?.[1]
    ?.matchAll(/"([^"]+)"/g) ?? [],
  (match) => match[1],
);

for (const [sectorLabel, order] of sectorOrders) {
  if (!knownSectors.has(sectorLabel)) {
    errors.push(`Aid recommendations target unknown sector: ${sectorLabel}.`);
  }
  for (const aidSlug of order) {
    if (!aidBySlug.has(aidSlug)) {
      errors.push(`Unknown aid ${aidSlug} recommended for sector ${sectorLabel}.`);
    }
  }
}

for (const [systemSlug, order] of systemOrders) {
  if (!knownSystems.has(systemSlug)) {
    errors.push(`Aid recommendations target unknown system: ${systemSlug}.`);
  }
  for (const aidSlug of order) {
    if (!aidBySlug.has(aidSlug)) {
      errors.push(`Unknown aid ${aidSlug} recommended for ${systemSlug}.`);
    }
  }
}

for (const enterprise of enterprisePayload.enterprises) {
  const order = systemOrders.get(enterprise.slug)
    ?? sectorOrders.get(enterprise.sectorLabel)
    ?? defaultOrder;
  const resolved = order.map((slug) => aidBySlug.get(slug)).filter(Boolean).slice(0, 6);
  const visible = resolved
    .filter(
      (item, index, list) =>
        list.findIndex((candidate) => candidate.family === item.family) === index,
    )
    .slice(0, 3);
  const visibleFamilies = visible.map((item) => item.family);
  const visibleSources = visible.map((item) => item.sourceUrl);

  if (!visible.length) {
    errors.push(`${enterprise.slug} resolves to no visible aid recommendation.`);
  }
  if (new Set(visibleFamilies).size !== visibleFamilies.length) {
    errors.push(`${enterprise.slug} shows overlapping aid families.`);
  }
  if (new Set(visibleSources).size !== visibleSources.length) {
    errors.push(`${enterprise.slug} shows the same official aid source twice.`);
  }
}

const result = {
  aids: aidItems.length,
  sectorRules: sectorOrders.size,
  systemRules: systemOrders.size,
  errors,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
