export const expandedServiceSlugs = [
  "organisation-automatisation",
  "assistant-polyvalent",
] as const;

export function hasExpandedServiceContent(serviceSlug: string) {
  return expandedServiceSlugs.includes(
    serviceSlug as (typeof expandedServiceSlugs)[number]
  );
}
