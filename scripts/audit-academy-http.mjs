const args = process.argv.slice(2);
const baseUrlIndex = args.indexOf("--base-url");
const baseUrl = new URL(
  baseUrlIndex >= 0 && args[baseUrlIndex + 1]
    ? args[baseUrlIndex + 1]
    : "http://127.0.0.1:3000",
);

const slugs = [
  "piloter-sa-tresorerie",
  "comprendre-chiffre-affaires-benefice",
  "fixer-ses-prix-sans-vendre-a-perte",
  "construire-systeme-marketing-vente",
  "transformer-demande-en-client",
  "deleguer-sans-perdre-le-controle",
  "cabinet-conseil-acquisition",
  "formation-b2b-acquisition",
  "maintenance-informatique-acquisition",
  "bureau-etudes-acquisition",
  "nettoyage-professionnel-acquisition",
];

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

const historicalResponse = await fetch(
  new URL("/cours/facture-electronique", baseUrl),
  { redirect: "manual" },
);
const historicalHtml = await historicalResponse.text();
if (
  historicalResponse.status !== 200 ||
  !historicalHtml.includes("La facturation électronique")
) {
  failures.push({
    source: "/cours/facture-electronique",
    expected: { status: 200, content: "La facturation électronique" },
    actual: { status: historicalResponse.status },
  });
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
      historicalCoursePreserved: true,
    },
    null,
    2,
  ),
);
