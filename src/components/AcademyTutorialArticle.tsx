"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AcademyLessonVisual from "@/components/AcademyLessonVisual";
import type { AcademyContentDefinition } from "@/lib/academy-course-content";

type AcademyTutorialArticleProps = {
  content: AcademyContentDefinition;
  embedded?: boolean;
  onBack?: () => void;
};

export default function AcademyTutorialArticle({
  content,
  embedded = false,
  onBack,
}: AcademyTutorialArticleProps) {
  const ArticleContainer = embedded ? "div" : "main";

  return (
    <ArticleContainer className={embedded ? "min-h-[60vh] bg-[#FAFAFA]" : "min-h-[calc(100vh-72px)] bg-[#FAFAFA]"}>
      <article className="mx-auto max-w-3xl px-5 pb-20 pt-6 sm:px-7 sm:pt-10">
        <div className="mb-10">
          {embedded && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour aux tutoriels
            </button>
          ) : (
            <Link
              href="/academie"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour à Structurer
            </Link>
          )}
        </div>

        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
            Tutoriel · {content.identity.category}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-light leading-[1.06] tracking-[-0.035em] text-brand-blue sm:text-5xl">
            {content.identity.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-dema-muted">
            {content.identity.promise}
          </p>
          <p className="mt-4 text-sm text-dema-muted">
            {content.identity.durationMinutes} min de lecture
          </p>
        </header>

        <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-16">
          {content.lessons.map((lesson, lessonIndex) => (
            <section key={lesson.id} aria-labelledby={`tutorial-${lesson.id}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                {lesson.eyebrow}
              </p>
              <h2
                id={`tutorial-${lesson.id}`}
                className="mt-3 text-2xl font-medium leading-tight text-brand-blue sm:text-3xl"
              >
                {lesson.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-dema-muted sm:text-lg">
                {lesson.body}
              </p>
              <div className="mt-7 overflow-hidden rounded-[1rem]">
                <AcademyLessonVisual lesson={lesson} eager={lessonIndex === 0} />
              </div>
              <aside className="mt-6 border-l-2 border-dema-forest/35 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-forest">
                  À retenir
                </p>
                <p className="mt-1.5 font-medium leading-relaxed text-brand-blue">
                  {lesson.takeaway}
                </p>
              </aside>
            </section>
          ))}
        </div>

        <section className="mt-16 border-y border-dema-line py-8" aria-labelledby="tutorial-recap">
          <h2 id="tutorial-recap" className="text-2xl font-medium text-brand-blue sm:text-3xl">
            {content.recap.title}
          </h2>
          <ol className="mt-6 space-y-4">
            {content.recap.points.map((point, index) => (
              <li key={point} className="grid grid-cols-[1.75rem_1fr] gap-3">
                <span className="pt-0.5 text-xs font-semibold text-dema-forest">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7 text-brand-blue">{point}</p>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </ArticleContainer>
  );
}
