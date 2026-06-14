import { notFound } from "next/navigation";
import type { Metadata } from "next";
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

  return {
    title: `${entry.title} | Cours Demaa`,
    description: entry.description,
    alternates: {
      canonical: `/cours/${entry.slug}`,
    },
    openGraph: {
      title: `${entry.title} | Cours Demaa`,
      description: entry.description,
      url: `/cours/${entry.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.title} | Cours Demaa`,
      description: entry.description,
    },
  };
}

export default async function CourseDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const entry = getCourseEntryBySlug(params.slug);
  const relatedSystems = getRelatedSystemsForContentSlug(params.slug);

  if (!entry) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh] py-16 px-4">
        <article className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <Link href="/cours" className="inline-flex items-center text-brand-blue hover:text-neutral-700 font-medium mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux cours
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

          <div className="[&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-gray-600 [&>p]:mb-6 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-brand-blue [&>h3]:mt-10 [&>h3]:mb-4 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-brand-blue [&>h2]:mt-12 [&>h2]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:text-gray-600 [&>strong]:text-brand-blue [&>strong]:font-semibold">
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
