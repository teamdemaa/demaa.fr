import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "..");
const toolDirectoryPath = resolve(rootDir, "src/lib/tool-directory.json");
const enterpriseAnnuairePath = resolve(rootDir, "src/lib/enterprise-annuaire.json");
const sectorTaxonomyPath = resolve(rootDir, "src/lib/sector-taxonomy.json");
const freeToolFallbacksPath = resolve(rootDir, "src/lib/free-tool-fallbacks.json");

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function resolveToolScope(tool, ref) {
  return ref?.scope ?? tool?.scope;
}

const toolPayload = readJson(toolDirectoryPath);
const enterprisePayload = readJson(enterpriseAnnuairePath);
const sectorTaxonomyPayload = readJson(sectorTaxonomyPath);
const freeToolFallbacksPayload = readJson(freeToolFallbacksPath);

if (!Array.isArray(toolPayload.tools)) {
  throw new Error("Invalid tool-directory.json: expected tools array.");
}

if (!Array.isArray(enterprisePayload.enterprises)) {
  throw new Error("Invalid enterprise-annuaire.json: expected enterprises array.");
}

if (!Array.isArray(sectorTaxonomyPayload.sectors)) {
  throw new Error("Invalid sector-taxonomy.json: expected sectors array.");
}

const sectorTaxonomyByLabel = new Map(
  sectorTaxonomyPayload.sectors.map((sector) => [sector.publicLabel, sector]),
);
const sectorTaxonomyByToolSectorLabel = new Map(
  sectorTaxonomyPayload.sectors
    .filter((sector) => sector.toolSectorLabel)
    .map((sector) => [sector.toolSectorLabel, sector]),
);
const exactFallbacksByToolSector =
  freeToolFallbacksPayload.exactSectorPriorityByToolSector ?? {};
const genericFallbacksByPublicSector =
  freeToolFallbacksPayload.genericFallbackPriorityByPublicSector ?? {};
const manualFallbacksBySystem =
  freeToolFallbacksPayload.manualSystemPriorityBySystem ?? {};

const errors = [];
const warnings = [];
const toolSlugs = new Set();
const activeToolSlugs = new Set();

for (const tool of toolPayload.tools) {
  if (!tool.slug) {
    addUnique(errors, `Tool without slug: ${tool.name ?? "<unknown>"}`);
    continue;
  }

  if (toolSlugs.has(tool.slug)) {
    addUnique(errors, `Duplicate tool slug: ${tool.slug}`);
  }

  toolSlugs.add(tool.slug);

  const requiredFields = ["name", "url", "category", "description", "bestFor", "pricingHint"];
  for (const field of requiredFields) {
    if (!tool[field]) {
      addUnique(errors, `Tool ${tool.slug} is missing ${field}.`);
    }
  }

  if (!Array.isArray(tool.sectors) || !tool.sectors.length) {
    addUnique(errors, `Tool ${tool.slug} needs at least one sector.`);
  }

  if (!Array.isArray(tool.tags)) {
    addUnique(errors, `Tool ${tool.slug} needs tags array.`);
  }

  if (tool.scope && !["business", "transverse"].includes(tool.scope)) {
    addUnique(errors, `Tool ${tool.slug} has invalid scope: ${tool.scope}`);
  }

  if (!tool.scope) {
    addUnique(warnings, `Tool ${tool.slug} has no scope.`);
  }

  if (tool.status !== "hidden" && tool.status !== "deprecated") {
    activeToolSlugs.add(tool.slug);
  }
}

const enterpriseSlugs = new Set();
const onlyTransverseSystems = [];
const onlyTransverseSystemsCoveredByFallback = [];

function hasSectorFallbackCoverage(sectorLabel) {
  const sector = sectorTaxonomyByLabel.get(sectorLabel);

  if (!sector) {
    return false;
  }

  if (sector.fallbackMode === "exact") {
    const exactFallback = exactFallbacksByToolSector[sector.toolSectorLabel ?? ""];
    return Array.isArray(exactFallback) && exactFallback.length > 0;
  }

  const genericFallback = genericFallbacksByPublicSector[sector.publicLabel];
  return Array.isArray(genericFallback) && genericFallback.length > 0;
}

for (const enterprise of enterprisePayload.enterprises) {
  if (!enterprise.slug) {
    addUnique(errors, `Enterprise without slug: ${enterprise.name ?? "<unknown>"}`);
    continue;
  }

  if (enterpriseSlugs.has(enterprise.slug)) {
    addUnique(errors, `Duplicate enterprise slug: ${enterprise.slug}`);
  }

  enterpriseSlugs.add(enterprise.slug);

  const refs = Array.isArray(enterprise.toolRefs) ? enterprise.toolRefs : [];
  if (!refs.length) {
    addUnique(errors, `Enterprise ${enterprise.slug} has no toolRefs.`);
    continue;
  }

  let businessCount = 0;

  for (const ref of refs) {
    if (!ref.slug) {
      addUnique(errors, `Enterprise ${enterprise.slug} has a toolRef without slug.`);
      continue;
    }

    if (ref.scope && !["business", "transverse"].includes(ref.scope)) {
      addUnique(errors, `Enterprise ${enterprise.slug} toolRef ${ref.slug} has invalid scope: ${ref.scope}`);
    }

    if (!toolSlugs.has(ref.slug)) {
      addUnique(errors, `Enterprise ${enterprise.slug} references unknown tool ${ref.slug}.`);
      continue;
    }

    if (!activeToolSlugs.has(ref.slug)) {
      addUnique(errors, `Enterprise ${enterprise.slug} references inactive tool ${ref.slug}.`);
      continue;
    }

    const tool = toolPayload.tools.find((item) => item.slug === ref.slug);
    if (resolveToolScope(tool, ref) !== "transverse") {
      businessCount += 1;
    }
  }

  if (businessCount === 0) {
    const label = `${enterprise.slug} (${enterprise.name})`;

    if (hasSectorFallbackCoverage(enterprise.sectorLabel)) {
      onlyTransverseSystemsCoveredByFallback.push(label);
    } else {
      onlyTransverseSystems.push(label);
    }
  }
}

for (const slug of onlyTransverseSystems) {
  addUnique(warnings, `System has only transverse tools: ${slug}`);
}

for (const [toolSectorLabel, fallbackSlugs] of Object.entries(exactFallbacksByToolSector)) {
  if (!sectorTaxonomyByToolSectorLabel.has(toolSectorLabel)) {
    addUnique(
      errors,
      `Exact fallback sector "${toolSectorLabel}" does not exist in sector taxonomy.`,
    );
  }

  if (!Array.isArray(fallbackSlugs) || !fallbackSlugs.length) {
    addUnique(errors, `Exact fallback sector "${toolSectorLabel}" must declare at least one tool.`);
    continue;
  }

  for (const fallbackSlug of fallbackSlugs) {
    if (!activeToolSlugs.has(fallbackSlug)) {
      addUnique(
        errors,
        `Exact fallback sector "${toolSectorLabel}" references unknown or inactive tool "${fallbackSlug}".`,
      );
    }
  }
}

for (const [publicSectorLabel, fallbackSlugs] of Object.entries(genericFallbacksByPublicSector)) {
  const sector = sectorTaxonomyByLabel.get(publicSectorLabel);

  if (!sector) {
    addUnique(
      errors,
      `Generic fallback sector "${publicSectorLabel}" does not exist in sector taxonomy.`,
    );
  } else if (sector.fallbackMode !== "generic") {
    addUnique(
      errors,
      `Generic fallback sector "${publicSectorLabel}" is not marked as generic in sector taxonomy.`,
    );
  }

  if (!Array.isArray(fallbackSlugs) || !fallbackSlugs.length) {
    addUnique(
      errors,
      `Generic fallback sector "${publicSectorLabel}" must declare at least one tool.`,
    );
    continue;
  }

  for (const fallbackSlug of fallbackSlugs) {
    if (!activeToolSlugs.has(fallbackSlug)) {
      addUnique(
        errors,
        `Generic fallback sector "${publicSectorLabel}" references unknown or inactive tool "${fallbackSlug}".`,
      );
    }
  }
}

for (const [systemSlug, fallbackSlugs] of Object.entries(manualFallbacksBySystem)) {
  if (!enterpriseSlugs.has(systemSlug)) {
    addUnique(errors, `Manual fallback system "${systemSlug}" does not exist in enterprise annuaire.`);
  }

  if (!Array.isArray(fallbackSlugs) || !fallbackSlugs.length) {
    addUnique(errors, `Manual fallback system "${systemSlug}" must declare at least one tool.`);
    continue;
  }

  for (const fallbackSlug of fallbackSlugs) {
    if (!activeToolSlugs.has(fallbackSlug)) {
      addUnique(
        errors,
        `Manual fallback system "${systemSlug}" references unknown or inactive tool "${fallbackSlug}".`,
      );
    }
  }
}

const result = {
  tools: toolPayload.tools.length,
  activeTools: activeToolSlugs.size,
  enterprises: enterprisePayload.enterprises.length,
  transverseOnlySystemsCoveredByFallback: onlyTransverseSystemsCoveredByFallback.length,
  transverseOnlySystemsWithoutFallback: onlyTransverseSystems.length,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
