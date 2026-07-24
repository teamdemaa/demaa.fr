export const SYSTEM_DETAIL_TABS = [
  "kit",
  "outils",
  "process",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

const SYSTEM_DETAIL_TAB_VISIBILITY = {
  kit: true,
  outils: true,
  process: true,
} satisfies Record<SystemDetailTab, boolean>;

function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}

export function isVisibleSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return isSystemDetailTab(tab) && SYSTEM_DETAIL_TAB_VISIBILITY[tab];
}

const LEGACY_SYSTEM_DETAIL_TABS: Readonly<Record<string, SystemDetailTab>> = {
  accompagnement: "kit",
  cours: "process",
  systeme: "process",
};

export function normalizeSystemDetailTab(tab?: string): SystemDetailTab | undefined {
  if (!tab) return undefined;

  const normalizedTab = LEGACY_SYSTEM_DETAIL_TABS[tab] ?? tab;

  return isVisibleSystemDetailTab(normalizedTab) ? normalizedTab : undefined;
}
