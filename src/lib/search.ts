const SEARCH_ALIAS_GROUPS = [
  ["btp", "batiment", "bâtiment", "chantier", "construction", "travaux", "artisan", "artisanat"],
  ["compta", "comptable", "expert comptable", "expert-comptable", "cabinet comptable"],
  ["resto", "restaurant", "restauration"],
  ["beaute", "beauté", "esthetique", "esthétique", "bien etre", "bien-être"],
  ["rh", "ressources humaines", "paie", "salaries", "salariés"],
  ["crm", "ventes", "commercial", "prospection"],
  ["facture", "facturation", "devis"],
] as const;

function dedupeParts(parts: string[]): string[] {
  return Array.from(new Set(parts.filter(Boolean)));
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandAliasTerms(normalizedText: string): string[] {
  return SEARCH_ALIAS_GROUPS.flatMap((group) => {
    const normalizedGroup = group.map((term) => normalizeSearchText(term));
    return normalizedGroup.some((term) => normalizedText.includes(term))
      ? normalizedGroup
      : [];
  });
}

function buildSearchableText(parts: Array<string | null | undefined>): string {
  const normalizedBase = normalizeSearchText(parts.filter(Boolean).join(" "));

  if (!normalizedBase) {
    return "";
  }

  const expandedTerms = expandAliasTerms(normalizedBase);
  return dedupeParts([normalizedBase, ...expandedTerms]).join(" ");
}

export function matchesSearchQuery(
  query: string,
  parts: Array<string | null | undefined>,
): boolean {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = buildSearchableText(parts);

  if (!searchableText) {
    return false;
  }

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  return queryTokens.every((token) => searchableText.includes(token));
}
