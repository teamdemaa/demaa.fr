export const SYSTEM_DETAIL_TABS = [
  "process",
  "outils",
  "fournisseurs",
  "financement",
  "reseaux-pro",
  "accompagnement",
  "recrutement",
  "formation",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

export const SYSTEM_DETAIL_TAB_VISIBILITY = {
  process: true,
  outils: true,
  fournisseurs: true,
  financement: true,
  "reseaux-pro": true,
  accompagnement: true,
  recrutement: true,
  formation: true,
} satisfies Record<SystemDetailTab, boolean>;

export function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}

export function isVisibleSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return isSystemDetailTab(tab) && SYSTEM_DETAIL_TAB_VISIBILITY[tab];
}
