import { getAllNewsletters } from "@/lib/newsletter-content";

export type NewsletterEntry = {
  slug: string;
  title: string;
  description: string;
  frequency: string;
  publisher: string;
  href: string;
  systemSlugs: string[];
};

export const newsletters: NewsletterEntry[] = getAllNewsletters().map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  description: entry.description,
  frequency: entry.frequency,
  publisher: entry.publisher,
  href: `/annuaire-newsletters/${entry.slug}`,
  systemSlugs: entry.systemSlugs,
}));

export function getRelatedNewslettersForSystemSlug(
  systemSlug: string,
  limit = 6,
): NewsletterEntry[] {
  return newsletters
    .filter((entry) => entry.systemSlugs.includes(systemSlug))
    .sort((left, right) => left.systemSlugs.length - right.systemSlugs.length)
    .slice(0, limit);
}
