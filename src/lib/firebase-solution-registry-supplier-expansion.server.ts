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

export const SUPPLIER_EXPANSION_TIMESTAMP = "2026-08-10T08:30:00.000Z" as const;
export const SUPPLIER_EXPANSION_EXPIRY = "2027-02-10T08:30:00.000Z" as const;
export const SUPPLIER_EXPANSION_REVISION_ID =
  "solutions-2026-08-10-supplier-expansion-published-v1" as const;

const EMPTY_FINGERPRINT = "0".repeat(64);
const PUBLICATION_BLOCKERS = ["commercial-relationship-unconfirmed"] as const;
const SECTION_ORDER = new Map(
  ["software", "services", "providers", "models", "networks"].map(
    (section, index) => [section, index],
  ),
);
const ACTIVE_RESOURCE_SLUGS = new Set(
  activeSnapshot.resources.map(({ resource }) => resource.resourceSlug),
);

const SUPPLIER_CLAIMS = {
  bernard:
    "Bernard présente un catalogue professionnel de produits d’hygiène, d’entretien, de consommables et de matériel de nettoyage.",
  "codes-rousseau-pro":
    "Codes Rousseau Pro présente des supports pédagogiques et des solutions destinés aux écoles de conduite.",
  "france-boissons":
    "France Boissons présente une offre de distribution de boissons destinée aux cafés, hôtels, restaurants et événements.",
  kiloutou:
    "Kiloutou présente une offre de location de matériel professionnel pour les chantiers, l’industrie et l’événementiel.",
  "metro-france":
    "METRO France présente une offre professionnelle destinée notamment aux métiers de bouche, cafés, hôtels et restaurants.",
  raja:
    "RAJA présente des emballages, fournitures et équipements destinés notamment au commerce, à l’e-commerce et à l’expédition.",
  sumup:
    "SumUp présente des solutions d’encaissement destinées notamment aux commerces, services et activités événementielles.",
  transgourmet:
    "Transgourmet présente une offre de grossiste alimentaire destinée aux professionnels de la restauration et des métiers de bouche.",
  wurth:
    "Würth présente une offre d’outillage, de consommables et d’équipements destinée aux professionnels et à l’industrie.",
} as const;

type SupplierSlug = keyof typeof SUPPLIER_CLAIMS;

type PlacementDefinition = Readonly<{
  slug: SupplierSlug;
  usage: string;
  rationale: string;
  constraints: readonly string[];
}>;

const SYSTEM_PLACEMENTS = {
  "commerce-de-detail": [
    {
      slug: "sumup",
      usage: "Encaisser les paiements en magasin ou en mobilité et suivre les ventes courantes.",
      rationale: "Une solution d’encaissement simple répond au besoin quotidien d’un commerce de détail.",
      constraints: ["Comparer les frais, le matériel, les fonctions de caisse et les volumes d’encaissement."],
    },
    {
      slug: "raja",
      usage: "Acheter les sacs, emballages, étiquettes et fournitures nécessaires à la vente et aux expéditions.",
      rationale: "Les commerces qui emballent ou expédient des produits ont un besoin récurrent de consommables adaptés.",
      constraints: ["Sélectionner uniquement les références adaptées aux produits, volumes et exigences environnementales du commerce."],
    },
  ],
  "e-commerce": [
    {
      slug: "raja",
      usage: "Approvisionner les cartons, protections, adhésifs et consommables nécessaires à la préparation des commandes.",
      rationale: "L’emballage et l’expédition sont des opérations structurantes pour une activité e-commerce.",
      constraints: ["Comparer les formats, quantités, coûts logistiques et objectifs de réduction des emballages."],
    },
  ],
  "commerce-alimentaire": [
    {
      slug: "transgourmet",
      usage: "Centraliser une partie des approvisionnements alimentaires et des livraisons professionnelles.",
      rationale: "Un grossiste alimentaire peut sécuriser les commandes récurrentes d’un commerce de bouche.",
      constraints: ["Vérifier l’éligibilité, la zone de livraison, les minimums de commande et la gamme réellement utile."],
    },
    {
      slug: "metro-france",
      usage: "Acheter des produits alimentaires, emballages et équipements adaptés au commerce de bouche.",
      rationale: "L’offre professionnelle couvre plusieurs besoins d’exploitation d’un commerce alimentaire.",
      constraints: ["Vérifier les conditions d’accès professionnel, les prix et la disponibilité locale."],
    },
    {
      slug: "sumup",
      usage: "Encaisser les paiements au comptoir ou en mobilité et suivre les ventes.",
      rationale: "Un terminal de paiement est pertinent pour un commerce alimentaire recevant du public.",
      constraints: ["Comparer les frais de transaction, le matériel et les fonctions de caisse nécessaires."],
    },
    {
      slug: "raja",
      usage: "Commander des sacs, emballages alimentaires et consommables de vente à emporter.",
      rationale: "Les emballages et consommables sont récurrents dans de nombreux commerces alimentaires.",
      constraints: ["Vérifier l’aptitude au contact alimentaire et l’adéquation aux produits vendus."],
    },
  ],
  "boutique-specialisee": [
    {
      slug: "sumup",
      usage: "Encaisser les paiements en boutique ou lors de ventes ponctuelles hors magasin.",
      rationale: "Une solution d’encaissement flexible répond au fonctionnement d’une petite boutique spécialisée.",
      constraints: ["Comparer les frais, le matériel et les besoins de caisse ou de gestion des produits."],
    },
    {
      slug: "raja",
      usage: "Approvisionner les sacs, emballages cadeaux, étiquettes et cartons d’expédition.",
      rationale: "Une boutique spécialisée utilise souvent des emballages de vente et parfois d’expédition.",
      constraints: ["Adapter les formats et volumes au positionnement, aux produits et à la fréquence des commandes."],
    },
  ],
  "hotel-hebergement-independant": [
    {
      slug: "metro-france",
      usage: "Approvisionner le petit-déjeuner, la restauration, l’hygiène et certains équipements de l’établissement.",
      rationale: "Un hôtel indépendant peut regrouper plusieurs achats d’exploitation auprès d’un grossiste CHR.",
      constraints: ["Pertinent surtout lorsque l’établissement propose du petit-déjeuner ou de la restauration ; comparer les prix et conditions d’accès."],
    },
    {
      slug: "france-boissons",
      usage: "Organiser l’approvisionnement en boissons du bar, du petit-déjeuner ou de la restauration.",
      rationale: "La distribution CHR est pertinente pour les établissements ayant une activité boissons régulière.",
      constraints: ["Pertinent uniquement si l’établissement exploite un service de boissons ; vérifier la couverture locale et les conditions commerciales."],
    },
    {
      slug: "sumup",
      usage: "Encaisser les paiements sur place ou en mobilité pour les prestations de l’établissement.",
      rationale: "Un dispositif d’encaissement flexible complète le parcours de paiement d’un petit établissement.",
      constraints: ["Vérifier l’intégration au logiciel hôtelier, les frais et les besoins de préautorisation éventuels."],
    },
  ],
  "production-industrie": [
    {
      slug: "wurth",
      usage: "Approvisionner l’atelier en outillage, consommables, fixation et équipements de protection.",
      rationale: "Les consommables et équipements techniques sont des achats récurrents en production et maintenance.",
      constraints: ["Valider les normes, références et conditions d’achat adaptées aux risques et procédés du site."],
    },
    {
      slug: "kiloutou",
      usage: "Louer ponctuellement du matériel de manutention, d’accès ou de chantier sans immobiliser un achat.",
      rationale: "La location peut répondre à un besoin temporaire de matériel professionnel ou de capacité supplémentaire.",
      constraints: ["Comparer disponibilité, habilitations, transport, assurance et coût total avec l’achat ou la location longue durée."],
    },
  ],
  "auto-ecole": [
    {
      slug: "codes-rousseau-pro",
      usage: "Équiper les formations avec des supports pédagogiques et solutions numériques dédiés à l’apprentissage de la conduite.",
      rationale: "Un fournisseur spécialisé répond directement au besoin pédagogique d’une école de conduite.",
      constraints: ["Vérifier les contenus, licences, mises à jour réglementaires et compatibilités nécessaires aux formations proposées."],
    },
  ],
  evenementiel: [
    {
      slug: "kiloutou",
      usage: "Louer le matériel nécessaire aux installations, à la manutention ou aux besoins techniques ponctuels d’un événement.",
      rationale: "La location évite d’acheter du matériel utilisé de façon intermittente.",
      constraints: ["Vérifier disponibilité, transport, montage, habilitations, assurance et contraintes du lieu."],
    },
    {
      slug: "france-boissons",
      usage: "Approvisionner les événements comprenant un service régulier de boissons.",
      rationale: "Un distributeur CHR peut simplifier l’approvisionnement lorsque les boissons font partie de la prestation.",
      constraints: ["Pertinent uniquement pour les événements concernés ; vérifier la zone, les volumes et les conditions de reprise éventuelles."],
    },
    {
      slug: "sumup",
      usage: "Encaisser les ventes ou prestations sur site avec un dispositif mobile.",
      rationale: "L’encaissement mobile est adapté aux événements, stands et lieux temporaires.",
      constraints: ["Vérifier la connectivité du site, l’autonomie du matériel et les frais de transaction."],
    },
  ],
  "nettoyage-professionnel": [
    {
      slug: "bernard",
      usage: "Approvisionner les équipes en produits d’entretien, consommables sanitaires, matériel et équipements de protection.",
      rationale: "Les consommables et matériels de nettoyage sont au cœur de l’exécution quotidienne des prestations.",
      constraints: ["Valider les fiches techniques, usages, protocoles, EPI et exigences environnementales de chaque chantier."],
    },
  ],
} as const satisfies Record<string, readonly PlacementDefinition[]>;

function buildReviewMetadata(slug: string, sourceRef: string, claim: string) {
  return {
    evidence: [{
      evidenceId: `supplier-expansion-${slug}`,
      sourceRef,
      claim,
      evidenceType: "official_product_page" as const,
      capturedAt: SUPPLIER_EXPANSION_TIMESTAMP,
    }],
    reviewer: "Solutions France - audit officiel",
    reviewedAt: SUPPLIER_EXPANSION_TIMESTAMP,
    expiresAt: SUPPLIER_EXPANSION_EXPIRY,
  };
}

function buildResourceEntries(): readonly FirebaseSolutionResourceEntry[] {
  return Object.entries(SUPPLIER_CLAIMS)
    .filter(([slug]) => !ACTIVE_RESOURCE_SLUGS.has(slug))
    .map(([slug, claim]) => {
    const supplier = getDemaaSupplierBySlug(slug);
    if (!supplier) throw new Error(`Unknown supplier: ${slug}`);
    return {
      resource: {
        ...buildReviewMetadata(`resource-${slug}`, supplier.href, claim),
        interactionMode: "external_link" as const,
        href: supplier.href,
        resourceSlug: supplier.slug,
        resourceType: "provider" as const,
        name: supplier.name,
        description: supplier.shortDescription,
        commercialRelationship: "unknown" as const,
        status: "draft" as const,
        resourceVersion: "supplier-expansion.v1",
        publicationBlockers: PUBLICATION_BLOCKERS,
      },
    };
    });
}

function buildPlacementEntries(): readonly FirebaseSolutionPlacementEntry[] {
  return Object.entries(SYSTEM_PLACEMENTS).flatMap(([systemSlug, placements]) =>
    placements.map((definition, index) => {
      const supplier = getDemaaSupplierBySlug(definition.slug);
      if (!supplier) throw new Error(`Unknown supplier placement: ${definition.slug}`);
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
          placementVersion: "supplier-expansion.v1",
          publicationBlockers: PUBLICATION_BLOCKERS,
        },
        presentation: {
          displayCategory: supplier.category,
          nameOverride: supplier.name,
          hrefOverride: supplier.href,
          ctaLabel: "Voir le fournisseur",
          descriptionOverride: supplier.shortDescription,
        },
      };
    }),
  );
}

export function buildPublishedSupplierExpansionRevision(): FirebaseSolutionRegistryRevision {
  const activeRevision = parseFirebaseSolutionRegistryRevision(activeSnapshot);
  const addedResources = buildResourceEntries();
  const addedResourceSlugs = new Set(
    addedResources.map(({ resource }) => resource.resourceSlug),
  );
  const targetSystemSlugs = new Set(Object.keys(SYSTEM_PLACEMENTS));

  const resources = [
    ...activeRevision.resources.filter(
      ({ resource }) => !addedResourceSlugs.has(resource.resourceSlug),
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
        !(targetSystemSlugs.has(placement.systemSlug) && placement.section === "providers"),
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
    revisionId: SUPPLIER_EXPANSION_REVISION_ID,
    revisionStatus: "published" as const,
    createdAt: SUPPLIER_EXPANSION_TIMESTAMP,
    createdBy: "release://supplier-expansion-france-2026-08-10",
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
    now: new Date(SUPPLIER_EXPANSION_TIMESTAMP),
    requirePublishedRevision: true,
  });
  if (errors.length > 0) {
    throw new Error(`Invalid supplier expansion revision:\n${errors.join("\n")}`);
  }
  return candidate;
}
