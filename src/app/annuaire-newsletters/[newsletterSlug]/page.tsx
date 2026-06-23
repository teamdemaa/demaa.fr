import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import {
  getChildNewsletters,
  getNewsletterArticlesByNewsletterSlug,
  getNewsletterBySlug,
  getNewsletterSystems,
  getParentNewsletter,
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

  const title = newsletter.seoTitle ?? `${newsletter.title} | Demaa`;
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

  const articles = getNewsletterArticlesByNewsletterSlug(newsletter.slug);
  const relatedSystems = getNewsletterSystems(newsletter.slug);
  const parentNewsletter = getParentNewsletter(newsletter.slug);
  const childNewsletters = getChildNewsletters(newsletter.slug);

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
            Retour à l&apos;annuaire newsletters
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
                {parentNewsletter ? (
                  <div className="mt-6 rounded-[1rem] border border-dema-line bg-dema-cream/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                      Newsletter mère
                    </p>
                    <Link
                      href={`/annuaire-newsletters/${parentNewsletter.slug}`}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-brand-blue transition hover:text-dema-forest"
                    >
                      {parentNewsletter.title}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : null}
              </div>

              <aside className="rounded-[1.25rem] border border-dema-line bg-dema-cream/65 p-5">
                <div className="flex items-center gap-2 text-brand-blue">
                  <Mail className="h-4 w-4" />
                  <h2 className="text-lg font-semibold">Recevoir les prochaines éditions</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  Abonnez-vous pour recevoir les prochains articles de cette newsletter quand une nouvelle édition est publiée.
                </p>
                <div className="mt-4">
                  <NewsletterSubscribeForm
                    newsletterSlug={newsletter.slug}
                    newsletterTitle={newsletter.title}
                  />
                </div>
              </aside>
            </div>
          </section>

          {childNewsletters.length ? (
            <section className="mt-10">
              <div className="flex items-end justify-between gap-4 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue">Newsletters métier liées</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
                    Quelques déclinaisons plus spécifiques pour les métiers de ce secteur.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {childNewsletters.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/annuaire-newsletters/${entry.slug}`}
                    className="rounded-[1.15rem] border border-dema-line bg-dema-paper p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(23,35,29,0.06)]"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
                      Newsletter spécifique
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-brand-blue">
                      {entry.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                      {entry.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-brand-blue">Articles publiés</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
                  Chaque édition publique de la newsletter devient un article consultable et indexable.
                </p>
              </div>
            </div>

            {articles.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/annuaire-newsletters/${newsletter.slug}/${article.slug}`}
                    className="block h-full group"
                  >
                    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(0,0,0,0.045)]">
                      <div className="flex aspect-[16/10] items-end justify-between gap-3 border-b border-gray-100 bg-[linear-gradient(135deg,#f8f5ef_0%,#f3efe6_100%)] p-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                          Edition
                        </span>
                        <span className="rounded-full bg-brand-blue px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                          {new Date(article.date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="text-[1.65rem] font-normal leading-tight text-brand-blue transition-colors group-hover:text-neutral-700">
                          {article.title}
                        </h3>
                        <p className="mt-3 leading-relaxed text-gray-500">
                          {article.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/75"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-5 flex justify-end">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-brand-blue transition-colors group-hover:bg-neutral-100 group-hover:text-neutral-700">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-8 text-center">
                <h3 className="text-lg font-semibold text-brand-blue">Premières éditions en préparation</h3>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  Cette newsletter est prête à accueillir ses prochaines editions publiques.
                </p>
              </div>
            )}
          </section>

          <div className="mt-10">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques systèmes particulièrement proches des sujets couverts par cette newsletter."
            />
          </div>
        </div>
      </main>
    </>
  );
}
