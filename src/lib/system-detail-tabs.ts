export const SYSTEM_DETAIL_TABS = [
  "process",
  "solutions",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}

export function getVisibleSystemDetailTabs(): readonly SystemDetailTab[] {
  return SYSTEM_DETAIL_TABS;
}

export function isVisibleSystemDetailTab(
  tab: string | undefined,
): tab is SystemDetailTab {
  return isSystemDetailTab(tab) && getVisibleSystemDetailTabs().includes(tab);
}

const LEGACY_SYSTEM_DETAIL_TABS: Readonly<Record<string, SystemDetailTab>> = {
  outils: "solutions",
  ecosysteme: "solutions",
  resources: "solutions",
  ressources: "solutions",
  modeles: "solutions",
  "modeles-de-documents": "solutions",
  kit: "process",
  pilotage: "process",
  accompagnement: "process",
  services: "process",
  cours: "process",
  systeme: "process",
};

export function normalizeSystemDetailTab(
  tab: string | undefined,
): SystemDetailTab | undefined {
  if (!tab) return undefined;

  const normalizedTab = LEGACY_SYSTEM_DETAIL_TABS[tab] ?? tab;

  return isVisibleSystemDetailTab(normalizedTab)
    ? normalizedTab
    : undefined;
}

export function getNextSystemDetailTab(
  currentTab: SystemDetailTab,
  key: string,
): SystemDetailTab | undefined {
  const visibleTabs = getVisibleSystemDetailTabs();
  const currentIndex = visibleTabs.indexOf(currentTab);

  if (key === "Home") return visibleTabs[0];
  if (key === "End") return visibleTabs.at(-1);
  if (key === "ArrowRight") {
    return visibleTabs[(currentIndex + 1) % visibleTabs.length];
  }
  if (key === "ArrowLeft") {
    return visibleTabs[
      (currentIndex - 1 + visibleTabs.length) % visibleTabs.length
    ];
  }

  return undefined;
}
