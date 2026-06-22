import {
  getToolDirectorySlug,
  hasStandaloneToolPage,
  type ToolDirectoryItem,
} from "@/lib/tool-directory";
import { getToolDirectorySectorLabel } from "@/lib/public-sectors";

export type ToolDirectoryCardItem = ToolDirectoryItem & {
  detailUrl?: string;
};

export type ToolDirectorySearchParams = Promise<{
  secteur?: string | string[];
  categorie?: string | string[];
  q?: string | string[];
  retourSysteme?: string | string[];
}>;

export type ToolDirectoryInitialFilters = {
  initialCategory?: string;
  initialSector?: string;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function getToolDirectoryInitialFilters(
  searchParams: ToolDirectorySearchParams,
): Promise<ToolDirectoryInitialFilters> {
  const params = await searchParams;

  return {
    initialCategory: getParamValue(params.categorie),
    initialSector: getParamValue(params.secteur)
      ? getToolDirectorySectorLabel(getParamValue(params.secteur) as string)
      : undefined,
  };
}

export function withSoftwareDetailUrls(tools: ToolDirectoryItem[]): ToolDirectoryCardItem[] {
  return tools.map((tool) => ({
    ...tool,
    detailUrl: hasStandaloneToolPage(tool)
      ? undefined
      : `/annuaire-outils/${getToolDirectorySlug(tool)}`,
  }));
}
