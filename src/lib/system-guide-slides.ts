import type { SystemResourceSlug } from "@/lib/system-resource-catalog";

const GUIDE_SLIDES: Partial<Record<SystemResourceSlug, readonly string[]>> = {
  "guide-obligations-fiscales-sociales-comptables": [1, 2, 3, 4, 5].map(
    (slide) => `/images/courses/obligations-finances/${String(slide).padStart(2, "0")}.png`,
  ),
  "guide-facturation-electronique": [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
    (slide) => `/images/courses/facturation-electronique/${String(slide).padStart(2, "0")}.png`,
  ),
};

export function getGuideSlides(resourceSlug: SystemResourceSlug): readonly string[] {
  return GUIDE_SLIDES[resourceSlug] ?? [];
}
