import rawToolDirectory from "./tool-directory.json";

export type ToolScope = "business" | "transverse";

export type ToolDirectoryItem = {
  slug?: string;
  name: string;
  url: string;
  category: string;
  sectors: string[];
  description: string;
  tags: string[];
  bestFor: string;
  pricingHint: string;
  keyFeatures?: string[];
  idealFor?: string[];
  pricingNoteVerified?: string;
  pricingCapturedAt?: string;
  pricingExpiresAt?: string;
  sources?: string[];
  lastReviewedAt?: string;
  scope?: ToolScope;
  status?: "active" | "hidden" | "deprecated";
};

export function getFreshToolPricingNote(
  tool: Pick<ToolDirectoryItem, "pricingNoteVerified" | "pricingCapturedAt" | "pricingExpiresAt">,
  now = new Date(),
): string | null {
  if (!tool.pricingNoteVerified || !tool.pricingCapturedAt || !tool.pricingExpiresAt) return null;
  const nowTimestamp = now.getTime();
  const capturedAt = Date.parse(tool.pricingCapturedAt);
  const expiresAt = Date.parse(tool.pricingExpiresAt);
  if (
    !Number.isFinite(nowTimestamp) ||
    !Number.isFinite(capturedAt) ||
    !Number.isFinite(expiresAt) ||
    capturedAt > nowTimestamp ||
    capturedAt >= expiresAt ||
    expiresAt <= nowTimestamp
  ) return null;
  return tool.pricingNoteVerified;
}

type ToolDirectoryPayload = {
  tools: ToolDirectoryItem[];
};

const toolDirectoryPayload = rawToolDirectory as ToolDirectoryPayload;

const CANONICAL_TOOL_SLUG_OVERRIDES: Record<string, string> = {
  "booknroll": "book-n-roll",
  "harvest-patrimoine": "harvest",
  "laddition": "l-addition",
  "lexis-plus": "lexis",
  "maia-assurance": "maia",
  "nomad-caisse": "nomad",
  "openprod": "open-prod",
  "orchestra-travel": "orchestra",
  "repairsoft": "repair-soft",
  "simplybook": "simplybook-me",
  "vega-idel": "vega",
};

function slugifyToolName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getToolDirectorySlug(tool: Pick<ToolDirectoryItem, "name" | "slug">): string {
  if (tool.slug) {
    return CANONICAL_TOOL_SLUG_OVERRIDES[tool.slug] ?? tool.slug;
  }

  return slugifyToolName(tool.name);
}

function getToolDirectoryAliases(tool: Pick<ToolDirectoryItem, "name" | "slug">): string[] {
  const aliases = new Set<string>();
  const canonicalSlug = getToolDirectorySlug(tool);

  if (tool.slug && tool.slug !== canonicalSlug) {
    aliases.add(tool.slug);
  }

  const slugFromName = slugifyToolName(tool.name);
  if (slugFromName !== canonicalSlug) {
    aliases.add(slugFromName);
  }

  return Array.from(aliases);
}

export const toolDirectory = toolDirectoryPayload.tools.filter(
  (tool) => tool.status !== "hidden" && tool.status !== "deprecated",
);

const toolDirectoryBySlug = Object.fromEntries(
  toolDirectory.flatMap((tool) => {
    const canonicalSlug = getToolDirectorySlug(tool);
    const aliases = getToolDirectoryAliases(tool);

    return [
      [canonicalSlug, tool],
      ...aliases.map((alias) => [alias, tool] as const),
    ];
  }),
);

export function findToolDirectoryItemBySlug(
  tools: ToolDirectoryItem[],
  slug: string,
): ToolDirectoryItem | null {
  return (
    tools.find((tool) => {
      const canonicalSlug = getToolDirectorySlug(tool);
      const aliases = getToolDirectoryAliases(tool);

      return canonicalSlug === slug || aliases.includes(slug);
    }) ?? null
  );
}

export function getToolDirectoryItemBySlug(slug: string): ToolDirectoryItem | null {
  return toolDirectoryBySlug[slug] ?? null;
}

export function resolveToolDirectorySlugInList(
  tools: ToolDirectoryItem[],
  slug: string,
): string | null {
  const tool = findToolDirectoryItemBySlug(tools, slug);

  if (!tool) {
    return null;
  }

  return getToolDirectorySlug(tool);
}

export function hasStandaloneToolPage(tool: Pick<ToolDirectoryItem, "url">): boolean {
  return tool.url.startsWith("/") && !tool.url.startsWith("/annuaire-outils/");
}
