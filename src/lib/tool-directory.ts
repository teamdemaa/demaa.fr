import rawToolDirectory from "./tool-directory.json";

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
  memberDealLabel?: string;
  memberDealDescription?: string;
  scope?: "business" | "transverse";
  status?: "active" | "hidden" | "deprecated";
  toolbox?: boolean;
};

type ToolDirectoryPayload = {
  tools: ToolDirectoryItem[];
};

const toolDirectoryPayload = rawToolDirectory as ToolDirectoryPayload;

export function getToolDirectorySlug(tool: Pick<ToolDirectoryItem, "name" | "slug">): string {
  if (tool.slug) {
    return tool.slug;
  }

  return tool.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const toolDirectory = toolDirectoryPayload.tools.filter(
  (tool) => tool.status !== "hidden" && tool.status !== "deprecated",
);

export const toolboxToolDirectory = toolDirectory.filter((tool) => tool.toolbox);

export const toolDirectoryBySlug = Object.fromEntries(
  toolDirectory.map((tool) => [getToolDirectorySlug(tool), tool]),
);

export const toolDirectorySectors = [
  "Tous",
  ...Array.from(new Set(toolDirectory.flatMap((tool) => tool.sectors))),
];

export const toolDirectoryCategories = [
  "Tous",
  ...Array.from(new Set(toolDirectory.map((tool) => tool.category))),
];

export function getToolDirectoryItemBySlug(slug: string): ToolDirectoryItem | null {
  return toolDirectoryBySlug[slug] ?? null;
}
