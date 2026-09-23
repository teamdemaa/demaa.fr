import { promisify } from "node:util";
import { execFile } from "node:child_process";
import enterpriseCatalog from "../src/lib/enterprise-annuaire.json" with { type: "json" };

// Read-only comparison of the existing public métier pages and a protected
// Vercel preview. It never changes Firebase, Vercel settings or a domain.
const run = promisify(execFile);
const args = process.argv.slice(2);
const preview = args.find((arg) => arg.startsWith("--preview="))?.slice(10);
const requestedSlug = args.find((arg) => arg.startsWith("--slug="))?.slice(7);
const production = args.find((arg) => arg.startsWith("--production="))?.slice(13) ?? "https://demaa.fr";

if (!preview || !/^https:\/\/[a-z0-9-]+\.vercel\.app\/?$/.test(preview)) {
  throw new Error("Pass a protected Vercel deployment with --preview=https://…vercel.app");
}

const slugs = enterpriseCatalog.enterprises
  .map(({ slug }) => slug)
  .filter((slug) => !requestedSlug || slug === requestedSlug);
if (slugs.length === 0) throw new Error(`Unknown métier: ${requestedSlug}`);

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ");
}

function toolNames(html) {
  const section = html.match(/<section[^>]*aria-labelledby="solution-section-software"[\s\S]*?<\/section>/)?.[0];
  return section
    ? [...section.matchAll(/aria-label="Ouvrir ([^"]+)"/g)].map((match) => decodeHtml(match[1]))
    : [];
}

function hasLink(html, href) {
  return html.includes(`href="${href}"`);
}

async function fetchProduction(slug) {
  const response = await fetch(`${production}/solutions/${slug}`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Production ${slug}: HTTP ${response.status}`);
  return response.text();
}

async function fetchPreview(slug) {
  const { stdout } = await run("npx", [
    "--yes", "vercel", "curl", `/solutions/${slug}`,
    "--deployment", preview,
    "--", "-sS", "--fail",
  ], { maxBuffer: 8 * 1024 * 1024, timeout: 60000 });
  return stdout;
}

async function audit(slug) {
  const [currentHtml, previewHtml] = await Promise.all([
    fetchProduction(slug),
    fetchPreview(slug),
  ]);
  const currentTools = toolNames(currentHtml);
  const previewTools = toolNames(previewHtml);
  const previewNames = new Set(previewTools);
  const currentNames = new Set(currentTools);
  const comparisonPath = `/solutions/${slug}/comparatif-outils`;
  const processPath = `/systemes/${slug}/processus`;
  return {
    slug,
    currentTools,
    previewTools,
    missingTools: currentTools.filter((name) => !previewNames.has(name)),
    addedTools: previewTools.filter((name) => !currentNames.has(name)),
    currentCompare: hasLink(currentHtml, comparisonPath),
    previewCompare: hasLink(previewHtml, comparisonPath),
    currentProcesses: hasLink(currentHtml, processPath),
    previewProcesses: hasLink(previewHtml, processPath),
    previewHorizontalToolRail: previewTools.length === 0
      ? null
      : /data-solution-section-layout="rail"/.test(previewHtml),
  };
}

const results = new Array(slugs.length);
let next = 0;
let completed = 0;
async function worker() {
  while (next < slugs.length) {
    const index = next++;
    results[index] = await audit(slugs[index]);
    completed++;
    if (completed % 10 === 0 || completed === slugs.length) {
      console.error(`Checked ${completed}/${slugs.length} métier pages`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(5, slugs.length) }, worker));

const gaps = results.filter((item) =>
  item.missingTools.length > 0 ||
  (item.currentCompare && !item.previewCompare) ||
  (item.currentProcesses && !item.previewProcesses) ||
  item.previewHorizontalToolRail === false
);
console.log(JSON.stringify({
  production,
  preview,
  checked: results.length,
  currentToolOccurrences: results.reduce((total, item) => total + item.currentTools.length, 0),
  previewToolOccurrences: results.reduce((total, item) => total + item.previewTools.length, 0),
  missingToolOccurrences: results.reduce((total, item) => total + item.missingTools.length, 0),
  métiersWithMissingTools: results.filter((item) => item.missingTools.length > 0).length,
  lostComparatorEntries: results.filter((item) => item.currentCompare && !item.previewCompare).map((item) => item.slug),
  lostProcessEntries: results.filter((item) => item.currentProcesses && !item.previewProcesses).map((item) => item.slug),
  gaps,
}, null, 2));
