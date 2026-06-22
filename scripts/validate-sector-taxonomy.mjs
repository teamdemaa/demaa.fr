import enterpriseAnnuaire from "../src/lib/enterprise-annuaire.json" with { type: "json" };
import freeToolFallbacks from "../src/lib/free-tool-fallbacks.json" with { type: "json" };
import sectorTaxonomyPayload from "../src/lib/sector-taxonomy.json" with { type: "json" };
import toolDirectoryPayload from "../src/lib/tool-directory.json" with { type: "json" };
import fs from "node:fs";
import path from "node:path";

const sectorPagesSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/sector-pages.ts"),
  "utf8",
);

const sectorTaxonomy = sectorTaxonomyPayload.sectors;
const tools = toolDirectoryPayload.tools.filter(
  (tool) => tool.status !== "hidden" && tool.status !== "deprecated",
);
const activeToolSlugs = new Set(tools.map((tool) => tool.slug ?? tool.name));
const enterpriseBySlug = Object.fromEntries(
  enterpriseAnnuaire.enterprises.map((enterprise) => [enterprise.slug, enterprise]),
);
const taxonomyByLabel = Object.fromEntries(
  sectorTaxonomy.map((sector) => [sector.publicLabel, sector]),
);

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function collectDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return Array.from(duplicates);
}

function extractQuotedStrings(source) {
  return [...source.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function extractSectorPages(source) {
  const pages = [];
  const blockPattern =
    /createSectorPageDefinition\(\s*"([^"]+)"\s*,\s*{[\s\S]*?featuredSystemSlugs:\s*\[([\s\S]*?)\],\s*highlights:\s*\[([\s\S]*?)\],\s*}\s*\)/g;

  for (const match of source.matchAll(blockPattern)) {
    const [, label, featuredSystemSlugsSource, highlightsSource] = match;
    const toolHighlightMatch = highlightsSource.match(
      /{\s*label:\s*"Voir les outils utiles",\s*href:\s*getSectorToolDirectoryHref\("([^"]+)"\)\s*}/,
    );
    const taxonomyEntry = taxonomyByLabel[label];

    pages.push({
      slug: taxonomyEntry?.publicSlug ?? null,
      label,
      featuredSystemSlugs: extractQuotedStrings(featuredSystemSlugsSource),
      toolHighlightLabel: toolHighlightMatch?.[1] ?? null,
    });
  }

  return pages;
}

function validateFallbackToolSlugs(slugs, context, errors) {
  for (const slug of slugs) {
    if (!activeToolSlugs.has(slug)) {
      addUnique(errors, `${context} references unknown or inactive tool slug "${slug}".`);
    }
  }
}

const errors = [];
const warnings = [];
const sectorPages = extractSectorPages(sectorPagesSource);

for (const duplicate of collectDuplicates(sectorTaxonomy.map((sector) => sector.publicLabel))) {
  addUnique(errors, `Duplicate public sector label in taxonomy: ${duplicate}`);
}

for (const duplicate of collectDuplicates(sectorTaxonomy.map((sector) => sector.publicSlug))) {
  addUnique(errors, `Duplicate public sector slug in taxonomy: ${duplicate}`);
}

for (const duplicate of collectDuplicates(sectorTaxonomy.map((sector) => sector.seoSlug))) {
  addUnique(errors, `Duplicate SEO sector slug in taxonomy: ${duplicate}`);
}

for (const duplicate of collectDuplicates(sectorPages.map((page) => page.slug))) {
  addUnique(errors, `Duplicate sector page slug: ${duplicate}`);
}

for (const duplicate of collectDuplicates(sectorPages.map((page) => page.label))) {
  addUnique(errors, `Duplicate sector page label: ${duplicate}`);
}

for (const sector of sectorTaxonomy) {
  const page = sectorPages.find((entry) => entry.label === sector.publicLabel);

  if (!page) {
    addUnique(errors, `Missing sector page for taxonomy label "${sector.publicLabel}".`);
    continue;
  }

  if (page.slug !== sector.publicSlug) {
    addUnique(
      errors,
      `Sector page slug mismatch for "${sector.publicLabel}": expected "${sector.publicSlug}", got "${page.slug}".`,
    );
  }

  if (page.toolHighlightLabel !== sector.publicLabel) {
    addUnique(
      errors,
      `Sector page "Voir les outils utiles" mismatch for "${sector.publicLabel}".`,
    );
  }

  if (sector.fallbackMode === "exact") {
    if (!sector.toolSectorLabel) {
      addUnique(errors, `Exact sector "${sector.publicLabel}" is missing toolSectorLabel.`);
    }

    const exactFallback =
      freeToolFallbacks.exactSectorPriorityByToolSector[sector.toolSectorLabel ?? ""];

    if (!exactFallback?.length) {
      addUnique(
        errors,
        `Exact sector "${sector.publicLabel}" has no exact fallback priority entry for "${sector.toolSectorLabel}".`,
      );
    } else {
      validateFallbackToolSlugs(
        exactFallback,
        `Exact fallback for "${sector.publicLabel}"`,
        errors,
      );
    }

    const matchingTools = tools.filter((tool) =>
      tool.sectors.includes(sector.toolSectorLabel ?? ""),
    );
    if (!matchingTools.length) {
      addUnique(
        warnings,
        `Exact sector "${sector.publicLabel}" has no active tools tagged with "${sector.toolSectorLabel}".`,
      );
    }
  }

  if (sector.fallbackMode === "generic") {
    const genericFallback =
      freeToolFallbacks.genericFallbackPriorityByPublicSector[sector.publicLabel];

    if (!genericFallback?.length) {
      addUnique(errors, `Generic sector "${sector.publicLabel}" has no generic fallback entry.`);
    } else {
      validateFallbackToolSlugs(
        genericFallback,
        `Generic fallback for "${sector.publicLabel}"`,
        errors,
      );
    }
  }
}

for (const page of sectorPages) {
  if (!taxonomyByLabel[page.label]) {
    addUnique(errors, `Sector page "${page.label}" has no taxonomy entry.`);
  }

  for (const featuredSlug of page.featuredSystemSlugs) {
    const enterprise = enterpriseBySlug[featuredSlug];

    if (!enterprise) {
      addUnique(errors, `Sector page "${page.label}" references unknown featured system "${featuredSlug}".`);
      continue;
    }

    if (enterprise.sectorLabel !== page.label) {
      addUnique(
        errors,
        `Sector page "${page.label}" references featured system "${featuredSlug}" from sector "${enterprise.sectorLabel}".`,
      );
    }
  }
}

for (const enterprise of enterpriseAnnuaire.enterprises) {
  if (!taxonomyByLabel[enterprise.sectorLabel]) {
    addUnique(
      errors,
      `Enterprise "${enterprise.slug}" references unknown sector label "${enterprise.sectorLabel}".`,
    );
  }
}

const result = {
  sectorsInTaxonomy: sectorTaxonomy.length,
  sectorPages: sectorPages.length,
  enterprises: enterpriseAnnuaire.enterprises.length,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
