import previewManifest from "@/lib/generated/system-kit-previews.json";

export type SystemKitPreview = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

const SYSTEM_KIT_PREVIEWS = new Map<string, SystemKitPreview>(
  previewManifest.map(({ slug, ...preview }) => [slug, preview]),
);

export function getSystemKitPreview(systemSlug: string): SystemKitPreview | null {
  return SYSTEM_KIT_PREVIEWS.get(systemSlug) ?? null;
}
