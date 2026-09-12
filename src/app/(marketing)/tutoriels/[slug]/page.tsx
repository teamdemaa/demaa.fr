import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TutorialArticle from "@/components/TutorialArticle";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { getCanonicalOrigin } from "@/lib/site-url";
import {
  getPublishedTutorialBySlug,
  getPublishedTutorialRouteParams,
} from "@/lib/tutorial-catalog";

type TutorialPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export function generateStaticParams() {
  return getPublishedTutorialRouteParams();
}

export async function generateMetadata({ params }: TutorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = getPublishedTutorialBySlug(slug);
  if (!tutorial) return {};

  return buildPublicPageMetadata({
    title: `${tutorial.title} | Demaa`,
    description: tutorial.summary,
    path: `/tutoriels/${tutorial.slug}`,
    type: "article",
    keywords: [...tutorial.searchTerms, tutorial.category],
  });
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params;
  const tutorial = getPublishedTutorialBySlug(slug);
  if (!tutorial) notFound();

  const canonicalUrl = `${getCanonicalOrigin()}/tutoriels/${tutorial.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tutorial.title,
    description: tutorial.summary,
    url: canonicalUrl,
    totalTime: `PT${tutorial.minutes}M`,
    datePublished: tutorial.publishedAt,
    dateModified: tutorial.updatedAt,
    tool: [{ "@type": "HowToTool", name: tutorial.tool }],
    step: tutorial.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.paragraphs.join(" "),
      url: `${canonicalUrl}#tutorial-step-${index + 1}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <TutorialArticle tutorial={tutorial} />
    </>
  );
}
