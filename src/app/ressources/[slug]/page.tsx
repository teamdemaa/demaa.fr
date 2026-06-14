import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import { getEditorialEntryBySlug } from "@/lib/editorial-content";
import { getRelatedSystemsForContentSlug } from "@/lib/related-systems";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const entry = getEditorialEntryBySlug(params.slug);

  if (!entry) return { title: "Ressource introuvable - Demaa" };

  return {
    title: `${entry.title} | Ressources Demaa`,
    description: entry.description,
    alternates: {
      canonical: `/ressources/${entry.slug}`,
    },
    openGraph: {
      title: `${entry.title} | Ressources Demaa`,
      description: entry.description,
      url: `/ressources/${entry.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.title} | Ressources Demaa`,
      description: entry.description,
    },
  };
}

export default async function ResourceDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const entry = getEditorialEntryBySlug(params.slug);
  const relatedSystems = getRelatedSystemsForContentSlug(params.slug);

  if (!entry) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh] py-16 px-4">
        <article className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <Link href="/ressources" className="inline-flex items-center text-brand-blue hover:text-neutral-700 font-medium mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux ressources
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
              <span className="rounded-full bg-neutral-100 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-neutral-700">
                {entry.type}
              </span>
              <span className="rounded-full bg-dema-sage/75 px-4 py-2 text-[11px] font-semibold text-brand-blue/75">
                {entry.category}
              </span>
            </div>
          </header>

          {entry.image ? (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl border border-gray-100 bg-dema-cream">
              <Image
                src={entry.image}
                alt={entry.title}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          ) : null}

          {entry.slides?.length ? (
            <section className="mb-10">
              <div className="-mx-4 overflow-x-auto px-4 pb-4 soft-scroll sm:-mx-6 sm:px-6">
                <div className="flex w-max snap-x snap-mandatory gap-4">
                  {entry.slides.map((slide, index) => (
                    <div
                      key={slide}
                      className="w-[min(86vw,44rem)] shrink-0 snap-start"
                    >
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

          <div className="[&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-gray-600 [&>p]:mb-6 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-brand-blue [&>h3]:mt-10 [&>h3]:mb-4 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-brand-blue [&>h2]:mt-12 [&>h2]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:text-gray-600 [&>strong]:text-brand-blue [&>strong]:font-semibold [&_img]:rounded-3xl [&_img]:shadow-sm [&_img]:my-10 [&_img]:mx-auto [&_img]:max-w-full">
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

          {entry.ctaHref && entry.ctaLabel ? (
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
          ) : null}

          <div className="mt-10">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques pages système où cette ressource peut être particulièrement utile."
            />
          </div>
        </article>
      </main>
    </>
  );
}
