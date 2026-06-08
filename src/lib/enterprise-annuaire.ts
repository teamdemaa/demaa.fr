import "server-only";

import { getAdminFirestore } from "./firebase-admin";
import type { DocumentData } from "firebase-admin/firestore";
import type { ToolDirectoryItem } from "./tool-directory";
import type { SystemPillar } from "./system-process-templates";
import type { System } from "./types";
import { publicSectorLabels } from "./public-sectors";
import rawEnterpriseAnnuaire from "./enterprise-annuaire.json";

export type EnterpriseTool = {
  slug?: string;
  name: string;
  type: string;
  usage: string;
  url?: string;
  detail?: ToolDirectoryItem;
};

export type EnterpriseToolReference = {
  slug: string;
  usage?: string;
};

export type EnterpriseProcess = {
  pillar: SystemPillar | "Finance & Juridique";
  title: string;
  description: string;
  examples?: string;
};

export type EnterpriseDefinition = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  icon: string;
  price: string;
  sectorLabel: string;
  imageTitle: string;
  imageSubtitle: string;
  processes?: EnterpriseProcess[];
  operationProcesses?: EnterpriseProcess[];
  processExamples?: Record<string, string>;
  tools?: EnterpriseTool[];
  toolRefs?: EnterpriseToolReference[];
};

type EnterpriseAnnuairePayload = {
  enterprises: EnterpriseDefinition[];
};

type EnterpriseFirestoreDocument = EnterpriseDefinition & {
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

const ENTERPRISE_ANNUAIRE_COLLECTION = "enterprise_annuaire";

const enterpriseAnnuaire = rawEnterpriseAnnuaire as EnterpriseAnnuairePayload;

export const enterpriseCatalog = enterpriseAnnuaire.enterprises;

export const enterpriseCatalogBySlug = Object.fromEntries(
  enterpriseCatalog.map((enterprise) => [enterprise.slug, enterprise]),
);

export function enterpriseToSystem(enterprise: EnterpriseDefinition): System {
  return {
    id: enterprise.id,
    slug: enterprise.slug,
    name: enterprise.name,
    category: enterprise.category,
    description: enterprise.description,
    tags: enterprise.tags,
    icon: enterprise.icon,
    price: enterprise.price,
  };
}

function normalizeEnterpriseDocument(
  data: DocumentData | undefined,
): EnterpriseFirestoreDocument | null {
  if (!data) {
    return null;
  }

  const enterprise = data as EnterpriseFirestoreDocument;

  if (!enterprise.slug || !enterprise.name) {
    return null;
  }

  return enterprise;
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

function mergeToolRefs(
  fallbackRefs: EnterpriseToolReference[] | undefined,
  enterpriseRefs: EnterpriseToolReference[] | undefined,
): EnterpriseToolReference[] {
  const mergedRefs = [...(enterpriseRefs ?? [])];
  const existingSlugs = new Set(mergedRefs.map((ref) => ref.slug));

  for (const fallbackRef of fallbackRefs ?? []) {
    if (!existingSlugs.has(fallbackRef.slug)) {
      mergedRefs.push(fallbackRef);
    }
  }

  return mergedRefs;
}

function mergeEnterpriseTools(
  fallbackTools: EnterpriseTool[] | undefined,
  enterpriseTools: EnterpriseTool[] | undefined,
): EnterpriseTool[] {
  const mergedTools = [...(enterpriseTools ?? [])];
  const existingKeys = new Set(
    mergedTools.map((tool) => tool.slug || tool.name)
  );

  for (const fallbackTool of fallbackTools ?? []) {
    const key = fallbackTool.slug || fallbackTool.name;

    if (!existingKeys.has(key)) {
      mergedTools.push(fallbackTool);
    }
  }

  return mergedTools;
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
  return enterpriseCatalog;
}

export async function getEnterpriseCatalog(): Promise<EnterpriseDefinition[]> {
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

    return enterprises.map((enterprise) => mergeEnterpriseFallback(stripFirestoreMetadata(enterprise)));
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

  try {
    const firestore = getAdminFirestore();
    const doc = await firestore.collection(ENTERPRISE_ANNUAIRE_COLLECTION).doc(normalizedSlug).get();

    if (doc.exists) {
      const enterprise = normalizeEnterpriseDocument(doc.data());

      if (enterprise) {
        return mergeEnterpriseFallback(stripFirestoreMetadata(enterprise));
      }
    }
  } catch (error) {
    console.warn(`[enterprise-annuaire] Firestore lookup failed for "${normalizedSlug}", using JSON fallback.`, error);
  }

  return enterpriseCatalogBySlug[normalizedSlug] ?? null;
}

export async function getEnterpriseSystems(): Promise<System[]> {
  const enterprises = await getEnterpriseCatalog();

  return enterprises.map(enterpriseToSystem);
}
