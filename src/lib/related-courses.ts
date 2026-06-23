import { getAllCourseEntries, type CourseEntry } from "@/lib/course-content";

export function getRelatedCoursesForSystemSlug(_systemSlug: string, limit = 3): CourseEntry[] {
  return getAllCourseEntries().slice(0, limit);
}
