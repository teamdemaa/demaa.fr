import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(currentDir, "../src/lib/enterprise-annuaire.json");
const baseUrl = (process.env.DEMAA_AUDIT_BASE_URL ?? "http://127.0.0.1:3001").replace(/\/$/, "");
const concurrency = Number.parseInt(process.env.DEMAA_AUDIT_CONCURRENCY ?? "8", 10);
const timeoutMs = Number.parseInt(process.env.DEMAA_AUDIT_TIMEOUT_MS ?? "30000", 10);
const enterprises = JSON.parse(fs.readFileSync(catalogPath, "utf8")).enterprises;

const forbiddenUi = [
  "Recevoir gratuitement mon tableau de pilotage",
  "Recevoir les documents",
  "Documents et process",
  "Accéder aux téléchargements",
  "Aperçu du document",
  "Diagnostic organisation",
  "Système opérationnel",
];

const downloadCta = "Tableau de suivi opérationnel";

async function fetchPage(path, redirect = "follow") {
  return fetch(`${baseUrl}${path}`, {
    redirect,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": "Demaa operational kit audit" },
  });
}

async function inspectEnterprise(enterprise) {
  const slug = encodeURIComponent(enterprise.slug);
  const canonicalPath = `/kit-operationnel/${slug}`;
  const errors = [];

  try {
    const overviewResponse = await fetchPage(canonicalPath);
    const overviewHtml = await overviewResponse.text();
    const renderedOverviewHtml = overviewHtml
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    if (overviewResponse.status !== 200) errors.push(`canonical HTTP ${overviewResponse.status}`);
    if (!overviewHtml.includes(`<link rel="canonical" href="https://demaa.fr${canonicalPath}"/>`)) {
      errors.push("canonical link missing or incorrect");
    }
    if (!overviewHtml.includes("Kit opérationnel")) errors.push("SEO title missing");
    const overviewDownloadCtaCount = renderedOverviewHtml.split(downloadCta).length - 1;
    if (overviewDownloadCtaCount !== 1) {
      errors.push(`expected one top download CTA, found ${overviewDownloadCtaCount}`);
    }

    for (const value of forbiddenUi) {
      if (renderedOverviewHtml.includes(value)) errors.push(`legacy UI still visible: ${value}`);
    }
    if (!/<p[^>]*>\s*\d+ process\s*<\/p>/.test(renderedOverviewHtml)) {
      errors.push("process count missing");
    }
    if (!overviewHtml.includes('class="demaa-accordion')) {
      errors.push("process accordions missing");
    }

    const redirects = [
      {
        from: `/systemes/${slug}?tab=outils`,
        to: `${canonicalPath}?tab=outils`,
        label: "systemes",
      },
      {
        from: `/kit-systeme/${slug}`,
        to: canonicalPath,
        label: "kit-systeme",
      },
      {
        from: `/modeles-de-documents/tableau-de-pilotage-${slug}`,
        to: canonicalPath,
        label: "tableau-de-pilotage",
      },
    ];

    for (const redirect of redirects) {
      const legacyResponse = await fetchPage(redirect.from, "manual");
      const location = legacyResponse.headers.get("location");

      if (legacyResponse.status !== 308) {
        errors.push(`${redirect.label} redirect HTTP ${legacyResponse.status}`);
      }
      if (location !== redirect.to) {
        errors.push(`${redirect.label} redirect target ${location ?? "missing"}`);
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return { slug: enterprise.slug, errors };
}

async function runPool(items) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await inspectEnterprise(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, () => worker()),
  );

  return results;
}

const results = await runPool(enterprises);
const failures = results.filter((result) => result.errors.length);

console.log(
  JSON.stringify(
    {
      kits: enterprises.length,
      canonicalPagesChecked: enterprises.length,
      redirectsChecked: enterprises.length * 3,
      failureCount: failures.length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) process.exitCode = 1;
