import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const academyRoutesSource = fs.readFileSync(
  resolve(currentDir, "../src/lib/academy-course-routes.ts"),
  "utf8",
);
const academySlugBlock = academyRoutesSource.match(
  /export const ACADEMY_CONTENT_SLUGS = \[([\s\S]*?)\] as const;/,
);
if (!academySlugBlock) {
  throw new Error("Unable to read the canonical Academy slug registry.");
}

const slugs = [...academySlugBlock[1].matchAll(/"([^"]+)"/g)].map(
  (match) => match[1],
);
if (slugs.length !== 14 || new Set(slugs).size !== slugs.length) {
  throw new Error(
    `Expected 14 unique canonical Academy slugs, found ${slugs.length}.`,
  );
}

const args = process.argv.slice(2);
const baseUrlIndex = args.indexOf("--base-url");
const baseUrl = new URL(
  baseUrlIndex >= 0 && args[baseUrlIndex + 1]
    ? args[baseUrlIndex + 1]
    : "http://127.0.0.1:3000",
);

const aliases = {
  "entreprise-rentable-sans-tresorerie": "piloter-sa-tresorerie",
  "difference-chiffre-affaires-benefice":
    "comprendre-chiffre-affaires-benefice",
  "transformer-une-demande-en-client": "transformer-demande-en-client",
};

const redirectCases = [
  ["/cours", "/academie"],
  ...slugs.map((slug) => [`/cours/${slug}`, `/academie/${slug}`]),
  ...Object.entries(aliases).flatMap(([legacySlug, canonicalSlug]) => [
    [`/cours/${legacySlug}`, `/academie/${canonicalSlug}`],
    [`/academie/${legacySlug}`, `/academie/${canonicalSlug}`],
  ]),
  ["/cours/facture-electronique", "/systemes"],
  ["/cours/obligations-finances-entreprise", "/systemes"],
  [
    "/cours/organisation-marketing-vente",
    "/academie/construire-systeme-marketing-vente",
  ],
  ["/cours?retourSysteme=batiment", "/academie?retourSysteme=batiment"],
];

const failures = [];

for (const [source, expectedDestination] of redirectCases) {
  const response = await fetch(new URL(source, baseUrl), {
    redirect: "manual",
  });
  const location = response.headers.get("location");
  const normalizedLocation = location
    ? `${new URL(location, baseUrl).pathname}${new URL(location, baseUrl).search}`
    : null;

  if (response.status !== 308 || normalizedLocation !== expectedDestination) {
    failures.push({
      source,
      expected: { status: 308, location: expectedDestination },
      actual: { status: response.status, location: normalizedLocation },
    });
  }
}

for (const slug of slugs) {
  const response = await fetch(new URL(`/academie/${slug}`, baseUrl), {
    redirect: "manual",
  });
  const html = await response.text();
  if (
    response.status !== 200 ||
    !html.includes('type="application/ld+json"') ||
    html.includes("VideoObject")
  ) {
    failures.push({
      source: `/academie/${slug}`,
      expected: { status: 200, jsonLd: true, videoObject: false },
      actual: {
        status: response.status,
        jsonLd: html.includes('type="application/ld+json"'),
        videoObject: html.includes("VideoObject"),
      },
    });
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl: baseUrl.origin,
      redirects: redirectCases.length,
      academyPages: slugs.length,
    },
    null,
    2,
  ),
);
