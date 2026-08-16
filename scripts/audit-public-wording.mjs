import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const emDash = "—";
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const visibleAssetExtensions = new Set([
  ".csv",
  ".html",
  ".md",
  ".svg",
  ".txt",
]);
const generatedVisibleFiles = [
  "scripts/generate-meta-carousel.mjs",
  "scripts/generate-system-kit-previews.mjs",
];
const pilotageEmDashExceptions = new Map([
  ["src/components/CompanyFiguresPanel.tsx", [
    'value === null ? "—"',
    'affichés « — »',
  ]],
  ["src/components/CompanyStrategyHistory.tsx", [
    "formatCompanyMonth(cycle.startMonth)} — ${formatCompanyMonth(cycle.endMonth)",
    'cycle.answers[question.key] || "—"',
  ]],
  ["src/components/CompanyStrategyPanel.tsx", [
    "${start} — ${end}",
  ]],
]);

function isValidatedPilotageEmDash(relativePath, line) {
  return pilotageEmDashExceptions.get(relativePath)?.some((fragment) =>
    line.includes(fragment)
  ) === true;
}

async function collectFiles(directory, extensions) {
  const entries = await readdir(path.join(repoRoot, directory), {
    withFileTypes: true,
  });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(relativePath, extensions)));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(relativePath);
    }
  }

  return files;
}

const files = [
  ...(await collectFiles("src", sourceExtensions)),
  ...(await collectFiles("public", visibleAssetExtensions)),
  ...(await collectFiles("marketing", visibleAssetExtensions)),
  ...generatedVisibleFiles,
];
const failures = [];

for (const relativePath of files) {
  const content = await readFile(path.join(repoRoot, relativePath), "utf8");

  content.split(/\r?\n/).forEach((line, index) => {
    if (line.includes(emDash) && !isValidatedPilotageEmDash(relativePath, line)) {
      failures.push(`${relativePath}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (failures.length) {
  console.error(
    [
      "Tirets longs interdits dans les textes publics ou rendus :",
      ...failures,
    ].join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    `Textes publics validés : ${files.length} fichiers sans tiret long.`,
  );
}
