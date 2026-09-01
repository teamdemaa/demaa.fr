import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import localSnapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
import {
  fingerprintFirebaseSolutionRegistryRevision,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import { fetchActiveFirebaseSolutionRegistryRevisionFromFirestore } from "@/lib/firebase-solution-registry.server";
import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";
import type { FirebaseToolComparisonDocument } from "@/lib/firebase-tool-comparison-contract";
import { buildFirestoreToolComparisonImportPlan } from "@/lib/firebase-tool-comparison-firestore-plan";
import { composePublicSolutionSectionsForSystem } from "@/lib/canonical-services-system-section.server";
import { filterPublicSystemRecommendationSections } from "@/lib/public-solution-section-visibility";
import { mergeRenderableSolutionSections } from "@/lib/system-solutions-ui-dto";
import {
  getToolCapabilityComparisonReview,
  isReviewedGenericToolComparisonSystem,
} from "@/lib/tool-capability-comparison-data";
import { TOOL_PROCESS_COMPARISON_REVIEWS } from "@/lib/tool-process-comparison-data";
import { buildToolProcessComparisonView } from "@/lib/tool-process-comparison.server";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";

const CANDIDATE_REVISION_ID =
  "solutions-2026-09-01-firebase-only-comparisons-evidence-v2-1";
const CREATED_AT = "2026-09-01T15:00:00.000Z";
const EXPIRES_AT = "2027-02-28";
const REVIEWED_SYSTEMS = new Set([
  "cabinet-comptable",
  "batiment",
  "restaurant",
  "gestionnaire-paie-independant",
]);

if (new Date(CREATED_AT).getTime() > Date.now()) {
  throw new Error("Candidate creation timestamp must not be in the future.");
}

function argument(prefix: string) {
  return process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
}

function comparePlacements(
  left: FirebaseSolutionRegistryRevision["placements"][number],
  right: FirebaseSolutionRegistryRevision["placements"][number],
) {
  const systems = new Map(
    enterpriseCatalog.map(({ slug }, index) => [slug, index]),
  );
  const sections = new Map(
    ["software", "services", "providers", "financing", "aids", "models", "networks"]
      .map((section, index) => [section, index]),
  );
  return (
    (systems.get(left.placement.systemSlug) ?? 999) -
      (systems.get(right.placement.systemSlug) ?? 999) ||
    (sections.get(left.placement.section) ?? 999) -
      (sections.get(right.placement.section) ?? 999) ||
    left.placement.rank - right.placement.rank ||
    left.placement.placementId.localeCompare(right.placement.placementId)
  );
}

function buildPayfitEntries() {
  const tool = getToolDirectoryItemBySlug("payfit");
  if (!tool) throw new Error("PayFit is missing from the reviewed tool directory");
  const capturedAt = CREATED_AT;
  const expiresAt = `${EXPIRES_AT}T23:59:59.999Z`;
  const sources = tool.sources ?? [];
  if (sources.length === 0) throw new Error("PayFit has no reviewed source URL");
  const evidence = sources.map((sourceRef, index) => ({
    evidenceId: `firebase-only-payfit-${index + 1}`,
    sourceRef,
    claim: "PayFit documente ses fonctions de paie, déclarations sociales et gestion RH.",
    evidenceType: "official_product_page" as const,
    capturedAt,
  }));
  return {
    resource: {
      resource: {
        evidence,
        reviewer: "Demaa — migration Firebase-only",
        reviewedAt: capturedAt,
        expiresAt,
        interactionMode: "external_link" as const,
        href: tool.url,
        resourceSlug: "payfit",
        resourceType: "software" as const,
        name: tool.name,
        description: tool.description,
        commercialRelationship: "unknown" as const,
        status: "draft" as const,
        resourceVersion: "firebase.v1",
        publicationBlockers: ["commercial-relationship-unconfirmed"],
      },
    },
    placement: {
      placement: {
        evidence,
        reviewer: "Demaa — migration Firebase-only",
        reviewedAt: capturedAt,
        expiresAt,
        placementId: "gestionnaire-paie-independant:payfit:software:2",
        systemSlug: "gestionnaire-paie-independant",
        resourceSlug: "payfit",
        rank: 2,
        section: "software" as const,
        usage: "Gérer les bulletins, variables, déclarations sociales et le suivi RH.",
        fitRationale: tool.description,
        fitConstraints: [
          "Vérifier le périmètre multi-dossiers et le niveau d’accompagnement attendu.",
        ],
        editorialStatus: "selected" as const,
        commercialRelationship: "unknown" as const,
        status: "draft" as const,
        placementVersion: "firebase.v1",
        publicationBlockers: ["commercial-relationship-unconfirmed"],
      },
      presentation: {
        displayCategory: tool.category,
        nameOverride: tool.name,
        hrefOverride: tool.url,
        ctaLabel: "Voir l’outil",
        descriptionOverride: tool.description,
      },
    },
  };
}

function buildCandidateRevision(
  active: FirebaseSolutionRegistryRevision,
): FirebaseSolutionRegistryRevision {
  const local = parseFirebaseSolutionRegistryRevision(localSnapshot);
  const resources = new Map(
    active.resources.map((entry) => [entry.resource.resourceSlug, entry]),
  );
  const placements = new Map(
    active.placements.map((entry) => [entry.placement.placementId, entry]),
  );

  for (const resourceSlug of ["l-addition", "revya", "uber-eats"]) {
    const resource = local.resources.find(
      (entry) => entry.resource.resourceSlug === resourceSlug,
    );
    const placement = local.placements.find((entry) =>
      entry.placement.systemSlug === "restaurant" &&
      entry.placement.resourceSlug === resourceSlug &&
      entry.placement.section === "software"
    );
    if (!resource || !placement) {
      throw new Error(`Reviewed restaurant addition is incomplete: ${resourceSlug}`);
    }
    if (!resources.has(resourceSlug)) resources.set(resourceSlug, resource);
    const existing = [...placements.values()].some((entry) =>
      entry.placement.systemSlug === "restaurant" &&
      entry.placement.resourceSlug === resourceSlug &&
      entry.placement.section === "software"
    );
    if (!existing) placements.set(placement.placement.placementId, placement);
  }

  const payfit = buildPayfitEntries();
  if (!resources.has("payfit")) resources.set("payfit", payfit.resource);
  const hasPayfit = [...placements.values()].some((entry) =>
    entry.placement.systemSlug === "gestionnaire-paie-independant" &&
    entry.placement.resourceSlug === "payfit" &&
    entry.placement.section === "software"
  );
  if (!hasPayfit) placements.set(payfit.placement.placement.placementId, payfit.placement);

  const base = {
    ...active,
    revisionId: CANDIDATE_REVISION_ID,
    revisionStatus: "published" as const,
    createdAt: CREATED_AT,
    createdBy: "Demaa — Firebase-only tool comparisons",
    sourceFingerprint: "0".repeat(64),
    resources: [...resources.values()].sort((left, right) =>
      left.resource.resourceSlug.localeCompare(right.resource.resourceSlug)
    ),
    placements: [...placements.values()].sort(comparePlacements),
  };
  const candidate = parseFirebaseSolutionRegistryRevision({
    ...base,
    sourceFingerprint: fingerprintFirebaseSolutionRegistryRevision(base),
  });
  const errors = validateFirebaseSolutionRegistryRevision(candidate, {
    expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
    now: new Date(CREATED_AT),
    requirePublishedRevision: true,
  });
  if (errors.length > 0) {
    throw new Error(`Invalid Firebase-only candidate:\n${errors.join("\n")}`);
  }
  return candidate;
}

function getEvidenceMetadata(
  systemSlug: string,
  resourceSlugs: readonly string[],
) {
  const reviews = systemSlug === "cabinet-comptable"
    ? TOOL_PROCESS_COMPARISON_REVIEWS
        .filter((review) =>
          review.systemSlug === systemSlug && resourceSlugs.includes(review.resourceSlug)
        )
        .map((review) => ({ resourceSlug: review.resourceSlug, review }))
    : resourceSlugs.flatMap((resourceSlug) => {
        const review = getToolCapabilityComparisonReview(resourceSlug);
        return review ? [{ resourceSlug, review }] : [];
      });
  const evidence = reviews.flatMap(({ resourceSlug, review }) =>
    review.evidence.map((item) => ({
      ...item,
      resourceSlug,
    })),
  );
  if (
    new Set(evidence.map(({ evidenceId }) => evidenceId)).size !==
    evidence.length
  ) {
    throw new Error(`${systemSlug}: duplicate atomic comparison evidence IDs`);
  }
  const sourceUrls = [...new Set(
    evidence.map(({ sourceRef }) => sourceRef),
  )];
  const expiresAt = reviews.length > 0
    ? reviews.map(({ review }) => review.expiresAt).toSorted()[0]
    : EXPIRES_AT;
  return { evidence, sourceUrls, expiresAt };
}

function buildComparisonPlan(revision: FirebaseSolutionRegistryRevision) {
  const documents: FirebaseToolComparisonDocument[] = [];
  const blockedSystemSlugs: string[] = [];

  for (const enterprise of enterpriseCatalog) {
    const sections = filterPublicSystemRecommendationSections(
      composePublicSolutionSectionsForSystem(
        enterprise.slug,
        mergeRenderableSolutionSections(
          selectRenderableSolutionSectionsFromRevision(revision, enterprise.slug),
        ),
      ),
    );
    const comparison = buildToolProcessComparisonView({
      enterprise,
      systemName: enterprise.name,
      sections,
      enforceQuality: false,
    });
    if (!comparison || comparison.tools.length < 2 || comparison.tools.length > 12) {
      blockedSystemSlugs.push(enterprise.slug);
      continue;
    }
    const visibleTools = new Set(
      sections.find(({ section }) => section === "software")?.placements
        .map(({ resource }) => resource.resourceSlug) ?? [],
    );
    const reviewed = REVIEWED_SYSTEMS.has(enterprise.slug) &&
      (enterprise.slug === "cabinet-comptable" ||
        isReviewedGenericToolComparisonSystem(enterprise.slug));
    const exactFirebaseScope = comparison.tools.every(({ resourceSlug }) =>
      visibleTools.has(resourceSlug)
    );
    const publishedView = reviewed && exactFirebaseScope
      ? buildToolProcessComparisonView({
          enterprise,
          systemName: enterprise.name,
          sections,
        })
      : null;
    const evidenceMetadata = getEvidenceMetadata(
      enterprise.slug,
      comparison.tools.map(({ resourceSlug }) => resourceSlug),
    );
    const directorySources = comparison.tools.flatMap(({ resourceSlug }) =>
      getToolDirectoryItemBySlug(resourceSlug)?.sources ?? [],
    );
    documents.push({
      schemaVersion: 2,
      publicationStatus: publishedView ? "published" : "draft",
      registryRevisionId: revision.revisionId,
      registryFingerprint: revision.sourceFingerprint,
      systemSlug: enterprise.slug,
      expiresAt: evidenceMetadata.expiresAt,
      sourceUrls: publishedView
        ? evidenceMetadata.sourceUrls
        : [...new Set([...evidenceMetadata.sourceUrls, ...directorySources])],
      evidence: evidenceMetadata.evidence,
      comparison: publishedView ?? comparison,
    });
  }

  return buildFirestoreToolComparisonImportPlan({
    revision,
    documents,
    blockedSystemSlugs,
    now: new Date(CREATED_AT),
  });
}

const active = await fetchActiveFirebaseSolutionRegistryRevisionFromFirestore();
const confirmedRevision = argument("--confirm-active-revision=");
const confirmedFingerprint = argument("--confirm-active-fingerprint=");
if (
  confirmedRevision !== active.revisionId ||
  confirmedFingerprint !== active.sourceFingerprint
) {
  throw new Error(
    `Active Firebase revision must be confirmed exactly: ${active.revisionId} / ${active.sourceFingerprint}`,
  );
}
const candidate = buildCandidateRevision(active);
const candidateRegistryPlan = buildFirestoreSolutionRegistryImportPlan(candidate);
const candidateComparisonPlan = buildComparisonPlan(candidate);
const activeResourceSlugs = new Set(
  active.resources.map(({ resource }) => resource.resourceSlug),
);
const payload = {
  schemaVersion: 2,
  generatedAt: CREATED_AT,
  activeRevision: {
    revisionId: active.revisionId,
    sourceFingerprint: active.sourceFingerprint,
    resources: active.resources.length,
    placements: active.placements.length,
  },
  candidateRevision: candidate,
  candidateRegistryPlanFingerprint: candidateRegistryPlan.planFingerprint,
  candidateDelta: {
    resourcesAdded: candidate.resources.length - active.resources.length,
    placementsAdded: candidate.placements.length - active.placements.length,
    addedTools: candidate.resources
      .map(({ resource }) => resource.resourceSlug)
      .filter((resourceSlug) => !activeResourceSlugs.has(resourceSlug)),
  },
  candidateComparisonPlan,
};

if (process.argv.includes("--write")) {
  const outputPath = fileURLToPath(new URL(
    "../docs/research/d091-tools/firebase-only-comparison-candidate.generated.json",
    import.meta.url,
  ));
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    mode: "write",
    outputPath,
    candidateRevisionId: candidate.revisionId,
    candidateFingerprint: candidate.sourceFingerprint,
    candidateRegistryPlanFingerprint: candidateRegistryPlan.planFingerprint,
    candidateComparisonPlanFingerprint: candidateComparisonPlan.planFingerprint,
    candidatePublishedComparisons: candidateComparisonPlan.publishedSystemSlugs,
    draftSystems: candidateComparisonPlan.draftSystemSlugs.length,
    blockedSystems: candidateComparisonPlan.blockedSystemSlugs,
  }, null, 2));
} else {
  console.log(JSON.stringify({
    mode: "plan",
    candidateRevisionId: candidate.revisionId,
    candidateFingerprint: candidate.sourceFingerprint,
    candidateRegistryPlanFingerprint: candidateRegistryPlan.planFingerprint,
    candidateDelta: payload.candidateDelta,
    candidateComparisonPlanFingerprint: candidateComparisonPlan.planFingerprint,
    candidatePublishedComparisons: candidateComparisonPlan.publishedSystemSlugs,
    draftSystems: candidateComparisonPlan.draftSystemSlugs.length,
    blockedSystems: candidateComparisonPlan.blockedSystemSlugs,
  }, null, 2));
}
