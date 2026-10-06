import { LEARNING_PROJECT_SERIES } from "@/lib/academy-project-series";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import { getPublishedPracticeTutorials } from "@/lib/tutorial-catalog";

export type AcademyPreviewCard = Readonly<{
  category: string;
  format: "Méthode" | "Cours" | "Apprentissage" | "Projet" | "Approche";
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
    href: `/apprentissages/${tutorial.slug}`,
    image: academyCoverPath(tutorial.slug),
    imageAlt: "",
    ...modelFor(tutorial.modelSlug),
    searchTerms: tutorial.searchTerms,
    summary: tutorial.summary,
    title: tutorial.title,
  }));
}

export function getAcademyPreviewCards(): AcademyPreviewCard[] {
  return LEARNING_PROJECT_SERIES.map(project => ({
    category: String(project.number).padStart(2, "0"),
    format: "Projet",
    href: `/apprentissages/${project.slug}`,
    image: project.image,
    imageAlt: project.imageAlt,
    imageCaption: project.imageCaption,
    searchTerms: [project.description],
    summary: project.description,
    title: project.name,
  }));
}
