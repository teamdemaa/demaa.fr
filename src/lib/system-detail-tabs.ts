export const SYSTEM_DETAIL_TABS = [
  "systeme",
  "outils",
  "fournisseurs",
  "financement",
  "academie",
  "reseaux-pro",
  "recrutement",
  "ressources",
  "formation",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

// Keep tab availability centralized so temporarily hidden sections can be
// restored without removing their routes or content.
export const SYSTEM_DETAIL_TAB_VISIBILITY = {
  systeme: true,
  outils: true,
  fournisseurs: true,
  financement: true,
  academie: false,
  "reseaux-pro": true,
  recrutement: true,
  ressources: true,
  formation: true,
} satisfies Record<SystemDetailTab, boolean>;

export function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}

export function isVisibleSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return isSystemDetailTab(tab) && SYSTEM_DETAIL_TAB_VISIBILITY[tab];
}
