import { readFile } from "node:fs/promises";
import path from "node:path";

import { validateCuratedToolsCandidateRevision } from "@/lib/curated-tools-candidate-audit";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { getToolDirectorySlug, toolDirectory } from "@/lib/tool-directory";

async function readRevision(filePath: string) {
  return parseFirebaseSolutionRegistryRevision(
    JSON.parse(await readFile(path.resolve(filePath), "utf8")),
  );
}

const candidatePath = process.argv[2];
if (!candidatePath) {
  throw new Error(
    "Usage: npm run audit:d091 -- <candidate.json> [active-revision.json]",
  );
}

const activePath = process.argv[3] ??
  "src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
const [candidate, activeRevision] = await Promise.all([
  readRevision(candidatePath),
  readRevision(activePath),
]);
const expectedSystemSlugs = enterpriseCatalog.map(({ slug }) => slug);
const activeToolSlugs = new Set(toolDirectory.map(getToolDirectorySlug));
const errors = [
  ...validateFirebaseSolutionRegistryRevision(candidate, {
    expectedSystemSlugs,
  }),
  ...validateCuratedToolsCandidateRevision(candidate, {
    activeRevision,
    activeToolSlugs,
    expectedSystemSlugs,
  }),
];

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    revisionId: candidate.revisionId,
    systems: expectedSystemSlugs.length,
    softwarePlacements: candidate.placements.filter(
      ({ placement }) => placement.section === "software",
    ).length,
    status: "ready-for-preview",
  }, null, 2));
}
