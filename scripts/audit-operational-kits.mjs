import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(currentDir, "../src/lib/enterprise-annuaire.json");
const baseUrl = (process.env.DEMAA_AUDIT_BASE_URL ?? "http://127.0.0.1:3001").replace(/\/$/, "");
const concurrency = Number.parseInt(process.env.DEMAA_AUDIT_CONCURRENCY ?? "8", 10);
const timeoutMs = Number.parseInt(process.env.DEMAA_AUDIT_TIMEOUT_MS ?? "30000", 10);
const targetSlug = process.env.DEMAA_AUDIT_SLUG?.trim();
const enterprises = JSON.parse(fs.readFileSync(catalogPath, "utf8")).enterprises.filter(
  (enterprise) => !targetSlug || enterprise.slug === targetSlug,
);
if (targetSlug && enterprises.length !== 1) {
  throw new Error(`Unknown enterprise slug: ${targetSlug}`);
}
const forbiddenUi = [
  "Recevoir gratuitement mon tableau de pilotage",
  "Recevoir les documents",
  "Documents et process",
  "Accéder aux téléchargements",
  "Aperçu du document",
  "Diagnostic organisation",
  "Ouvrir gratuitement le tableau",
  "Réserver ma session offerte",
  "Démonstration en lecture seule · Version modifiable après paiement",
  "Obtenir le système — 49 €",
  "Démonstration en lecture seule · Tableau prêt à utiliser après paiement",
  "Modèle disponible dans le système",
];

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
    if (!overviewHtml.includes("Système opérationnel")) {
      errors.push("SEO title missing");
    }

    for (const expectedText of [
      "Voir le système",
      "Un appel gratuit de 30 minutes",
      "Réserver mon appel gratuit",
    ]) {
      if (!renderedOverviewHtml.includes(expectedText)) {
        errors.push(`system journey control missing: ${expectedText}`);
      }
    }
    for (const removedDiagnosticText of [
      "Diagnostic offert",
      "Demander mon diagnostic",
    ]) {
      if (renderedOverviewHtml.includes(removedDiagnosticText)) {
        errors.push(`removed diagnostic control still visible: ${removedDiagnosticText}`);
      }
    }

    for (const value of forbiddenUi) {
      if (renderedOverviewHtml.includes(value)) errors.push(`legacy UI still visible: ${value}`);
    }
    for (const serverOnlyCopyMarker of ["/copy", "\\/copy", "%2Fcopy"]) {
      if (overviewHtml.includes(serverOnlyCopyMarker)) {
        errors.push("editable Google Drive link leaked into the public HTML");
        break;
      }
    }
    if (
      renderedOverviewHtml.includes("Routines essentielles") ||
      renderedOverviewHtml.includes(
        "Les rendez-vous opérationnels à installer pour piloter l’activité",
      )
    ) {
      errors.push("removed Process introduction is still visible");
    }
    const routineControlCount =
      renderedOverviewHtml.split('aria-controls="system-routine-detail-').length - 1;
    if (routineControlCount < 8 || routineControlCount > 12) {
      errors.push(`expected 8 to 12 Process routines, found ${routineControlCount}`);
    }
    if (renderedOverviewHtml.includes("system-process-panel-")) {
      errors.push("legacy Process family accordion is still rendered");
    }
    if (renderedOverviewHtml.includes('aria-expanded="true"')) {
      errors.push("a Process routine is expanded by default");
    }
    if (
      renderedOverviewHtml.includes(
        "Dans le système",
      )
    ) {
      errors.push("collapsed process content is exposed by default");
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
