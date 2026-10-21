import "server-only";
import { createHash } from "node:crypto";
import { getAdminFirestore, hasFirebaseAdminConfiguration } from "@/lib/firebase-admin";
import { encodePublication, decodePublication } from "@/lib/publication-storage.server";
import seeds from "@/lib/learning-episodes-data.json";
import { DraftSchema, ArticleSchema, publicationTitles, PROJECTS, publicationSlot, type ArticleDraft, type Publication, type PublicationRecord } from "@/lib/publication-contract";

export class PublicationConflict extends Error {}
export function publicationRef(id: string) { return getAdminFirestore().collection("studioPublications").doc(id); }
export function initialPublication(project: string, number: number): PublicationRecord {
  const slot = publicationSlot(project, number);
  const seed = seeds.find(s => s.project === project && s.number === number);
  const draft = seed ? { title: seed.title, description: seed.description, text: seed.paragraphs.join("\n\n") } : { title: publicationTitles(project)[number], description: "", text: "" };
  return { id: slot.id, project: slot.project, number, revision: 0, draft, published: seed ? { ...draft, ...slot, publishedAt: "2026-10-05T00:00:00.000Z" } : null };
}
export async function listPublications(): Promise<PublicationRecord[]> {
  const docs = hasFirebaseAdminConfiguration() ? await getAdminFirestore().collection("studioPublications").get() : null;
  const stored = new Map(docs?.docs.map(d => [d.id, decodePublication(d.id, d.data())]));
  return PROJECTS.flatMap(project => publicationTitles(project).map((_, number) => stored.get(`${project}-${number}`) ?? initialPublication(project, number)));
}
export async function publishedArticles(): Promise<Publication[]> {
  // Public articles are temporarily hidden; drafts and publications remain stored.
  return [];
}
export async function publishedArticle(project: string, slug: string) {
  return (await publishedArticles()).find(p => p.project === project && p.slug === slug);
}
export function publicationVersion(article: ArticleDraft) { return createHash("sha256").update(JSON.stringify([article.title, article.description, article.text])).digest("hex"); }
export async function changePublication(input: { project: string; number: number; revision: number; action: "save" | "publish" | "unpublish"; draft?: unknown }, actor: string) {
  const slot = publicationSlot(input.project, input.number);
  const ref = publicationRef(slot.id);
  return getAdminFirestore().runTransaction(async tx => {
    const snap = await tx.get(ref);
    const current = snap.exists ? decodePublication(slot.id, snap.data()!) : initialPublication(input.project, input.number);
    if (current.revision !== input.revision) throw new PublicationConflict("Cet épisode a été modifié ailleurs. Recharge la page avant de continuer.");
    if (input.action !== "save" && current.newsletter && ["preparing", "sending"].includes(current.newsletter.status)) throw new PublicationConflict("Une opération newsletter est en cours. Attends sa fin avant de modifier la publication.");
    const now = new Date().toISOString();
    const next: PublicationRecord = { ...current, revision: current.revision + 1, updatedAt: now };
    if (input.action === "save") next.draft = DraftSchema.parse(input.draft);
    if (input.action === "publish") next.published = { ...ArticleSchema.parse(current.draft), project: slot.project, number: slot.number, slug: slot.slug, publishedAt: now };
    if (input.action === "unpublish") next.published = null;
    tx.set(ref.collection("history").doc(String(next.revision)), { ...encodePublication(current), archivedAt: now, actor });
    tx.set(ref, { ...encodePublication(next), updatedBy: actor });
    return next;
  });
}
