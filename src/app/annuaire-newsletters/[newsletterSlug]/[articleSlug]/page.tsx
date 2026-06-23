import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import {
  getAllNewsletterArticles,
  getNewsletterArticleBySlugs,
  getNewsletterBySlug,
  getNewsletterSystems,
} from "@/lib/newsletter-content";

type NewsletterArticlePageProps = {
  params: Promise<{ newsletterSlug: string; articleSlug: string }>;
};

export async function generateStaticParams() {
  return getAllNewsletterArticles().map((entry) => ({
    newsletterSlug: entry.newsletterSlug,
    articleSlug: entry.slug,
  }));
}

export async function generateMetadata({
  params,
}: NewsletterArticlePageProps): Promise<Metadata> {
  const { newsletterSlug, articleSlug } = await params;
  const article = getNewsletterArticleBySlugs(newsletterSlug, articleSlug);
  const newsletter = getNewsletterBySlug(newsletterSlug);

  if (!article || !newsletter) {
    return { title: "Article introuvable - Demaa" };
  }

  const title = article.seoTitle ?? article.title;
  const description = article.seoDescription ?? article.description;

  return {
    title: `${title} | ${newsletter.title} | Demaa`,
    description,
    alternates: {
      canonical: `/annuaire-newsletters/${newsletter.slug}/${article.slug}`,
    },
    openGraph: {
      title: `${title} | ${newsletter.title} | Demaa`,
      description,
      url: `/annuaire-newsletters/${newsletter.slug}/${article.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${newsletter.title} | Demaa`,
      description,
    },
  };
}

export default async function NewsletterArticlePage({
  params,
}: NewsletterArticlePageProps) {
  const { newsletterSlug, articleSlug } = await params;
  const article = getNewsletterArticleBySlugs(newsletterSlug, articleSlug);
  const newsletter = getNewsletterBySlug(newsletterSlug);

  if (!article || !newsletter) {
    notFound();
  }

  const relatedSystems = getNewsletterSystems(newsletter.slug);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Organization",
      name: "Demaa",
    },
    publisher: {
      "@type": "Organization",
      name: "Demaa",
    },
    mainEntityOfPage: `https://demaa.fr/annuaire-newsletters/${newsletter.slug}/${article.slug}`,
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh] py-16 px-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <article className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <Link
            href={`/annuaire-newsletters/${newsletter.slug}`}
            className="inline-flex items-center text-brand-blue hover:text-neutral-700 font-medium mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à {newsletter.title}
          </Link>

          <header className="mb-12 border-b border-gray-100 pb-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand-coral/10 px-4 py-2 text-sm font-medium text-brand-coral">
                {newsletter.sectorLabel}
              </span>
              <div className="flex items-center text-sm font-medium text-brand-blue bg-dema-sage/75 w-fit px-4 py-2 rounded-full">
                <Mail className="w-4 h-4 mr-2" />
                {newsletter.title}
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-blue mt-6 mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center text-sm font-medium text-brand-coral bg-brand-coral/10 w-fit px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </div>
          </header>

          <div className="[&>p]:mb-6 [&>p]:text-lg [&>p]:leading-8 [&>p]:text-gray-700 [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-brand-blue [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-brand-blue [&>ul]:mb-7 [&>ul]:list-disc [&>ul]:space-y-3 [&>ul]:pl-6 [&>ul>li]:text-lg [&>ul>li]:leading-8 [&>ul>li]:text-gray-700 [&>ol]:mb-7 [&>ol]:list-decimal [&>ol]:space-y-3 [&>ol]:pl-6 [&>ol>li]:text-lg [&>ol>li]:leading-8 [&>ol>li]:text-gray-700 [&>blockquote]:my-8 [&>blockquote]:rounded-3xl [&>blockquote]:border [&>blockquote]:border-dema-sage/60 [&>blockquote]:bg-dema-sage/15 [&>blockquote]:px-6 [&>blockquote]:py-5 [&>blockquote]:text-base [&>blockquote]:leading-8 [&>blockquote]:text-brand-blue [&>blockquote]:shadow-[0_10px_30px_rgba(29,78,61,0.08)] [&>blockquote_p]:mb-3 [&>blockquote_p:last-child]:mb-0 [&>strong]:font-semibold [&>strong]:text-brand-blue">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {article.tags.length ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-dema-sage/75 px-3 py-1.5 text-xs font-medium text-brand-blue/75"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-10">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques systèmes particulièrement concernés par les sujets de cet article."
            />
          </div>
        </article>
      </main>
    </>
  );
}
