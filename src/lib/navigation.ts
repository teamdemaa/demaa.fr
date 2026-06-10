export const primaryNavigationItems = [
  { id: "analyser", label: "Analyser", href: "/", visible: true },
  { id: "structurer", label: "Structurer", href: "/structurer", visible: true },
  { id: "deleguer", label: "Déléguer", href: "/deleguer", visible: true },
  { id: "developper", label: "Développer", href: "/developper", visible: false },
] as const;

export const visiblePrimaryNavigationItems = primaryNavigationItems.filter(
  (item) => item.visible
);

export type PrimaryNavigationId = (typeof primaryNavigationItems)[number]["id"];
