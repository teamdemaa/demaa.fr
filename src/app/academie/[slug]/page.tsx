import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AcademyCoursePlayer from "@/components/AcademyCoursePlayer";
import {
  getAcademyContentBySlug,
  getAllAcademyContent,
  getCanonicalAcademySlugForLegacySlug,
} from "@/lib/academy-course-content";

export function generateStaticParams() {
  return getAllAcademyContent().map((content) => ({ slug: content.identity.slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const canonicalSlug = getCanonicalAcademySlugForLegacySlug(slug);
  if (canonicalSlug) permanentRedirect(`/academie/${canonicalSlug}`);
  const content = getAcademyContentBySlug(slug);

  if (!content) return { title: "Cours introuvable | Académie Demaa" };

  const title = `${content.identity.title} | Académie Demaa`;
  const description = content.identity.promise;

  return {
    title,
    description,
    alternates: {
      canonical: `/academie/${content.identity.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/academie/${content.identity.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
      images: content.identity.card.image
        ? [{ url: content.identity.card.image, alt: content.identity.card.imageAlt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AcademyCoursePage(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const canonicalSlug = getCanonicalAcademySlugForLegacySlug(slug);
  if (canonicalSlug) permanentRedirect(`/academie/${canonicalSlug}`);
  const content = getAcademyContentBySlug(slug);

  if (!content) notFound();

  return (
    <>
      <Navbar />
      <AcademyCoursePlayer content={content} />
    </>
  );
}
