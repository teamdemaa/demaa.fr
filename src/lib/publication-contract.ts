import { z } from "zod";

export const PROJECTS = ["jago", "dumaan", "tiimora"] as const;
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
export function publicationSlot(project: unknown, number: unknown) {
  if (!PROJECTS.includes(project as typeof PROJECTS[number]) || !Number.isInteger(number) || Number(number) < 0 || Number(number) > 5) throw new Error("Projet ou épisode invalide.");
  return { id: `${project}-${number}`, project: project as typeof PROJECTS[number], number: Number(number), slug: EPISODE_SLUGS[Number(number)] };
}
export function articleParagraphs(text: string) { return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean); }
