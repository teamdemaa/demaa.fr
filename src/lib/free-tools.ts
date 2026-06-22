import { getToolDirectorySlug, hasStandaloneToolPage, toolDirectory, type ToolDirectoryItem } from "@/lib/tool-directory";
import freeToolFallbacks from "@/lib/free-tool-fallbacks.json";
import { getToolDirectorySectorLabel } from "@/lib/sector-taxonomy";

const MAX_FREE_TOOLS_PER_SYSTEM = 6;

const EXACT_SECTOR_PRIORITY_BY_TOOL_SECTOR =
  freeToolFallbacks.exactSectorPriorityByToolSector as Record<string, string[]>;
const GENERIC_FALLBACK_PRIORITY_BY_PUBLIC_SECTOR =
  freeToolFallbacks.genericFallbackPriorityByPublicSector as Record<string, string[]>;
export const MANUAL_SYSTEM_PRIORITY_BY_SYSTEM =
  freeToolFallbacks.manualSystemPriorityBySystem as Record<string, string[]>;

const freeTools = toolDirectory.filter(
  (tool) => tool.pricingHint === "Gratuit" && hasStandaloneToolPage(tool),
);

const freeToolsBySlug = Object.fromEntries(
  freeTools.map((tool) => [getToolDirectorySlug(tool), tool] as const),
);

function resolveToolsFromSlugs(slugs: readonly string[]): ToolDirectoryItem[] {
  const seenSlugs = new Set<string>();

  return slugs
    .map((slug) => freeToolsBySlug[slug])
    .filter((tool): tool is ToolDirectoryItem => {
      if (!tool) {
        return false;
      }

      const resolvedSlug = getToolDirectorySlug(tool);

      if (seenSlugs.has(resolvedSlug)) {
        return false;
      }

      seenSlugs.add(resolvedSlug);
      return true;
    });
}

function resolveFreeToolFallbackTools(sectorLabel: string): ToolDirectoryItem[] {
  const effectiveSectorLabel = getToolDirectorySectorLabel(sectorLabel);
  const preferredSlugs = [
    ...(GENERIC_FALLBACK_PRIORITY_BY_PUBLIC_SECTOR[sectorLabel] ?? []),
    ...(EXACT_SECTOR_PRIORITY_BY_TOOL_SECTOR[effectiveSectorLabel] ?? []),
  ];
  const prioritized = resolveToolsFromSlugs(preferredSlugs);
  const existingSlugs = new Set(prioritized.map((tool) => getToolDirectorySlug(tool)));
  const matchingSectorTools = freeTools.filter(
    (tool) =>
      tool.sectors.includes(effectiveSectorLabel) &&
      !existingSlugs.has(getToolDirectorySlug(tool)),
  );

  return [...prioritized, ...matchingSectorTools].slice(0, MAX_FREE_TOOLS_PER_SYSTEM);
}

export function getFreeToolsForSector(sectorLabel: string): ToolDirectoryItem[] {
  return resolveFreeToolFallbackTools(sectorLabel);
}

export function getFreeToolsForSystem(systemSlug: string, sectorLabel: string): ToolDirectoryItem[] {
  const manualSelection = MANUAL_SYSTEM_PRIORITY_BY_SYSTEM[systemSlug];

  if (manualSelection?.length) {
    return resolveToolsFromSlugs(manualSelection).slice(0, MAX_FREE_TOOLS_PER_SYSTEM);
  }

  return resolveFreeToolFallbackTools(sectorLabel);
}
