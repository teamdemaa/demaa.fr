import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AcademyCoursePlayer from "@/components/AcademyCoursePlayer";
import AcademyTutorialArticle from "@/components/AcademyTutorialArticle";
import {
  getAcademyContentBySlug,
  getAllAcademyContent,
  getCanonicalAcademySlugForLegacySlug,
} from "@/lib/academy-course-content";
import {
  buildAcademyContentJsonLd,
  buildAcademyContentMetadata,
  serializeAcademyContentJsonLd,
} from "@/lib/academy-content-seo";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";

function academyDestination(slug: string) {
  return getAcademyPreviewCards().some(({ href }) => href === `/academie/${slug}`)
    ? `/academie/${slug}`
    : null;
}

export function generateStaticParams() {
  return getAllAcademyContent().map((content) => ({ slug: content.identity.slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const canonicalSlug = getCanonicalAcademySlugForLegacySlug(slug);
  const destination = academyDestination(canonicalSlug ?? slug);
  if (destination) permanentRedirect(destination);
  if (canonicalSlug) permanentRedirect(`/organiser/${canonicalSlug}`);
  const content = getAcademyContentBySlug(slug);

  if (!content) return { title: "Contenu introuvable | Organisation Demaa" };

  return buildAcademyContentMetadata(content);
}

export default async function OrganiserContentPage(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const canonicalSlug = getCanonicalAcademySlugForLegacySlug(slug);
  const destination = academyDestination(canonicalSlug ?? slug);
  if (destination) permanentRedirect(destination);
  if (canonicalSlug) permanentRedirect(`/organiser/${canonicalSlug}`);
  const content = getAcademyContentBySlug(slug);

  if (!content) notFound();

  const jsonLd = buildAcademyContentJsonLd(content);

  return (
    <>
      <Navbar publicNavigationActiveView="academy" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeAcademyContentJsonLd(jsonLd),
        }}
      />
      {content.kind === "case-study" ? (
        <AcademyTutorialArticle content={content} />
      ) : (
        <AcademyCoursePlayer content={content} />
      )}
    </>
  );
}
