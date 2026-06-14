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
const resourcesSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/system-resources.ts"),
  "utf8"
);

function extractRuleKeys(source) {
  return new Set(
    [...source.matchAll(/^\s*(?:"([^"]+)"|([a-z0-9-]+)):\s*\{/gm)]
      .map((match) => match[1] ?? match[2])
      .filter((key) => key !== "order")
  );
}

function extractFlexibleResourceSlugs(source) {
  const match = source.match(/const flexibleSystemSlugs = \[(.*?)\];/s);

  if (!match) {
    return new Set();
  }

  return new Set(
    [...match[1].matchAll(/"([^"]+)"/g)].map((slugMatch) => slugMatch[1])
  );
}

const serviceRuleKeys = extractRuleKeys(serviceRulesSource);
const supplierRuleKeys = extractRuleKeys(supplierRulesSource);
const flexibleResourceSlugs = extractFlexibleResourceSlugs(resourcesSource);

function getResourceCount(slug) {
  return flexibleResourceSlugs.has(slug) ? 3 : 2;
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
    const resourceCount = getResourceCount(enterprise.slug);
    const specificityScore =
      processes +
      tools +
      (hasCustomServiceRule ? 2 : 0) +
      (hasCustomSupplierRule ? 2 : 0);

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
