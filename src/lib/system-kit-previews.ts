import previewManifest from "@/lib/system-kit-previews.generated.json";

export type SystemKitPreview = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export const LEVIER_PREVIEW = Object.freeze({
  alt: "Aperçu du tableau de bord Levier avec des données d’exemple",
  height: 933,
  src: "/images/levier/levier-tableau-de-bord-preview.webp",
  width: 1400,
}) satisfies SystemKitPreview;

const SYSTEM_KIT_PREVIEWS = new Map<string, SystemKitPreview>(
  previewManifest.map(({ slug, ...preview }) => [slug, preview]),
);

export function getSystemKitPreview(systemSlug: string): SystemKitPreview | null {
  return SYSTEM_KIT_PREVIEWS.get(systemSlug) ?? null;
}
