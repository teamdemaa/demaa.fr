import fs from "node:fs";
import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "..");
const concurrency = Number.parseInt(process.env.DEMAA_LINK_AUDIT_CONCURRENCY ?? "8", 10);
const requestTimeoutMs = Number.parseInt(process.env.DEMAA_LINK_AUDIT_TIMEOUT_MS ?? "15000", 10);
const retryCount = Number.parseInt(process.env.DEMAA_LINK_AUDIT_RETRIES ?? "1", 10);
const blockedStatuses = new Set([401, 403, 406, 418, 429, 451]);
const execFileAsync = promisify(execFile);

const catalogFiles = [
  { path: "src/lib/supplier-catalog.ts", fields: ["href"] },
  { path: "src/lib/finance-catalog.ts", fields: ["href"] },
  { path: "src/lib/aid-catalog.ts", fields: ["sourceUrl"] },
  { path: "src/lib/pro-network-catalog.ts", fields: ["href"] },
  { path: "src/lib/training-catalog.ts", fields: ["href"] },
  { path: "src/lib/recruitment-catalog.ts", fields: ["href"] },
];

function addLink(links, rawUrl, source) {
  if (rawUrl.startsWith("/")) {
    return;
  }

  let url;

  try {
    url = new URL(rawUrl);
    url.hash = "";
  } catch {
    const key = `invalid:${rawUrl}`;
    const existing = links.get(key) ?? { url: rawUrl, sources: new Set(), invalid: true };
    existing.sources.add(source);
    links.set(key, existing);
    return;
  }

  const key = url.toString();
  const existing = links.get(key) ?? { url: key, sources: new Set(), invalid: false };
  existing.sources.add(source);
  links.set(key, existing);
}

function extractLinks() {
  const links = new Map();
  const directoryPath = resolve(projectRoot, "src/lib/tool-directory.json");
  const directory = JSON.parse(fs.readFileSync(directoryPath, "utf8"));

  for (const tool of directory.tools ?? []) {
    if (tool.status === "active" && typeof tool.url === "string") {
      addLink(links, tool.url, `tool-directory:${tool.slug}`);
    }
  }

  for (const catalog of catalogFiles) {
    const source = fs.readFileSync(resolve(projectRoot, catalog.path), "utf8");
    const fieldPattern = catalog.fields.join("|");
    const expression = new RegExp(`\\b(?:${fieldPattern})\\s*:\\s*["'](https?:\\/\\/[^"']+)["']`, "g");

    for (const match of source.matchAll(expression)) {
      addLink(links, match[1], catalog.path);
    }
  }

  return [...links.values()]
    .map((link) => ({ ...link, sources: [...link.sources].sort() }))
    .sort((left, right) => left.url.localeCompare(right.url));
}

async function request(url, method) {
  const response = await fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(requestTimeoutMs),
    headers: {
      accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      "accept-language": "fr-FR,fr;q=0.9,en;q=0.7",
      "user-agent": "Mozilla/5.0 (compatible; DemaaLinkAudit/1.0; +https://demaa.fr)",
    },
  });

  await response.body?.cancel();

  return {
    status: response.status,
    finalUrl: response.url,
    method,
  };
}

async function requestWithCurl(url, headOnly = true) {
  const { stdout } = await execFileAsync(
    "curl",
    [
      "--location",
      "--silent",
      "--show-error",
      "--output",
      "/dev/null",
      "--max-time",
      String(Math.ceil(requestTimeoutMs / 1000)),
      "--user-agent",
      "Mozilla/5.0 (compatible; DemaaLinkAudit/1.0; +https://demaa.fr)",
      ...(headOnly ? ["--head"] : []),
      "--write-out",
      "%{http_code}\t%{url_effective}",
      url,
    ],
    { timeout: requestTimeoutMs + 1000 },
  );
  const [rawStatus, finalUrl] = stdout.trim().split("\t");
  const status = Number.parseInt(rawStatus, 10);

  if (!Number.isInteger(status)) {
    throw new Error(`curl returned an invalid status: ${stdout.trim()}`);
  }

  return {
    status,
    finalUrl,
    method: headOnly ? "CURL HEAD" : "CURL GET",
  };
}

function classifyResponse(link, result, attempts) {
  const base = { ...link, ...result, attempts };

  if (result.status >= 200 && result.status < 400) {
    return { ...base, category: "healthy" };
  }

  if (blockedStatuses.has(result.status)) {
    return { ...base, category: "blocked", detail: `HTTP ${result.status}` };
  }

  if (result.status === 404 || result.status === 410) {
    return { ...base, category: "dead", detail: `HTTP ${result.status}` };
  }

  return null;
}

async function probeLink(link) {
  if (link.invalid) {
    return { ...link, category: "invalid", detail: "invalid URL" };
  }

  if (!link.url.startsWith("https://")) {
    return { ...link, category: "invalid", detail: "URL is not HTTPS" };
  }

  let lastError;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      let result = await request(link.url, "HEAD");

      if (result.status >= 400) {
        result = await request(link.url, "GET");
      }

      const classification = classifyResponse(link, result, attempt + 1);

      if (classification) {
        return classification;
      }

      lastError = new Error(`HTTP ${result.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  try {
    let result = await requestWithCurl(link.url);

    if (result.status >= 400) {
      result = await requestWithCurl(link.url, false);
    }

    const classification = classifyResponse(link, result, retryCount + 2);

    if (classification) {
      return classification;
    }

    lastError = new Error(`HTTP ${result.status}`);
  } catch (error) {
    lastError = error;
  }

  return {
    ...link,
    category: "suspect",
    detail: lastError instanceof Error ? lastError.message : String(lastError),
    attempts: retryCount + 1,
  };
}

async function mapConcurrent(items, worker, size) {
  const results = new Array(items.length);
  let nextIndex = 0;
  let completed = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
      completed += 1;

      if (completed % 50 === 0 || completed === items.length) {
        console.log(`Checked ${completed}/${items.length} links`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => run()));
  return results;
}

function printIssues(title, items) {
  if (items.length === 0) {
    return;
  }

  console.log(`\n${title} (${items.length})`);

  for (const item of items) {
    const redirect = item.finalUrl && item.finalUrl !== item.url ? ` -> ${item.finalUrl}` : "";
    console.log(`- ${item.detail ?? ""} ${item.url}${redirect} [${item.sources.join(", ")}]`.trim());
  }
}

const links = extractLinks();

if (!Number.isInteger(concurrency) || concurrency < 1) {
  throw new Error("DEMAA_LINK_AUDIT_CONCURRENCY must be a positive integer");
}

console.log(`External link audit: ${links.length} unique URLs`);
const results = await mapConcurrent(links, probeLink, concurrency);
const byCategory = Object.groupBy(results, (result) => result.category);

console.log("\nSummary");
for (const category of ["healthy", "blocked", "dead", "suspect", "invalid"]) {
  console.log(`- ${category}: ${byCategory[category]?.length ?? 0}`);
}

printIssues("Blocked by the destination (manual verification recommended)", byCategory.blocked ?? []);
printIssues("Dead links", byCategory.dead ?? []);
printIssues("Temporarily unreachable links (manual verification required)", byCategory.suspect ?? []);
printIssues("Invalid links", byCategory.invalid ?? []);

const conclusiveResultCount =
  (byCategory.healthy?.length ?? 0) +
  (byCategory.blocked?.length ?? 0) +
  (byCategory.dead?.length ?? 0);
const networkAuditUnavailable = conclusiveResultCount === 0 && (byCategory.suspect?.length ?? 0) > 0;

if (networkAuditUnavailable) {
  console.error("\nExternal network unavailable: the link audit could not reach any destination.");
}

if (
  networkAuditUnavailable ||
  (byCategory.dead?.length ?? 0) + (byCategory.invalid?.length ?? 0) > 0
) {
  process.exitCode = 1;
}
