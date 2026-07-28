import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
} from "lucide-react";
import AcademyVideoArtwork from "@/components/AcademyVideoArtwork";
import AcademyVideoPlayer from "@/components/AcademyVideoPlayer";
import Navbar from "@/components/Navbar";
import {
  getAcademyVideoBySlug,
  getAllAcademyVideos,
} from "@/lib/academy-video-catalog";
import {
  buildAcademyPageJsonLd,
  serializeJsonLd,
} from "@/lib/academy-seo";

type PageProps = { params: Promise<{ slug: string }> };

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllAcademyVideos().map((video) => ({ slug: video.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = getAcademyVideoBySlug(slug);

  if (!video) {
    return {
      title: "Fiche Académie introuvable | Demaa",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: video.seoTitle,
    description: video.seoDescription,
    keywords: [video.primaryKeyword, ...video.secondaryKeywords],
    alternates: { canonical: `/academie/${video.slug}` },
    openGraph: {
      title: video.seoTitle,
      description: video.seoDescription,
      url: `/academie/${video.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
      publishedTime: video.editorialPublishedAt,
      modifiedTime: video.updatedAt,
      images: [
        {
          url: video.publication.thumbnailUrl,
          width: video.publication.thumbnailWidth,
          height: video.publication.thumbnailHeight,
          alt: video.thumbnailAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: video.seoTitle,
      description: video.seoDescription,
      images: [video.publication.thumbnailUrl],
    },
  };
}

export default async function AcademyVideoPage({ params }: PageProps) {
  const { slug } = await params;
  const video = getAcademyVideoBySlug(slug);
  if (!video) notFound();

  const relatedVideo = getAcademyVideoBySlug(video.relatedVideoSlug);
  const publishedDate = dateFormatter.format(
    new Date(`${video.editorialPublishedAt}T12:00:00+02:00`),
  );
  const updatedDate = dateFormatter.format(
    new Date(`${video.updatedAt}T12:00:00+02:00`),
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildAcademyPageJsonLd(video)),
          }}
        />

        <article className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-9 lg:px-8">
          <nav aria-label="Fil d’Ariane">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-dema-muted">
              <li><Link href="/" className="hover:text-dema-forest">Accueil</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/academie" className="hover:text-dema-forest">Académie</Link></li>
              <li aria-hidden="true">/</li>
              <li className="max-w-[18rem] truncate text-brand-blue sm:max-w-none">
                {video.cardTitle}
              </li>
            </ol>
          </nav>

          <header className="mx-auto mt-10 max-w-5xl text-center sm:mt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              {video.category}
            </p>
            <h1 className="mt-4 text-[clamp(2.35rem,6vw,5.35rem)] font-light leading-[0.96] tracking-[-0.052em] text-brand-blue">
              {video.h1}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-[1.75] text-dema-muted sm:text-lg">
              {video.shortAnswer}
            </p>
          </header>

          <section
            className="mx-auto mt-10 max-w-5xl sm:mt-12"
            aria-label={`Vidéo : ${video.publication.youtubeTitle}`}
          >
            <AcademyVideoPlayer video={video} />
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-dema-muted">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-dema-forest" aria-hidden="true" />
                Durée : {video.durationLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-dema-forest" aria-hidden="true" />
                Publiée le {publishedDate}
              </span>
            </div>
          </section>

          <div className="mx-auto mt-14 grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
            <div className="min-w-0 space-y-14">
              <section aria-labelledby="points-essentiels">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">Comprendre</p>
                <h2 id="points-essentiels" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue">
                  Les points essentiels
                </h2>
                <div className="mt-7 grid gap-3">
                  {video.essentialPoints.map((point, index) => (
                    <div key={point.title} className="grid grid-cols-[2.4rem_minmax(0,1fr)] gap-4 rounded-[1.2rem] border border-dema-line bg-dema-paper px-5 py-5">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-dema-sage text-sm font-semibold text-dema-forest">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold leading-snug text-brand-blue">{point.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-dema-muted">{point.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section aria-labelledby="exemple-chiffre">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">Mise en situation</p>
                <h2 id="exemple-chiffre" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue">
                  Un exemple chiffré
                </h2>
                <p className="mt-5 leading-relaxed text-dema-muted">{video.example.introduction}</p>
                <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper">
                  <dl>
                    {video.example.rows.map((row) => (
                      <div key={row.label} className={`flex items-start justify-between gap-6 border-b border-dema-line px-5 py-4 last:border-b-0 ${row.emphasis ? "bg-dema-positive" : ""}`}>
                        <dt className="text-sm leading-relaxed text-dema-muted">{row.label}</dt>
                        <dd className={`shrink-0 text-right font-semibold ${row.emphasis ? "text-dema-forest" : "text-brand-blue"}`}>
                          {row.amount}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <p className="mt-5 rounded-[1rem] bg-brand-blue px-5 py-4 text-center text-base font-semibold text-white">
                  {video.example.formula}
                </p>
                <p className="mt-5 leading-relaxed text-brand-blue">{video.example.conclusion}</p>
                {video.example.alert ? (
                  <p className="mt-4 rounded-[1rem] border border-dema-forest/12 bg-dema-sage px-5 py-4 text-sm leading-relaxed text-dema-muted">
                    {video.example.alert}
                  </p>
                ) : null}
              </section>

              <section aria-labelledby="actions-retenir">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">Passer à l’action</p>
                <h2 id="actions-retenir" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue">
                  Les actions à retenir
                </h2>
                <ul className="mt-7 grid gap-3">
                  {video.actions.map((action) => (
                    <li key={action} className="flex gap-4 rounded-[1.1rem] bg-dema-sage/80 px-5 py-4 text-sm leading-relaxed text-brand-blue">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dema-forest text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="questions-frequentes">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">Questions fréquentes</p>
                <h2 id="questions-frequentes" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue">
                  Pour aller plus loin
                </h2>
                <div className="mt-7 space-y-3">
                  {video.faq.map((item) => (
                    <details key={item.question} className="demaa-accordion">
                      <summary className="cursor-pointer px-5 py-5 pr-12 font-semibold leading-snug text-brand-blue">
                        {item.question}
                      </summary>
                      <div className="demaa-accordion-content border-t border-dema-line px-5 py-5 text-sm leading-relaxed text-dema-muted">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
              <section className="rounded-[1.35rem] border border-dema-line bg-dema-paper p-5">
                <h2 className="text-base font-semibold text-brand-blue">Systèmes associés</h2>
                <ul className="mt-4 space-y-2">
                  {video.relatedSystems.map((system) => (
                    <li key={system.slug}>
                      <Link href={`/kit-operationnel/${system.slug}`} className="group flex items-start justify-between gap-3 rounded-[0.85rem] px-3 py-3 text-sm leading-snug text-dema-muted transition hover:bg-dema-sage hover:text-brand-blue">
                        <span>{system.anchor}</span>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-[1.35rem] border border-dema-line bg-dema-paper p-5">
                <h2 className="text-base font-semibold text-brand-blue">Au programme</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {video.topics.map((topic) => (
                    <span key={topic} className="rounded-full bg-dema-sage px-2.5 py-1 text-xs font-medium text-dema-forest">
                      {topic}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-relaxed text-dema-muted">
                  Mise à jour le {updatedDate}
                </p>
              </section>
            </aside>
          </div>

          {relatedVideo ? (
            <section className="mx-auto mt-16 max-w-5xl border-t border-dema-line pt-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">Fiche associée</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
                Continuer avec une notion complémentaire
              </h2>
              <Link href={`/academie/${relatedVideo.slug}`} className="group mt-6 grid overflow-hidden rounded-[1.4rem] border border-dema-line bg-dema-paper sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <AcademyVideoArtwork video={relatedVideo} className="rounded-none" />
                <div className="flex flex-col justify-center px-6 py-7 sm:px-8">
                  <p className="text-xs font-semibold text-dema-forest">{relatedVideo.category}</p>
                  <h3 className="mt-2 text-xl font-semibold leading-snug tracking-[-0.025em] text-brand-blue">
                    {video.relatedVideoAnchor}
                  </h3>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-dema-forest">
                    Lire la fiche
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </section>
          ) : null}

          <div className="mx-auto mt-12 max-w-5xl">
            <Link href="/academie" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-5 py-2.5 text-sm font-semibold text-brand-blue transition hover:text-dema-forest">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour à l’Académie
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
