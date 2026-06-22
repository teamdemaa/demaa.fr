import enterpriseAnnuaire from "../src/lib/enterprise-annuaire.json" with { type: "json" };
import fs from "node:fs";
import path from "node:path";

const serviceRulesSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/service-recommendations.ts"),
  "utf8"
);
const supplierRulesSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/supplier-recommendations.ts"),
  "utf8"
);
const contentRelationshipsSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/content-relationships.ts"),
  "utf8"
);
const courseContentSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/course-content.ts"),
  "utf8"
);
const documentModelsSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/document-models.ts"),
  "utf8"
);

function extractRuleKeys(source) {
  return new Set(
    [...source.matchAll(/^\s*(?:"([^"]+)"|([a-z0-9-]+)):\s*\{/gm)]
      .map((match) => match[1] ?? match[2])
      .filter((key) => key !== "order")
  );
}

function extractContentRelationships(source) {
  const relationships = new Map();
  const blockPattern = /"([^"]+)":\s*\[([\s\S]*?)\]/g;

  for (const match of source.matchAll(blockPattern)) {
    const [, contentSlug, slugsSource] = match;
    relationships.set(
      contentSlug,
      [...slugsSource.matchAll(/"([^"]+)"/g)].map((slugMatch) => slugMatch[1]),
    );
  }

  return relationships;
}

const serviceRuleKeys = extractRuleKeys(serviceRulesSource);
const supplierRuleKeys = extractRuleKeys(supplierRulesSource);
const contentRelationships = extractContentRelationships(contentRelationshipsSource);
const courseSlugs = [...courseContentSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
const documentModelSlugs = [...documentModelsSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);

function getRelatedContentCount(systemSlug) {
  let count = 0;

  for (const courseSlug of courseSlugs) {
    if ((contentRelationships.get(courseSlug) ?? []).includes(systemSlug)) {
      count += 1;
    }
  }

  for (const documentModelSlug of documentModelSlugs) {
    if ((contentRelationships.get(documentModelSlug) ?? []).includes(systemSlug)) {
      count += 1;
    }
  }

  return count;
}

function getCoverageTier(score) {
  if (score <= 8) return "fragile";
  if (score <= 14) return "moyen";
  return "solide";
}

const systems = enterpriseAnnuaire.enterprises
  .filter((enterprise) => enterprise.visibility !== "hidden")
  .map((enterprise) => {
    const processes =
      enterprise.operationProcesses?.length || enterprise.processes?.length || 0;
    const tools = enterprise.toolRefs?.length || enterprise.tools?.length || 0;
    const hasCustomServiceRule = serviceRuleKeys.has(enterprise.slug);
    const hasCustomSupplierRule = supplierRuleKeys.has(enterprise.slug);
    const resourceCount = getRelatedContentCount(enterprise.slug);
    const specificityScore =
      processes +
      tools +
      (hasCustomServiceRule ? 2 : 0) +
      (hasCustomSupplierRule ? 2 : 0) +
      resourceCount;

    return {
      slug: enterprise.slug,
      name: enterprise.name,
      sector: enterprise.sectorLabel,
      processes,
      tools,
      hasCustomServiceRule,
      hasCustomSupplierRule,
      resourceCount,
      specificityScore,
      tier: getCoverageTier(specificityScore),
    };
  })
  .sort((left, right) => left.specificityScore - right.specificityScore);

const summary = {
  totalSystems: systems.length,
  fragile: systems.filter((system) => system.tier === "fragile").length,
  moyen: systems.filter((system) => system.tier === "moyen").length,
  solide: systems.filter((system) => system.tier === "solide").length,
};

console.log(JSON.stringify({ summary, weakest: systems.slice(0, 20) }, null, 2));
