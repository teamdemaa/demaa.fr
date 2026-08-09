import fs from "node:fs";
import path from "node:path";
import sectorTaxonomyPayload from "../src/lib/sector-taxonomy.json" with { type: "json" };

const sectorPagesSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/sector-pages.ts"),
  "utf8",
);
const systemResourceCatalogSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/system-resource-catalog.ts"),
  "utf8",
);

const staticRoutes = new Set([
  "/systemes",
  "/services",
  "/annuaire-fournisseurs",
  "/annuaire-outils",
]);

function extractSlugs(source) {
  return new Set(
    [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]),
  );
}

const systemResourceSlugs = new Set(
  [...systemResourceCatalogSource.matchAll(/resourceSlug:\s*"([^"]+)"/g)]
    .map((match) => match[1]),
);
const publicSectorLabels = new Set(
  sectorTaxonomyPayload.sectors.map((sector) => sector.publicLabel),
);

const errors = [];

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function validateStaticHref(href, context) {
  if (staticRoutes.has(href)) {
    return;
  }

  if (href.startsWith("/modeles-de-documents/")) {
    addUnique(errors, `${context} references retired document model route "${href}".`);
    return;
  }

  if (href.startsWith("/api/systeme-kit/open/")) {
    const slug = href.replace("/api/systeme-kit/open/", "");
    if (!systemResourceSlugs.has(slug)) {
      addUnique(errors, `${context} references unknown system resource slug "${slug}".`);
    }
    return;
  }

  addUnique(errors, `${context} references unsupported internal href "${href}".`);
}

for (const match of sectorPagesSource.matchAll(/href:\s*"([^"]+)"/g)) {
  const href = match[1];
  validateStaticHref(href, `Sector page highlight`);
}

for (const match of sectorPagesSource.matchAll(/href:\s*getSectorToolDirectoryHref\("([^"]+)"\)/g)) {
  const label = match[1];

  if (!publicSectorLabels.has(label)) {
    addUnique(errors, `Sector page tools highlight references unknown sector label "${label}".`);
  }
}

const result = {
  sectors: sectorTaxonomyPayload.sectors.length,
  systemResources: systemResourceSlugs.size,
  errors,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
