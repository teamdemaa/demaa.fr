export type SystemKitPreview = {
  alt: string;
  src: string;
};

const SYSTEM_KIT_PREVIEWS: Partial<Record<string, SystemKitPreview>> = {
  "agence-marketing": {
    alt: "Aperçu des feuilles du tableau de pilotage pour agence marketing",
    src: "/images/kits/agence-marketing/tableau-pilotage-preview.webp",
  },
};

export function getSystemKitPreview(systemSlug: string): SystemKitPreview | null {
  return SYSTEM_KIT_PREVIEWS[systemSlug] ?? null;
}
