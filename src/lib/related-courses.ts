import { getAllCourseEntries, type CourseEntry } from "@/lib/course-content";
import { RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG } from "@/lib/content-relationships";

export function getRelatedCoursesForSystemSlug(systemSlug: string, limit = 3): CourseEntry[] {
  const relatedCourses = getAllCourseEntries().filter((entry) =>
    (RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG[entry.slug] ?? []).includes(systemSlug),
  );

  if (relatedCourses.length) {
    return relatedCourses.slice(0, limit);
  }

  return getAllCourseEntries().slice(0, limit);
}
