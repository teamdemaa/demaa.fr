import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import AcademyLessonVisual from "@/components/AcademyLessonVisual";
import CopyableTutorialTable from "@/components/CopyableTutorialTable";
import Navbar from "@/components/Navbar";
import { getAcademyFundamentals } from "@/lib/academy-course-content";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";
import { getAllPublishedContent } from "@/lib/content-catalog";
import { getPublishedPracticeTutorials } from "@/lib/tutorial-catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAcademyPreviewCards().map(({ href }) => ({ slug: href.slice("/academie/".length) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getAcademyPreviewCards().find(({ href }) => href === `/academie/${slug}`);
  return {
    title: card ? `${card.title} | Tutoriels Demaa` : "Tutoriel introuvable | Demaa",
    description: card?.summary,
    robots: { index: false, follow: false },
  };
}

export default async function AcademyMethodPage({ params }: Props) {
  const { slug } = await params;
  const card = getAcademyPreviewCards().find(({ href }) => href === `/academie/${slug}`);
  if (!card) notFound();

  const course = getAcademyFundamentals().find(({ identity }) => identity.slug === slug);
  const practice = getPublishedPracticeTutorials().find((item) => item.slug === slug);
  const article = getAllPublishedContent().find((item) => item.slug === slug);
  if (!course && !practice && !article) notFound();
  const keyPoints = course?.recap.points ?? practice?.keyPoints ?? article?.keyPoints ?? [];

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" publicNavigationVariant="demaa" />
      <main className="min-h-screen min-w-0 bg-background pb-20 text-brand-blue">
        <article className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link href="/academie" className="inline-flex min-h-11 items-center gap-2 text-sm text-dema-muted transition hover:text-dema-forest">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux tutoriels
          </Link>

          <header className="mx-auto mt-8 max-w-5xl">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-dema-forest">Méthode · {card.category}</p>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl font-light leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">{card.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-dema-muted sm:text-lg">{card.summary}</p>
          </header>

          {card.image ? (
            <div className="relative mx-auto mt-10 aspect-[16/8] max-w-5xl overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-sage">
              <Image src={card.image} alt={card.imageAlt} fill sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
            </div>
          ) : null}

          <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="min-w-0 space-y-12">
              {course?.lessons.map((lesson, index) => (
                <section key={lesson.id} aria-labelledby={`academy-lesson-${lesson.id}`}>
                  <p className="text-xs font-medium uppercase tracking-[0.13em] text-dema-forest">{String(index + 1).padStart(2, "0")} · {lesson.eyebrow}</p>
                  <h2 id={`academy-lesson-${lesson.id}`} className="mt-3 font-serif text-2xl leading-tight sm:text-3xl">{lesson.title}</h2>
                  <p className="mt-5 text-base leading-8 text-dema-muted">{lesson.body}</p>
                  <div className="mt-7 overflow-hidden rounded-[1.25rem] border border-dema-line">
                    <AcademyLessonVisual lesson={lesson} eager={index === 0} />
                  </div>
                  <p className="mt-6 border-l-2 border-dema-forest/35 pl-4 text-sm leading-7 text-dema-forest">À retenir : {lesson.takeaway}</p>
                </section>
              ))}

              {practice ? (
                <section aria-labelledby="academy-method-structure">
                  <h2 id="academy-method-structure" className="font-serif text-2xl sm:text-3xl">La structure à reproduire</h2>
                  <p className="mt-4 mb-5 text-base leading-8 text-dema-muted">Commencez par ces champs, puis adaptez-les à votre activité.</p>
                  <CopyableTutorialTable fields={practice.fields} />
                </section>
              ) : null}
              {practice?.steps.map((step, index) => (
                <section key={step.title} aria-labelledby={`academy-step-${index + 1}`}>
                  <p className="text-xs font-medium uppercase tracking-[0.13em] text-dema-forest">{String(index + 1).padStart(2, "0")}</p>
                  <h2 id={`academy-step-${index + 1}`} className="mt-3 font-serif text-2xl sm:text-3xl">{step.title}</h2>
                  <div className="mt-5 space-y-4 text-base leading-8 text-dema-muted">{step.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                  {step.items ? <ul className="mt-5 space-y-3">{step.items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-dema-muted"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />{item}</li>)}</ul> : null}
                  {step.screenshot ? (
                    <figure className="mt-6 overflow-hidden rounded-[1.25rem] border border-dema-line">
                      <div className="relative aspect-[8/5] bg-dema-sage"><Image src={step.screenshot.src} alt={step.screenshot.alt} fill sizes="(min-width: 1024px) 750px, 100vw" className="object-cover object-top" /></div>
                      <figcaption className="p-4 text-xs text-dema-muted">{step.screenshot.caption}</figcaption>
                    </figure>
                  ) : null}
                </section>
              ))}

              {article?.article.map((section, index) => (
                <section key={section.heading} aria-labelledby={`academy-article-${index + 1}`}>
                  <p className="text-xs font-medium uppercase tracking-[0.13em] text-dema-forest">{String(index + 1).padStart(2, "0")}</p>
                  <h2 id={`academy-article-${index + 1}`} className="mt-3 font-serif text-2xl sm:text-3xl">{section.heading}</h2>
                  <div className="mt-5 space-y-4 text-base leading-8 text-dema-muted">{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                  {section.items ? <ul className="mt-5 space-y-3">{section.items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-dema-muted"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />{item}</li>)}</ul> : null}
                  {section.process ? <ol className="mt-5 list-inside list-decimal space-y-2 text-sm leading-7 text-dema-muted">{section.process.map((step) => <li key={step}>{step}</li>)}</ol> : null}
                </section>
              ))}

              {card.modelHref && card.modelTitle ? (
                <aside className="rounded-[1.25rem] border border-dema-line bg-dema-sage/45 p-6 sm:p-8" aria-labelledby="academy-model-title">
                  <p className="text-xs font-medium uppercase tracking-[0.13em] text-dema-forest">Pour passer à l’action</p>
                  <h2 id="academy-model-title" className="mt-3 font-serif text-2xl sm:text-3xl">{card.modelTitle}</h2>
                  <p className="mt-3 text-sm leading-7 text-dema-muted">Un modèle à adapter après avoir compris la méthode.</p>
                  <Link href={card.modelHref} className="demaa-secondary-button mt-6 inline-flex min-h-11 items-center gap-2 px-5">Voir le modèle <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                </aside>
              ) : null}

              {article?.sources.length ? (
                <section className="border-t border-dema-line pt-8" aria-labelledby="academy-sources-title">
                  <h2 id="academy-sources-title" className="text-sm font-semibold">Sources pour approfondir</h2>
                  <ul className="mt-4 space-y-3">{article.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm text-dema-muted underline underline-offset-4 hover:text-dema-forest">{source.label}<ExternalLink className="mt-1 h-3.5 w-3.5" aria-hidden="true" /></a></li>)}</ul>
                </section>
              ) : null}
            </div>

            <aside className="h-fit rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-medium">À retenir</h2>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-dema-muted">{keyPoints.map((point) => <li key={point} className="flex gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />{point}</li>)}</ul>
            </aside>
          </div>
        </article>
      </main>
    </>
  );
}
