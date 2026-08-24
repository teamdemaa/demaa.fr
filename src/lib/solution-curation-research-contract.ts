export type CuratedToolResearchCandidate = Readonly<{
  toolSlug: string;
  coveredNeedIds: readonly string[];
}>;

export type ReviewedCuratedToolResearchCandidate = CuratedToolResearchCandidate & Readonly<{
  usage: string;
  fitRationale: string;
  fitConstraints: readonly string[];
  targetProfile: string;
  franceAvailability: string;
  officialSourceUrl: string;
  evidenceClaim: string;
  reviewedAt: string;
}>;

export type SystemToolCurationResearch = Readonly<{
  systemSlug: string;
  priorityNeeds: readonly string[];
  toolCandidatesByRank: readonly CuratedToolResearchCandidate[];
  compositionRationale: string;
}>;

export type SolutionCurationResearchManifest = Readonly<{
  schemaVersion: 2;
  decisionId: string;
  status: "research-candidate";
  selectionPolicy: "evidence-threshold";
  runtimeActivation: false;
  systems: readonly SystemToolCurationResearch[];
  activationBlockers: readonly string[];
}>;

export type ReviewedSolutionCurationResearchManifest = Omit<
  SolutionCurationResearchManifest,
  "systems"
> & Readonly<{
  reviewStage: "placement-reviewed";
  systems: readonly (Omit<SystemToolCurationResearch, "toolCandidatesByRank"> & Readonly<{
    toolCandidatesByRank: readonly ReviewedCuratedToolResearchCandidate[];
  }>)[];
}>;

type CuratedSelectionBySystem = ReadonlyMap<string, readonly string[]>;

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function stringArray(input: unknown): string[] | null {
  if (!Array.isArray(input) || input.some((entry) => typeof entry !== "string")) {
    return null;
  }
  return input;
}

/**
 * Checks the editorial research source without turning it into runtime truth.
 * Publication evidence and review metadata remain enforced on Firebase
 * resources and placements by the candidate revision audit.
 */
export function validateSolutionCurationResearchManifest(
  input: unknown,
  options: Readonly<{
    knownSystemSlugs: ReadonlySet<string>;
    knownToolSlugs: ReadonlySet<string>;
  }>,
): string[] {
  if (!isRecord(input)) return ["research manifest must be an object"];
  const errors: string[] = [];
  if (input.schemaVersion !== 2) errors.push("research manifest schemaVersion must be 2");
  if (input.decisionId !== "D-091") errors.push("research manifest decisionId must be D-091");
  if (input.status !== "research-candidate") errors.push("research manifest status is invalid");
  if (input.selectionPolicy !== "evidence-threshold") {
    errors.push("research manifest must use the evidence-threshold selection policy");
  }
  if (input.runtimeActivation !== false) {
    errors.push("research manifest must never activate runtime data");
  }
  const activationBlockers = stringArray(input.activationBlockers);
  if (!activationBlockers || activationBlockers.length === 0) {
    errors.push("research manifest requires explicit activation blockers");
  }
  if (!Array.isArray(input.systems) || input.systems.length === 0) {
    errors.push("research manifest requires at least one system");
    return errors;
  }

  const seenSystems = new Set<string>();
  for (const [systemIndex, rawSystem] of input.systems.entries()) {
    const path = `systems[${systemIndex}]`;
    if (!isRecord(rawSystem)) {
      errors.push(`${path} must be an object`);
      continue;
    }
    const systemSlug = typeof rawSystem.systemSlug === "string"
      ? rawSystem.systemSlug
      : "";
    if (!options.knownSystemSlugs.has(systemSlug)) {
      errors.push(`${path}.systemSlug is unknown`);
    }
    if (seenSystems.has(systemSlug)) errors.push(`${path}.systemSlug is duplicated`);
    seenSystems.add(systemSlug);

    const priorityNeeds = stringArray(rawSystem.priorityNeeds);
    if (!priorityNeeds || priorityNeeds.length === 0) {
      errors.push(`${path}.priorityNeeds must be a non-empty string array`);
      continue;
    }
    if (new Set(priorityNeeds).size !== priorityNeeds.length) {
      errors.push(`${path}.priorityNeeds contains duplicates`);
    }
    const priorityNeedSet = new Set(priorityNeeds);
    const coveredNeeds = new Set<string>();
    const seenTools = new Set<string>();
    if (
      !Array.isArray(rawSystem.toolCandidatesByRank) ||
      rawSystem.toolCandidatesByRank.length === 0
    ) {
      errors.push(`${path}.toolCandidatesByRank must be non-empty`);
      continue;
    }
    for (const [toolIndex, rawTool] of rawSystem.toolCandidatesByRank.entries()) {
      const toolPath = `${path}.toolCandidatesByRank[${toolIndex}]`;
      if (!isRecord(rawTool)) {
        errors.push(`${toolPath} must be an object`);
        continue;
      }
      const toolSlug = typeof rawTool.toolSlug === "string" ? rawTool.toolSlug : "";
      if (!options.knownToolSlugs.has(toolSlug)) errors.push(`${toolPath}.toolSlug is unknown`);
      if (seenTools.has(toolSlug)) errors.push(`${toolPath}.toolSlug is duplicated`);
      seenTools.add(toolSlug);
      const coveredNeedIds = stringArray(rawTool.coveredNeedIds);
      if (!coveredNeedIds || coveredNeedIds.length === 0) {
        errors.push(`${toolPath}.coveredNeedIds must be non-empty`);
        continue;
      }
      if (new Set(coveredNeedIds).size !== coveredNeedIds.length) {
        errors.push(`${toolPath}.coveredNeedIds contains duplicates`);
      }
      for (const needId of coveredNeedIds) {
        if (!priorityNeedSet.has(needId)) {
          errors.push(`${toolPath} references unknown need ${needId}`);
        } else {
          coveredNeeds.add(needId);
        }
      }
    }
    for (const needId of priorityNeeds) {
      if (!coveredNeeds.has(needId)) errors.push(`${path} does not cover priority need ${needId}`);
    }
    if (
      typeof rawSystem.compositionRationale !== "string" ||
      rawSystem.compositionRationale.trim().length < 50
    ) {
      errors.push(`${path}.compositionRationale is too short`);
    }
  }

  return errors;
}

/**
 * Tightens the generic research contract for a placement-level business
 * review. A candidate revision may only be built from this richer manifest:
 * every placement carries its target, France fit, constraints, official proof
 * and review date. The validator remains read-only and fail-closed.
 */
export function validateReviewedSolutionCurationResearchManifest(
  input: unknown,
  options: Readonly<{
    knownSystemSlugs: ReadonlySet<string>;
    knownToolSlugs: ReadonlySet<string>;
  }>,
): string[] {
  const errors = validateSolutionCurationResearchManifest(input, options);
  if (!isRecord(input)) return errors;
  if (input.reviewStage !== "placement-reviewed") {
    errors.push("reviewed research manifest reviewStage is invalid");
  }
  if (!Array.isArray(input.systems)) return errors;

  for (const [systemIndex, rawSystem] of input.systems.entries()) {
    if (!isRecord(rawSystem) || !Array.isArray(rawSystem.toolCandidatesByRank)) continue;
    for (const [toolIndex, rawTool] of rawSystem.toolCandidatesByRank.entries()) {
      const path = `systems[${systemIndex}].toolCandidatesByRank[${toolIndex}]`;
      if (!isRecord(rawTool)) continue;
      for (const [field, minimumLength] of [
        ["usage", 20],
        ["fitRationale", 30],
        ["targetProfile", 30],
        ["franceAvailability", 30],
        ["evidenceClaim", 30],
      ] as const) {
        if (
          typeof rawTool[field] !== "string" ||
          rawTool[field].trim().length < minimumLength
        ) {
          errors.push(`${path}.${field} is too short`);
        }
      }
      const constraints = stringArray(rawTool.fitConstraints);
      if (
        !constraints ||
        constraints.length === 0 ||
        constraints.some((constraint) => constraint.trim().length < 20)
      ) {
        errors.push(`${path}.fitConstraints requires factual constraints`);
      }
      if (
        typeof rawTool.officialSourceUrl !== "string" ||
        !rawTool.officialSourceUrl.startsWith("https://")
      ) {
        errors.push(`${path}.officialSourceUrl must be HTTPS`);
      }
      if (
        typeof rawTool.reviewedAt !== "string" ||
        !Number.isFinite(Date.parse(rawTool.reviewedAt))
      ) {
        errors.push(`${path}.reviewedAt is invalid`);
      }
    }
  }

  return errors;
}

/**
 * Connects the editorial needs map to the actual Firebase selection. The
 * manifest remains research-only: this validator can reject a candidate but
 * can never create or activate registry data.
 */
export function validateCuratedSelectionAgainstResearch(
  manifest: SolutionCurationResearchManifest,
  selectedToolSlugsBySystem: CuratedSelectionBySystem,
  auditSystemSlugs: readonly string[],
): string[] {
  const errors: string[] = [];
  const researchBySystem = new Map(
    manifest.systems.map((system) => [system.systemSlug, system]),
  );

  for (const systemSlug of auditSystemSlugs) {
    const research = researchBySystem.get(systemSlug);
    if (!research) {
      errors.push(`${systemSlug}: research coverage is missing`);
      continue;
    }
    const selectedToolSlugs = selectedToolSlugsBySystem.get(systemSlug) ?? [];
    const candidatesBySlug = new Map(
      research.toolCandidatesByRank.map((candidate) => [candidate.toolSlug, candidate]),
    );
    for (const toolSlug of selectedToolSlugs) {
      if (!candidatesBySlug.has(toolSlug)) {
        errors.push(`${systemSlug}:${toolSlug}: selected tool is absent from reviewed research`);
      }
    }

    const reviewedRankByToolSlug = new Map(
      research.toolCandidatesByRank.map((candidate, index) => [candidate.toolSlug, index]),
    );
    const selectedReviewedRanks = selectedToolSlugs.flatMap((toolSlug) => {
      const rank = reviewedRankByToolSlug.get(toolSlug);
      return rank === undefined ? [] : [rank];
    });
    if (selectedReviewedRanks.some((rank, index) =>
      index > 0 && rank <= selectedReviewedRanks[index - 1]!
    )) {
      errors.push(`${systemSlug}: selected tool order differs from reviewed research`);
    }

    const coveredNeedIds = new Set(
      selectedToolSlugs.flatMap((toolSlug) =>
        candidatesBySlug.get(toolSlug)?.coveredNeedIds ?? []
      ),
    );
    for (const needId of research.priorityNeeds) {
      if (!coveredNeedIds.has(needId)) {
        errors.push(`${systemSlug}: selected tools do not cover priority need ${needId}`);
      }
    }
  }

  return errors;
}
