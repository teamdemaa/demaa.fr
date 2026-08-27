import { fileURLToPath } from "node:url";

const DEFAULT_BASE_URL = "http://localhost:3000";
const CONCURRENCY = 12;

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match?.[1]?.trim() ?? "";
}

function getMetaContent(html, attribute, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const tag = tags.find((candidate) => getAttribute(candidate, attribute) === value);
  return tag ? getAttribute(tag, "content") : "";
}

function getCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  const tag = tags.find((candidate) =>
    getAttribute(candidate, "rel").split(/\s+/).includes("canonical")
  );
  return tag ? getAttribute(tag, "href") : "";
}

function getTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

export function inspectPublicHtml(html, expectedCanonical) {
  const failures = [];
  const title = getTitle(html);
  const description = getMetaContent(html, "name", "description");
  const robots = getMetaContent(html, "name", "robots").toLowerCase();
  const canonical = getCanonical(html);
  const openGraphImage = getMetaContent(html, "property", "og:image");
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;

  if (!title) failures.push("title manquant");
  if (!description) failures.push("meta description manquante");
  if (robots.includes("noindex")) failures.push("page déclarée noindex");
  if (!canonical) failures.push("canonical manquante");
  if (canonical && canonical !== expectedCanonical) {
    failures.push(`canonical inattendue (${canonical})`);
  }
  if (!openGraphImage) failures.push("og:image manquante");
  if (h1Count !== 1) failures.push(`${h1Count} H1 au lieu de 1`);

  return failures;
}

export function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) =>
    decodeXml(match[1].trim())
  );
}

async function runPool(items, worker, concurrency = CONCURRENCY) {
  let cursor = 0;
  const results = new Array(items.length);

  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

async function inspectSitemapUrl(publicUrl, baseUrl) {
  const publicLocation = new URL(publicUrl);
  const localUrl = new URL(`${publicLocation.pathname}${publicLocation.search}`, baseUrl);
  const response = await fetch(localUrl, { redirect: "manual" });

  if (response.status !== 200) {
    return [`HTTP ${response.status}`];
  }

  const html = await response.text();
  return inspectPublicHtml(html, publicUrl);
}

async function inspectRedirect(baseUrl, source, expectedDestination) {
  const response = await fetch(new URL(source, baseUrl), { redirect: "manual" });
  const location = response.headers.get("location");
  const destination = location ? new URL(location, baseUrl) : null;
  const actual = destination ? `${destination.pathname}${destination.search}` : "";

  return response.status === 308 && actual === expectedDestination
    ? []
    : [`attendu 308 vers ${expectedDestination}, reçu ${response.status} vers ${actual || "rien"}`];
}

export async function runPublicIndexabilityAudit(
  baseUrl = process.env.AUDIT_BASE_URL ?? DEFAULT_BASE_URL,
) {
  const normalizedBaseUrl = new URL(baseUrl).toString();
  const sitemapResponse = await fetch(new URL("/sitemap.xml", normalizedBaseUrl));
  if (!sitemapResponse.ok) {
    throw new Error(`Sitemap inaccessible : HTTP ${sitemapResponse.status}`);
  }

  const sitemapUrls = extractSitemapUrls(await sitemapResponse.text());
  const duplicateUrls = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);
  const failures = [];

  if (duplicateUrls.length > 0) {
    failures.push({ url: "/sitemap.xml", issues: [`URL dupliquées : ${[...new Set(duplicateUrls)].join(", ")}`] });
  }

  const pageResults = await runPool(sitemapUrls, (url) => inspectSitemapUrl(url, normalizedBaseUrl));
  pageResults.forEach((issues, index) => {
    if (issues.length > 0) failures.push({ url: sitemapUrls[index], issues });
  });

  const redirects = [
    ["/", "/solutions"],
    ["/rejoindre-team-demaa", "/opportunites?intent=team-demaa-profile"],
  ];
  for (const [source, destination] of redirects) {
    const issues = await inspectRedirect(normalizedBaseUrl, source, destination);
    if (issues.length > 0) failures.push({ url: source, issues });
  }

  return { sitemapUrlCount: sitemapUrls.length, failures };
}

async function main() {
  const result = await runPublicIndexabilityAudit();

  if (result.failures.length > 0) {
    console.error(`Audit SEO public échoué : ${result.failures.length} URL(s) en erreur.`);
    for (const failure of result.failures.slice(0, 50)) {
      console.error(`- ${failure.url}: ${failure.issues.join("; ")}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Audit SEO public validé : ${result.sitemapUrlCount} URL(s), canonicals, H1, métadonnées sociales et redirections conformes.`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) {
  await main();
}
