import { enterpriseCatalog } from "../src/lib/enterprise-annuaire";
import activeSnapshot from "../src/lib/firebase-solution-registry.snapshot.generated.json";
import { getRecommendedSuppliersForSystem } from "../src/lib/supplier-recommendations";

const systemsWithPublishedProviders = new Set(
  activeSnapshot.placements
    .filter(({ placement }) => placement.section === "providers")
    .map(({ placement }) => placement.systemSlug),
);

const missing = enterpriseCatalog
  .filter(({ slug }) => !systemsWithPublishedProviders.has(slug))
  .map((enterprise) => ({
    slug: enterprise.slug,
    name: enterprise.name,
    sector: enterprise.sectorLabel,
    candidates: getRecommendedSuppliersForSystem(
      enterprise.slug,
      enterprise.sectorLabel,
    )
      .slice(0, 6)
      .map(({ slug, name, category }) => ({ slug, name, category })),
  }));

const transversalSlugs = new Set([
  "alan",
  "amazon-business",
  "bernard",
  "edf-entreprises",
  "insify",
  "onoff-business",
  "orus",
  "swile",
]);

const highConfidenceSpecialtyCandidates = missing
  .map((system) => ({
    ...system,
    candidates: system.candidates.filter(
      ({ slug }) => !transversalSlugs.has(slug),
    ),
  }))
  .filter(({ candidates }) => candidates.length > 0);

console.log(JSON.stringify({
  generatedFromRevision: activeSnapshot.revisionId,
  systems: enterpriseCatalog.length,
  systemsWithPublishedProviders: systemsWithPublishedProviders.size,
  systemsWithoutPublishedProviders: missing.length,
  systemsWithSpecialtyCandidates: highConfidenceSpecialtyCandidates.length,
  highConfidenceSpecialtyCandidates,
  missing,
}, null, 2));
