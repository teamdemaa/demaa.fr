import type { SystemResourceSlug } from "@/lib/system-resource-catalog";

const GUIDE_SLIDE_FOLDERS: Partial<Record<SystemResourceSlug, { folder: string; count: number }>> = {
  "guide-obligations-fiscales-sociales-comptables": {
    folder: "obligations-finances",
    count: 5,
  },
  "guide-facturation-electronique": {
    folder: "facturation-electronique",
    count: 9,
  },
};

export function getGuideSlides(resourceSlug: SystemResourceSlug): readonly string[] {
  const config = GUIDE_SLIDE_FOLDERS[resourceSlug];
  if (!config) return [];

  return Array.from({ length: config.count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return `/images/courses/${config.folder}/${number}.png`;
  });
}
