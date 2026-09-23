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

function modelFor(slug: string) {
  const model = getPublishedCopyableModelBySlug(slug);
  return model ? { modelHref: `/modeles/${model.slug}`, modelTitle: model.title } : {};
}

function academyCoverPath(slug: string) {
  return `/images/academy/covers/${slug}-v3.png`;
}

export function getAcademyPreviewCards(): AcademyPreviewCard[] {
  // The public Tutorials surface deliberately starts with four Airtable
  // walkthroughs. The broader Academy catalog remains in the repository for
  // later editorial review; it is not published through this surface.
  return getPublishedPracticeTutorials().map((tutorial) => ({
    category: tutorial.topic,
    format: "Méthode",
    href: `/academie/${tutorial.slug}`,
    image: academyCoverPath(tutorial.slug),
    imageAlt: "",
    ...modelFor(tutorial.modelSlug),
    searchTerms: tutorial.searchTerms,
    summary: tutorial.summary,
    title: tutorial.title,
  }));
}
