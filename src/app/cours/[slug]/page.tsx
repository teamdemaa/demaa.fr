import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import { getCourseEntryBySlug } from "@/lib/course-content";
import { getRelatedSystemsForContentSlug } from "@/lib/related-systems";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const entry = getCourseEntryBySlug(params.slug);

  if (!entry) return { title: "Cours introuvable - Demaa" };

  const title = `${entry.seoTitle ?? entry.title} | Demaa`;
  const description = entry.seoDescription ?? entry.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/cours/${entry.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/cours/${entry.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CourseDetailPage(
  props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ retourSysteme?: string | string[] }>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const entry = getCourseEntryBySlug(params.slug);
  const relatedSystems = getRelatedSystemsForContentSlug(params.slug);

  if (!entry) {
    notFound();
  }

  const title = entry.seoTitle ?? entry.title;
  const description = entry.seoDescription ?? entry.description;
  const returnSystemSlug = Array.isArray(searchParams.retourSysteme)
    ? searchParams.retourSysteme[0]
    : searchParams.retourSysteme;
  const slides = entry.slides?.length ? entry.slides : entry.image ? [entry.image] : [];
  const backHref = returnSystemSlug
    ? `/kit-operationnel/${returnSystemSlug}?tab=formation`
    : "/cours";
  const backLabel = returnSystemSlug ? "Retour au système" : "Retour aux cours";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: entry.date,
    dateModified: entry.date,
    author: {
      "@type": "Organization",
      name: "Demaa",
    },
    publisher: {
      "@type": "Organization",
      name: "Demaa",
    },
    mainEntityOfPage: `https://demaa.fr/cours/${entry.slug}`,
  };
  const faqJsonLd = entry.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: entry.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh] py-16 px-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        {faqJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        ) : null}
        <article className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <Link href={backHref} className="inline-flex items-center text-brand-blue hover:text-neutral-700 font-medium mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Link>

          <header className="mb-12 border-b border-gray-100 pb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-blue mb-6 leading-tight">
              {entry.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center text-sm font-medium text-brand-coral bg-brand-coral/10 w-fit px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={entry.date}>
                  {new Date(entry.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                </time>
              </div>
              <div className="flex items-center text-sm font-medium text-brand-blue bg-dema-sage/75 w-fit px-4 py-2 rounded-full">
                <GraduationCap className="w-4 h-4 mr-2" />
                {entry.duration}
              </div>
              <span className="rounded-full bg-neutral-100 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-neutral-700">
                {entry.category}
              </span>
            </div>
          </header>

          {slides.length ? (
            <section className="mb-10">
              <div className="-mx-4 overflow-x-auto px-4 pb-4 soft-scroll sm:-mx-6 sm:px-6">
                <div className="flex w-max snap-x snap-mandatory gap-4">
                  {slides.map((slide, index) => (
                    <div key={slide} className="w-[min(88vw,56rem)] shrink-0 snap-start">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_10px_30px_rgba(20,20,20,0.05)]">
                        <Image
                          src={slide}
                          alt={`${entry.title} - slide ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 88vw, 56rem"
                          className="object-contain bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {entry.content ? (
            <div className="[&>p]:mb-6 [&>p]:text-lg [&>p]:leading-8 [&>p]:text-gray-700 [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-brand-blue [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-brand-blue [&>ul]:mb-7 [&>ul]:list-disc [&>ul]:space-y-3 [&>ul]:pl-6 [&>ul>li]:text-lg [&>ul>li]:leading-8 [&>ul>li]:text-gray-700 [&>ol]:mb-7 [&>ol]:list-decimal [&>ol]:space-y-3 [&>ol]:pl-6 [&>ol>li]:text-lg [&>ol>li]:leading-8 [&>ol>li]:text-gray-700 [&>blockquote]:my-8 [&>blockquote]:rounded-3xl [&>blockquote]:border [&>blockquote]:border-dema-sage/60 [&>blockquote]:bg-dema-sage/15 [&>blockquote]:px-6 [&>blockquote]:py-5 [&>blockquote]:text-base [&>blockquote]:leading-8 [&>blockquote]:text-brand-blue [&>blockquote]:shadow-[0_10px_30px_rgba(29,78,61,0.08)] [&>blockquote_p]:mb-3 [&>blockquote_p:last-child]:mb-0 [&>strong]:font-semibold [&>strong]:text-brand-blue">
              <ReactMarkdown>{entry.content}</ReactMarkdown>
            </div>
          ) : (
            <section className="rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5">
              <h2 className="text-lg font-semibold text-brand-blue">Article détaillé à venir</h2>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                Pour l&apos;instant, cette ressource est disponible en format slides. Le contenu détaillé pourra être ajouté ensuite sous le diaporama.
              </p>
            </section>
          )}

          {entry.tags.length ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-dema-sage/75 px-3 py-1.5 text-xs font-medium text-brand-blue/75"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {entry.faq?.length ? (
            <section className="mt-14 border-t border-gray-100 pt-10">
              <h2 className="text-3xl font-bold text-brand-blue">FAQ</h2>
              <div className="mt-6 space-y-6">
                {entry.faq.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-gray-100 bg-white p-5">
                    <h3 className="text-lg font-semibold text-brand-blue">{item.question}</h3>
                    <p className="mt-2 text-base leading-7 text-gray-700">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-10">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques pages système où ce cours est particulièrement utile."
            />
          </div>
        </article>
      </main>
    </>
  );
}
