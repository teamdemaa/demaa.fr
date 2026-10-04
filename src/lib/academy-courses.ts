import courses from "@/lib/academy-courses-data.json";
import jagoCase from "@/lib/academy-jago-case.json";

export { ACADEMY_LEARNING_LABEL } from "@/lib/academy-learning-label";
// Existing articles and their landscape assets are retained for future editorial work.
export const ACADEMY_COURSES = [jagoCase];
export type AcademyCourse = (typeof courses)[number];
export function getAcademyCourse(slug: string) {
  return [...ACADEMY_COURSES, ...courses].find((course) => course.slug === slug);
}
export function academyWorksheetHref(slug: string) {
  return `/downloads/academy/${slug}.csv`;
}
