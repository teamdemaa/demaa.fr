export type NewsletterEntry = {
  slug: string;
  title: string;
  description: string;
  frequency: string;
  publisher: string;
  href: string;
  systemSlugs: string[];
};

export const newsletters: NewsletterEntry[] = [
  {
    slug: "la-veille-du-cabinet",
    title: "La veille du Cabinet",
    description:
      "Une fois par mois, un résumé des évolutions juridiques, fiscales et comptables à maîtriser, avec les informations clés du mois précédent.",
    frequency: "1 fois par mois",
    publisher: "La veille du Cabinet",
    href: "https://laveilleducabinet.kessel.media/",
    systemSlugs: ["cabinet-comptable"],
  },
];

export function getRelatedNewslettersForSystemSlug(
  systemSlug: string,
  limit = 3
): NewsletterEntry[] {
  return newsletters
    .filter((entry) => entry.systemSlugs.includes(systemSlug))
    .slice(0, limit);
}
