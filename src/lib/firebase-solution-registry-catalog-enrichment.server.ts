import "server-only";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  fingerprintFirebaseSolutionRegistryRevision,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { buildFirebaseSolutionRegistryMigrationRevision } from "@/lib/firebase-solution-registry-migration.server";

export const CATALOG_ENRICHMENT_TIMESTAMP = "2026-08-12T12:00:00.000Z" as const;
export const CATALOG_ENRICHMENT_REVISION_ID =
  "solutions-2026-08-12-catalog-enrichment-published-v1" as const;

const EMPTY_FINGERPRINT = "0".repeat(64);

export function buildPublishedCatalogEnrichmentRevision(): FirebaseSolutionRegistryRevision {
  const consolidated = buildFirebaseSolutionRegistryMigrationRevision();
  const baseRevision = {
    ...consolidated,
    revisionId: CATALOG_ENRICHMENT_REVISION_ID,
    createdAt: CATALOG_ENRICHMENT_TIMESTAMP,
    createdBy: "release://catalog-enrichment-france-2026-08-12",
    sourceFingerprint: EMPTY_FINGERPRINT,
  };
  const candidate = parseFirebaseSolutionRegistryRevision({
    ...baseRevision,
    sourceFingerprint: fingerprintFirebaseSolutionRegistryRevision(baseRevision),
  });
  const errors = validateFirebaseSolutionRegistryRevision(candidate, {
    expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
    now: new Date(CATALOG_ENRICHMENT_TIMESTAMP),
    requirePublishedRevision: true,
  });
  if (errors.length > 0) {
    throw new Error(`Invalid catalog enrichment revision:\n${errors.join("\n")}`);
  }
  return candidate;
}
