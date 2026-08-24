import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  validateReviewedSolutionCurationResearchManifest,
  type ReviewedSolutionCurationResearchManifest,
} from "@/lib/solution-curation-research-contract";
import {
  getToolDirectorySlug,
  toolDirectoryCandidatePool,
} from "@/lib/tool-directory";

const INPUT_PATH =
  "docs/research/d091-tools/lot1-restauration-curation.v1.json";
const PILOT_INPUT_PATH =
  "docs/research/d091-tools/pilot-reviewed-selections.v2.json";
const OUTPUT_PATH =
  "docs/research/d091-tools/lot1-restauration-reviewed-selections.generated.json";
const COMBINED_OUTPUT_PATH =
  "docs/research/d091-tools/lot1-restauration-plus-pilot-reviewed-selections.generated.json";

type SharedToolEvidence = Readonly<{
  targetProfile: string;
  franceAvailability: string;
  officialSourceUrl: string;
  evidenceClaim: string;
  reviewedAt: string;
  fitConstraints: readonly string[];
}>;

type CompactCandidate = Readonly<{
  toolSlug: string;
  coveredNeedIds: readonly string[];
  usage: string;
  fitRationale: string;
  fitConstraints: readonly string[];
}>;

type CompactManifest = Readonly<{
  schemaVersion: 1;
  decisionId: "D-091";
  status: "research-candidate";
  selectionPolicy: "evidence-threshold";
  runtimeActivation: false;
  reviewStage: "placement-reviewed";
  toolEvidence: Readonly<Record<string, SharedToolEvidence>>;
  systems: readonly Readonly<{
    systemSlug: string;
    priorityNeeds: readonly string[];
    toolCandidatesByRank: readonly CompactCandidate[];
    compositionRationale: string;
  }>[];
  activationBlockers: readonly string[];
}>;

const [compact, pilotManifest] = await Promise.all([
  readFile(path.resolve(INPUT_PATH), "utf8").then((input) =>
    JSON.parse(input) as CompactManifest
  ),
  readFile(path.resolve(PILOT_INPUT_PATH), "utf8").then((input) =>
    JSON.parse(input) as ReviewedSolutionCurationResearchManifest
  ),
]);

const usedToolSlugs = new Set(
  compact.systems.flatMap(({ toolCandidatesByRank }) =>
    toolCandidatesByRank.map(({ toolSlug }) => toolSlug)
  ),
);
const evidenceToolSlugs = new Set(Object.keys(compact.toolEvidence));
const missingEvidence = [...usedToolSlugs].filter(
  (toolSlug) => !evidenceToolSlugs.has(toolSlug),
);
const unusedEvidence = [...evidenceToolSlugs].filter(
  (toolSlug) => !usedToolSlugs.has(toolSlug),
);
if (missingEvidence.length > 0 || unusedEvidence.length > 0) {
  throw new Error([
    missingEvidence.length > 0
      ? `Missing shared evidence: ${missingEvidence.join(", ")}`
      : "",
    unusedEvidence.length > 0
      ? `Unused shared evidence: ${unusedEvidence.join(", ")}`
      : "",
  ].filter(Boolean).join("\n"));
}

const manifest: ReviewedSolutionCurationResearchManifest = {
  schemaVersion: 2,
  decisionId: compact.decisionId,
  status: compact.status,
  selectionPolicy: compact.selectionPolicy,
  runtimeActivation: compact.runtimeActivation,
  reviewStage: compact.reviewStage,
  systems: compact.systems.map((system) => ({
    ...system,
    toolCandidatesByRank: system.toolCandidatesByRank.map((candidate) => {
      const evidence = compact.toolEvidence[candidate.toolSlug];
      if (!evidence) throw new Error(`Missing evidence for ${candidate.toolSlug}`);
      return {
        ...candidate,
        fitConstraints: [
          ...evidence.fitConstraints,
          ...candidate.fitConstraints,
        ],
        targetProfile: evidence.targetProfile,
        franceAvailability: evidence.franceAvailability,
        officialSourceUrl: evidence.officialSourceUrl,
        evidenceClaim: evidence.evidenceClaim,
        reviewedAt: evidence.reviewedAt,
      };
    }),
  })),
  activationBlockers: compact.activationBlockers,
};

const errors = validateReviewedSolutionCurationResearchManifest(manifest, {
  knownSystemSlugs: new Set(enterpriseCatalog.map(({ slug }) => slug)),
  knownToolSlugs: new Set(toolDirectoryCandidatePool.map(getToolDirectorySlug)),
});
if (errors.length > 0) {
  throw new Error(`Invalid D-091 restauration review:\n${errors.join("\n")}`);
}

const combinedManifest: ReviewedSolutionCurationResearchManifest = {
  ...pilotManifest,
  systems: [...pilotManifest.systems, ...manifest.systems],
  activationBlockers: [...new Set([
    ...pilotManifest.activationBlockers,
    ...manifest.activationBlockers,
  ])],
};
const combinedErrors = validateReviewedSolutionCurationResearchManifest(
  combinedManifest,
  {
    knownSystemSlugs: new Set(enterpriseCatalog.map(({ slug }) => slug)),
    knownToolSlugs: new Set(toolDirectoryCandidatePool.map(getToolDirectorySlug)),
  },
);
if (combinedErrors.length > 0) {
  throw new Error(
    `Invalid combined D-091 review:\n${combinedErrors.join("\n")}`,
  );
}

const output = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes("--write")) {
  await Promise.all([
    writeFile(path.resolve(OUTPUT_PATH), output, "utf8"),
    writeFile(
      path.resolve(COMBINED_OUTPUT_PATH),
      `${JSON.stringify(combinedManifest, null, 2)}\n`,
      "utf8",
    ),
  ]);
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Wrote ${COMBINED_OUTPUT_PATH}`);
} else {
  process.stdout.write(output);
}
