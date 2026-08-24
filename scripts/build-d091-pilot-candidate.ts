import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  fingerprintFirebaseSolutionRegistryRevision,
  parseFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { buildStableSoftwarePlacementId } from "@/lib/curated-tools-candidate-audit";
import { validateReviewedSolutionCurationResearchManifest } from "@/lib/solution-curation-research-contract";
import {
  getToolDirectorySlug,
  toolDirectoryCandidatePool,
} from "@/lib/tool-directory";

const ACTIVE_REVISION_PATH =
  "src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
const PILOT_REVIEWED_SELECTION_PATH =
  "docs/research/d091-tools/pilot-reviewed-selections.v2.json";
const RESTAURATION_REVIEWED_SELECTION_PATH =
  "docs/research/d091-tools/lot1-restauration-reviewed-selections.generated.json";
const IS_RESTAURATION_GENERALIZATION = process.argv.includes("--restauration");
const REVIEWED_SELECTION_PATHS = IS_RESTAURATION_GENERALIZATION
  ? [PILOT_REVIEWED_SELECTION_PATH, RESTAURATION_REVIEWED_SELECTION_PATH]
  : [PILOT_REVIEWED_SELECTION_PATH];
const OUTPUT_PATH = IS_RESTAURATION_GENERALIZATION
  ? "docs/research/d091-tools/lot1-restauration-candidate-revision.generated.json"
  : "docs/research/d091-tools/pilot-candidate-revision.generated.json";
const CANDIDATE_CREATED_AT = IS_RESTAURATION_GENERALIZATION
  ? "2026-08-24T19:45:00.000Z"
  : "2026-08-24T18:30:00.000Z";
const REVIEW_EXPIRES_AT = "2027-02-24T18:30:00.000Z";
const CANDIDATE_REVISION_ID = IS_RESTAURATION_GENERALIZATION
  ? "solutions-2026-08-24-d091-tpe-restauration-candidate-v1"
  : "solutions-2026-08-24-d091-tpe-pilot-candidate-v4";
const CANDIDATE_REVIEWER = IS_RESTAURATION_GENERALIZATION
  ? "D-091 TPE pilot plus restauration review v1"
  : "D-091 TPE pilot review v4";
const CANDIDATE_VERSION = IS_RESTAURATION_GENERALIZATION
  ? "d091.restauration.v1"
  : "d091.pilot.v4";

type ReviewedCandidate = {
  toolSlug: string;
  coveredNeedIds: string[];
  usage: string;
  fitRationale: string;
  fitConstraints: string[];
  targetProfile: string;
  franceAvailability: string;
  officialSourceUrl: string;
  evidenceClaim: string;
  reviewedAt: string;
};

type ReviewedSystem = {
  systemSlug: string;
  toolCandidatesByRank: ReviewedCandidate[];
};

type ReviewedManifest = {
  reviewStage: "placement-reviewed";
  systems: ReviewedSystem[];
  activationBlockers?: string[];
};

function officialEvidence(input: {
  id: string;
  sourceRef: string;
  claim: string;
  capturedAt: string;
}) {
  return [{
    evidenceId: input.id,
    sourceRef: input.sourceRef,
    claim: input.claim,
    evidenceType: "official_product_page" as const,
    capturedAt: input.capturedAt,
  }];
}

const [activeInput, ...reviewedInputs] = await Promise.all([
  readFile(path.resolve(ACTIVE_REVISION_PATH), "utf8").then(JSON.parse),
  ...REVIEWED_SELECTION_PATHS.map((selectionPath) =>
    readFile(path.resolve(selectionPath), "utf8").then(
      (value) => JSON.parse(value) as ReviewedManifest,
    )
  ),
]);
const active = parseFirebaseSolutionRegistryRevision(activeInput);
const reviewedInput = {
  ...reviewedInputs[0],
  systems: reviewedInputs.flatMap(({ systems }) => systems),
  activationBlockers: [...new Set(
    reviewedInputs.flatMap(({ activationBlockers }) => activationBlockers ?? []),
  )],
};
const toolsBySlug = new Map(
  toolDirectoryCandidatePool.map((tool) => [getToolDirectorySlug(tool), tool]),
);
const reviewedManifestErrors = validateReviewedSolutionCurationResearchManifest(
  reviewedInput,
  {
    knownSystemSlugs: new Set(active.knownSystemSlugs),
    knownToolSlugs: new Set(toolsBySlug.keys()),
  },
);
if (reviewedManifestErrors.length > 0) {
  throw new Error(
    `Reviewed D-091 manifest is invalid:\n${reviewedManifestErrors.join("\n")}`,
  );
}
const selectedSystems = new Set(
  reviewedInput.systems.map(({ systemSlug }) => systemSlug),
);
const selectedToolSlugs = new Set(
  reviewedInput.systems.flatMap(({ toolCandidatesByRank }) =>
    toolCandidatesByRank.map(({ toolSlug }) => toolSlug)
  ),
);
const activeResourcesBySlug = new Map(
  active.resources.map((entry) => [entry.resource.resourceSlug, entry]),
);
const activePlacementsByKey = new Map(
  active.placements
    .filter(({ placement }) => placement.section === "software")
    .map((entry) => [
      `${entry.placement.systemSlug}:${entry.placement.resourceSlug}`,
      entry,
    ]),
);
const reviewedCandidateBySlug = new Map(
  reviewedInput.systems.flatMap(({ toolCandidatesByRank }) =>
    toolCandidatesByRank.map((candidate) => [candidate.toolSlug, candidate] as const)
  ),
);

const resources = active.resources.map((entry) => {
  const resourceSlug = entry.resource.resourceSlug;
  if (!selectedToolSlugs.has(resourceSlug)) return entry;
  const reviewed = reviewedCandidateBySlug.get(resourceSlug);
  if (!reviewed) throw new Error(`Missing reviewed copy for ${resourceSlug}`);
  return {
    resource: {
      ...entry.resource,
      evidence: officialEvidence({
        id: `d091-resource-${resourceSlug}`,
        sourceRef: reviewed.officialSourceUrl,
        claim: reviewed.evidenceClaim,
        capturedAt: reviewed.reviewedAt,
      }),
      reviewer: CANDIDATE_REVIEWER,
      reviewedAt: reviewed.reviewedAt,
      expiresAt: REVIEW_EXPIRES_AT,
      interactionMode: "external_link" as const,
      href: reviewed.officialSourceUrl,
      commercialRelationship: "none" as const,
      status: "published" as const,
      resourceVersion: CANDIDATE_VERSION,
      publicationBlockers: [],
    },
  };
});

for (const toolSlug of selectedToolSlugs) {
  if (activeResourcesBySlug.has(toolSlug)) continue;
  const tool = toolsBySlug.get(toolSlug);
  const reviewed = reviewedCandidateBySlug.get(toolSlug);
  if (!tool || !reviewed) throw new Error(`Missing canonical tool ${toolSlug}`);
  resources.push({
    resource: {
      evidence: officialEvidence({
        id: `d091-resource-${toolSlug}`,
        sourceRef: reviewed.officialSourceUrl,
        claim: reviewed.evidenceClaim,
        capturedAt: reviewed.reviewedAt,
      }),
      reviewer: CANDIDATE_REVIEWER,
      reviewedAt: reviewed.reviewedAt,
      expiresAt: REVIEW_EXPIRES_AT,
      interactionMode: "external_link",
      href: reviewed.officialSourceUrl,
      resourceSlug: toolSlug,
      resourceType: "software",
      name: tool.name,
      description: tool.description,
      commercialRelationship: "none",
      status: "published",
      resourceVersion: CANDIDATE_VERSION,
      publicationBlockers: [],
    },
  });
}

const placements = active.placements
  .filter(({ placement }) =>
    !(
      selectedSystems.has(placement.systemSlug) &&
      ["software", "providers", "networks"].includes(placement.section)
    )
  )
  .map((entry) => {
    if (!selectedToolSlugs.has(entry.placement.resourceSlug)) return entry;
    const activeResource = activeResourcesBySlug.get(
      entry.placement.resourceSlug,
    )?.resource;
    if (!activeResource) return entry;
    const existingHref = entry.presentation.hrefOverride ??
      ("href" in activeResource ? activeResource.href : undefined);
    if (!existingHref) {
      throw new Error(
        `Missing existing external destination for ${entry.placement.placementId}`,
      );
    }
    return {
      ...entry,
      placement: {
        ...entry.placement,
        commercialRelationship: "none" as const,
      },
      presentation: {
        ...entry.presentation,
        // A resource is shared by every system. Publishing its reviewed pilot
        // destination must not silently change the destination rendered by a
        // non-pilot placement that already references the same resource.
        hrefOverride: existingHref,
      },
    };
  });

for (const system of reviewedInput.systems) {
  system.toolCandidatesByRank.forEach((reviewed, index) => {
    const tool = toolsBySlug.get(reviewed.toolSlug);
    if (!tool) throw new Error(`Missing canonical tool ${reviewed.toolSlug}`);
    const previous = activePlacementsByKey.get(
      `${system.systemSlug}:${reviewed.toolSlug}`,
    );
    const placementId = previous?.placement.placementId ??
      buildStableSoftwarePlacementId({
        systemSlug: system.systemSlug,
        resourceSlug: reviewed.toolSlug,
      });
    placements.push({
      placement: {
        evidence: officialEvidence({
          id: `d091-placement-${system.systemSlug}-${reviewed.toolSlug}`,
          sourceRef: reviewed.officialSourceUrl,
          claim: reviewed.evidenceClaim,
          capturedAt: reviewed.reviewedAt,
        }),
        reviewer: CANDIDATE_REVIEWER,
        reviewedAt: reviewed.reviewedAt,
        expiresAt: REVIEW_EXPIRES_AT,
        placementId,
        systemSlug: system.systemSlug,
        resourceSlug: reviewed.toolSlug,
        rank: index + 1,
        section: "software",
        usage: reviewed.usage,
        fitRationale: reviewed.fitRationale,
        fitConstraints: reviewed.fitConstraints,
        editorialStatus: "selected",
        commercialRelationship: "none",
        status: "published",
        placementVersion: CANDIDATE_VERSION,
        publicationBlockers: [],
      },
      presentation: {
        displayCategory: tool.category,
        nameOverride: tool.name,
        hrefOverride: reviewed.officialSourceUrl,
        ctaLabel: "Voir l’outil",
        descriptionOverride: tool.description,
      },
    });
  });
}

const candidateWithoutFingerprint = {
  schemaVersion: 1,
  revisionId: CANDIDATE_REVISION_ID,
  revisionStatus: "draft",
  createdAt: CANDIDATE_CREATED_AT,
  createdBy: CANDIDATE_REVIEWER,
  sourceFingerprint: "0".repeat(64),
  knownSystemSlugs: [...active.knownSystemSlugs],
  resources,
  placements,
};
const candidate = {
  ...candidateWithoutFingerprint,
  sourceFingerprint: fingerprintFirebaseSolutionRegistryRevision(
    candidateWithoutFingerprint,
  ),
};
const output = `${JSON.stringify(candidate, null, 2)}\n`;

if (process.argv.includes("--write")) {
  await writeFile(path.resolve(OUTPUT_PATH), output, "utf8");
  console.log(`Wrote ${OUTPUT_PATH}`);
} else {
  process.stdout.write(output);
}
