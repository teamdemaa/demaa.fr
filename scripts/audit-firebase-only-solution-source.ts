import { readFile } from "node:fs/promises";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import {
  parseFirebaseToolComparisonDocument,
  type FirebaseToolComparisonDocument,
} from "@/lib/firebase-tool-comparison-contract";
import { buildFirestoreToolComparisonImportPlan } from "@/lib/firebase-tool-comparison-firestore-plan";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");
const [artifactSource, readerSource, packageSource, canonicalSource, pageSource] =
  await Promise.all([
    read("docs/research/d091-tools/firebase-only-comparison-candidate.generated.json"),
    read("src/lib/firebase-solution-registry.server.ts"),
    read("package.json"),
    read("src/lib/canonical-services-system-section.server.ts"),
    read("src/app/(marketing)/solutions/[slug]/page.tsx"),
  ]);
const artifact = JSON.parse(artifactSource);
const packageJson = JSON.parse(packageSource);
const candidate = parseFirebaseSolutionRegistryRevision(artifact.candidateRevision);
const registryIssues = validateFirebaseSolutionRegistryRevision(candidate, {
  expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
  now: new Date(artifact.generatedAt),
  requirePublishedRevision: true,
});
const errors = [...registryIssues];

const candidatePlan = artifact.candidateComparisonPlan;
const documents: FirebaseToolComparisonDocument[] = candidatePlan.writes
  .filter(({ path }: { path: string }) => path.includes("/systems/"))
  .map(({ data }: { data: unknown }) => parseFirebaseToolComparisonDocument(data));
const rebuiltPlan = buildFirestoreToolComparisonImportPlan({
  revision: candidate,
  documents,
  blockedSystemSlugs: candidatePlan.blockedSystemSlugs,
  now: new Date(artifact.generatedAt),
});
for (const document of documents.filter(
  ({ publicationStatus }) => publicationStatus === "published",
)) {
  for (const feature of document.comparison.features) {
    for (const cell of feature.cells) {
      if (cell.status !== "not_documented" && cell.evidenceIds.length === 0) {
        errors.push(
          `Published positive cell ${document.systemSlug}/${feature.featureId} has no evidence.`,
        );
      }
    }
  }
}
if (rebuiltPlan.planFingerprint !== candidatePlan.planFingerprint) {
  errors.push("Candidate comparison plan fingerprint is not reproducible.");
}
if (candidate.knownSystemSlugs.length !== 115) {
  errors.push(`Candidate covers ${candidate.knownSystemSlugs.length} systems instead of 115.`);
}
if (candidatePlan.publishedSystemSlugs.length !== 4) {
  errors.push("Exactly four reviewed comparison systems must be published.");
}
if (
  candidatePlan.draftSystemSlugs.length +
    candidatePlan.blockedSystemSlugs.length +
    candidatePlan.publishedSystemSlugs.length !== 115
) {
  errors.push("The comparison readiness plan does not classify all 115 systems.");
}
if (/snapshot\.generated\.json/.test(readerSource)) {
  errors.push("The runtime Firebase Solutions reader imports a local snapshot.");
}
if (/DEMAA_FORCE_LOCAL_DATA/.test(readerSource)) {
  errors.push("The runtime Firebase Solutions reader still accepts a local-data bypass.");
}
for (const scriptName of ["build", "build:vercel", "build:stable"]) {
  if ((packageJson.scripts?.[scriptName] ?? "").includes("DEMAA_FORCE_LOCAL_DATA")) {
    errors.push(`${scriptName} still forces local Solutions data.`);
  }
}
if (packageJson.scripts?.["start:local-data"]) {
  errors.push("start:local-data must remain removed.");
}
if (/LOCAL_PILOT_SOFTWARE_SYSTEMS|getRenderableSolutionSectionsForSystem/.test(canonicalSource)) {
  errors.push("Canonical public sections still replace Firebase software locally.");
}
if (!pageSource.includes("getFirebaseToolComparisonViewForRevision")) {
  errors.push("The public solution page does not read its comparison from Firebase.");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "ok",
  source: "firebase-only-software-and-comparisons",
  candidateRevisionId: candidate.revisionId,
  candidateFingerprint: candidate.sourceFingerprint,
  systems: candidate.knownSystemSlugs.length,
  resources: candidate.resources.length,
  placements: candidate.placements.length,
  publishedComparisons: candidatePlan.publishedSystemSlugs,
  draftComparisons: candidatePlan.draftSystemSlugs.length,
  blockedComparisons: candidatePlan.blockedSystemSlugs,
  comparisonPlanFingerprint: candidatePlan.planFingerprint,
}, null, 2));
