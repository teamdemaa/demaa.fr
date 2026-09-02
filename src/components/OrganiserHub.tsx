import Navbar from "@/components/Navbar";
import OrganiserLibrary, {
  type OrganiserGuideCardData,
  type OrganiserProcessCardData,
} from "@/components/OrganiserLibrary";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import { getPublicOrganiserContent } from "@/lib/academy-course-content";
import { getAllPublishedContent, getContentFormat } from "@/lib/content-catalog";
import { getOrganiserThumbnailPath } from "@/lib/organiser-thumbnail-catalog";

export default function OrganiserHub() {
  const processes: OrganiserProcessCardData[] = getPublicOrganiserContent().flatMap((content) => {
    const guide = content.processGuide;
    return guide ? [{
      category: content.identity.category,
      durationMinutes: content.identity.durationMinutes,
      promise: content.identity.promise,
      recapPoints: content.recap.points,
      sector: guide.sector,
      slug: content.identity.slug,
      steps: guide.steps,
      systemLabel: guide.system.label,
      thumbnail: getOrganiserThumbnailPath(content.identity.slug),
      title: content.identity.card.title,
    }] : [];
  });
  const guides: OrganiserGuideCardData[] = getAllPublishedContent().map((guide) => ({
    category: guide.category,
    format: getContentFormat(guide),
    image: guide.media.youtubeThumbnail ?? guide.media.slides?.[0],
    keyPoints: guide.keyPoints,
    slug: guide.slug,
    summary: guide.summary,
    tags: guide.tags,
    thumbnail: getOrganiserThumbnailPath(guide.slug),
    title: guide.shortTitle,
  }));

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="min-h-screen bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
          <h1
            aria-label="Des cas concrets pour organiser votre activité"
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span aria-hidden="true">
              <span className="block text-brand-blue/62">Des cas concrets</span>
              <span className="demaa-hero-title block text-dema-forest">pour organiser votre activité</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-dema-muted md:text-lg">
            Des explications concrètes pour mieux organiser votre activité, avec les méthodes, les outils et les modèles utiles pour passer à l’action.
          </p>
        </header>

        <OrganiserLibrary guides={guides} processes={processes} />

        <div className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
