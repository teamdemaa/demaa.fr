import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const enterpriseCatalogPath = resolve(currentDir, "../src/lib/enterprise-annuaire.json");
const familySelectionsPath = resolve(
  currentDir,
  "../src/lib/family-solution-selections.generated.json",
);

const PILOT_SOLUTION_ORDERS = new Map([
  [
    "batiment",
    [
      "obat",
      "costructor",
      "progbat",
      "vertuoza",
      "point-p",
      "plateforme-du-batiment",
      "kiloutou",
      "wurth",
      "capeb",
    ],
  ],
  [
    "cabinet-comptable",
    [
      "pennylane",
      "tiimora",
      "silae",
      "ordre-experts-comptables",
      "croec-regional",
    ],
  ],
  [
    "agence-marketing",
    ["airtable", "canva", "brevo", "metricool", "chatgpt"],
  ],
]);

const EXPECTED_RESOURCE_TITLES = [
  "Tableau de pilotage opérationnel",
  "Suivi et prévisionnel financier",
  "CRM - suivi commercial",
  "La facturation électronique",
  "Maîtriser les obligations et les finances de son entreprise",
];

const PRIVATE_SOLUTION_MARKERS = [
  "commercialRelationship",
  "publicationBlockers",
  "evidenceUrls",
  "catalogDestination",
  "checkedAt",
  "expiresAt",
  "paid_referral",
  "commercial_partner",
  "affiliate",
];
const FORBIDDEN_SOLUTION_RELATIONSHIP =
  /Demaa|ODEMA|partenair|affili|rémunér/iu;

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

export function loadEnterprises() {
  const payload = readJson(enterpriseCatalogPath);

  if (!Array.isArray(payload?.enterprises)) {
    throw new Error("Invalid enterprise catalog");
  }

  return payload.enterprises;
}

export function buildExpectedSolutionOrders() {
  const manifest = readJson(familySelectionsPath);
  if (!Array.isArray(manifest?.systems)) {
    throw new Error("Invalid family Solution selection manifest");
  }

  const orders = new Map(
    manifest.systems.map((system) => [
      system.systemSlug,
      ["software", "providers", "networks"].flatMap((section) =>
        system.placements
          .filter((placement) => {
            if (placement.editorialStatus !== "selected") return false;
            if (placement.resourceSlug === "levier") return false;
            if (section === "networks") return placement.resourceType === "directory";
            if (section === "providers") {
              return placement.section === "providers" && placement.resourceType === "provider";
            }
            return placement.section === section;
          })
          .sort((left, right) => left.rank - right.rank)
          .map((placement) => placement.resourceSlug),
      ),
    ]),
  );

  for (const [systemSlug, order] of PILOT_SOLUTION_ORDERS) {
    orders.set(systemSlug, [...order]);
  }
  return orders;
}

function countOccurrences(source, value) {
  return source.split(value).length - 1;
}

export function getTabs() {
  return ["process", "solutions", "resources"];
}

export function getExpectedCallTexts(tab) {
  if (tab === "resources") return [];
  return tab === "solutions"
    ? [
        "Besoin d’aide pour identifier la bonne solution ?",
        "Échanger 30 minutes",
      ]
    : [
        "Besoin de prendre du recul sur votre organisation ?",
        "Réserver mon échange offert",
      ];
}

export function collectSerializedSolutionSlugs(html) {
  return Array.from(
    html.matchAll(/resourceSlug\\?"\s*:\s*\\?"([^"\\]+)\\?"/g),
    (match) => match[1],
  );
}

export function getSerializedSolutionPayload(html) {
  const start = html.indexOf("solutionSections");
  if (start < 0) return "";
  const rscPropEnd = html.indexOf(']},\\"$', start);
  if (rscPropEnd >= 0) return html.slice(start, rscPropEnd + 2);

  const scriptEnd = html.indexOf("</script>", start);
  return html.slice(start, scriptEnd < 0 ? undefined : scriptEnd);
}

function sameOrder(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

export function inspectPage({ response, html, tab, expectedSolutionOrder }) {
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

  for (const expectedTab of ["Process", "Solutions", "Ressources"]) {
    if (!renderedHtml.includes(`>${expectedTab}</button>`)) {
      errors.push(`missing direct tab: ${expectedTab}`);
    }
  }
  for (const removedTab of ["Outils", "Écosystème"]) {
    if (renderedHtml.includes(`>${removedTab}</button>`)) {
      errors.push(`legacy direct tab still visible: ${removedTab}`);
    }
  }

  const controlledPanelCount = countOccurrences(
    renderedHtml,
    'aria-controls="kit-content-panel"',
  );
  if (controlledPanelCount !== 3) {
    errors.push(
      `expected 3 tab controls for the shared panel, found ${controlledPanelCount}`,
    );
  }
  if (!renderedHtml.includes('id="kit-content-panel"')) {
    errors.push("shared tab panel is missing");
  }
  if (
    !new RegExp(
      `id="tab-${tab}"[^>]*aria-selected="true"|aria-selected="true"[^>]*id="tab-${tab}"`,
    ).test(renderedHtml)
  ) {
    errors.push(`${tab} tab is not selected`);
  }

  for (const callText of getExpectedCallTexts(tab)) {
    if (!renderedHtml.includes(callText)) {
      errors.push(`missing ${tab} call control: ${callText}`);
    }
  }
  for (const removedCallText of [
    "Voir le système",
    "Un appel gratuit de 30 minutes",
    "Réserver mon appel gratuit",
    "Diagnostic offert",
    "Demander mon diagnostic",
  ]) {
    if (renderedHtml.includes(removedCallText)) {
      errors.push(`removed call control still visible: ${removedCallText}`);
    }
  }

  for (const removedAcademyText of [
    "Académie Demaa",
    "Comprendre les indicateurs de ce système",
    "Lire la fiche",
  ]) {
    if (renderedHtml.includes(removedAcademyText)) {
      errors.push(`removed Academy block still visible: ${removedAcademyText}`);
    }
  }

  for (const legacyPromise of [
    "Ouvrir gratuitement le tableau",
    "Réserver ma session de cadrage offerte",
    "1 500 € HT",
    "Démonstration en lecture seule · Version modifiable après paiement",
    "Obtenir le système — 49 €",
    "Démonstration en lecture seule · Tableau prêt à utiliser après paiement",
    "Modèle disponible dans le système",
  ]) {
    if (renderedHtml.includes(legacyPromise)) {
      errors.push(`legacy promise is still visible: ${legacyPromise}`);
    }
  }

  for (const privateMarker of PRIVATE_SOLUTION_MARKERS) {
    if (html.includes(privateMarker)) {
      errors.push(`private Solution metadata leaked: ${privateMarker}`);
    }
  }
  for (const privateAssetMarker of ["/copy", "\\/copy", "%2Fcopy", ".xlsx"] ) {
    if (html.includes(privateAssetMarker)) {
      errors.push(`private delivery asset leaked: ${privateAssetMarker}`);
    }
  }

  if (renderedHtml.includes("Écosystème")) {
    errors.push("legacy Écosystème wording is still visible");
  }

  if (tab === "process") {
    if (renderedHtml.includes('aria-expanded="true"')) {
      errors.push("a Process routine is expanded by default");
    }
    if (
      renderedHtml.includes("Routines essentielles") ||
      renderedHtml.includes(
        "Les rendez-vous opérationnels à installer pour piloter l’activité",
      )
    ) {
      errors.push("removed Process introduction is still visible");
    }
    const routineControlCount = countOccurrences(
      renderedHtml,
      'aria-controls="system-routine-detail-',
    );
    if (routineControlCount < 8 || routineControlCount > 12) {
      errors.push(
        `expected 8 to 12 Process routines, found ${routineControlCount}`,
      );
    }
    const cadenceCount = countOccurrences(
      renderedHtml,
      "data-process-cadence",
    );
    if (cadenceCount !== routineControlCount) {
      errors.push(
        `expected one cadence per Process routine, found ${cadenceCount} for ${routineControlCount}`,
      );
    }
    if (renderedHtml.includes("Une fois, puis à revoir si besoin")) {
      errors.push("setup recurrence leaked into a public Process cadence");
    }
    if (renderedHtml.includes("system-process-panel-")) {
      errors.push("legacy Process family accordion is still rendered");
    }
    if (renderedHtml.includes("Dans le système")) {
      errors.push("unsupported Process asset is exposed");
    }
    if (renderedHtml.includes("data-solution-resource-card")) {
      errors.push("Solution cards leaked into Process");
    }
    if (renderedHtml.includes("data-system-resource-card")) {
      errors.push("Resource cards leaked into Process");
    }
    if (collectSerializedSolutionSlugs(renderedHtml).length > 0) {
      errors.push("serialized Solution payload leaked into visible Process markup");
    }
  }

  let solutionCardCount = 0;
  let solutionSlugs = [];
  let resourceCardCount = 0;
  if (tab === "solutions") {
    solutionCardCount = countOccurrences(
      renderedHtml,
      "data-solution-resource-card",
    );
    solutionSlugs = collectSerializedSolutionSlugs(html);

    if (solutionCardCount !== expectedSolutionOrder.length) {
      errors.push(
        `expected ${expectedSolutionOrder.length} Solution cards, found ${solutionCardCount}`,
      );
    }
    if (!sameOrder(solutionSlugs, expectedSolutionOrder)) {
      errors.push(
        `Solution order mismatch: ${solutionSlugs.join(",")} != ${expectedSolutionOrder.join(",")}`,
      );
    }

    const hasLevierCard = renderedHtml.includes('aria-label="Ouvrir Levier"');
    if (solutionSlugs.includes("levier") || hasLevierCard) {
      errors.push("legacy Levier resource leaked into Solutions");
    }
    if (renderedHtml.includes("data-system-resource-card")) {
      errors.push("Resource cards leaked into Solutions");
    }

    const payload = getSerializedSolutionPayload(html);
    if (!payload) {
      errors.push("serialized Solution payload is missing");
    } else if (FORBIDDEN_SOLUTION_RELATIONSHIP.test(payload)) {
      errors.push("forbidden Demaa/ODEMA/partner claim in Solution payload");
    }
  }

  if (tab === "resources") {
    resourceCardCount = countOccurrences(
      renderedHtml,
      "data-system-resource-card",
    );

    if (resourceCardCount !== EXPECTED_RESOURCE_TITLES.length) {
      errors.push(
        `expected ${EXPECTED_RESOURCE_TITLES.length} Resource cards, found ${resourceCardCount}`,
      );
    }
    for (const resourceTitle of EXPECTED_RESOURCE_TITLES) {
      if (!renderedHtml.includes(`aria-label="Ouvrir ${resourceTitle}"`)) {
        errors.push(`missing Resource card: ${resourceTitle}`);
      }
    }
    if (renderedHtml.includes("data-solution-resource-card")) {
      errors.push("Solution cards leaked into Resources");
    }
    for (const callText of [
      ...getExpectedCallTexts("process"),
      ...getExpectedCallTexts("solutions"),
    ]) {
      if (renderedHtml.includes(callText)) {
        errors.push(`custom offer leaked into Resources: ${callText}`);
      }
    }
  }

  return { errors, resourceCardCount, solutionCardCount, solutionSlugs };
}

async function inspectState({ baseUrl, enterprise, expectedSolutionOrder, request, tab }) {
  const url = `${baseUrl}/kit-operationnel/${encodeURIComponent(enterprise.slug)}?tab=${tab}`;

  for (let attempt = 0; attempt <= request.retryCount; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(request.timeoutMs),
        headers: { "user-agent": "Demaa system kit audit" },
      });
      const html = await response.text();
      return {
        slug: enterprise.slug,
        tab,
        url,
        status: response.status,
        attempts: attempt + 1,
        ...inspectPage({ response, html, tab, expectedSolutionOrder }),
      };
    } catch (error) {
      if (attempt === request.retryCount) {
        return {
          slug: enterprise.slug,
          tab,
          url,
          status: null,
          attempts: attempt + 1,
          errors: [error instanceof Error ? error.message : String(error)],
          resourceCardCount: 0,
          solutionCardCount: 0,
          solutionSlugs: [],
        };
      }
    }
  }
}

async function runPool(tasks, concurrency) {
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await inspectState(tasks[currentIndex]);
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

export async function runAudit(options = {}) {
  const baseUrl = (options.baseUrl ?? process.env.DEMAA_AUDIT_BASE_URL ?? "http://127.0.0.1:3001")
    .replace(/\/$/, "");
  const concurrency = options.concurrency ?? Number.parseInt(
    process.env.DEMAA_AUDIT_CONCURRENCY ?? "8",
    10,
  );
  const timeoutMs = options.timeoutMs ?? Number.parseInt(
    process.env.DEMAA_AUDIT_TIMEOUT_MS ?? "60000",
    10,
  );
  const retryCount = options.retryCount ?? Number.parseInt(
    process.env.DEMAA_AUDIT_RETRIES ?? "2",
    10,
  );
  const targetSlug = options.targetSlug ?? process.env.DEMAA_AUDIT_SLUG?.trim();
  const expectedOrders = buildExpectedSolutionOrders();
  const enterprises = loadEnterprises().filter(
    (enterprise) => !targetSlug || enterprise.slug === targetSlug,
  );

  if (targetSlug && enterprises.length !== 1) {
    throw new Error(`Unknown enterprise slug: ${targetSlug}`);
  }
  for (const enterprise of enterprises) {
    if (!expectedOrders.has(enterprise.slug)) {
      throw new Error(`Missing expected Solution order: ${enterprise.slug}`);
    }
  }

  const tasks = enterprises.flatMap((enterprise) =>
    getTabs().map((tab) => ({
      baseUrl,
      enterprise,
      expectedSolutionOrder: expectedOrders.get(enterprise.slug),
      request: { retryCount, timeoutMs },
      tab,
    })),
  );
  const results = await runPool(tasks, concurrency);
  const failures = results.filter((result) => result.errors.length);
  const solutionResults = results.filter((result) => result.tab === "solutions");
  const resourceResults = results.filter((result) => result.tab === "resources");

  return {
    baseUrl,
    kits: enterprises.length,
    tabsPerKit: getTabs().length,
    statesChecked: results.length,
    processStatus200: results.filter(
      (result) => result.tab === "process" && result.status === 200,
    ).length,
    solutionsStatus200: solutionResults.filter((result) => result.status === 200).length,
    resourcesStatus200: resourceResults.filter((result) => result.status === 200).length,
    solutionCards: solutionResults.reduce(
      (total, result) => total + result.solutionCardCount,
      0,
    ),
    resourceCards: resourceResults.reduce(
      (total, result) => total + result.resourceCardCount,
      0,
    ),
    failureCount: failures.length,
    failures: failures.slice(0, 100),
    failuresTruncated: failures.length > 100,
  };
}

async function main() {
  const report = await runAudit();
  console.log(JSON.stringify(report, null, 2));
  if (report.failureCount) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
