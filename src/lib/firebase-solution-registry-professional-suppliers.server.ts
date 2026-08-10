import "server-only";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  fingerprintFirebaseSolutionRegistryRevision,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionPlacementEntry,
  type FirebaseSolutionRegistryRevision,
  type FirebaseSolutionResourceEntry,
} from "@/lib/firebase-solution-registry-contract";
import activeSnapshot from "@/lib/firebase-solution-registry.snapshot.generated.json";
import { getDemaaSupplierBySlug } from "@/lib/supplier-catalog";

export const PROFESSIONAL_SUPPLIERS_TIMESTAMP =
  "2026-08-09T12:00:00.000Z" as const;
export const PROFESSIONAL_SUPPLIERS_EXPIRY =
  "2027-02-09T12:00:00.000Z" as const;
export const PROFESSIONAL_SUPPLIERS_REVISION_ID =
  "solutions-2026-08-10-professional-suppliers-published-v1" as const;

const EMPTY_FINGERPRINT = "0".repeat(64);
const PUBLICATION_BLOCKERS = ["commercial-relationship-unconfirmed"] as const;
const SECTION_ORDER = new Map(
  ["software", "services", "providers", "models", "networks"].map(
    (section, index) => [section, index],
  ),
);

const SUPPLIER_DEFINITIONS = [
  {
    slug: "orus",
    displayCategory: "Assurance professionnelle",
    resourceClaim:
      "Orus présente officiellement des offres d’assurance professionnelle destinées aux indépendants et petites entreprises.",
  },
  {
    slug: "alan",
    displayCategory: "Protection sociale",
    resourceClaim:
      "Alan présente officiellement des offres de complémentaire santé et de prévoyance pour les petites entreprises et leurs équipes.",
  },
  {
    slug: "swile",
    displayCategory: "Avantages salariés",
    resourceClaim:
      "Swile présente officiellement une solution de titres-restaurant et d’avantages destinée aux employeurs et à leurs salariés.",
  },
  {
    slug: "amazon-business",
    displayCategory: "Achats professionnels",
    resourceClaim:
      "Amazon Business présente officiellement un compte professionnel et des fonctions d’achat destinés aux petites entreprises.",
  },
] as const;

type SupplierSlug = (typeof SUPPLIER_DEFINITIONS)[number]["slug"];

const SYSTEM_PLACEMENTS = {
  "cabinet-comptable": [
    {
      slug: "orus",
      usage: "Protéger le cabinet, sa responsabilité professionnelle et ses locaux selon les garanties retenues.",
      rationale:
        "Une couverture professionnelle est structurante pour sécuriser l’activité et ses principaux risques.",
      constraints: [
        "Comparer les garanties, exclusions, franchises et obligations propres à l’activité réglementée.",
      ],
    },
    {
      slug: "alan",
      usage: "Mettre en place et administrer la protection sociale de l’équipe du cabinet.",
      rationale:
        "La solution devient pertinente lorsque le cabinet emploie des salariés ou recherche une couverture adaptée au dirigeant.",
      constraints: [
        "Vérifier l’éligibilité, la convention collective, les garanties et la situation exacte de l’équipe.",
      ],
    },
    {
      slug: "swile",
      usage: "Gérer les titres-restaurant et les avantages proposés aux salariés du cabinet.",
      rationale:
        "La solution simplifie un avantage récurrent lorsque le cabinet emploie une équipe éligible.",
      constraints: [
        "Pertinent uniquement avec des salariés éligibles ; vérifier les règles d’attribution applicables.",
      ],
    },
    {
      slug: "amazon-business",
      usage: "Centraliser les achats courants, fournitures et petits équipements du cabinet.",
      rationale:
        "Un compte professionnel peut simplifier les commandes récurrentes et le suivi des dépenses courantes.",
      constraints: [
        "Comparer les prix et réserver ce canal aux achats non spécialisés adaptés aux besoins du cabinet.",
      ],
    },
  ],
  "cabinet-de-conseil": [
    {
      slug: "orus",
      usage: "Couvrir la responsabilité professionnelle, le matériel et les locaux selon le fonctionnement du cabinet.",
      rationale:
        "Une assurance adaptée aide à sécuriser les missions, les actifs et les principaux risques du cabinet.",
      constraints: [
        "Comparer les garanties, exclusions, franchises et niveaux de couverture avec les risques réels des missions.",
      ],
    },
    {
      slug: "alan",
      usage: "Organiser la complémentaire santé et la prévoyance de l’équipe du cabinet.",
      rationale:
        "La solution devient pertinente lorsque le cabinet recrute ou doit administrer une protection sociale collective.",
      constraints: [
        "Vérifier l’éligibilité, la convention collective et les garanties nécessaires avant de choisir.",
      ],
    },
    {
      slug: "swile",
      usage: "Gérer les titres-restaurant et les avantages proposés aux salariés du cabinet.",
      rationale:
        "La solution est utile aux cabinets employeurs qui souhaitent centraliser ces avantages.",
      constraints: [
        "Pertinent uniquement avec des salariés éligibles ; vérifier les règles d’attribution applicables.",
      ],
    },
    {
      slug: "amazon-business",
      usage: "Centraliser les fournitures, équipements et achats récurrents du cabinet.",
      rationale:
        "Un compte professionnel peut simplifier les commandes, les utilisateurs autorisés et le suivi des dépenses.",
      constraints: [
        "Comparer les prix et réserver ce canal aux achats non spécialisés adaptés au fonctionnement du cabinet.",
      ],
    },
  ],
} as const satisfies Record<
  string,
  readonly Readonly<{
    slug: SupplierSlug;
    usage: string;
    rationale: string;
    constraints: readonly string[];
  }>[]
>;

function buildReviewMetadata(slug: string, sourceRef: string, claim: string) {
  return {
    evidence: [{
      evidenceId: `professional-suppliers-${slug}`,
      sourceRef,
      claim,
      evidenceType: "official_product_page" as const,
      capturedAt: PROFESSIONAL_SUPPLIERS_TIMESTAMP,
    }],
    reviewer: "Solutions France - audit officiel",
    reviewedAt: PROFESSIONAL_SUPPLIERS_TIMESTAMP,
    expiresAt: PROFESSIONAL_SUPPLIERS_EXPIRY,
  };
}

function buildResourceEntries(): readonly FirebaseSolutionResourceEntry[] {
  return SUPPLIER_DEFINITIONS.map((definition) => {
    const supplier = getDemaaSupplierBySlug(definition.slug);
    if (!supplier) throw new Error(`Unknown supplier: ${definition.slug}`);
    return {
      resource: {
        ...buildReviewMetadata(
          `resource-${definition.slug}`,
          supplier.href,
          definition.resourceClaim,
        ),
        interactionMode: "external_link" as const,
        href: supplier.href,
        resourceSlug: supplier.slug,
        resourceType: "provider" as const,
        name: supplier.name,
        description: supplier.shortDescription,
        commercialRelationship: "unknown" as const,
        status: "draft" as const,
        resourceVersion: "professional-suppliers.v1",
        publicationBlockers: PUBLICATION_BLOCKERS,
      },
    };
  });
}

function buildPlacementEntries(): readonly FirebaseSolutionPlacementEntry[] {
  return Object.entries(SYSTEM_PLACEMENTS).flatMap(([systemSlug, placements]) =>
    placements.map((definition, index) => {
      const supplierDefinition = SUPPLIER_DEFINITIONS.find(
        ({ slug }) => slug === definition.slug,
      );
      const supplier = getDemaaSupplierBySlug(definition.slug);
      if (!supplierDefinition || !supplier) {
        throw new Error(`Unknown supplier placement: ${definition.slug}`);
      }
      const rank = index + 1;
      return {
        placement: {
          ...buildReviewMetadata(
            `placement-${systemSlug}-${definition.slug}`,
            supplier.href,
            definition.rationale,
          ),
          placementId: `${systemSlug}:${definition.slug}:providers:${rank}`,
          systemSlug,
          resourceSlug: definition.slug,
          rank,
          section: "providers" as const,
          usage: definition.usage,
          fitRationale: definition.rationale,
          fitConstraints: definition.constraints,
          editorialStatus: "selected" as const,
          commercialRelationship: "unknown" as const,
          status: "draft" as const,
          placementVersion: "professional-suppliers.v1",
          publicationBlockers: PUBLICATION_BLOCKERS,
        },
        presentation: {
          displayCategory: supplierDefinition.displayCategory,
          nameOverride: supplier.name,
          hrefOverride: supplier.href,
          ctaLabel: "Voir le fournisseur",
          descriptionOverride: supplier.shortDescription,
        },
      };
    }),
  );
}

export function buildPublishedProfessionalSuppliersRevision(): FirebaseSolutionRegistryRevision {
  const activeRevision = parseFirebaseSolutionRegistryRevision(activeSnapshot);
  const addedResources = buildResourceEntries();
  const addedResourceSlugs = new Set(
    addedResources.map(({ resource }) => resource.resourceSlug),
  );
  const targetSystemSlugs = new Set(Object.keys(SYSTEM_PLACEMENTS));

  const resources = [
    ...activeRevision.resources.filter(
      ({ resource }) =>
        !addedResourceSlugs.has(resource.resourceSlug) &&
        resource.resourceVersion !== "prelaunch-closeout.v1" &&
        resource.resourceVersion !== "supplier-expansion.v1",
    ),
    ...addedResources,
  ].toSorted((left, right) =>
    left.resource.resourceSlug.localeCompare(right.resource.resourceSlug)
  );
  const systemOrder = new Map(
    activeRevision.knownSystemSlugs.map((systemSlug, index) => [systemSlug, index]),
  );
  const placements = [
    ...activeRevision.placements.filter(
      ({ placement }) =>
        !(targetSystemSlugs.has(placement.systemSlug) && placement.section === "providers") &&
        !addedResourceSlugs.has(placement.resourceSlug) &&
        placement.placementVersion !== "prelaunch-closeout.v1" &&
        placement.placementVersion !== "supplier-expansion.v1",
    ),
    ...buildPlacementEntries(),
  ].toSorted((left, right) => {
    const systemDifference =
      (systemOrder.get(left.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER) -
      (systemOrder.get(right.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER);
    if (systemDifference !== 0) return systemDifference;
    const sectionDifference =
      (SECTION_ORDER.get(left.placement.section) ?? Number.MAX_SAFE_INTEGER) -
      (SECTION_ORDER.get(right.placement.section) ?? Number.MAX_SAFE_INTEGER);
    if (sectionDifference !== 0) return sectionDifference;
    return left.placement.rank - right.placement.rank ||
      left.placement.placementId.localeCompare(right.placement.placementId);
  });
  const baseRevision = {
    ...activeRevision,
    revisionId: PROFESSIONAL_SUPPLIERS_REVISION_ID,
    revisionStatus: "published" as const,
    createdAt: PROFESSIONAL_SUPPLIERS_TIMESTAMP,
    createdBy: "release://professional-suppliers-france-2026-08-10",
    sourceFingerprint: EMPTY_FINGERPRINT,
    resources,
    placements,
  };
  const candidate = parseFirebaseSolutionRegistryRevision({
    ...baseRevision,
    sourceFingerprint: fingerprintFirebaseSolutionRegistryRevision(baseRevision),
  });
  const errors = validateFirebaseSolutionRegistryRevision(candidate, {
    expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
    now: new Date(PROFESSIONAL_SUPPLIERS_TIMESTAMP),
    requirePublishedRevision: true,
  });
  if (errors.length > 0) {
    throw new Error(`Invalid professional suppliers revision:\n${errors.join("\n")}`);
  }
  return candidate;
}
