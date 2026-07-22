const SYSTEM_DETAIL_TABS = [
  "process",
  "outils",
  "accompagnement",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

const SYSTEM_DETAIL_TAB_VISIBILITY = {
  process: true,
  outils: true,
  accompagnement: true,
} satisfies Record<SystemDetailTab, boolean>;

function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}

export function isVisibleSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return isSystemDetailTab(tab) && SYSTEM_DETAIL_TAB_VISIBILITY[tab];
}
