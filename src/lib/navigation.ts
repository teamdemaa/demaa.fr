export const primaryNavigationItems = [
  { id: "structurer", label: "Analyser", href: "/", visible: true },
  { id: "deleguer", label: "Structurer", href: "/deleguer", visible: true },
  { id: "developper", label: "Développer", href: "/developper", visible: true },
] as const;

export const visiblePrimaryNavigationItems = primaryNavigationItems.filter(
  (item) => item.visible
);

export type PrimaryNavigationId = (typeof primaryNavigationItems)[number]["id"];
