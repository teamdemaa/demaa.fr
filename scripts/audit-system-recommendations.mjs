import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import enterprisePayload from "../src/lib/enterprise-annuaire.json" with { type: "json" };
import toolPayload from "../src/lib/tool-directory.json" with { type: "json" };

const recommendationsSource = readFileSync(
  resolve("src/lib/system-tool-recommendations.ts"),
  "utf8",
);
const recommendationObjectMatch = recommendationsSource.match(
  /=\s*({[\s\S]*?})\s*;\s*\n\s*export function/,
);

if (!recommendationObjectMatch) {
  throw new Error("Impossible de lire la sélection des recommandations.");
}

const CURATED_TOOL_RECOMMENDATIONS_BY_SYSTEM = Function(
  `"use strict"; return (${recommendationObjectMatch[1]});`,
)();

const errors = [];
const warnings = [];
const MAX_RECOMMENDATIONS = 5;
const MAX_REVIEW_AGE_DAYS = 365;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const toolsBySlug = new Map(toolPayload.tools.map((tool) => [tool.slug, tool]));
const enterprisesBySlug = new Map(
  enterprisePayload.enterprises.map((enterprise) => [enterprise.slug, enterprise]),
);

for (const enterprise of enterprisePayload.enterprises) {
  const recommendations =
    enterprise.recommendedToolSlugs ??
    CURATED_TOOL_RECOMMENDATIONS_BY_SYSTEM[enterprise.slug];

  if (!recommendations) {
    errors.push(`${enterprise.slug}: aucune sélection explicite.`);
    continue;
  }

  if (recommendations.length > MAX_RECOMMENDATIONS) {
    errors.push(
      `${enterprise.slug}: ${recommendations.length} recommandations (maximum ${MAX_RECOMMENDATIONS}).`,
    );
  }

  if (new Set(recommendations).size !== recommendations.length) {
    errors.push(`${enterprise.slug}: une recommandation est présente plusieurs fois.`);
  }

  const refs = new Set((enterprise.toolRefs ?? []).map((ref) => ref.slug));
  const excludedToolSlugs = new Set(enterprise.excludedToolSlugs ?? []);

  for (const slug of recommendations) {
    if (excludedToolSlugs.has(slug)) {
      errors.push(`${enterprise.slug}: ${slug} est à la fois recommandé et exclu.`);
    }

    if (!refs.has(slug)) {
      errors.push(`${enterprise.slug}: ${slug} n’est pas rattaché à ce kit.`);
    }

    const tool = toolsBySlug.get(slug);

    if (!tool) {
      errors.push(`${enterprise.slug}: ${slug} est absent de l’annuaire outils.`);
      continue;
    }

    if (tool.status === "hidden" || tool.status === "deprecated") {
      errors.push(`${enterprise.slug}: ${slug} n’est pas un outil actif.`);
    }

    for (const field of ["url", "description", "bestFor", "pricingHint"]) {
      if (!tool[field]) {
        errors.push(`${enterprise.slug}: ${slug} n’a pas de champ ${field}.`);
      }
    }

    if (!Array.isArray(tool.sources) || tool.sources.length === 0) {
      errors.push(`${enterprise.slug}: ${slug} n’a aucune source éditoriale.`);
    } else {
      for (const source of tool.sources) {
        if (!source.startsWith("https://") && !source.startsWith("http://")) {
          errors.push(`${enterprise.slug}: ${slug} contient une source invalide (${source}).`);
        }
      }
    }

    if (!tool.lastReviewedAt) {
      errors.push(`${enterprise.slug}: ${slug} n’a pas de date de revue.`);
    } else {
      const reviewedAt = Date.parse(`${tool.lastReviewedAt}T00:00:00Z`);
      const reviewAgeInDays = (Date.now() - reviewedAt) / DAY_IN_MS;

      if (Number.isNaN(reviewedAt)) {
        errors.push(`${enterprise.slug}: ${slug} a une date de revue invalide.`);
      } else if (reviewAgeInDays < -1) {
        errors.push(`${enterprise.slug}: ${slug} a une date de revue située dans le futur.`);
      } else if (reviewAgeInDays > MAX_REVIEW_AGE_DAYS) {
        errors.push(`${enterprise.slug}: ${slug} n’a pas été revu depuis plus d’un an.`);
      }
    }

    if (!tool.url.startsWith("https://") && !tool.url.startsWith("http://")) {
      warnings.push(`${enterprise.slug}: ${slug} n’a pas de site éditeur externe.`);
    }
  }

  if (enterprise.visibility === "hidden") {
    errors.push(`${enterprise.slug}: le kit est encore masqué.`);
  }

  for (const slug of excludedToolSlugs) {
    if (refs.has(slug)) {
      errors.push(`${enterprise.slug}: ${slug} est à la fois rattaché et exclu.`);
    }
  }
}

for (const slug of Object.keys(CURATED_TOOL_RECOMMENDATIONS_BY_SYSTEM)) {
  if (!enterprisesBySlug.has(slug)) {
    errors.push(`${slug}: sélection orpheline sans kit correspondant.`);
  }
}

const intentionallyEmpty = enterprisePayload.enterprises
  .filter((enterprise) => {
    const recommendations =
      enterprise.recommendedToolSlugs ??
      CURATED_TOOL_RECOMMENDATIONS_BY_SYSTEM[enterprise.slug];

    return recommendations?.length === 0;
  })
  .map((enterprise) => enterprise.slug);

console.log(
  JSON.stringify(
    {
      summary: {
        kits: enterprisePayload.enterprises.length,
        selections: Object.keys(CURATED_TOOL_RECOMMENDATIONS_BY_SYSTEM).length,
        kitsWithoutRecommendation: intentionallyEmpty.length,
        hiddenKits: enterprisePayload.enterprises.filter(
          (enterprise) => enterprise.visibility === "hidden",
        ).length,
        errors: errors.length,
        warnings: warnings.length,
      },
      intentionallyEmpty,
      errors,
      warnings,
    },
    null,
    2,
  ),
);

if (errors.length > 0) {
  process.exitCode = 1;
}
