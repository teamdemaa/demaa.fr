import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import {
  getDocumentModelBySlug,
  getRelatedSystemsForDocumentModelSlug,
} from "@/lib/document-models";

type DocumentModelDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: DocumentModelDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getDocumentModelBySlug(slug);

  if (!entry) {
    return { title: "Modèle introuvable - Demaa" };
  }

  return {
    title: entry.seoTitle ?? `${entry.title} | Modèles de documents Demaa`,
    description: entry.seoDescription ?? entry.description,
    alternates: {
      canonical: `/modeles-de-documents/${entry.slug}`,
    },
    openGraph: {
      title: entry.seoTitle ?? `${entry.title} | Modèles de documents Demaa`,
      description: entry.seoDescription ?? entry.description,
      url: `/modeles-de-documents/${entry.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.seoTitle ?? `${entry.title} | Modèles de documents Demaa`,
      description: entry.seoDescription ?? entry.description,
    },
  };
}

export default async function DocumentModelDetailPage({
  params,
}: DocumentModelDetailPageProps) {
  const { slug } = await params;
  const entry = getDocumentModelBySlug(slug);

  if (!entry) {
    notFound();
  }

  const relatedSystems = getRelatedSystemsForDocumentModelSlug(slug);
  const mediaSlides = entry.slides?.length ? entry.slides : entry.image ? [entry.image] : [];

  return (
    <>
      <Navbar />
      <main className="min-h-[85vh] w-full flex-1 bg-background px-4 py-16">
        <article className="mx-auto max-w-3xl animate-in slide-in-from-bottom-4 duration-500">
          <Link
            href="/modeles-de-documents"
            className="mb-10 inline-flex items-center font-medium text-brand-blue transition-colors hover:text-neutral-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux modèles de documents
          </Link>

          <header className="mb-12 border-b border-gray-100 pb-10">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-brand-blue sm:text-5xl">
              {entry.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex w-fit items-center rounded-full bg-brand-coral/10 px-4 py-2 text-sm font-medium text-brand-coral">
                <Calendar className="mr-2 h-4 w-4" />
                <time dateTime={entry.date}>
                  {new Date(entry.date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <span className="rounded-full bg-neutral-100 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-neutral-700">
                Modele
              </span>
              <span className="rounded-full bg-dema-sage/75 px-4 py-2 text-[11px] font-semibold text-brand-blue/75">
                {entry.category}
              </span>
            </div>
          </header>

          {mediaSlides.length ? (
            <section className="mb-10">
              <div className="-mx-4 overflow-x-auto px-4 pb-4 soft-scroll sm:-mx-6 sm:px-6">
                <div className="flex w-max snap-x snap-mandatory gap-4">
                  {mediaSlides.map((slide, index) => (
                    <div key={slide} className="w-[min(86vw,44rem)] shrink-0 snap-start">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-gray-100 bg-dema-cream shadow-[0_10px_30px_rgba(20,20,20,0.05)]">
                        <Image
                          src={slide}
                          alt={`${entry.title} - visuel ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 86vw, 44rem"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <div className="[&>h2]:mb-6 [&>h2]:mt-12 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-brand-blue [&>h3]:mb-4 [&>h3]:mt-10 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-brand-blue [&>p]:mb-6 [&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-gray-600 [&>strong]:font-semibold [&>strong]:text-brand-blue [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:text-gray-600">
            <ReactMarkdown>{entry.content}</ReactMarkdown>
          </div>

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

          <div className="mt-10">
            <a
              href={entry.ctaHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {entry.ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques pages système où ce modèle de document peut être particulièrement utile."
            />
          </div>
        </article>
      </main>
    </>
  );
}
