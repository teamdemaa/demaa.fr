import enterpriseAnnuaire from "../src/lib/enterprise-annuaire.json" with { type: "json" };
import fs from "node:fs";
import path from "node:path";

const sectorPagesSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/sector-pages.ts"),
  "utf8",
);
const contentRelationshipsSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/content-relationships.ts"),
  "utf8",
);
const courseContentSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/course-content.ts"),
  "utf8",
);
const documentModelsSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/document-models.ts"),
  "utf8",
);

function extractSectorPageFeaturedSystems(source) {
  const matches = [];
  const blockPattern =
    /createSectorPageDefinition\(\s*"([^"]+)"\s*,\s*{[\s\S]*?featuredSystemSlugs:\s*\[([\s\S]*?)\]/g;

  for (const match of source.matchAll(blockPattern)) {
    const [, sectorLabel, slugsSource] = match;
    matches.push({
      sectorLabel,
      systemSlugs: [...slugsSource.matchAll(/"([^"]+)"/g)].map((item) => item[1]),
    });
  }

  return matches;
}

function extractContentRelationships(source) {
  const relationships = new Map();
  const blockPattern = /"([^"]+)":\s*\[([\s\S]*?)\]/g;

  for (const match of source.matchAll(blockPattern)) {
    const [, contentSlug, slugsSource] = match;
    relationships.set(
      contentSlug,
      [...slugsSource.matchAll(/"([^"]+)"/g)].map((item) => item[1]),
    );
  }

  return relationships;
}

function extractSlugs(source) {
  return [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
}

const sectorPageFeaturedSystems = extractSectorPageFeaturedSystems(sectorPagesSource);
const contentRelationships = extractContentRelationships(contentRelationshipsSource);
const courseSlugs = new Set(extractSlugs(courseContentSource));
const documentModelSlugs = new Set(extractSlugs(documentModelsSource));

const systemScores = new Map(
  enterpriseAnnuaire.enterprises.map((enterprise) => [
    enterprise.slug,
    {
      slug: enterprise.slug,
      name: enterprise.name,
      sectorLabel: enterprise.sectorLabel,
      sectorHubFeaturedCount: 0,
      toolSectorFeaturedCount: 0,
      courseLinkCount: 0,
      documentModelLinkCount: 0,
    },
  ]),
);

for (const page of sectorPageFeaturedSystems) {
  for (const slug of page.systemSlugs) {
    const entry = systemScores.get(slug);

    if (!entry) {
      continue;
    }

    entry.sectorHubFeaturedCount += 1;
    entry.toolSectorFeaturedCount += 1;
  }
}

for (const [contentSlug, systemSlugs] of contentRelationships.entries()) {
  const isCourse = courseSlugs.has(contentSlug);
  const isDocumentModel = documentModelSlugs.has(contentSlug);

  for (const slug of systemSlugs) {
    const entry = systemScores.get(slug);

    if (!entry) {
      continue;
    }

    if (isCourse) {
      entry.courseLinkCount += 1;
    }

    if (isDocumentModel) {
      entry.documentModelLinkCount += 1;
    }
  }
}

const systems = Array.from(systemScores.values())
  .map((entry) => ({
    ...entry,
    totalInternalLinkSignals:
      entry.sectorHubFeaturedCount +
      entry.toolSectorFeaturedCount +
      entry.courseLinkCount +
      entry.documentModelLinkCount,
  }))
  .sort((a, b) => a.totalInternalLinkSignals - b.totalInternalLinkSignals || a.name.localeCompare(b.name, "fr"));

const summary = {
  totalSystems: systems.length,
  zeroSignalSystems: systems.filter((system) => system.totalInternalLinkSignals === 0).length,
  lowSignalSystems: systems.filter((system) => system.totalInternalLinkSignals > 0 && system.totalInternalLinkSignals <= 2).length,
  strongSignalSystems: systems.filter((system) => system.totalInternalLinkSignals >= 4).length,
};

console.log(
  JSON.stringify(
    {
      summary,
      weakest: systems.slice(0, 25),
    },
    null,
    2,
  ),
);
