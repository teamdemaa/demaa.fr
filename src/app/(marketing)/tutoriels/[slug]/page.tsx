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
    ...(tutorial.format === "practice"
      ? {
          socialImage: {
            alt: `Aperçu de la mise en pratique : ${tutorial.title}`,
            height: 900,
            url: tutorial.thumbnail,
            width: 1600,
          },
        }
      : {}),
  });
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params;
  const tutorial = getPublishedTutorialBySlug(slug);
  if (!tutorial) notFound();

  const origin = getCanonicalOrigin();
  const canonicalUrl = `${origin}/tutoriels/${tutorial.slug}`;
  const parentName = tutorial.format === "method" ? "Méthodes" : "Modèles";
  const parentUrl = tutorial.format === "method" ? "/tutoriels" : "/modeles";
  const articleJsonLd = tutorial.format === "method"
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: tutorial.title,
        description: tutorial.summary,
        url: canonicalUrl,
        inLanguage: "fr-FR",
        datePublished: tutorial.publishedAt,
        dateModified: tutorial.updatedAt,
        citation: tutorial.sources.map(({ url }) => url),
        author: { "@type": "Organization", name: "Demaa" },
        publisher: { "@type": "Organization", name: "Demaa" },
      }
    : {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: tutorial.title,
        description: tutorial.summary,
        url: canonicalUrl,
        image: `${origin}${tutorial.thumbnail.split("?")[0]}`,
        inLanguage: "fr-FR",
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
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: origin },
        { "@type": "ListItem", position: 2, name: parentName, item: `${origin}${parentUrl}` },
        { "@type": "ListItem", position: 3, name: tutorial.title, item: canonicalUrl },
      ],
    },
    articleJsonLd,
  ];

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
