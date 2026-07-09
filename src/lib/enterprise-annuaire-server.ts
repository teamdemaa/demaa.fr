import "server-only";

import { getAdminFirestore } from "./firebase-admin";
import {
  enterpriseCatalog,
  enterpriseCatalogBySlug,
  enterpriseToSystem,
  enrichEnterpriseBusinessModel,
  type EnterpriseDefinition,
  type EnterpriseTool,
  type EnterpriseToolReference,
} from "./enterprise-annuaire";
import { publicSectorLabels } from "./public-sectors";
import type { System } from "./types";

type EnterpriseFirestoreDocument = EnterpriseDefinition & {
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

const ENTERPRISE_ANNUAIRE_COLLECTION = "enterprise_annuaire";
const FORCE_LOCAL_DATA = process.env.DEMAA_FORCE_LOCAL_DATA === "true";

function normalizeEnterpriseDocument(data: unknown): EnterpriseFirestoreDocument | null {
  if (!data) {
    return null;
  }

  const enterprise = data as Partial<EnterpriseFirestoreDocument>;

  if (!enterprise.slug || !enterprise.name) {
    return null;
  }

  return enterprise as EnterpriseFirestoreDocument;
}

function mergeToolRefs(
  fallbackRefs: EnterpriseToolReference[] | undefined,
  enterpriseRefs: EnterpriseToolReference[] | undefined,
): EnterpriseToolReference[] {
  const remoteRefsBySlug = new Map((enterpriseRefs ?? []).map((ref) => [ref.slug, ref]));
  const mergedRefs: EnterpriseToolReference[] = [];
  const seenSlugs = new Set<string>();

  for (const fallbackRef of fallbackRefs ?? []) {
    const remoteRef = remoteRefsBySlug.get(fallbackRef.slug);
    mergedRefs.push(remoteRef ? { ...fallbackRef, ...remoteRef } : fallbackRef);
    seenSlugs.add(fallbackRef.slug);
  }

  for (const remoteRef of enterpriseRefs ?? []) {
    if (!seenSlugs.has(remoteRef.slug)) {
      mergedRefs.push(remoteRef);
    }
  }

  return mergedRefs;
}

function mergeEnterpriseTools(
  fallbackTools: EnterpriseTool[] | undefined,
  enterpriseTools: EnterpriseTool[] | undefined,
): EnterpriseTool[] {
  const mergedTools = [...(enterpriseTools ?? [])];
  const existingKeys = new Set(mergedTools.map((tool) => tool.slug || tool.name));

  for (const fallbackTool of fallbackTools ?? []) {
    const key = fallbackTool.slug || fallbackTool.name;

    if (!existingKeys.has(key)) {
      mergedTools.push(fallbackTool);
    }
  }

  return mergedTools;
}

function mergeEnterpriseFallback(
  enterprise: EnterpriseFirestoreDocument,
): EnterpriseDefinition {
  const fallback = enterpriseCatalogBySlug[enterprise.slug];
  const mergedToolRefs = mergeToolRefs(fallback?.toolRefs, enterprise.toolRefs);
  const mergedTools = mergeEnterpriseTools(fallback?.tools, enterprise.tools);

  return {
    ...(fallback ?? {}),
    ...enterprise,
    id: enterprise.id || fallback?.id || enterprise.slug,
    name: enterprise.name || fallback?.name || enterprise.slug,
    category: enterprise.category || fallback?.category || "Système opérationnel",
    description:
      enterprise.description || fallback?.description || `Système opérationnel pour ${enterprise.slug}`,
    tags: enterprise.tags?.length ? enterprise.tags : fallback?.tags ?? [],
    icon: enterprise.icon || fallback?.icon || "Briefcase",
    price: enterprise.price ?? fallback?.price ?? "",
    sectorLabel: enterprise.sectorLabel || fallback?.sectorLabel || publicSectorLabels[0],
    imageTitle: enterprise.imageTitle || fallback?.imageTitle || enterprise.name || enterprise.slug,
    imageSubtitle:
      enterprise.imageSubtitle || fallback?.imageSubtitle || `Aperçu du système opérationnel pour ${enterprise.name || fallback?.name || enterprise.slug}`,
    processes: enterprise.processes?.length ? enterprise.processes : fallback?.processes ?? [],
    operationProcesses: enterprise.operationProcesses?.length
      ? enterprise.operationProcesses
      : fallback?.operationProcesses ?? [],
    processExamples: Object.keys(enterprise.processExamples ?? {}).length
      ? enterprise.processExamples
      : fallback?.processExamples ?? {},
    tools: mergedTools,
    toolRefs: mergedToolRefs,
  };
}

function stripFirestoreMetadata({
  sort_order,
  created_at,
  updated_at,
  ...enterprise
}: EnterpriseFirestoreDocument): EnterpriseDefinition {
  void sort_order;
  void created_at;
  void updated_at;

  return enterprise;
}

function fallbackEnterpriseCatalog() {
  return enterpriseCatalog.map(enrichEnterpriseBusinessModel);
}

function mergeCatalogWithFallbacks(
  enterprises: EnterpriseDefinition[],
): EnterpriseDefinition[] {
  const existingSlugs = new Set(enterprises.map((enterprise) => enterprise.slug));
  const missingFallbacks = enterpriseCatalog.filter(
    (enterprise) => !existingSlugs.has(enterprise.slug),
  );

  return [...enterprises, ...missingFallbacks].map(enrichEnterpriseBusinessModel);
}

export async function getEnterpriseCatalog(): Promise<EnterpriseDefinition[]> {
  if (FORCE_LOCAL_DATA) {
    return fallbackEnterpriseCatalog();
  }

  try {
    const firestore = getAdminFirestore();
    const snapshot = await firestore.collection(ENTERPRISE_ANNUAIRE_COLLECTION).get();

    if (snapshot.empty) {
      return fallbackEnterpriseCatalog();
    }

    const enterprises = snapshot.docs
      .map((doc) => normalizeEnterpriseDocument(doc.data()))
      .filter((enterprise): enterprise is EnterpriseFirestoreDocument => Boolean(enterprise));

    if (!enterprises.length) {
      return fallbackEnterpriseCatalog();
    }

    enterprises.sort((left, right) => {
      const leftOrder = typeof left.sort_order === "number" ? left.sort_order : Number.POSITIVE_INFINITY;
      const rightOrder = typeof right.sort_order === "number" ? right.sort_order : Number.POSITIVE_INFINITY;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.name.localeCompare(right.name, "fr");
    });

    return mergeCatalogWithFallbacks(
      enterprises.map((enterprise) => mergeEnterpriseFallback(stripFirestoreMetadata(enterprise))),
    );
  } catch (error) {
    console.warn("[enterprise-annuaire] Firestore unavailable, using JSON fallback.", error);
    return fallbackEnterpriseCatalog();
  }
}

export async function getEnterpriseBySlug(slug: string): Promise<EnterpriseDefinition | null> {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  if (FORCE_LOCAL_DATA) {
    const fallback = enterpriseCatalogBySlug[normalizedSlug];
    return fallback ? enrichEnterpriseBusinessModel(fallback) : null;
  }

  try {
    const firestore = getAdminFirestore();
    const doc = await firestore.collection(ENTERPRISE_ANNUAIRE_COLLECTION).doc(normalizedSlug).get();

    if (doc.exists) {
      const enterprise = normalizeEnterpriseDocument(doc.data());

      if (enterprise) {
        return enrichEnterpriseBusinessModel(mergeEnterpriseFallback(stripFirestoreMetadata(enterprise)));
      }
    }
  } catch (error) {
    console.warn(`[enterprise-annuaire] Firestore lookup failed for "${normalizedSlug}", using JSON fallback.`, error);
  }

  const fallback = enterpriseCatalogBySlug[normalizedSlug];

  return fallback ? enrichEnterpriseBusinessModel(fallback) : null;
}

export async function getEnterpriseSystems(): Promise<System[]> {
  const enterprises = await getEnterpriseCatalog();

  return enterprises.map(enterpriseToSystem);
}
