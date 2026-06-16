export const SYSTEM_DETAIL_TABS = [
  "processus",
  "outils",
  "services",
  "fournisseurs",
  "reseaux-pro",
  "ressources",
  "cours",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

export function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}
