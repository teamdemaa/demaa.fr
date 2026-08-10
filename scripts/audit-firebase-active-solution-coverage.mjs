import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [snapshot, enterprisePayload] = await Promise.all([
  readFile(new URL("src/lib/firebase-solution-registry.snapshot.generated.json", root), "utf8").then(JSON.parse),
  readFile(new URL("src/lib/enterprise-annuaire.json", root), "utf8").then(JSON.parse),
]);

const errors = [];
const systemSlugs = enterprisePayload.enterprises.map(({ slug }) => slug);
const knownSystemSlugs = snapshot.knownSystemSlugs;
const knownSet = new Set(knownSystemSlugs);
const resourceSlugs = new Set(snapshot.resources.map(({ resource }) => resource.resourceSlug));
const placementIds = new Set();
const placementSlots = new Set();
const coverage = new Map(systemSlugs.map((slug) => [slug, {
  software: 0,
  providers: 0,
  models: 0,
  networks: 0,
}]));
const now = Date.now();

if (snapshot.revisionStatus !== "published") {
  errors.push(`Active fallback revision is ${snapshot.revisionStatus}, expected published.`);
}
if (systemSlugs.length !== 115 || knownSystemSlugs.length !== 115) {
  errors.push(`Expected 115 systems, found catalog=${systemSlugs.length}, snapshot=${knownSystemSlugs.length}.`);
}
for (const slug of systemSlugs) {
  if (!knownSet.has(slug)) errors.push(`Snapshot is missing system ${slug}.`);
}
for (const slug of knownSystemSlugs) {
  if (!coverage.has(slug)) errors.push(`Snapshot contains unknown system ${slug}.`);
}

for (const { resource } of snapshot.resources) {
  const expiresAt = Date.parse(resource.expiresAt);
  if (!Number.isFinite(expiresAt)) errors.push(`Resource ${resource.resourceSlug} has no valid expiry.`);
  else if (expiresAt <= now) errors.push(`Resource ${resource.resourceSlug} review has expired.`);
  if (
    resource.resourceSlug !== "levier" &&
    resource.commercialRelationship !== "unknown"
  ) {
    errors.push(`Third-party resource ${resource.resourceSlug} is not relationship=unknown.`);
  }
}

for (const { placement } of snapshot.placements) {
  if (!coverage.has(placement.systemSlug)) continue;
  if (!resourceSlugs.has(placement.resourceSlug)) {
    errors.push(`Placement ${placement.placementId} references missing resource ${placement.resourceSlug}.`);
  }
  if (placementIds.has(placement.placementId)) {
    errors.push(`Duplicate placement ID ${placement.placementId}.`);
  }
  placementIds.add(placement.placementId);
  const slot = `${placement.systemSlug}:${placement.section}:${placement.rank}`;
  if (placementSlots.has(slot)) errors.push(`Duplicate placement rank ${slot}.`);
  placementSlots.add(slot);
  const expiresAt = Date.parse(placement.expiresAt);
  if (!Number.isFinite(expiresAt)) errors.push(`Placement ${placement.placementId} has no valid expiry.`);
  else if (expiresAt <= now) errors.push(`Placement ${placement.placementId} review has expired.`);
  if (
    placement.resourceSlug !== "levier" &&
    placement.commercialRelationship !== "unknown"
  ) {
    errors.push(`Third-party placement ${placement.placementId} is not relationship=unknown.`);
  }
  const systemCoverage = coverage.get(placement.systemSlug);
  if (placement.section in systemCoverage) systemCoverage[placement.section] += 1;
}

for (const [systemSlug, sections] of coverage) {
  if (sections.software < 1) errors.push(`${systemSlug} has no software recommendation.`);
  if (sections.models !== 1) errors.push(`${systemSlug} must have exactly one model; found ${sections.models}.`);
}

const text = JSON.stringify(snapshot);
if (/\b(?:partenaire|affili[ée]?|odema)\b/i.test(text)) {
  errors.push("The active registry contains a prohibited partnership or affiliation claim.");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const countSystemsWith = (section) =>
  [...coverage.values()].filter((entry) => entry[section] > 0).length;

console.log(JSON.stringify({
  revisionId: snapshot.revisionId,
  systems: systemSlugs.length,
  resources: snapshot.resources.length,
  placements: snapshot.placements.length,
  systemsWithSoftware: countSystemsWith("software"),
  systemsWithProviders: countSystemsWith("providers"),
  systemsWithModels: countSystemsWith("models"),
  systemsWithNetworks: countSystemsWith("networks"),
  expiredReviews: 0,
  status: "ok",
}, null, 2));
