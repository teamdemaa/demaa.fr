import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "..");
const enterpriseAnnuairePath = resolve(rootDir, "src/lib/enterprise-annuaire.json");
const systemeCatalogPath = resolve(rootDir, "src/lib/systeme-catalog.ts");

const VISIBLE_PILLARS = new Set([
  "Direction",
  "Marketing et Vente",
  "Opérations",
  "Équipe",
  "Finance et Admin",
]);

const LEGACY_VISIBLE_LABELS = new Set([
  "Stratégie",
  "Marketing & Vente",
  "Finance & administration",
  "Finance & Juridique",
]);

const VISIBLE_PILLAR_ORDER = [
  "Direction",
  "Marketing et Vente",
  "Opérations",
  "Équipe",
  "Finance et Admin",
];

const PROCESS_CATEGORY_RULES = {
  "Direction": [
    { order: 0, patterns: [/savoir ou va|vision|objectifs?|positionnement/i] },
    { order: 1, patterns: [/decid|grille d[' ]autorite|arbitrage/i] },
    { order: 2, patterns: [/donner acces|acces|informations? critiques/i] },
    { order: 3, patterns: [/visibilite|pilotage|tableau de bord/i] },
  ],
  "Marketing et Vente": [
    { order: 0, patterns: [/developper|attirer|prospection|portefeuille|inscriptions?|recruter/i] },
    { order: 1, patterns: [/vendre|devis|offre|argumentaire|proposition commerciale|qualifier/i] },
    { order: 2, patterns: [/faire revenir|fidelis|avis|rendez-vous|suivi post/i] },
    { order: 3, patterns: [/reclamation|litige|retour client|signalement|incident client/i] },
  ],
  "Opérations": [
    { order: 0, patterns: [/ouvrir|ouverture|demarr|lancer|entrer un bien|constituer un dossier/i] },
    { order: 1, patterns: [/preparer|produire|execut|realiser|planifier|gerer|tenir/i] },
    { order: 2, patterns: [/control|suivre|verifier|mesurer|piloter|tracer/i] },
    { order: 3, patterns: [/alea|incident|imprevu|retard|panne|sinistre/i] },
    { order: 4, patterns: [/clotur|reception|restitut|livrer|signature|sortie/i] },
  ],
  "Équipe": [
    { order: 0, patterns: [/organiser|roles?|charge|planning|astreintes?/i] },
    { order: 1, patterns: [/remplacer|continuite|absence|astreinte/i] },
    { order: 2, patterns: [/integrer|nouvel|arrivant/i] },
    { order: 3, patterns: [/transmettre|passation|autonomie/i] },
  ],
  "Finance et Admin": [
    { order: 0, patterns: [/suivre|rentabilite|marge|tresorerie|cash-flow|performance/i] },
    { order: 1, patterns: [/se faire payer|encaisse|facturation|reglements?|reversements?/i] },
    { order: 2, patterns: [/payer a temps|payer|echeances/i] },
    { order: 3, patterns: [/conformite|justificatifs?|obligations?/i] },
  ],
};

const CRITICAL_EXPECTATIONS = [
  {
    slug: "batiment",
    checks: [
      { label: "se faire payer", pattern: /se faire payer|impay[ée]s?|acomptes|situations/i },
      { label: "traiter une réclamation", pattern: /réclamation|reclamation|litige/i },
      { label: "remplacer un absent", pattern: /absent|remplacement/i },
    ],
  },
  {
    slug: "cfa",
    checks: [
      { label: "traiter une réclamation", pattern: /réclamation|reclamation/i },
      { label: "remplacer un absent", pattern: /absent|remplacement/i },
      { label: "se faire payer", pattern: /se faire payer|financements|opco|relance/i },
    ],
  },
  {
    slug: "garage-automobile",
    checks: [
      { label: "traiter une réclamation", pattern: /réclamation|reclamation/i },
      { label: "remplacer un absent", pattern: /absent|remplacement|consignes/i },
      { label: "se faire payer", pattern: /se faire payer|facturation|relance/i },
    ],
  },
];

const QUALIOPI_ALLOWED_SLUGS = new Set(["cfa", "organisme-de-formation"]);

const APPRENTICESHIP_ONLY_PATTERNS = [
  /\bcfa\b/i,
  /apprenti|apprentissage/i,
  /mineurs?/i,
];

const SLUG_SPECIFIC_EXPECTATIONS = [
  {
    slug: "e-commerce",
    required: [/catalogue|boutique en ligne/i, /commande|exp[eé]dition/i, /retour|support|litige/i],
    forbidden: [/\bcaisse\b/i, /mise en rayon|rayon/i],
  },
  {
    slug: "marketplace",
    required: [/vendeur|vendeurs/i, /mod[eé]ration/i, /commande|retour|litige/i],
    forbidden: [/\bcaisse\b/i, /boutique/i],
  },
  {
    slug: "pressing",
    required: [/d[eé]p[oô]t/i, /traitement|contr[oô]le qualit[eé]/i, /restitution/i],
  },
  {
    slug: "laverie-automatique",
    required: [/machine/i, /paiement/i, /maintenance|panne/i],
  },
  {
    slug: "syndic",
    required: [/copro/i, /assembl/i, /fonds|impay[ée]s?/i],
  },
  {
    slug: "investissement-locatif",
    required: [/sourcing|opportunit[eé]s?/i, /rentabilit[eé]|rendement/i, /location|revente|arbitrage/i],
    forbidden: [/assembl/i, /copropri[eé]t/i],
  },
  {
    slug: "pharmacie",
    required: [/officine|comptoir/i, /ordonnance/i, /stock|rupture/i],
  },
];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function normalizeForMatch(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();
}

function getVisiblePillarIndexes(rows) {
  return rows
    .map((row) => row.pillar)
    .filter((pillar) => VISIBLE_PILLARS.has(pillar))
    .map((pillar) => VISIBLE_PILLAR_ORDER.indexOf(pillar));
}

function sortRows(rows) {
  return [...rows].sort((left, right) => {
    const leftPillarOrder = VISIBLE_PILLAR_ORDER.indexOf(left.pillar);
    const rightPillarOrder = VISIBLE_PILLAR_ORDER.indexOf(right.pillar);
    const normalizedLeftPillarOrder = leftPillarOrder === -1 ? Number.POSITIVE_INFINITY : leftPillarOrder;
    const normalizedRightPillarOrder = rightPillarOrder === -1 ? Number.POSITIVE_INFINITY : rightPillarOrder;

    if (normalizedLeftPillarOrder !== normalizedRightPillarOrder) {
      return normalizedLeftPillarOrder - normalizedRightPillarOrder;
    }

    if (left.pillar !== right.pillar) {
      return left.pillar.localeCompare(right.pillar, "fr");
    }

    const leftProcessOrder = getProcessOrder(left.pillar, left.process, left.document);
    const rightProcessOrder = getProcessOrder(right.pillar, right.process, right.document);

    if (leftProcessOrder !== rightProcessOrder) {
      return leftProcessOrder - rightProcessOrder;
    }

    return left.process.localeCompare(right.process, "fr");
  });
}

function extractTemplateRows(source) {
  const templates = new Map();
  const rowBlockRegex = /const\s+([A-Z0-9_]+_ROWS):\s*SystemeTemplateRow\[\]\s*=\s*\[(.*?)\n\];/gs;

  for (const match of source.matchAll(rowBlockRegex)) {
    const [, constName, block] = match;
    const rows = [];
    const rowRegex =
      /\{\s*pillar:\s*"([^"]+)",\s*process:\s*"([^"]+)",\s*document:\s*"([^"]+)"\s*\}/g;

    for (const rowMatch of block.matchAll(rowRegex)) {
      const [, pillar, process, document] = rowMatch;
      rows.push({ pillar, process, document });
    }

    templates.set(constName, rows);
  }

  return templates;
}

function extractSlugMappings(source, templatesByName) {
  const mappings = new Map();
  const templateRegex = /\{\s*slugs:\s*\[((?:.|\n)*?)\],\s*rows:\s*([A-Z0-9_]+_ROWS),\s*\}/g;

  for (const match of source.matchAll(templateRegex)) {
    const [, slugsBlock, rowConstName] = match;
    const rows = templatesByName.get(rowConstName) ?? [];
    const slugs = [...slugsBlock.matchAll(/"([a-z0-9-]+)"/g)].map((slugMatch) => slugMatch[1]);

    for (const slug of slugs) {
      mappings.set(slug, rows);
    }
  }

  return mappings;
}

function getProcessOrder(pillar, process, document) {
  const rules = PROCESS_CATEGORY_RULES[pillar];

  if (!rules) {
    return Number.POSITIVE_INFINITY;
  }

  const haystack = normalizeForMatch(`${process} || ${document}`);

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return rule.order;
    }
  }

  return Number.POSITIVE_INFINITY;
}

const enterprisePayload = readJson(enterpriseAnnuairePath);
const source = fs.readFileSync(systemeCatalogPath, "utf8");
const templatesByName = extractTemplateRows(source);
const rowsBySlug = extractSlugMappings(source, templatesByName);

const errors = [];
const warnings = [];
const enterprises = enterprisePayload.enterprises ?? [];

if (!Array.isArray(enterprises) || enterprises.length === 0) {
  throw new Error("Invalid enterprise-annuaire.json: expected non-empty enterprises array.");
}

for (const enterprise of enterprises) {
  const rows = rowsBySlug.get(enterprise.slug);

  if (!rows?.length) {
    addUnique(errors, `Systeme missing rows for ${enterprise.slug}.`);
    continue;
  }

  const sortedRows = sortRows(rows);

  const seen = new Set();
  const pillars = new Set();

  for (const row of rows) {
    if (!row.pillar || !row.process || !row.document) {
      addUnique(errors, `Systeme row incomplete for ${enterprise.slug}.`);
      continue;
    }

    if (LEGACY_VISIBLE_LABELS.has(row.pillar)) {
      addUnique(errors, `Systeme row for ${enterprise.slug} uses legacy pillar label "${row.pillar}".`);
    }

    pillars.add(row.pillar);

    const key = `${row.pillar}::${row.process}::${row.document}`;
    if (seen.has(key)) {
      addUnique(errors, `Systeme duplicate row for ${enterprise.slug}: ${key}`);
    }
    seen.add(key);
  }

  for (const requiredPillar of VISIBLE_PILLARS) {
    if (!pillars.has(requiredPillar)) {
      addUnique(warnings, `Systeme ${enterprise.slug} is missing visible pillar "${requiredPillar}".`);
    }
  }

  const visibleIndexes = getVisiblePillarIndexes(sortedRows);
  for (let index = 1; index < visibleIndexes.length; index += 1) {
    if (visibleIndexes[index] < visibleIndexes[index - 1]) {
      addUnique(errors, `Systeme ${enterprise.slug} breaks visible pillar order.`);
      break;
    }
  }

  for (const pillar of VISIBLE_PILLAR_ORDER) {
    const pillarRows = sortedRows.filter((row) => row.pillar === pillar);
    const knownOrders = pillarRows
      .map((row) => getProcessOrder(row.pillar, row.process, row.document))
      .filter((order) => Number.isFinite(order));

    for (let index = 1; index < knownOrders.length; index += 1) {
      if (knownOrders[index] < knownOrders[index - 1]) {
        addUnique(errors, `Systeme ${enterprise.slug} breaks process order for pillar "${pillar}".`);
        break;
      }
    }
  }

  const hasComplaintProcess = rows.some((row) =>
    /réclamation|reclamation|avis négatif|avis negatif|signalement/i.test(row.process),
  );
  if (!hasComplaintProcess) {
    addUnique(warnings, `Systeme ${enterprise.slug} has no complaint-handling process.`);
  }

  const hasContinuityProcess = rows.some((row) =>
    /absent|passation|polyvalence|remplacement/i.test(row.process) ||
    /absent|passation|polyvalence|remplacement/i.test(row.document),
  );
  if (!hasContinuityProcess) {
    addUnique(warnings, `Systeme ${enterprise.slug} has no continuity/replacement process.`);
  }

  const hasCashCollectionProcess = rows.some((row) =>
    /se faire payer|encaiss|impay[ée]s?|relance/i.test(row.process) ||
    /se faire payer|encaiss|impay[ée]s?|relance/i.test(row.document),
  );
  if (!hasCashCollectionProcess) {
    addUnique(warnings, `Systeme ${enterprise.slug} has no cash-collection process.`);
  }

  const mentionsQualiopi = rows.some((row) =>
    /qualiopi/i.test(row.pillar) || /qualiopi/i.test(row.process) || /qualiopi/i.test(row.document),
  );
  if (mentionsQualiopi && !QUALIOPI_ALLOWED_SLUGS.has(enterprise.slug)) {
    addUnique(errors, `Systeme ${enterprise.slug} mentions Qualiopi outside training-specific slugs.`);
  }

  const mentionsApprenticeshipSpecificTerms = rows.some((row) =>
    APPRENTICESHIP_ONLY_PATTERNS.some((pattern) => pattern.test(`${row.pillar} || ${row.process} || ${row.document}`)),
  );
  if (mentionsApprenticeshipSpecificTerms && enterprise.slug !== "cfa") {
    addUnique(errors, `Systeme ${enterprise.slug} uses CFA/apprenticeship-specific wording.`);
  }

  const slugExpectation = SLUG_SPECIFIC_EXPECTATIONS.find((expectation) => expectation.slug === enterprise.slug);
  if (slugExpectation) {
    const haystack = rows.flatMap((row) => [row.pillar, row.process, row.document]).join(" || ");

    for (const pattern of slugExpectation.required ?? []) {
      if (!pattern.test(haystack)) {
        addUnique(errors, `Systeme ${enterprise.slug} is missing expected contextual marker ${pattern}.`);
      }
    }

    for (const pattern of slugExpectation.forbidden ?? []) {
      if (pattern.test(haystack)) {
        addUnique(errors, `Systeme ${enterprise.slug} contains forbidden contextual marker ${pattern}.`);
      }
    }
  }
}

for (const expectation of CRITICAL_EXPECTATIONS) {
  const rows = rowsBySlug.get(expectation.slug) ?? [];
  const haystack = rows
    .flatMap((row) => [row.process, row.document])
    .join(" || ");

  for (const check of expectation.checks) {
    if (!check.pattern.test(haystack)) {
      addUnique(
        errors,
        `Systeme ${expectation.slug} is missing critical check "${check.label}".`,
      );
    }
  }
}

const unmappedSlugs = enterprises
  .map((enterprise) => enterprise.slug)
  .filter((slug) => !rowsBySlug.has(slug));

if (unmappedSlugs.length) {
  addUnique(errors, `Systeme coverage incomplete: ${unmappedSlugs.join(", ")}`);
}

if (errors.length) {
  console.error("[validate-systeme-catalog] Errors:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`[validate-systeme-catalog] OK: ${enterprises.length} sectors mapped.`);

if (warnings.length) {
  console.warn("[validate-systeme-catalog] Warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}
