import "server-only";

import { getAdminFirestore } from "./firebase-admin";
import type { DocumentData } from "firebase-admin/firestore";
import type { System } from "./types";
import rawEnterpriseAnnuaire from "./enterprise-annuaire.json";

export type EnterpriseTool = {
  name: string;
  type: string;
  usage: string;
  priority: string;
};

export type EnterpriseProcess = {
  pillar: "Stratégie" | "Marketing & Vente" | "Opérations" | "Finance & Juridique" | "Équipe";
  title: string;
  description: string;
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
  editorialSubtitle: string;
  imageTitle: string;
  imageSubtitle: string;
  processes: EnterpriseProcess[];
  tools: EnterpriseTool[];
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
    sectorLabel: enterprise.sectorLabel || fallback?.sectorLabel || "Services & conseil",
    editorialSubtitle:
      enterprise.editorialSubtitle || fallback?.editorialSubtitle || `Aperçu du système opérationnel pour ${enterprise.name || fallback?.name || enterprise.slug}`,
    imageTitle: enterprise.imageTitle || fallback?.imageTitle || enterprise.name || enterprise.slug,
    imageSubtitle:
      enterprise.imageSubtitle || fallback?.imageSubtitle || `Aperçu du système opérationnel pour ${enterprise.name || fallback?.name || enterprise.slug}`,
    processes: enterprise.processes?.length ? enterprise.processes : fallback?.processes ?? [],
    tools: enterprise.tools?.length ? enterprise.tools : fallback?.tools ?? [],
  };
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

    return enterprises.map(({ sort_order: _sortOrder, created_at: _createdAt, updated_at: _updatedAt, ...enterprise }) =>
      mergeEnterpriseFallback(enterprise)
    );
  } catch {
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
        const { sort_order: _sortOrder, created_at: _createdAt, updated_at: _updatedAt, ...rest } = enterprise;
        return mergeEnterpriseFallback(rest);
      }
    }
  } catch {
    // Fallback handled below.
  }

  return enterpriseCatalogBySlug[normalizedSlug] ?? null;
}

export async function getEnterpriseSystems(): Promise<System[]> {
  const enterprises = await getEnterpriseCatalog();

  return enterprises.map(enterpriseToSystem);
}
