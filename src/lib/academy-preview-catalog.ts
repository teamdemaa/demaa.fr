import { ACADEMY_COURSES, ACADEMY_LEARNING_LABEL } from "@/lib/academy-courses";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import { getPublishedPracticeTutorials } from "@/lib/tutorial-catalog";

export type AcademyPreviewCard = Readonly<{
  category: string;
  format: "Méthode" | "Cours" | "Apprentissage";
  href: string;
  image: string | null;
  imageAlt: string;
  imageCaption?: string;
  modelHref?: string;
  modelTitle?: string;
  searchTerms: readonly string[];
  summary: string;
  title: string;
}>;

function modelFor(slug: string) {
  const model = getPublishedCopyableModelBySlug(slug);
  return model ? { modelHref: `/modeles/${model.slug}`, modelTitle: model.title } : {};
}

function academyCoverPath(slug: string) {
  return `/images/academy/covers/${slug}-v3.png`;
}

export function getAcademyPracticeCards(): AcademyPreviewCard[] {
  return getPublishedPracticeTutorials().map((tutorial) => ({
    category: tutorial.topic,
    format: "Méthode",
    href: `/tutoriels/${tutorial.slug}`,
    image: academyCoverPath(tutorial.slug),
    imageAlt: "",
    ...modelFor(tutorial.modelSlug),
    searchTerms: tutorial.searchTerms,
    summary: tutorial.summary,
    title: tutorial.title,
  }));
}

export function getAcademyPreviewCards(): AcademyPreviewCard[] {
  return ACADEMY_COURSES.map(course => ({
    category: course.category,
    format: ACADEMY_LEARNING_LABEL,
    href: `/tutoriels/${course.slug}`,
    image: course.image,
    imageAlt: course.imageAlt,
    imageCaption: course.imageCaption,
    searchTerms: [course.objective, course.intro],
    summary: course.objective,
    title: course.title,
  }));
}
