const expandedServiceSlugs = [
  "organisation-automatisation",
  "recrutement-assistante-facturation",
  "audit-conformite-fiscale",
] as const;

export function hasExpandedServiceContent(serviceSlug: string) {
  return expandedServiceSlugs.includes(
    serviceSlug as (typeof expandedServiceSlugs)[number]
  );
}
