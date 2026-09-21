import { getAcademyFundamentals } from "@/lib/academy-course-content";
import { getAllPublishedContent } from "@/lib/content-catalog";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import { getPublishedPracticeTutorials } from "@/lib/tutorial-catalog";

export type AcademyPreviewCard = Readonly<{
  category: string;
  format: "Méthode";
  href: string;
  image: string | null;
  imageAlt: string;
  modelHref?: string;
  modelTitle?: string;
  searchTerms: readonly string[];
  summary: string;
  title: string;
}>;

const courseModelSlugs: Readonly<Record<string, string>> = {
  "piloter-sa-tresorerie": "suivi-previsionnel-financier",
  "comprendre-chiffre-affaires-benefice": "suivi-previsionnel-financier",
  "construire-systeme-marketing-vente": "suivi-commercial-et-devis",
  "transformer-demande-en-client": "suivi-commercial-et-devis",
  "deleguer-sans-perdre-le-controle": "pilotage-entreprise-notion",
  "livrer-prestation-sans-tout-reinventer": "projets-et-missions-clients",
};

function modelFor(slug: string) {
  const model = getPublishedCopyableModelBySlug(slug);
  return model ? { modelHref: `/modeles/${model.slug}`, modelTitle: model.title } : {};
}

function academyCoverPath(slug: string) {
  return `/images/academy/covers/${slug}-v3.png`;
}

export function getAcademyPreviewCards(): AcademyPreviewCard[] {
  const fundamentals = getAcademyFundamentals().map((course) => ({
    category: course.identity.category,
    format: "Méthode" as const,
    href: `/academie/${course.identity.slug}`,
    image: academyCoverPath(course.identity.slug),
    imageAlt: "",
    ...(courseModelSlugs[course.identity.slug] ? modelFor(courseModelSlugs[course.identity.slug]) : {}),
    searchTerms: [course.identity.audience, ...course.recap.points],
    summary: course.identity.promise,
    title: course.identity.title,
  }));
  const methods = getPublishedPracticeTutorials().map((tutorial) => ({
    category: tutorial.topic,
    format: "Méthode" as const,
    href: `/academie/${tutorial.slug}`,
    image: academyCoverPath(tutorial.slug),
    imageAlt: "",
    ...modelFor(tutorial.modelSlug),
    searchTerms: tutorial.searchTerms,
    summary: tutorial.summary,
    title: tutorial.title,
  }));
  const articles = getAllPublishedContent().map((entry) => ({
    category: entry.category,
    format: "Méthode" as const,
    href: `/academie/${entry.slug}`,
    image: academyCoverPath(entry.slug),
    imageAlt: "",
    searchTerms: entry.tags,
    summary: entry.summary,
    title: entry.title,
  }));

  return [...fundamentals, ...methods, ...articles];
}
