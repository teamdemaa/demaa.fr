export const primaryNavigationItems = [
  { id: "analyser", label: "Analyser", href: "/", visible: false },
  { id: "structurer", label: "Structurer", href: "/structurer", visible: false },
  { id: "deleguer", label: "Déléguer", href: "/deleguer", visible: false },
  { id: "developper", label: "Développer", href: "/developper", visible: false },
] as const;

export const visiblePrimaryNavigationItems = primaryNavigationItems.filter(
  (item) => item.visible
);

export type PrimaryNavigationId = (typeof primaryNavigationItems)[number]["id"];
