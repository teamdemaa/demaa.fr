import { z } from "zod";

export const PROJECTS = ["jago", "tiimora", "dumaan", "demaa"] as const;
export const EPISODE_TITLES = ["La genèse du projet", "Stratégie", "Plan d’action", "Update 1", "Update 2", "Update 3"] as const;
export const EPISODE_SLUGS = ["la-genese", "strategie", "plan-action", "update-1", "update-2", "update-3"] as const;
export const DraftSchema = z.object({
  title: z.string().trim().max(160),
  description: z.string().trim().max(320),
  text: z.string().trim().max(50000),
});
export const ArticleSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(320),
  text: z.string().trim().min(30).max(50000),
});
export type ArticleDraft = z.infer<typeof ArticleSchema>;
export type Publication = ArticleDraft & { project: typeof PROJECTS[number]; number: number; slug: string; publishedAt?: string };
export type Newsletter = { status: "preparing" | "prepared" | "sending" | "sent" | "uncertain"; broadcastId?: string; version: string; testedVersion?: string; testedAt?: string };
export type PublicationRecord = { id: string; project: typeof PROJECTS[number]; number: number; revision: number; draft: ArticleDraft; published: Publication | null; updatedAt?: string; newsletter?: Newsletter };
export const STUDIO_ARTICLE_TITLES = ["Pourquoi on construit DEMAA", "Notre système Go-to-Market", "Comment on pilote notre exécution dans Airtable"] as const;
export const STUDIO_ARTICLE_SLUGS = ["pourquoi-demaa", "systeme-go-to-market", "execution-airtable"] as const;
export function publicationTitles(project: string): readonly string[] { return project === "demaa" ? STUDIO_ARTICLE_TITLES : EPISODE_TITLES; }
export function publicationSlot(project: unknown, number: unknown) {
  if (!PROJECTS.includes(project as typeof PROJECTS[number]) || !Number.isInteger(number) || Number(number) < 0 || Number(number) >= publicationTitles(String(project)).length) throw new Error("Projet ou épisode invalide.");
  return { id: `${project}-${number}`, project: project as typeof PROJECTS[number], number: Number(number), slug: (project === "demaa" ? STUDIO_ARTICLE_SLUGS : EPISODE_SLUGS)[Number(number)] };
}
export function publicationRouteAllowed(project: string, slug: string) {
  return PROJECTS.includes(project as typeof PROJECTS[number]) && (project === "demaa" ? STUDIO_ARTICLE_SLUGS : EPISODE_SLUGS).some(s => s === slug);
}
export function articleParagraphs(text: string) { return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean); }

export function articleHeading(text: string) {
  return ["Signal à valider", "Ce qu’on veut vérifier", "Indicateurs à suivre", "Audience", "Positionnement", "Offre", "Promotion", "Attirer", "Convertir", "Fidéliser", "Nurture", "Relation", "Recommandation", "Ce qui fera choisir l’ICP", "Ce qui fera choisir le profil de client idéal", "Deux couches restent actives partout", "1. La stratégie : APOP", "2. Le plan d’action", "Et maintenant ?"].includes(text);
}
