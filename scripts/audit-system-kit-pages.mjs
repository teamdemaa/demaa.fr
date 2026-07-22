import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const enterpriseCatalogPath = resolve(currentDir, "../src/lib/enterprise-annuaire.json");
const toolDirectoryPath = resolve(currentDir, "../src/lib/tool-directory.json");
const baseUrl = (process.env.DEMAA_AUDIT_BASE_URL ?? "http://127.0.0.1:3001").replace(/\/$/, "");
const concurrency = Number.parseInt(process.env.DEMAA_AUDIT_CONCURRENCY ?? "8", 10);
const requestTimeoutMs = Number.parseInt(process.env.DEMAA_AUDIT_TIMEOUT_MS ?? "60000", 10);
const retryCount = Number.parseInt(process.env.DEMAA_AUDIT_RETRIES ?? "2", 10);

const tabs = ["process", "outils", "accompagnement"];
const toolsBySlug = new Map(
  JSON.parse(fs.readFileSync(toolDirectoryPath, "utf8")).tools.map((tool) => [tool.slug, tool]),
);

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

function inspectPage({ enterprise, response, html, tab }) {
  const errors = [];
  const renderedHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  if (!response.ok) errors.push(`HTTP ${response.status}`);
  if (!response.headers.get("content-type")?.includes("text/html")) {
    errors.push("response is not HTML");
  }
  if (!renderedHtml.includes("<h1")) errors.push("missing main heading");

  for (const forbiddenText of [
    "Cette page n'existe pas",
    "Page introuvable",
    "Internal Server Error",
    "Application error",
  ]) {
    if (renderedHtml.includes(forbiddenText)) {
      errors.push(`forbidden page state: ${forbiddenText}`);
    }
  }

  for (const expectedTab of ["Process", "Outils", "Accompagnement"]) {
    if (!renderedHtml.includes(`>${expectedTab}</button>`)) {
      errors.push(`missing direct tab: ${expectedTab}`);
    }
  }

  const controlledPanelCount = countOccurrences(
    renderedHtml,
    'aria-controls="kit-content-panel"',
  );
  if (controlledPanelCount !== 3) {
    errors.push(`expected three tab controls for the shared panel, found ${controlledPanelCount}`);
  }
  if (!renderedHtml.includes('id="kit-content-panel"')) {
    errors.push("shared tab panel is missing");
  }

  const ctaCount = countOccurrences(
    renderedHtml,
    "Recevoir mon tableau de suivi",
  );
  if (ctaCount !== 1) {
    errors.push(`expected one top download CTA, found ${ctaCount}`);
  }

  for (const removedIntro of [
    "Recevoir gratuitement mon tableau de pilotage",
    "Un seul Google Sheet : synthèse, prévisionnel, actions, équipe, écosystème",
    "Les outils métier à regarder en priorité",
    "Une sélection courte, spécifique à votre activité",
    "Vous aider à mettre le tableau en place",
    "Le tableau est gratuit. Ces prestations sont là",
  ]) {
    if (renderedHtml.includes(removedIntro)) {
      errors.push(`removed intro is still visible: ${removedIntro}`);
    }
  }

  if (tab === "process") {
    if (!/<p[^>]*>\s*\d+ process\s*<\/p>/.test(renderedHtml)) {
      errors.push("missing process count");
    }
    if (renderedHtml.includes("Aperçu du document")) {
      errors.push("legacy document preview is still visible");
    }
    if (renderedHtml.includes("Recevoir le kit opérationnel")) {
      errors.push("legacy process download CTA is still visible");
    }
  }

  if (tab === "outils") {
    const toolCardCount = countOccurrences(renderedHtml, "demaa-card group");
    if (toolCardCount > 5) {
      errors.push(`${toolCardCount} tool cards visible; maximum is 5`);
    }
    const visibleToolSlugs = Array.from(
      renderedHtml.matchAll(/href="\/annuaire-outils\/([^"?]+)"/g),
      (match) => decodeURIComponent(match[1]),
    );
    const toolRefsBySlug = new Map(
      (enterprise.toolRefs ?? []).map((toolRef) => [toolRef.slug, toolRef]),
    );
    for (const toolSlug of new Set(visibleToolSlugs)) {
      const effectiveScope =
        toolRefsBySlug.get(toolSlug)?.scope ?? toolsBySlug.get(toolSlug)?.scope;

      if (effectiveScope === "transverse") {
        errors.push(`transverse tool visible in kit selection: ${toolSlug}`);
      }
    }
    if (renderedHtml.includes("Voir plus")) {
      errors.push("legacy tool expansion remains visible");
    }
  }

  if (tab === "accompagnement") {
    for (const expectedText of [
      "Structuration &amp; pilotage",
      "980 € HT",
      "Réserver ma session de cadrage offerte",
    ]) {
      if (!renderedHtml.includes(expectedText)) {
        errors.push(`missing offer text: ${expectedText}`);
      }
    }

    if (!renderedHtml.includes(
      'href="/annuaire-services/organisation?booking=1&amp;source=',
    )) {
      errors.push("structuration CTA does not open the booking form");
    }

    const accountingExpected = enterprise.slug !== "cabinet-comptable";
    const hasAccounting = renderedHtml.includes("Expertise comptable");
    if (hasAccounting !== accountingExpected) {
      errors.push(
        accountingExpected
          ? "accounting offer is missing"
          : "accounting offer should be hidden for cabinet-comptable",
      );
    }

    if (accountingExpected) {
      for (const expectedText of [
        "À partir de 250 € HT",
        "Demander un rendez-vous",
        "cabinet inscrit à l’Ordre des",
      ]) {
        if (!renderedHtml.includes(expectedText)) {
          errors.push(`missing accounting text: ${expectedText}`);
        }
      }
    }

    for (const removedOffer of [
      "Création de société",
      "Modification de société",
      "Fermeture de société",
      "Trouver un comptable",
    ]) {
      if (renderedHtml.includes(removedOffer)) {
        errors.push(`removed offer still visible: ${removedOffer}`);
      }
    }
  }

  return { errors };
}

async function inspectState(enterprise, tab) {
  const url = `${baseUrl}/kit-operationnel/${encodeURIComponent(enterprise.slug)}?tab=${tab}`;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(requestTimeoutMs),
        headers: { "user-agent": "Demaa system kit audit" },
      });
      const html = await response.text();
      return {
        slug: enterprise.slug,
        tab,
        url,
        status: response.status,
        attempts: attempt + 1,
        ...inspectPage({ enterprise, response, html, tab }),
      };
    } catch (error) {
      if (attempt === retryCount) {
        return {
          slug: enterprise.slug,
          tab,
          url,
          status: null,
          attempts: attempt + 1,
          errors: [error instanceof Error ? error.message : String(error)],
        };
      }
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

console.log(JSON.stringify({
  baseUrl,
  kits: enterprises.length,
  tabsPerKit: tabs.length,
  statesChecked: results.length,
  failureCount: failures.length,
  failures: failures.slice(0, 100),
  failuresTruncated: failures.length > 100,
}, null, 2));

if (failures.length) {
  process.exitCode = 1;
}
