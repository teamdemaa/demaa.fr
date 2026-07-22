import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { getSheetId, readSystemKitPreviewData } from "./lib/system-kit-preview-data.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const selectedSlugs = new Set();
let generateAll = false;
let force = false;
let refresh = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === "--all") generateAll = true;
  else if (arg === "--force") force = true;
  else if (arg === "--refresh") refresh = true;
  else if (arg === "--slug") selectedSlugs.add(args[++index]);
  else throw new Error(`Argument inconnu : ${arg}`);
}

if (!generateAll && selectedSlugs.size === 0) {
  throw new Error("Utilisez --all ou au moins un argument --slug <métier>.");
}

const runtimeNodeModules = process.env.CODEX_WORKSPACE_NODE_MODULES;

if (!runtimeNodeModules) {
  throw new Error(
    "CODEX_WORKSPACE_NODE_MODULES doit pointer vers le node_modules fourni par le runtime workspace.",
  );
}

const runtimeRequire = createRequire(path.join(runtimeNodeModules, "resolver.cjs"));
const [{ FileBlob, SpreadsheetFile }, sharpModule] = await Promise.all([
  import(pathToFileURL(runtimeRequire.resolve("@oai/artifact-tool")).href),
  import(pathToFileURL(runtimeRequire.resolve("sharp")).href),
]);
const sharp = sharpModule.default;
const mappings = await readSystemKitPreviewData(rootDir);
const selectedMappings = generateAll
  ? mappings
  : mappings.filter((mapping) => selectedSlugs.has(mapping.slug));
const unknownSlugs = [...selectedSlugs].filter(
  (slug) => !mappings.some((mapping) => mapping.slug === slug),
);

if (unknownSlugs.length) {
  throw new Error(`Métiers inconnus : ${unknownSlugs.join(", ")}`);
}

const cacheDir = path.join(os.tmpdir(), "demaa-system-kit-preview-cache");
const manifestPath = path.join(rootDir, "src/lib/system-kit-previews.generated.json");
const existingManifest = await fs
  .readFile(manifestPath, "utf8")
  .then((source) => JSON.parse(source))
  .catch(() => []);
const manifestBySlug = new Map(existingManifest.map((entry) => [entry.slug, entry]));

await fs.mkdir(cacheDir, { recursive: true });

function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

async function downloadWorkbook(mapping) {
  const sheetId = getSheetId(mapping.url);
  const workbookPath = path.join(cacheDir, `${mapping.slug}.xlsx`);

  if (!refresh) {
    const cached = await fs.stat(workbookPath).catch(() => null);
    if (cached?.size > 10_000) return workbookPath;
  }

  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  let lastError;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(exportUrl, {
        headers: { "user-agent": "Demaa system kit preview generator" },
        redirect: "follow",
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength < 10_000) {
        throw new Error(`export trop petit (${bytes.byteLength} octets)`);
      }

      await fs.writeFile(workbookPath, bytes);
      return workbookPath;
    } catch (error) {
      lastError = error;
      if (attempt < 4) await delay(attempt * 1_500);
    }
  }

  throw new Error(`Téléchargement impossible : ${lastError}`);
}

function normalizeSheetName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseSheetSummary(ndjson) {
  return ndjson
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((entry) => entry.kind === "sheet");
}

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character]);
}

async function renderWorkbook(workbookPath, renderDir) {
  const input = await FileBlob.load(workbookPath);
  const workbook = await SpreadsheetFile.importXlsx(input);
  const summary = await workbook.inspect({
    kind: "sheet",
    include: "id,name",
    maxChars: 12_000,
  });
  const sheets = parseSheetSummary(summary.ndjson);
  const sheetByNormalizedName = new Map(
    sheets.map((sheet) => [normalizeSheetName(sheet.name), sheet]),
  );
  const preferredSheets = [
    { normalizedName: "synthese", role: "summary" },
    { normalizedName: "previsionnel financier", role: "forecast" },
    { normalizedName: "process", role: "process" },
  ];
  const fallbackSheets = [...sheets];
  const selections = preferredSheets.map((preferred) => {
    const exact = sheetByNormalizedName.get(preferred.normalizedName);
    const sheet = exact ?? fallbackSheets.shift();

    if (!sheet) throw new Error(`Moins de trois onglets disponibles dans ${workbookPath}`);
    return { ...preferred, sheet };
  });

  await fs.mkdir(renderDir, { recursive: true });

  for (const selection of selections) {
    const preview = await workbook.render({
      sheetName: selection.sheet.name,
      range: selection.sheet.address,
      scale: 1,
      format: "png",
    });
    await fs.writeFile(
      path.join(renderDir, `${selection.role}.png`),
      new Uint8Array(await preview.arrayBuffer()),
    );
  }

  return sheets.map((sheet) => sheet.name);
}

function createSheetHeader({ width, name, kind }) {
  const safeName = escapeXml(name.toUpperCase());

  if (kind === "summary") {
    const titleSize = name.length > 28 ? 17 : 20;
    return Buffer.from(
      `<svg width="${width}" height="105" xmlns="http://www.w3.org/2000/svg">
        <rect x="31" y="22" width="${width - 31}" height="31" fill="#08613f"/>
        <text x="42" y="44" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="#ffffff">${safeName} — TABLEAU DE PILOTAGE</text>
        <rect x="31" y="53" width="${width - 31}" height="27" fill="#ffffff"/>
        <text x="42" y="71" font-family="Arial, sans-serif" font-size="10" font-style="italic" fill="#65706a">Un seul tableau pour suivre vos chiffres, vos priorités, votre équipe, votre écosystème, votre calendrier et vos process.</text>
        <rect x="31" y="80" width="${width - 31}" height="25" fill="#08613f"/>
        <text x="42" y="98" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#ffffff">SYNTHÈSE FINANCIÈRE</text>
      </svg>`,
    );
  }

  if (kind === "forecast") {
    const titleSize = name.length > 28 ? 12 : 14;
    return Buffer.from(
      `<svg width="${width}" height="58" xmlns="http://www.w3.org/2000/svg">
        <rect x="26" y="20" width="${width - 26}" height="30" fill="#08613f"/>
        <text x="36" y="41" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="#ffffff">${safeName} — PRÉVISIONNEL FINANCIER</text>
      </svg>`,
    );
  }

  return null;
}

async function createCard({
  inputPath,
  width,
  height,
  tabs = [],
  angle = 0,
  cropPosition = "top",
  header = null,
}) {
  const padding = 24;
  const radius = 20;
  const tabHeight = tabs.length ? 48 : 0;
  const contentHeight = height - tabHeight;
  const screenshot = await sharp(inputPath)
    .resize({ width, height: contentHeight, fit: "cover", position: cropPosition })
    .png()
    .toBuffer();
  const visibleTabs = tabs.slice(0, 7);
  const tabWidth = width / Math.max(visibleTabs.length, 1);
  const tabMarkup = visibleTabs.length
    ? `<svg width="${width}" height="${tabHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <rect width="${tabWidth}" height="${tabHeight}" fill="#e5efe8"/>
        ${visibleTabs.map((label, index) => {
          const fontSize = label.length > 19 ? 9 : label.length > 13 ? 10 : 11;
          return `<text x="${index * tabWidth + tabWidth / 2}" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${index === 0 ? 700 : 500}" fill="${index === 0 ? "#315f46" : "#17231d"}">${escapeXml(label)}</text>`;
        }).join("")}
      </svg>`
    : null;
  const surface = await sharp({
    create: { width, height, channels: 4, background: "#ffffff" },
  })
    .composite([
      { input: screenshot, left: 0, top: 0 },
      ...(header ? [{ input: header, left: 0, top: 0 }] : []),
      ...(tabMarkup ? [{ input: Buffer.from(tabMarkup), left: 0, top: contentHeight }] : []),
    ])
    .png()
    .toBuffer();
  const roundedMask = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" rx="${radius}" fill="#fff"/></svg>`,
  );
  const rounded = await sharp(surface)
    .composite([{ input: roundedMask, blend: "dest-in" }])
    .png()
    .toBuffer();
  const frame = Buffer.from(
    `<svg width="${width + padding * 2}" height="${height + padding * 2}" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#17231d" flood-opacity="0.12"/></filter></defs>
      <rect x="${padding}" y="${padding}" width="${width}" height="${height}" rx="${radius}" fill="#fff" stroke="#dde2df" stroke-width="1" filter="url(#shadow)"/>
    </svg>`,
  );
  const card = await sharp(frame)
    .composite([{ input: rounded, left: padding, top: padding }])
    .png()
    .toBuffer();

  return angle
    ? sharp(card)
        .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    : card;
}

async function composePreview(renderDir, outputPath, tabs, name) {
  const [left, right, front] = await Promise.all([
    createCard({
      inputPath: path.join(renderDir, "forecast.png"),
      width: 560,
      height: 610,
      angle: -1.2,
      cropPosition: "left",
      header: createSheetHeader({ width: 560, name, kind: "forecast" }),
    }),
    createCard({
      inputPath: path.join(renderDir, "process.png"),
      width: 520,
      height: 610,
      angle: 1.2,
    }),
    createCard({
      inputPath: path.join(renderDir, "summary.png"),
      width: 860,
      height: 590,
      tabs,
      header: createSheetHeader({ width: 860, name, kind: "summary" }),
    }),
  ]);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp({
    create: { width: 1400, height: 933, channels: 4, background: "#fbfaf7" },
  })
    .composite([
      { input: left, left: 35, top: 115 },
      { input: right, left: 820, top: 105 },
      { input: front, left: 246, top: 205 },
    ])
    .webp({ quality: 84, smartSubsample: true })
    .toFile(outputPath);
}

const failures = [];

for (const [index, mapping] of selectedMappings.entries()) {
  const relativeSrc = `/images/kits/${mapping.slug}/tableau-suivi-preview.webp`;
  const outputPath = path.join(rootDir, "public", relativeSrc);
  const existing = await fs.stat(outputPath).catch(() => null);

  process.stdout.write(`[${index + 1}/${selectedMappings.length}] ${mapping.slug} `);

  try {
    if (!force && existing?.size > 20_000) {
      process.stdout.write("déjà généré\n");
    } else {
      const workbookPath = await downloadWorkbook(mapping);
      const renderDir = path.join(cacheDir, `${mapping.slug}-render`);
      const tabs = await renderWorkbook(workbookPath, renderDir);
      await composePreview(renderDir, outputPath, tabs, mapping.name);
      process.stdout.write("généré\n");
    }

    const metadata = await sharp(outputPath).metadata();
    const stats = await fs.stat(outputPath);
    if (metadata.width !== 1400 || metadata.height !== 933 || stats.size < 20_000) {
      throw new Error(
        `aperçu invalide (${metadata.width}x${metadata.height}, ${stats.size} octets)`,
      );
    }

    manifestBySlug.set(mapping.slug, {
      slug: mapping.slug,
      src: relativeSrc,
      alt: `Aperçu du tableau de suivi opérationnel pour ${mapping.name}`,
      width: metadata.width,
      height: metadata.height,
    });
  } catch (error) {
    failures.push({ slug: mapping.slug, error: String(error) });
    process.stdout.write(`échec : ${error}\n`);
  }
}

const manifest = mappings
  .map((mapping) => manifestBySlug.get(mapping.slug))
  .filter(Boolean);
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      requested: selectedMappings.length,
      generatedManifestEntries: manifest.length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) process.exitCode = 1;
