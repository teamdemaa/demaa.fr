import "server-only";
import { cache } from "react";
import type { Publication } from "./publication-contract";
import translations from "./learning-episodes-en.json";
import { publishedArticles, publicationVersion } from "./publications.server";
// A changed or unpublished French article must never silently show an outdated
// English version. Re-review its translation and update sourceVersion to release it.
export function currentEnglishTranslations(french: readonly Publication[]) {
  return translations.filter(t => french.some(a => a.project === t.project && a.number === t.number && publicationVersion(a) === t.sourceVersion));
}
export const englishPublishedArticles = cache(async () => currentEnglishTranslations(await publishedArticles()));
export async function englishPublishedArticle(project: string, slug: string) {
  return (await englishPublishedArticles()).find(t => t.project === project && t.slug === slug);
}
