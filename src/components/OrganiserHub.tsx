import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import OrganiserLibrary, {
  type OrganiserGuideCardData,
  type OrganiserProcessCardData,
} from "@/components/OrganiserLibrary";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import {
  getAllAcademyContent,
  getPublicOrganiserContent,
} from "@/lib/academy-course-content";
import {
  getContentFormat,
  getPublishedOrganisationContent,
  isOrganisationTransverseLibraryReady,
} from "@/lib/content-catalog";
import { getPublishedCopyableModels } from "@/lib/copyable-model-catalog";
import { getOrganiserThumbnailPath } from "@/lib/organiser-thumbnail-catalog";

export default function OrganiserHub() {
  const courses = getAllAcademyContent().filter((content) => content.kind === "course");
  const publishedOrganisationContent = getPublishedOrganisationContent();
  const models = getPublishedCopyableModels();
  const showLegacyProcesses = !isOrganisationTransverseLibraryReady(
    publishedOrganisationContent.length,
  );
  const processes: OrganiserProcessCardData[] = (showLegacyProcesses
    ? getPublicOrganiserContent()
    : []
  ).flatMap((content) => {
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
  const guides: OrganiserGuideCardData[] = publishedOrganisationContent.map((guide) => ({
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
            aria-label="Mieux organiser l’entreprise, un sujet à la fois"
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span aria-hidden="true">
              <span className="block text-brand-blue/62">Mieux organiser l’entreprise</span>
              <span className="demaa-hero-title block text-dema-forest">un sujet à la fois</span>
            </span>
          </h1>
        </header>

        <section id="cours" aria-label="Cours Academy" className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-16 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => {
              const { card } = course.identity;
              return (
                <Link
                  key={course.identity.slug}
                  href={`/organiser/${course.identity.slug}`}
                  className="group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
                  aria-label={`Ouvrir le cours ${card.title}`}
                >
                  <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
                    <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-dema-line bg-[#F1F3F0]">
                      {card.image ? (
                        <Image
                          src={card.image}
                          alt={card.imageAlt}
                          fill
                          priority={index < 3}
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.01]"
                        />
                      ) : (
                        <div className="flex h-full flex-col justify-between bg-dema-forest p-6 text-dema-paper sm:p-7">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-paper/70">Academy</span>
                          <span className="max-w-[17rem] text-2xl font-light leading-[1.05] tracking-[-0.035em]">{card.title}</span>
                          <span className="h-px w-10 bg-dema-paper/70" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="px-0.5 pb-1 pt-3.5">
                      <h3 className="line-clamp-2 text-[0.96rem] font-normal leading-[1.3] text-brand-blue transition-colors group-hover:text-dema-forest sm:text-[1.02rem]">
                        {card.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-dema-muted">{course.identity.category}</p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        <OrganiserLibrary guides={guides} models={models} processes={processes} />

        <div className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
