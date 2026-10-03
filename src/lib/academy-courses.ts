import courses from "@/lib/academy-courses-data.json";

export { ACADEMY_LEARNING_LABEL } from "@/lib/academy-learning-label";
export const ACADEMY_COURSES = courses;
export type AcademyCourse = (typeof courses)[number];
export function getAcademyCourse(slug: string) {
  return ACADEMY_COURSES.find((course) => course.slug === slug);
}
export function academyWorksheetHref(slug: string) {
  return `/downloads/academy/${slug}.csv`;
}
