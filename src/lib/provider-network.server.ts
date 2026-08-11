import "server-only";

import { unstable_cache } from "next/cache";
import expertiseSnapshot from "@/lib/expertise-catalog.snapshot.generated.json";
import opportunitySnapshot from "@/lib/opportunities.snapshot.generated.json";
import {
  parseExpertiseCatalogEntry,
  type ExpertiseCatalogEntry,
} from "@/lib/expertise-catalog-contract";
import {
  parseExpertisePlacement,
  type ExpertisePlacement,
} from "@/lib/expertise-placement-contract";
import { buildExpertisePlacementSeeds } from "@/lib/expertise-placement-seeds";
import {
  isPublicOpenOpportunity,
  parseOpportunity,
  type PublicOpportunity,
} from "@/lib/opportunity-contract";
import {
  getAdminFirestore,
  hasFirebaseAdminConfiguration,
} from "@/lib/firebase-admin";
import { resolveProviderNetworkSource } from "@/lib/provider-network-source";

export const EXPERTISE_CATALOG_COLLECTION = "expertise_catalog";
export const EXPERTISE_PLACEMENTS_COLLECTION = "expertise_placements";
export const OPPORTUNITIES_COLLECTION = "opportunities";
const PROVIDER_NETWORK_CACHE_VERSION = "firebase-v1";

function sortExpertises(entries: readonly ExpertiseCatalogEntry[]) {
  return [...entries].sort((left, right) => {
    const familyDifference = left.family.localeCompare(right.family);
    return familyDifference || left.rank - right.rank;
  });
}

function parseExpertiseSnapshot() {
  return sortExpertises(
    expertiseSnapshot.map((entry, index) =>
      parseExpertiseCatalogEntry(entry, `expertiseSnapshot[${index}]`)
    ),
  );
}

function parseOpportunitySnapshot() {
  return opportunitySnapshot.map((entry, index) =>
    parseOpportunity(entry, `opportunitySnapshot[${index}]`)
  );
}

async function loadExpertisesFromFirestore() {
  const snapshot = await getAdminFirestore()
    .collection(EXPERTISE_CATALOG_COLLECTION)
    .get();
  return sortExpertises(
    snapshot.docs.map((document) =>
      parseExpertiseCatalogEntry(document.data(), `expertise:${document.id}`)
    ),
  );
}

async function loadExpertisePlacementsFromFirestore() {
  const snapshot = await getAdminFirestore()
    .collection(EXPERTISE_PLACEMENTS_COLLECTION)
    .get();
  return snapshot.docs.map((document) =>
    parseExpertisePlacement(document.data(), `expertisePlacement:${document.id}`)
  );
}

async function loadOpportunitiesFromFirestore() {
  const snapshot = await getAdminFirestore()
    .collection(OPPORTUNITIES_COLLECTION)
    .get();
  return snapshot.docs.map((document) =>
    parseOpportunity(document.data(), `opportunity:${document.id}`)
  );
}

async function loadFromAuthoritativeSource<T>(input: {
  fallback: () => T;
  remote: () => Promise<T>;
}) {
  const source = resolveProviderNetworkSource(
    process.env,
    hasFirebaseAdminConfiguration(),
  );
  if (source === "snapshot") {
    return input.fallback();
  }
  return input.remote();
}

export const getExpertiseCatalog = unstable_cache(
  async () => loadFromAuthoritativeSource({
    fallback: parseExpertiseSnapshot,
    remote: loadExpertisesFromFirestore,
  }),
  [PROVIDER_NETWORK_CACHE_VERSION, "provider-network-expertise-catalog"],
  { revalidate: 300, tags: ["provider-network-expertises"] },
);

export const getAllOpportunities = unstable_cache(
  async () => loadFromAuthoritativeSource({
    fallback: parseOpportunitySnapshot,
    remote: loadOpportunitiesFromFirestore,
  }),
  [PROVIDER_NETWORK_CACHE_VERSION, "provider-network-opportunities"],
  { revalidate: 60, tags: ["provider-network-opportunities"] },
);

export const getExpertisePlacements = unstable_cache(
  async (): Promise<readonly ExpertisePlacement[]> => loadFromAuthoritativeSource({
    fallback: buildExpertisePlacementSeeds,
    remote: loadExpertisePlacementsFromFirestore,
  }),
  [PROVIDER_NETWORK_CACHE_VERSION, "provider-network-expertise-placements"],
  { revalidate: 300, tags: ["provider-network-expertise-placements"] },
);

export async function getPublicOpenOpportunities(now = new Date()) {
  const opportunities = await getAllOpportunities();
  return opportunities
    .filter((opportunity) => isPublicOpenOpportunity(opportunity, now))
    .sort((left, right) =>
      Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "")
    );
}

export async function getPublicExpertises() {
  const entries = await getExpertiseCatalog();
  return entries.filter((entry) => entry.visibility === "public");
}

export async function getExpertiseById(expertiseId: string) {
  return (await getExpertiseCatalog())
    .find((entry) => entry.expertiseId === expertiseId) ?? null;
}

export async function getSelectedExpertisePlacementsForSystem(systemSlug: string) {
  return (await getExpertisePlacements())
    .filter((placement) => (
      placement.systemSlug === systemSlug && placement.visibility === "selected"
    ))
    .sort((left, right) => left.rank - right.rank);
}

export async function getOpportunityById(opportunityId: string) {
  return (await getAllOpportunities())
    .find((entry) => entry.opportunityId === opportunityId) ?? null;
}

export async function createOpportunity(input: PublicOpportunity) {
  const opportunity = parseOpportunity(input);
  await getAdminFirestore()
    .collection(OPPORTUNITIES_COLLECTION)
    .doc(opportunity.opportunityId)
    .create(opportunity);
  return opportunity;
}

export async function updateOpportunity(input: PublicOpportunity) {
  const opportunity = parseOpportunity(input);
  const reference = getAdminFirestore()
    .collection(OPPORTUNITIES_COLLECTION)
    .doc(opportunity.opportunityId);
  const snapshot = await reference.get();
  if (!snapshot.exists) return false;
  await reference.set({
    ...opportunity,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

export async function updateOpportunityStatus(
  opportunityId: string,
  status: PublicOpportunity["status"],
) {
  const reference = getAdminFirestore()
    .collection(OPPORTUNITIES_COLLECTION)
    .doc(opportunityId);
  const snapshot = await reference.get();
  if (!snapshot.exists) return false;
  await reference.update({ status, updatedAt: new Date().toISOString() });
  return true;
}
