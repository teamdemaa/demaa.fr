export const primaryNavigationItems = [
  { id: "structurer", label: "Structurer", href: "/", visible: true },
  { id: "deleguer", label: "Déléguer", href: "/deleguer", visible: true },
  { id: "developper", label: "Développer", href: "/developper", visible: true },
] as const;

export const visiblePrimaryNavigationItems = primaryNavigationItems.filter(
  (item) => item.visible
);

export type PrimaryNavigationId = (typeof primaryNavigationItems)[number]["id"];
