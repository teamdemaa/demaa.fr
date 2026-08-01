export const SYSTEM_DETAIL_TABS = [
  "process",
  "solutions",
] as const;

export type SystemDetailTab = (typeof SYSTEM_DETAIL_TABS)[number];

export type SystemDetailBookingSource =
  | "Système opérationnel - Process"
  | "Système opérationnel - Solutions";

export function getSystemDetailBookingSource(
  tab: SystemDetailTab,
): SystemDetailBookingSource {
  return tab === "solutions"
    ? "Système opérationnel - Solutions"
    : "Système opérationnel - Process";
}

function isSystemDetailTab(tab?: string): tab is SystemDetailTab {
  return SYSTEM_DETAIL_TABS.includes(tab as SystemDetailTab);
}

export function getVisibleSystemDetailTabs(
  solutionsAvailable: boolean,
): readonly SystemDetailTab[] {
  return solutionsAvailable ? SYSTEM_DETAIL_TABS : ["process"];
}

export function isVisibleSystemDetailTab(
  tab: string | undefined,
  solutionsAvailable: boolean,
): tab is SystemDetailTab {
  return (
    isSystemDetailTab(tab) &&
    getVisibleSystemDetailTabs(solutionsAvailable).includes(tab)
  );
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

export function normalizeSystemDetailTab(
  tab: string | undefined,
  solutionsAvailable: boolean,
): SystemDetailTab | undefined {
  if (!tab) return undefined;

  const normalizedTab = LEGACY_SYSTEM_DETAIL_TABS[tab] ?? tab;

  if (normalizedTab === "solutions" && !solutionsAvailable) return "process";

  return isVisibleSystemDetailTab(normalizedTab, solutionsAvailable)
    ? normalizedTab
    : undefined;
}

export function getNextSystemDetailTab(
  currentTab: SystemDetailTab,
  key: string,
  solutionsAvailable: boolean,
): SystemDetailTab | undefined {
  const visibleTabs = getVisibleSystemDetailTabs(solutionsAvailable);
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
