export const expandedServiceSlugs = [
  "organisation-automatisation",
  "recrutement-assistant-polyvalent",
  "audit-conformite-fiscale",
] as const;

export function hasExpandedServiceContent(serviceSlug: string) {
  return expandedServiceSlugs.includes(
    serviceSlug as (typeof expandedServiceSlugs)[number]
  );
}
