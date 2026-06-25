export const SYSTEM_DETAIL_TABS = [
  "outils",
  "fournisseurs",
  "expert-comptable",
  "financement",
  "reseaux-pro",
  "recrutement",
  "ressources",
  "formation",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

export function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}
