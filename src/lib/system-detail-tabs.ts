export const SYSTEM_DETAIL_TABS = [
  "process",
  "solutions",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

const SYSTEM_DETAIL_TAB_VISIBILITY = {
  process: true,
  solutions: true,
} satisfies Record<SystemDetailTab, boolean>;

function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}

export function isVisibleSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return isSystemDetailTab(tab) && SYSTEM_DETAIL_TAB_VISIBILITY[tab];
}

const LEGACY_SYSTEM_DETAIL_TABS: Readonly<Record<string, SystemDetailTab>> = {
  outils: "solutions",
  ecosysteme: "solutions",
  kit: "process",
  pilotage: "process",
  accompagnement: "process",
  services: "process",
  cours: "process",
  systeme: "process",
};

export function normalizeSystemDetailTab(tab?: string): SystemDetailTab | undefined {
  if (!tab) return undefined;

  const normalizedTab = LEGACY_SYSTEM_DETAIL_TABS[tab] ?? tab;

  return isVisibleSystemDetailTab(normalizedTab) ? normalizedTab : undefined;
}

export function getNextSystemDetailTab(
  currentTab: SystemDetailTab,
  key: string,
): SystemDetailTab | undefined {
  const currentIndex = SYSTEM_DETAIL_TABS.indexOf(currentTab);

  if (key === "Home") return SYSTEM_DETAIL_TABS[0];
  if (key === "End") return SYSTEM_DETAIL_TABS.at(-1);
  if (key === "ArrowRight") {
    return SYSTEM_DETAIL_TABS[(currentIndex + 1) % SYSTEM_DETAIL_TABS.length];
  }
  if (key === "ArrowLeft") {
    return SYSTEM_DETAIL_TABS[
      (currentIndex - 1 + SYSTEM_DETAIL_TABS.length) % SYSTEM_DETAIL_TABS.length
    ];
  }

  return undefined;
}
