export const primaryNavigationItems = [
  { id: "analyser", label: "Analyser", href: "/", visible: false },
  { id: "structurer", label: "Structurer", href: "/organisation-automatisation", visible: false },
  { id: "deleguer", label: "Déléguer", href: "/annuaire-services", visible: false },
] as const;

export const visiblePrimaryNavigationItems = primaryNavigationItems.filter(
  (item) => item.visible
);

export type PrimaryNavigationId = (typeof primaryNavigationItems)[number]["id"];
