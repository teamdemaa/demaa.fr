"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import AcademyLessonVisual from "@/components/AcademyLessonVisual";
import {
  getAcademyActionHref,
  getAcademyActionLabel,
  type AcademyContentDefinition,
  type AcademyQuizQuestion,
} from "@/lib/academy-course-content";
import {
  getAcademyCourseProgressKey,
  useAcademyCourseProgress,
  writeAcademyCourseProgress,
} from "@/lib/academy-course-progress.client";
import { getAcademyUiCopy } from "@/lib/academy-ui-copy";

type AcademyCoursePlayerProps = {
  content: AcademyContentDefinition;
  embedded?: boolean;
  localeCode?: "fr" | "en";
  onBack?: () => void;
};

type PlayerScreen =
  | { type: "intro" }
  | { type: "lesson"; lessonIndex: number }
  | { type: "recap" }
  | { type: "quiz"; questionIndex: number }
  | { type: "finish" };

function QuizScreen({
  localeCode,
  question,
  questionIndex,
  selectedChoiceId,
  onSelect,
}: {
  localeCode: "fr" | "en";
  question: AcademyQuizQuestion;
  questionIndex: number;
  selectedChoiceId?: string;
  onSelect: (choiceId: string) => void;
}) {
  const copy = getAcademyUiCopy(localeCode).player;
  const hasAnswered = Boolean(selectedChoiceId);
  const isCorrect = selectedChoiceId === question.correctChoiceId;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
        {copy.questionProgress(questionIndex + 1, 3)}
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-blue sm:text-4xl">
        {question.question}
      </h2>

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
          <p className="font-semibold text-brand-blue">
            {isCorrect ? copy.correct : copy.incorrect}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-dema-muted">{question.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function AcademyCoursePlayer({
  content,
  embedded = false,
  localeCode = "fr",
  onBack,
}: AcademyCoursePlayerProps) {
  const copy = getAcademyUiCopy(localeCode).player;
  const progressKey = getAcademyCourseProgressKey({
    contentVersion: content.editorial?.contentVersion ?? content.version,
    courseId: content.editorial?.courseId ?? content.identity.slug,
    localeCode,
  });
  const storedProgress = useAcademyCourseProgress(progressKey);
  const [sessionProgress, setSessionProgress] = useState<{
    answers: Record<string, string>;
    screenIndex: number;
  } | null>(null);
  const courseProgress = sessionProgress ?? storedProgress ?? {
    answers: {},
    screenIndex: 0,
  };
  const answers = courseProgress.answers;

  const screens = useMemo<PlayerScreen[]>(
    () => [
      ...(content.kind === "course" ? [{ type: "intro" as const }] : []),
      ...content.lessons.map((_, lessonIndex) => ({ type: "lesson" as const, lessonIndex })),
      { type: "recap" as const },
      ...(content.kind === "course"
        ? content.quiz.questions.map((_, questionIndex) => ({ type: "quiz" as const, questionIndex }))
        : []),
      { type: "finish" as const },
    ],
    [content.kind, content.lessons, content.quiz.questions],
  );

  const activeScreenIndex = Math.min(courseProgress.screenIndex, screens.length - 1);
  const activeScreen = screens[activeScreenIndex];
  const isFirstScreen = activeScreenIndex === 0;
  const isLastScreen = activeScreenIndex === screens.length - 1;
  const progress = screens.length > 1 ? (activeScreenIndex / (screens.length - 1)) * 100 : 100;
  const screenLabel = (() => {
    if (activeScreen.type === "intro") return null;
    if (activeScreen.type === "lesson") {
      if (content.kind === "case-study") {
        return activeScreen.lessonIndex === 0
          ? copy.situation
          : copy.stepProgress(activeScreen.lessonIndex, content.lessons.length - 1);
      }
      return copy.lessonProgress(activeScreen.lessonIndex + 1, content.lessons.length);
    }
    if (activeScreen.type === "recap") return copy.recap;
    if (activeScreen.type === "quiz") {
      return copy.questionStep(activeScreen.questionIndex + 1, content.quiz.questions.length);
    }
    return copy.complete;
  })();

  function goToScreen(index: number) {
    const nextProgress = {
      answers,
      screenIndex: Math.max(0, Math.min(index, screens.length - 1)),
    };
    setSessionProgress(nextProgress);
    writeAcademyCourseProgress(progressKey, nextProgress);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectAnswer(questionId: string, choiceId: string) {
    const nextProgress = {
      answers: { ...answers, [questionId]: choiceId },
      screenIndex: activeScreenIndex,
    };
    setSessionProgress(nextProgress);
    writeAcademyCourseProgress(progressKey, nextProgress);
  }

  const CourseContainer = embedded ? "div" : "main";

  return (
    <CourseContainer className={embedded ? "min-h-[60vh] bg-dema-cream" : "min-h-[calc(100vh-72px)] bg-dema-cream"}>
      <div className="border-b border-dema-line/70 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          {embedded && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
              aria-label={copy.back}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <Link
              href={localeCode === "en" ? "/en?view=academy" : "/academie"}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
              aria-label={copy.back}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <h1 className="truncate text-base font-medium text-brand-blue">{content.identity.shortTitle}</h1>
              {screenLabel ? (
                <p className="shrink-0 text-xs text-dema-muted">{screenLabel}</p>
              ) : null}
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

      <div className={`mx-auto flex min-h-[calc(100dvh-150px)] max-w-3xl flex-col px-5 ${activeScreen.type === "intro" ? "py-4 sm:py-6" : "py-10 sm:py-14"}`}>
        <div className={activeScreen.type === "intro" ? "" : "flex-1"}>
          {activeScreen.type === "intro" ? (
            <section className="w-full">
              <p className="max-w-2xl text-sm leading-6 text-dema-muted sm:text-base sm:leading-7">
                {content.identity.promise}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-brand-blue sm:text-sm">
                <span>{content.identity.durationMinutes} min</span>
                <span aria-hidden="true" className="text-dema-line">•</span>
                <span>{copy.knowledgeQuiz}</span>
              </div>

              <div className="mt-4 rounded-[1.25rem] bg-[#E7EEE8] px-4 py-4 sm:px-6 sm:py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-dema-forest sm:text-xs">
                  {copy.courseContent}
                </p>
                <div className="mt-2 divide-y divide-dema-forest/10">
                  {(content.outline ?? content.lessons.slice(0, 3).map((lesson) => ({
                    title: lesson.title,
                    description: lesson.takeaway,
                  }))).map((item, index) => (
                    <div key={item.title} className="grid grid-cols-[1.5rem_1fr] gap-2.5 py-2.5 first:pt-1 last:pb-1">
                      <span className="pt-0.5 text-xs font-semibold text-dema-forest sm:text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold text-brand-blue sm:text-base">{item.title}</h2>
                        <p className="mt-0.5 text-xs leading-5 text-dema-muted sm:text-sm sm:leading-relaxed">{item.description}</p>
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
              <h2 className="mt-3 text-3xl font-semibold leading-[1.12] text-brand-blue sm:text-4xl">
                {content.lessons[activeScreen.lessonIndex].title}
              </h2>
              <p className="mt-5 text-base leading-8 text-dema-muted sm:text-lg">
                {content.lessons[activeScreen.lessonIndex].body}
              </p>

              {content.kind === "course" ? (
                <div className="mt-8 rounded-[1.5rem] bg-[#E7EEE8] px-5 py-6 sm:px-7 sm:py-7">
                  <AcademyLessonVisual
                    lesson={content.lessons[activeScreen.lessonIndex]}
                    localeCode={localeCode}
                  />
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
                  {content.kind === "case-study" ? copy.keyIdea : copy.keyTakeaway}
                </p>
                <p className="mt-1.5 font-medium leading-relaxed text-brand-blue">
                  {content.lessons[activeScreen.lessonIndex].takeaway}
                </p>
              </div>
            </section>
          ) : null}

          {activeScreen.type === "recap" ? (
            <section className="w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                {copy.recap}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-brand-blue sm:text-4xl">{content.recap.title}</h2>
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
              localeCode={localeCode}
              selectedChoiceId={answers[content.quiz.questions[activeScreen.questionIndex].id]}
              onSelect={(choiceId) => selectAnswer(
                content.quiz.questions[activeScreen.questionIndex].id,
                choiceId,
              )}
            />
          ) : null}

          {activeScreen.type === "finish" ? (
            <section className="mx-auto w-full max-w-3xl text-center">
              <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                {copy.courseComplete}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-brand-blue sm:text-4xl">
                {copy.essentials}
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-dema-muted">
                {copy.finishDescription}
              </p>

              {content.action ? (
                <div className="mx-auto mt-8 max-w-xl border-y border-dema-line py-6 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-forest">
                    {copy.practice}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-brand-blue">{content.action.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">{content.action.description}</p>
                  <Link
                    href={getAcademyActionHref(content.action)}
                    className="demaa-primary-button mt-5 min-h-11 w-full sm:w-auto"
                  >
                    {localeCode === "en"
                      ? content.action.ctaLabel
                      : getAcademyActionLabel(content.action)}
                  </Link>
                </div>
              ) : null}

              {embedded && onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className={`${content.action ? "demaa-secondary-button" : "demaa-primary-button"} mt-5 min-h-11`}
                >
                  {copy.back}
                </button>
              ) : (
                <Link
                  href={localeCode === "en" ? "/en?view=academy" : "/academie"}
                  className={`${content.action ? "demaa-secondary-button" : "demaa-primary-button"} mt-5 min-h-11`}
                >
                  {copy.back}
                </Link>
              )}
            </section>
          ) : null}
        </div>

        {!isLastScreen ? (
          <nav className={`${activeScreen.type === "intro" ? "mt-4 pt-4" : "mt-10 pt-5"} flex items-center justify-between gap-3 border-t border-dema-line/70`} aria-label={copy.navigation}>
            <button
              type="button"
              disabled={isFirstScreen}
              onClick={() => goToScreen(activeScreenIndex - 1)}
              className="demaa-secondary-button min-h-11 gap-2 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{copy.previous}</span>
            </button>
            <button
              type="button"
              onClick={() => goToScreen(activeScreenIndex + 1)}
              className="demaa-primary-button min-h-11 gap-2"
            >
              {activeScreen.type === "intro"
                ? copy.startCourse
                : activeScreen.type === "quiz"
                  ? copy.nextQuestion
                  : copy.next}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        ) : null}
      </div>
    </CourseContainer>
  );
}
