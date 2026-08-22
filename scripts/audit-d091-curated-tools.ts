import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  D091_PILOT_SYSTEM_SLUGS,
  validateCuratedEcosystemCandidateRevision,
  validateCuratedToolsCandidateRevision,
} from "@/lib/curated-tools-candidate-audit";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { getToolDirectorySlug, toolDirectory } from "@/lib/tool-directory";
import {
  validateCuratedSelectionAgainstResearch,
  validateSolutionCurationResearchManifest,
  type SolutionCurationResearchManifest,
} from "@/lib/solution-curation-research-contract";

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
      ? "Usage: npm run audit:d091:pilot -- <candidate.json> [active-revision.json] [research.json]"
      : "Usage: npm run audit:d091 -- <candidate.json> <active-revision.json> <research.json>",
  );
}

const activePath = args[1] ??
  "src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
const researchPath = args[2] ?? (pilotMode
  ? "docs/research/d091-tools/pilot-reviewed-selections.v1.json"
  : undefined);
if (!researchPath) {
  throw new Error(
    "The final D-091 audit requires a reviewed research manifest covering all 115 systems.",
  );
}
const [candidate, activeRevision, research] = await Promise.all([
  readRevision(candidatePath),
  readRevision(activePath),
  readFile(path.resolve(researchPath), "utf8").then((content) =>
    JSON.parse(content) as SolutionCurationResearchManifest
  ),
]);
const canonicalSystemSlugs = enterpriseCatalog.map(({ slug }) => slug);
const auditSystemSlugs = pilotMode
  ? [...D091_PILOT_SYSTEM_SLUGS]
  : canonicalSystemSlugs;
const activeToolSlugs = new Set(toolDirectory.map(getToolDirectorySlug));
const researchErrors = validateSolutionCurationResearchManifest(research, {
  knownSystemSlugs: new Set(canonicalSystemSlugs),
  knownToolSlugs: activeToolSlugs,
});
const selectedToolSlugsBySystem = new Map(
  auditSystemSlugs.map((systemSlug) => [
    systemSlug,
    candidate.placements
      .filter(({ placement }) =>
        placement.systemSlug === systemSlug &&
        placement.section === "software" &&
        placement.editorialStatus === "selected"
      )
      .sort((left, right) => left.placement.rank - right.placement.rank)
      .map(({ placement }) => placement.resourceSlug),
  ]),
);
const errors = [
  ...researchErrors.map((error) => `research manifest: ${error}`),
  ...(researchErrors.length === 0
    ? validateCuratedSelectionAgainstResearch(
        research,
        selectedToolSlugsBySystem,
        auditSystemSlugs,
      )
    : []),
  ...validateFirebaseSolutionRegistryRevision(candidate, {
    expectedSystemSlugs: canonicalSystemSlugs,
  }),
  ...validateFirebaseSolutionRegistryRevision(activeRevision, {
    expectedSystemSlugs: canonicalSystemSlugs,
    requirePublishedRevision: true,
  }).map((error) => `active revision: ${error}`),
  ...validateCuratedToolsCandidateRevision(candidate, {
    activeRevision,
    activeToolSlugs,
    auditSystemSlugs,
    expectedCatalogSystemSlugs: canonicalSystemSlugs,
  }),
  ...validateCuratedEcosystemCandidateRevision(candidate, {
    auditSystemSlugs,
  }),
];

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    revisionId: candidate.revisionId,
    scope: pilotMode ? "five-system-pilot" : "all-115-systems",
    systems: auditSystemSlugs.length,
    softwarePlacements: candidate.placements.filter(
      ({ placement }) => placement.section === "software",
    ).length,
    researchManifest: researchPath,
    status: pilotMode ? "pilot-ready-for-preview" : "ready-for-final-preview",
  }, null, 2));
}
