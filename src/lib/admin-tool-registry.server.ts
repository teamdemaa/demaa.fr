import "server-only";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  fetchActiveFirebaseSolutionRegistryRevisionFromFirestore,
  fetchFirebaseSolutionRegistryRevisionByIdFromFirestore,
} from "@/lib/firebase-solution-registry.server";
import {
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";

export type AdminToolPlacement = Readonly<{
  evidenceSources: readonly string[];
  expiresAt: string | null;
  fitConstraints: readonly string[];
  fitRationale: string;
  name: string;
  placementId: string;
  placementStatus: string;
  rank: number;
  resourceSlug: string;
  resourceStatus: string;
  reviewedAt: string | null;
  usage: string;
}>;

export type AdminToolSystem = Readonly<{
  activeTools: readonly AdminToolPlacement[];
  addedResourceSlugs: readonly string[];
  candidateTools: readonly AdminToolPlacement[] | null;
  name: string;
  removedResourceSlugs: readonly string[];
  slug: string;
}>;

type RevisionSummary = Readonly<{
  createdAt: string;
  revisionId: string;
  revisionStatus: string;
  sourceFingerprint: string;
}>;

export type AdminToolRegistryReadModel =
  | Readonly<{
      error: string;
      status: "unavailable";
    }>
  | Readonly<{
      active: RevisionSummary;
      candidate: RevisionSummary | null;
      candidateError: string | null;
      candidateRevisionId: string | null;
      status: "ready";
      systems: readonly AdminToolSystem[];
    }>;

type Dependencies = Readonly<{
  candidateRevisionId?: string | null;
  fetchActive?: () => Promise<FirebaseSolutionRegistryRevision>;
  fetchCandidate?: (revisionId: string) => Promise<FirebaseSolutionRegistryRevision>;
  now?: Date;
  warn?: (message: string) => void;
}>;

function summarizeRevision(revision: FirebaseSolutionRegistryRevision): RevisionSummary {
  return {
    createdAt: revision.createdAt,
    revisionId: revision.revisionId,
    revisionStatus: revision.revisionStatus,
    sourceFingerprint: revision.sourceFingerprint,
  };
}

function buildToolPlacements(
  revision: FirebaseSolutionRegistryRevision,
  systemSlug: string,
): readonly AdminToolPlacement[] {
  const resourcesBySlug = new Map(
    revision.resources.map(({ resource }) => [resource.resourceSlug, resource]),
  );

  return revision.placements
    .filter(({ placement }) =>
      placement.systemSlug === systemSlug
      && placement.section === "software"
      && placement.editorialStatus === "selected"
    )
    .sort((left, right) => left.placement.rank - right.placement.rank)
    .flatMap(({ placement }) => {
      const resource = resourcesBySlug.get(placement.resourceSlug);
      if (!resource) return [];
      const evidenceSources = [...new Set([
        ...placement.evidence.map(({ sourceRef }) => sourceRef),
        ...resource.evidence.map(({ sourceRef }) => sourceRef),
      ])];
      return [{
        evidenceSources,
        expiresAt: placement.expiresAt ?? resource.expiresAt,
        fitConstraints: placement.fitConstraints,
        fitRationale: placement.fitRationale,
        name: resource.name,
        placementId: placement.placementId,
        placementStatus: placement.status,
        rank: placement.rank,
        resourceSlug: resource.resourceSlug,
        resourceStatus: resource.status,
        reviewedAt: placement.reviewedAt ?? resource.reviewedAt,
        usage: placement.usage,
      }];
    });
}

function validateRevision(
  revision: FirebaseSolutionRegistryRevision,
  now: Date,
  requirePublishedRevision: boolean,
) {
  return validateFirebaseSolutionRegistryRevision(revision, {
    expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
    now,
    requirePublishedRevision,
  });
}

function errorDetail(error: unknown) {
  return error instanceof Error ? error.message : "unknown error";
}

export async function loadAdminToolRegistryReadModel(
  dependencies: Dependencies = {},
): Promise<AdminToolRegistryReadModel> {
  const now = dependencies.now ?? new Date();
  const candidateRevisionId = dependencies.candidateRevisionId
    ?? process.env.DEMAA_SOLUTION_REGISTRY_CANDIDATE_REVISION_ID
    ?? null;
  const activePromise = (
    dependencies.fetchActive ?? fetchActiveFirebaseSolutionRegistryRevisionFromFirestore
  )();
  const candidatePromise = candidateRevisionId
    ? (dependencies.fetchCandidate ?? fetchFirebaseSolutionRegistryRevisionByIdFromFirestore)(
        candidateRevisionId,
      )
    : Promise.resolve(null);
  const [activeResult, candidateResult] = await Promise.allSettled([
    activePromise,
    candidatePromise,
  ]);

  if (activeResult.status === "rejected") {
    (dependencies.warn ?? console.error)(
      `[admin-tools] Active Firebase revision unavailable: ${errorDetail(activeResult.reason)}`,
    );
    return {
      status: "unavailable",
      error: "La révision active des Outils est indisponible. Aucun fallback local n'est affiché.",
    };
  }

  const activeErrors = validateRevision(activeResult.value, now, true);
  if (activeErrors.length > 0) {
    (dependencies.warn ?? console.error)(
      `[admin-tools] Active Firebase revision is invalid: ${activeErrors.join("; ")}`,
    );
    return {
      status: "unavailable",
      error: "La révision active des Outils est invalide. Aucun fallback local n'est affiché.",
    };
  }

  let candidate: FirebaseSolutionRegistryRevision | null = null;
  let candidateError: string | null = null;
  if (candidateResult.status === "rejected") {
    candidateError = "La candidate configurée est introuvable ou illisible.";
    (dependencies.warn ?? console.error)(
      `[admin-tools] Candidate Firebase revision unavailable: ${errorDetail(candidateResult.reason)}`,
    );
  } else if (candidateResult.value) {
    const candidateErrors = validateRevision(candidateResult.value, now, false);
    if (candidateErrors.length > 0) {
      candidateError = "La candidate configurée ne respecte pas le contrat D-091.";
      (dependencies.warn ?? console.error)(
        `[admin-tools] Candidate Firebase revision is invalid: ${candidateErrors.join("; ")}`,
      );
    } else {
      candidate = candidateResult.value;
    }
  }

  const systems = enterpriseCatalog.map(({ name, slug }) => {
    const activeTools = buildToolPlacements(activeResult.value, slug);
    const candidateTools = candidate ? buildToolPlacements(candidate, slug) : null;
    const activeSlugs = new Set(activeTools.map(({ resourceSlug }) => resourceSlug));
    const candidateSlugs = new Set(
      candidateTools?.map(({ resourceSlug }) => resourceSlug) ?? [],
    );
    return {
      activeTools,
      addedResourceSlugs: candidateTools
        ? [...candidateSlugs].filter((resourceSlug) => !activeSlugs.has(resourceSlug))
        : [],
      candidateTools,
      name,
      removedResourceSlugs: candidateTools
        ? [...activeSlugs].filter((resourceSlug) => !candidateSlugs.has(resourceSlug))
        : [],
      slug,
    };
  });

  return {
    active: summarizeRevision(activeResult.value),
    candidate: candidate ? summarizeRevision(candidate) : null,
    candidateError,
    candidateRevisionId,
    status: "ready",
    systems,
  };
}
