import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const enterpriseCatalogPath = resolve(currentDir, "../src/lib/enterprise-annuaire.json");
const baseUrl = (process.env.DEMAA_AUDIT_BASE_URL ?? "http://127.0.0.1:3001").replace(/\/$/, "");
const concurrency = Number.parseInt(process.env.DEMAA_AUDIT_CONCURRENCY ?? "8", 10);
const requestTimeoutMs = Number.parseInt(process.env.DEMAA_AUDIT_TIMEOUT_MS ?? "60000", 10);
const retryCount = Number.parseInt(process.env.DEMAA_AUDIT_RETRIES ?? "2", 10);

const tabs = [
  { slug: "process" },
  { slug: "outils" },
  { slug: "fournisseurs" },
  { slug: "financement" },
  { slug: "recrutement" },
  { slug: "formation" },
  { slug: "reseaux-pro" },
];

function loadEnterprises() {
  const payload = JSON.parse(fs.readFileSync(enterpriseCatalogPath, "utf8"));

  if (!Array.isArray(payload?.enterprises)) {
    throw new Error("Invalid enterprise catalog");
  }

  return payload.enterprises;
}

function countOccurrences(source, value) {
  return source.split(value).length - 1;
}

function inspectPage({ response, html, tab }) {
  const errors = [];
  const renderedHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const recommendationBadgeCount = countOccurrences(renderedHtml, ">Recommandé</span>");
  const visibleCardCount = countOccurrences(renderedHtml, "demaa-card group");

  if (!response.ok) {
    errors.push(`HTTP ${response.status}`);
  }

  if (!response.headers.get("content-type")?.includes("text/html")) {
    errors.push("response is not HTML");
  }

  if (!renderedHtml.includes("<h1")) {
    errors.push("missing main heading");
  }

  for (const forbiddenText of [
    "Cette page n'existe pas",
    "Page introuvable",
    "Structure en cours de préparation",
    "Internal Server Error",
    "Application error",
  ]) {
    if (renderedHtml.includes(forbiddenText)) {
      errors.push(`forbidden page state: ${forbiddenText}`);
    }
  }

  if (recommendationBadgeCount > 0) {
    errors.push(`${recommendationBadgeCount} recommendation badges still visible`);
  }

  if (tab.slug !== "process" && visibleCardCount > 3) {
    errors.push(`${visibleCardCount} recommendation cards visible before Voir plus`);
  }

  if (renderedHtml.includes("Ouvrir l’annuaire")) {
    errors.push("generic directory link still visible");
  }

  if (tab.slug === "recrutement") {
    if (!renderedHtml.includes("Solutions de recrutement")) {
      errors.push("missing unified recruitment section");
    }

    if (!renderedHtml.includes("Bravus Akademy")) {
      errors.push("Bravus Akademy is not visible");
    }

    if (/class="[^"]*text-\[11px\][^"]*"[^>]*>\s*Alternance\s*</i.test(renderedHtml)) {
      errors.push("standalone Alternance section still visible");
    }
  }

  if (tab.slug === "process") {
    if (!/<p[^>]*>\s*\d+ process\s*<\/p>/.test(renderedHtml)) {
      errors.push("missing process count");
    }
    if (!renderedHtml.includes("Recevoir le kit opérationnel")) {
      errors.push("missing single kit CTA");
    }
    if (renderedHtml.includes("Aperçu du document")) {
      errors.push("legacy document preview is still visible");
    }
  }

  return {
    errors,
    recommendationBadgeCount,
    visibleCardCount,
  };
}

async function inspectState(enterprise, tab) {
  const url = `${baseUrl}/kit-operationnel/${encodeURIComponent(enterprise.slug)}?tab=${encodeURIComponent(tab.slug)}`;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(requestTimeoutMs),
        headers: {
          "user-agent": "Demaa system kit audit",
        },
      });
      const html = await response.text();
      const inspection = inspectPage({ response, html, tab });

      return {
        slug: enterprise.slug,
        tab: tab.slug,
        url,
        status: response.status,
        attempts: attempt + 1,
        ...inspection,
      };
    } catch (error) {
      if (attempt === retryCount) {
        return {
          slug: enterprise.slug,
          tab: tab.slug,
          url,
          status: null,
          attempts: attempt + 1,
          recommendationBadgeCount: 0,
          errors: [error instanceof Error ? error.message : String(error)],
        };
      }

      await new Promise((resolveRetry) => setTimeout(resolveRetry, 250 * (attempt + 1)));
    }
  }
}

async function runPool(tasks) {
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const { enterprise, tab } = tasks[currentIndex];
      results[currentIndex] = await inspectState(enterprise, tab);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(concurrency, tasks.length)) },
      () => worker(),
    ),
  );

  return results;
}

const enterprises = loadEnterprises();
const tasks = enterprises.flatMap((enterprise) =>
  tabs.map((tab) => ({ enterprise, tab })),
);
const results = await runPool(tasks);
const failures = results.filter((result) => result.errors.length);
const recommendationBadgeCounts = results.reduce((counts, result) => {
  counts[result.tab] ??= {};
  counts[result.tab][result.recommendationBadgeCount] =
    (counts[result.tab][result.recommendationBadgeCount] ?? 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({
  baseUrl,
  kits: enterprises.length,
  tabsPerKit: tabs.length,
  statesChecked: results.length,
  recommendationBadgeCounts,
  failureCount: failures.length,
  failures: failures.slice(0, 100),
  failuresTruncated: failures.length > 100,
}, null, 2));

if (failures.length) {
  process.exitCode = 1;
}
