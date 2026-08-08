import "server-only";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { B2BOpportunity } from "@/lib/b2b-opportunities-contract";

export const B2B_OPPORTUNITIES_COLLECTION = "b2b_opportunities";
export type { B2BOpportunity } from "@/lib/b2b-opportunities-contract";

type StoredB2BOpportunity = B2BOpportunity & Readonly<{
  status: "draft" | "published" | "closed";
}>;

function parseOpportunity(input: unknown): StoredB2BOpportunity | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (
    typeof value.slug !== "string" || !/^[a-z0-9-]{3,120}$/.test(value.slug)
    || typeof value.title !== "string" || !value.title.trim()
    || typeof value.description !== "string" || !value.description.trim()
    || typeof value.category !== "string" || !value.category.trim()
    || !["draft", "published", "closed"].includes(String(value.status))
  ) return null;

  return {
    category: value.category.trim(),
    description: value.description.trim(),
    slug: value.slug,
    status: value.status as StoredB2BOpportunity["status"],
    title: value.title.trim(),
  };
}

export async function getPublishedB2BOpportunities(): Promise<readonly B2BOpportunity[]> {
  try {
    const snapshot = await getAdminFirestore()
      .collection(B2B_OPPORTUNITIES_COLLECTION)
      .where("status", "==", "published")
      .get();

    return snapshot.docs
      .map((document) => parseOpportunity(document.data()))
      .filter((opportunity): opportunity is StoredB2BOpportunity => opportunity !== null)
      .sort((left, right) => left.title.localeCompare(right.title, "fr"))
      .map(({ category, description, slug, title }) => ({ category, description, slug, title }));
  } catch (error) {
    console.error("[b2b-opportunities] Firebase read failed", error);
    return [];
  }
}

export async function getPublishedB2BOpportunity(slug: string): Promise<B2BOpportunity | null> {
  if (!/^[a-z0-9-]{3,120}$/.test(slug)) return null;
  try {
    const snapshot = await getAdminFirestore()
      .collection(B2B_OPPORTUNITIES_COLLECTION)
      .doc(slug)
      .get();
    const opportunity = snapshot.exists ? parseOpportunity(snapshot.data()) : null;
    if (!opportunity || opportunity.status !== "published") return null;
    const { category, description, title } = opportunity;
    return { category, description, slug, title };
  } catch (error) {
    console.error("[b2b-opportunities] Firebase read failed", error);
    return null;
  }
}
