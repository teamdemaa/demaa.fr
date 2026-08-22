import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  D091_PILOT_SYSTEM_SLUGS,
  validateCuratedToolsCandidateRevision,
} from "@/lib/curated-tools-candidate-audit";
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

const args = process.argv.slice(2);
const pilotMode = args[0] === "--pilot";
if (pilotMode) args.shift();
const candidatePath = args[0];
if (!candidatePath) {
  throw new Error(
    pilotMode
      ? "Usage: npm run audit:d091:pilot -- <candidate.json> [active-revision.json]"
      : "Usage: npm run audit:d091 -- <candidate.json> [active-revision.json]",
  );
}

const activePath = args[1] ??
  "src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
const [candidate, activeRevision] = await Promise.all([
  readRevision(candidatePath),
  readRevision(activePath),
]);
const canonicalSystemSlugs = enterpriseCatalog.map(({ slug }) => slug);
const expectedSystemSlugs = pilotMode
  ? [...D091_PILOT_SYSTEM_SLUGS]
  : canonicalSystemSlugs;
const activeToolSlugs = new Set(toolDirectory.map(getToolDirectorySlug));
const errors = [
  ...validateFirebaseSolutionRegistryRevision(candidate, {
    expectedSystemSlugs,
  }),
  ...validateFirebaseSolutionRegistryRevision(activeRevision, {
    expectedSystemSlugs: canonicalSystemSlugs,
    requirePublishedRevision: true,
  }).map((error) => `active revision: ${error}`),
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
    scope: pilotMode ? "five-system-pilot" : "all-115-systems",
    systems: expectedSystemSlugs.length,
    softwarePlacements: candidate.placements.filter(
      ({ placement }) => placement.section === "software",
    ).length,
    status: pilotMode ? "pilot-ready-for-preview" : "ready-for-final-preview",
  }, null, 2));
}
