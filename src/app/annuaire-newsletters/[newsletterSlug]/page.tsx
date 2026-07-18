import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Newspaper } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import {
  getNewsletterBySlug,
  getNewsletterSystems,
} from "@/lib/newsletter-content";

type NewsletterDetailPageProps = {
  params: Promise<{ newsletterSlug: string }>;
};

export async function generateStaticParams() {
  const { getAllNewsletters } = await import("@/lib/newsletter-content");

  return getAllNewsletters().map((entry) => ({
    newsletterSlug: entry.slug,
  }));
}

export async function generateMetadata({
  params,
}: NewsletterDetailPageProps): Promise<Metadata> {
  const { newsletterSlug } = await params;
  const newsletter = getNewsletterBySlug(newsletterSlug);

  if (!newsletter) {
    return { title: "Newsletter introuvable - Demaa" };
  }

  const title = newsletter.seoTitle ?? `${newsletter.title} | ${newsletter.publisher} | Demaa`;
  const description = newsletter.seoDescription ?? newsletter.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/annuaire-newsletters/${newsletter.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/annuaire-newsletters/${newsletter.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function NewsletterDetailPage({
  params,
}: NewsletterDetailPageProps) {
  const { newsletterSlug } = await params;
  const newsletter = getNewsletterBySlug(newsletterSlug);

  if (!newsletter) {
    notFound();
  }

  const relatedSystems = getNewsletterSystems(newsletter.slug);

  return (
    <>
      <Navbar />
      <main className="min-h-[85vh] w-full flex-1 bg-background px-4 py-16">
        <div className="mx-auto max-w-6xl animate-in slide-in-from-bottom-4 duration-500">
          <Link
            href="/annuaire-newsletters"
            className="mb-10 inline-flex items-center font-medium text-brand-blue transition-colors hover:text-neutral-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour a l&apos;annuaire newsletters
          </Link>

          <section className="rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_60px_rgba(23,35,29,0.08)] md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-brand-coral/10 px-4 py-2 text-sm font-medium text-brand-coral">
                    {newsletter.sectorLabel}
                  </span>
                  <span className="rounded-full bg-dema-sage/75 px-4 py-2 text-sm font-medium text-brand-blue/75">
                    {newsletter.frequency}
                  </span>
                </div>
                <h1 className="mt-5 text-4xl font-bold leading-tight text-brand-blue md:text-5xl">
                  {newsletter.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-gray-600">
                  {newsletter.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-dema-muted">
                  <span className="rounded-full bg-white px-4 py-2 font-medium text-brand-blue">
                    {newsletter.publisher}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {newsletter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <aside className="rounded-[1.25rem] border border-dema-line bg-dema-cream/65 p-5">
                <div className="flex items-center gap-2 text-brand-blue">
                  <Newspaper className="h-4 w-4" />
                  <h2 className="text-lg font-semibold">Voir la source</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  Source recommandee par Demaa.
                </p>
                <a
                  href={newsletter.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue"
                >
                  {newsletter.externalLabel}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </aside>
            </div>
          </section>

          <div className="mt-10">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques systemes particulierement proches de cette newsletter recommandee."
            />
          </div>
        </div>
      </main>
    </>
  );
}
