export const EXPERTISE_FAMILIES = [
  "acquisition-visibility",
  "web-product-creation",
  "organisation-support",
  "finance-legal",
] as const;

export type ExpertiseFamily = (typeof EXPERTISE_FAMILIES)[number];

export type ExpertiseCatalogEntry = Readonly<{
  aliases: readonly string[];
  description: string;
  expertiseId: string;
  family: ExpertiseFamily;
  label: string;
  rank: number;
  specialties: readonly string[];
  visibility: "hidden" | "public";
}>;

export const EXPERTISE_FAMILY_LABELS: Readonly<Record<ExpertiseFamily, string>> = {
  "acquisition-visibility": "Acquisition et visibilité",
  "web-product-creation": "Web, produit et création",
  "organisation-support": "Organisation et support",
  "finance-legal": "Finance, fiscalité et juridique",
};

export function isExpertiseFamily(value: unknown): value is ExpertiseFamily {
  return typeof value === "string"
    && (EXPERTISE_FAMILIES as readonly string[]).includes(value);
}

export function parseExpertiseCatalogEntry(
  input: unknown,
  path = "expertise",
): ExpertiseCatalogEntry {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError(`${path} must be an object`);
  }
  const entry = input as Record<string, unknown>;
  const expertiseId = typeof entry.expertiseId === "string" ? entry.expertiseId : "";
  const label = typeof entry.label === "string" ? entry.label.trim() : "";
  const description = typeof entry.description === "string"
    ? entry.description.trim()
    : "";
  const rank = typeof entry.rank === "number" ? entry.rank : Number.NaN;
  const aliases = Array.isArray(entry.aliases)
    ? entry.aliases.filter((value): value is string => typeof value === "string")
    : [];
  const specialties = Array.isArray(entry.specialties)
    ? entry.specialties.filter((value): value is string => typeof value === "string")
    : [];

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(expertiseId)) {
    throw new TypeError(`${path}.expertiseId is invalid`);
  }
  if (!label || !description) {
    throw new TypeError(`${path} requires a label and description`);
  }
  if (!isExpertiseFamily(entry.family)) {
    throw new TypeError(`${path}.family is invalid`);
  }
  if (!Number.isInteger(rank) || rank < 1) {
    throw new TypeError(`${path}.rank is invalid`);
  }
  if (entry.visibility !== "public" && entry.visibility !== "hidden") {
    throw new TypeError(`${path}.visibility is invalid`);
  }

  return {
    aliases,
    description,
    expertiseId,
    family: entry.family,
    label,
    rank,
    specialties,
    visibility: entry.visibility,
  };
}
