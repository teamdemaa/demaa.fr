import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarCheck, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import CaseVideoOverview from "@/components/CaseVideoOverview";
import ContentSlidesLauncher from "@/components/ContentSlidesLauncher";
import NumberedSectionHeading from "@/components/NumberedSectionHeading";
import {
  getAllPublishedContent,
  getContentFormat,
  getPublishedContentBySlug,
} from "@/lib/content-catalog";
import {
  buildContentJsonLd,
  buildContentMetadata,
  serializeContentJsonLd,
} from "@/lib/content-seo";
import { getOrganiserThumbnailPath } from "@/lib/organiser-thumbnail-catalog";

type ContentPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export function generateStaticParams() {
  return getAllPublishedContent().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPublishedContentBySlug(slug);
  return entry ? buildContentMetadata(entry) : {};
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const entry = getPublishedContentBySlug(slug);
  if (!entry) notFound();

  const slides = entry.media.slides ?? [];
  const heroImage = entry.media.youtubeThumbnail ?? slides[0];
  const isOrganisationContent = entry.surfaces.includes("organisation");
  const jsonLd = buildContentJsonLd(entry);

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="flex-1 bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeContentJsonLd(jsonLd) }}
        />

        <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            href={isOrganisationContent ? "/organiser#cas-concrets" : "/contenus"}
            className="inline-flex items-center gap-2 text-sm text-dema-muted transition hover:text-dema-forest"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {isOrganisationContent ? "Retour à Organisation" : "Retour aux contenus"}
          </Link>

          <header className="mx-auto mt-8 max-w-4xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-dema-muted">
              <span className="rounded-full bg-dema-sage px-3 py-1 font-medium text-dema-forest">
                {getContentFormat(entry)}
              </span>
              <span>{entry.category}</span>
            </div>
            <h1 className="demaa-section-title mt-5 text-4xl leading-tight tracking-tight text-brand-blue sm:text-5xl lg:text-6xl">
              {entry.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base font-normal leading-relaxed text-dema-muted sm:text-lg">
              {entry.summary}
            </p>
          </header>

          {entry.media.youtubeId ? (
            <section className="mx-auto mt-12 max-w-5xl sm:mt-14">
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-dema-line bg-black shadow-[0_14px_36px_rgba(23,35,29,0.045)]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${entry.media.youtubeId}`}
                  title={entry.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </section>
          ) : (
            <div className="mx-auto max-w-5xl">
              <CaseVideoOverview
                title={entry.title}
                thumbnail={getOrganiserThumbnailPath(entry.slug)}
                items={entry.article.map((section) => section.heading)}
              />
            </div>
          )}

          {entry.media.youtubeId ? (
            <div className="mx-auto max-w-5xl">
              <CaseVideoOverview
                hideMedia
                title={entry.title}
                items={entry.article.map((section) => section.heading)}
              />
            </div>
          ) : heroImage ? (
            <section className="mx-auto mt-10 max-w-5xl">
              <div className="overflow-hidden rounded-[1.5rem] border border-dema-line bg-white shadow-[0_14px_36px_rgba(23,35,29,0.045)]">
                <div className="relative aspect-video">
                  <Image
                    src={heroImage}
                    alt={`Première diapositive : ${entry.shortTitle}`}
                    fill
                    sizes="(min-width: 1024px) 960px, 100vw"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              {slides.length ? (
                <div className="mt-5 flex justify-center">
                  <ContentSlidesLauncher title={entry.shortTitle} slides={slides} />
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="space-y-10">
              {entry.article.map((section, index) => (
                <section key={section.heading} aria-labelledby={`content-section-${index + 1}`}>
                  <NumberedSectionHeading
                    id={`content-section-${index + 1}`}
                    number={index + 1}
                    title={section.heading}
                  />
                  <div className="mt-4 space-y-4 text-base leading-8 text-dema-muted">
                    {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.items ? (
                      <ul className="space-y-3">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <Check className="mt-1.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>

            <aside className="h-fit rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 lg:sticky lg:top-8">
              <div className="flex items-center gap-2 text-sm text-dema-forest">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Informations vérifiées le {new Intl.DateTimeFormat("fr-FR").format(new Date(entry.verifiedAt))}
              </div>
              <h2 className="mt-6 text-lg font-medium text-brand-blue">À retenir</h2>
              <ul className="mt-4 space-y-4 text-sm leading-relaxed text-dema-muted">
                {entry.keyPoints.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          {entry.sources.length ? (
            <section className="mx-auto mt-14 max-w-5xl border-t border-dema-line pt-8">
              <h2 className="text-xl font-normal text-brand-blue">Sources officielles</h2>
              <p className="mt-2 text-sm text-dema-muted">
                La réglementation peut évoluer. Vérifiez ces sources avant toute décision de conformité.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {entry.sources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-full items-start justify-between gap-3 rounded-[1rem] border border-dema-line bg-dema-paper p-4 text-sm leading-relaxed text-brand-blue transition hover:border-dema-forest/20"
                    >
                      <span>{source.label}</span>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </main>
    </>
  );
}
