export { publicSectorLabels, type PublicSectorLabel, getToolDirectorySectorLabel } from "@/lib/sector-taxonomy";

export const ALL_SECTORS_LABEL = "Tous";

export const TOOLS_HUB_SECTOR_ORDER = [
  "Conseil & services aux entreprises",
  "BTP & services techniques",
  "Tech & Digital",
  "Mobilité & logistique",
  "Immobilier",
  "Éducation & formation",
  "Automobile & réparation",
] as const;

export const toolsHubSectorLabels = new Set<string>(TOOLS_HUB_SECTOR_ORDER);
