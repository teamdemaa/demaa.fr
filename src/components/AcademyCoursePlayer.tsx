"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import AcademyLessonVisual from "@/components/AcademyLessonVisual";
import {
  getAcademyActionHref,
  type AcademyContentDefinition,
  type AcademyQuizQuestion,
} from "@/lib/academy-course-content";

type AcademyCoursePlayerProps = {
  content: AcademyContentDefinition;
};

type PlayerScreen =
  | { type: "intro" }
  | { type: "lesson"; lessonIndex: number }
  | { type: "recap" }
  | { type: "quiz"; questionIndex: number }
  | { type: "finish" };

function QuizScreen({
  question,
  questionIndex,
  selectedChoiceId,
  onSelect,
}: {
  question: AcademyQuizQuestion;
  questionIndex: number;
  selectedChoiceId?: string;
  onSelect: (choiceId: string) => void;
}) {
  const hasAnswered = Boolean(selectedChoiceId);
  const isCorrect = selectedChoiceId === question.correctChoiceId;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
        Question {questionIndex + 1} sur 3
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-brand-blue sm:text-4xl">
        {question.question}
      </h1>

      <div className="mt-8 grid gap-3">
        {question.choices.map((choice) => {
          const isSelected = choice.id === selectedChoiceId;
          const isAnswer = choice.id === question.correctChoiceId;
          const answerState = hasAnswered
            ? isAnswer
              ? "border-dema-forest/25 bg-dema-positive"
              : isSelected
                ? "border-[#b66a56]/25 bg-[#fbf2ef]"
                : "border-dema-line bg-white opacity-65"
            : "border-dema-line bg-white hover:border-dema-forest/25 hover:bg-dema-sage/35";

          return (
            <button
              key={choice.id}
              type="button"
              disabled={hasAnswered}
              onClick={() => onSelect(choice.id)}
              className={`flex min-h-16 items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition ${answerState}`}
            >
              <span className="font-medium leading-relaxed text-brand-blue">{choice.label}</span>
              {hasAnswered && isAnswer ? (
                <Check className="h-5 w-5 shrink-0 text-dema-forest" aria-hidden="true" />
              ) : null}
              {hasAnswered && isSelected && !isAnswer ? (
                <X className="h-5 w-5 shrink-0 text-[#a45745]" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      {hasAnswered ? (
        <div
          className={`mt-5 border-l-2 py-1 pl-4 ${
            isCorrect ? "border-dema-forest" : "border-dema-line"
          }`}
          role="status"
        >
          <p className="font-semibold text-brand-blue">{isCorrect ? "Oui, c’est ça." : "Pas tout à fait."}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-dema-muted">{question.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function AcademyCoursePlayer({ content }: AcademyCoursePlayerProps) {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const screens = useMemo<PlayerScreen[]>(
    () => [
      ...(content.kind === "course" ? [{ type: "intro" as const }] : []),
      ...content.lessons.map((_, lessonIndex) => ({ type: "lesson" as const, lessonIndex })),
      { type: "recap" as const },
      ...content.quiz.questions.map((_, questionIndex) => ({ type: "quiz" as const, questionIndex })),
      { type: "finish" as const },
    ],
    [content.kind, content.lessons, content.quiz.questions],
  );

  const activeScreen = screens[activeScreenIndex];
  const isFirstScreen = activeScreenIndex === 0;
  const isLastScreen = activeScreenIndex === screens.length - 1;
  const progress = screens.length > 1 ? (activeScreenIndex / (screens.length - 1)) * 100 : 100;
  const screenLabel = (() => {
    if (activeScreen.type === "intro") return "Présentation";
    if (activeScreen.type === "lesson") {
      if (content.kind === "case-study") {
        return activeScreen.lessonIndex === 0
          ? "Situation"
          : `Étape ${activeScreen.lessonIndex} / ${content.lessons.length - 1}`;
      }
      return `Notion ${activeScreen.lessonIndex + 1} / ${content.lessons.length}`;
    }
    if (activeScreen.type === "recap") return "Récapitulatif";
    if (activeScreen.type === "quiz") {
      return `Question ${activeScreen.questionIndex + 1} / ${content.quiz.questions.length}`;
    }
    return "Terminé";
  })();

  function goToScreen(index: number) {
    setActiveScreenIndex(Math.max(0, Math.min(index, screens.length - 1)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-dema-cream">
      <div className="border-b border-dema-line/70 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href="/academie"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Retour à l’Académie"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <p className="truncate text-sm font-semibold text-brand-blue">{content.identity.shortTitle}</p>
              <p className="shrink-0 text-xs text-dema-muted">{screenLabel}</p>
            </div>
            <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-dema-sage" aria-hidden="true">
              <div
                className="h-full rounded-full bg-dema-forest transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-150px)] max-w-3xl flex-col px-5 py-10 sm:py-14">
        <div className="flex-1">
          {activeScreen.type === "intro" ? (
            <section className="w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                Cours fondamental
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-[1.08] text-brand-blue sm:text-5xl">
                {content.identity.shortTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-dema-muted sm:text-lg">
                {content.identity.promise}
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-brand-blue">
                <span>{content.identity.durationMinutes} min</span>
                <span aria-hidden="true" className="text-dema-line">•</span>
                <span>{content.lessons.length} notions</span>
                <span aria-hidden="true" className="text-dema-line">•</span>
                <span>{content.quiz.questions.length} questions</span>
              </div>

              <div className="mt-9 rounded-[1.5rem] bg-[#E7EEE8] px-5 py-6 sm:px-7 sm:py-7">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-forest">
                  Contenu du cours
                </p>
                <div className="mt-4 divide-y divide-dema-forest/10">
                  {(content.outline ?? content.lessons.slice(0, 3).map((lesson) => ({
                    title: lesson.title,
                    description: lesson.takeaway,
                  }))).map((item, index) => (
                    <div key={item.title} className="grid grid-cols-[1.75rem_1fr] gap-3 py-4 first:pt-1 last:pb-1">
                      <span className="pt-0.5 text-sm font-semibold text-dema-forest">
                        {index + 1}
                      </span>
                      <div>
                        <h2 className="font-semibold text-brand-blue">{item.title}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-dema-muted">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activeScreen.type === "lesson" ? (
            <section className="w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                {content.lessons[activeScreen.lessonIndex].eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-[1.12] text-brand-blue sm:text-4xl">
                {content.lessons[activeScreen.lessonIndex].title}
              </h1>
              <p className="mt-5 text-base leading-8 text-dema-muted sm:text-lg">
                {content.lessons[activeScreen.lessonIndex].body}
              </p>

              {content.kind === "course" ? (
                <div className="mt-8 rounded-[1.5rem] bg-[#E7EEE8] px-5 py-6 sm:px-7 sm:py-7">
                  <AcademyLessonVisual lesson={content.lessons[activeScreen.lessonIndex]} />
                </div>
              ) : null}

              <div
                className={
                  content.kind === "case-study"
                    ? "mt-8 rounded-[1.5rem] bg-[#E7EEE8] px-5 py-5 sm:px-7 sm:py-6"
                    : "mt-6 border-t border-dema-line/70 pt-5"
                }
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-forest">
                  {content.kind === "case-study" ? "L’idée à retenir" : "À retenir"}
                </p>
                <p className="mt-1.5 font-medium leading-relaxed text-brand-blue">
                  {content.lessons[activeScreen.lessonIndex].takeaway}
                </p>
              </div>
            </section>
          ) : null}

          {activeScreen.type === "recap" ? (
            <section className="w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">Récapitulatif</p>
              <h1 className="mt-3 text-3xl font-semibold text-brand-blue sm:text-4xl">{content.recap.title}</h1>
              <div className="mt-8 divide-y divide-dema-line/70 border-y border-dema-line/70">
                {content.recap.points.map((point, index) => (
                  <div key={point} className="grid gap-2 py-5 sm:grid-cols-[2rem_1fr] sm:gap-4">
                    <span className="text-xs font-semibold text-dema-forest">{String(index + 1).padStart(2, "0")}</span>
                    <p className="text-lg font-medium leading-relaxed text-brand-blue">{point}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeScreen.type === "quiz" ? (
            <QuizScreen
              question={content.quiz.questions[activeScreen.questionIndex]}
              questionIndex={activeScreen.questionIndex}
              selectedChoiceId={answers[content.quiz.questions[activeScreen.questionIndex].id]}
              onSelect={(choiceId) =>
                setAnswers((current) => ({
                  ...current,
                  [content.quiz.questions[activeScreen.questionIndex].id]: choiceId,
                }))
              }
            />
          ) : null}

          {activeScreen.type === "finish" ? (
            <section className="mx-auto w-full max-w-3xl text-center">
              <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">Cours terminé</p>
              <h1 className="mt-3 text-3xl font-semibold text-brand-blue sm:text-4xl">Vous avez l’essentiel.</h1>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-dema-muted">
                Vous pouvez revenir à l’Académie ou passer directement à l’action.
              </p>

              {content.action ? (
                <div className="mx-auto mt-8 max-w-xl border-y border-dema-line py-6 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-forest">Pour passer à l’action</p>
                  <h2 className="mt-2 text-2xl font-semibold text-brand-blue">{content.action.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">{content.action.description}</p>
                  <Link
                    href={getAcademyActionHref(content.action)}
                    className="demaa-primary-button mt-5 min-h-11 w-full sm:w-auto"
                  >
                    {content.action.ctaLabel}
                  </Link>
                </div>
              ) : null}

              <Link
                href="/academie"
                className={`${content.action ? "demaa-secondary-button" : "demaa-primary-button"} mt-5 min-h-11`}
              >
                Retour à l’Académie
              </Link>
            </section>
          ) : null}
        </div>

        {!isLastScreen ? (
          <nav className="mt-10 flex items-center justify-between gap-3 border-t border-dema-line/70 pt-5" aria-label="Navigation du cours">
            <button
              type="button"
              disabled={isFirstScreen}
              onClick={() => goToScreen(activeScreenIndex - 1)}
              className="demaa-secondary-button min-h-11 gap-2 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Précédent</span>
            </button>
            <button
              type="button"
              onClick={() => goToScreen(activeScreenIndex + 1)}
              className="demaa-primary-button min-h-11 gap-2"
            >
              {activeScreen.type === "intro"
                ? "Commencer le cours"
                : activeScreen.type === "quiz"
                  ? "Question suivante"
                  : "Suivant"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        ) : null}
      </div>
    </main>
  );
}
