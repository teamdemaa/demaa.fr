import fs from "node:fs";
import path from "node:path";
import sectorTaxonomyPayload from "../src/lib/sector-taxonomy.json" with { type: "json" };

const sectorPagesSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/sector-pages.ts"),
  "utf8",
);
const courseContentSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/course-content.ts"),
  "utf8",
);
const documentModelsSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/document-models.ts"),
  "utf8",
);
const serviceCatalogSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/service-catalog.ts"),
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

const serviceSlugs = extractSlugs(serviceCatalogSource);
const courseSlugs = extractSlugs(courseContentSource);
const documentModelSlugs = extractSlugs(documentModelsSource);
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

  if (href.startsWith("/annuaire-services/")) {
    const slug = href.replace("/annuaire-services/", "");
    if (!serviceSlugs.has(slug)) {
      addUnique(errors, `${context} references unknown service slug "${slug}".`);
    }
    return;
  }

  if (href.startsWith("/modeles-de-documents/")) {
    const slug = href.replace("/modeles-de-documents/", "");
    if (!documentModelSlugs.has(slug)) {
      addUnique(errors, `${context} references unknown document model slug "${slug}".`);
    }
    return;
  }

  if (href.startsWith("/cours/")) {
    const slug = href.replace("/cours/", "");
    if (!courseSlugs.has(slug)) {
      addUnique(errors, `${context} references unknown course slug "${slug}".`);
    }
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
  services: serviceSlugs.size,
  courses: courseSlugs.size,
  documentModels: documentModelSlugs.size,
  systemResources: systemResourceSlugs.size,
  errors,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
