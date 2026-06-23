"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import type { CourseEntry } from "@/lib/course-content";

type CourseSlidesDialogProps = {
  course: CourseEntry;
  onClose: () => void;
  detailHref?: string;
};

export default function CourseSlidesDialog({
  course,
  onClose,
  detailHref,
}: CourseSlidesDialogProps) {
  const slides = course.slides?.length ? course.slides : course.image ? [course.image] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isProgrammaticScrollRef = useRef(false);
  const scrollUnlockTimeoutRef = useRef<number | null>(null);

  function clearProgrammaticScrollLock() {
    if (scrollUnlockTimeoutRef.current !== null) {
      window.clearTimeout(scrollUnlockTimeoutRef.current);
    }

    scrollUnlockTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      scrollUnlockTimeoutRef.current = null;
    }, 420);
  }

  function goToSlide(index: number) {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    const nextSlide = slideRefs.current[nextIndex];

    if (!nextSlide) {
      setActiveIndex(nextIndex);
      return;
    }

    isProgrammaticScrollRef.current = true;
    setActiveIndex(nextIndex);
    nextSlide.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    clearProgrammaticScrollLock();
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (!slides.length) {
        return;
      }

      if (event.key === "ArrowRight") {
        goToSlide(activeIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        goToSlide(activeIndex - 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose, slides.length]);

  useEffect(() => {
    return () => {
      if (scrollUnlockTimeoutRef.current !== null) {
        window.clearTimeout(scrollUnlockTimeoutRef.current);
      }
    };
  }, []);

  if (!slides.length) {
    return null;
  }

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/55 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.22)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={course.title}
      >
        <div className="flex items-center justify-end gap-2 border-b border-dema-line px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            {detailHref ? (
              <Link
                href={detailHref}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-cream text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-sm sm:font-medium"
                aria-label="Ouvrir la page"
              >
                <span className="hidden sm:inline">Ouvrir la page</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden bg-[#f7f6f1] p-2 sm:p-3">
          <div
            ref={scrollerRef}
            className="flex h-full snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden scroll-smooth px-1 touch-pan-x sm:gap-4 sm:px-3 lg:px-6"
            onScroll={(event) => {
              const target = event.currentTarget;
              const scrollerCenter = target.scrollLeft + target.clientWidth / 2;
              let nextIndex = activeIndex;
              let closestDistance = Number.POSITIVE_INFINITY;

              slideRefs.current.forEach((slide, index) => {
                if (!slide) {
                  return;
                }

                const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
                const distance = Math.abs(slideCenter - scrollerCenter);

                if (distance < closestDistance) {
                  closestDistance = distance;
                  nextIndex = index;
                }
              });

              if (isProgrammaticScrollRef.current && nextIndex !== activeIndex) {
                return;
              }

              if (nextIndex === activeIndex && isProgrammaticScrollRef.current) {
                clearProgrammaticScrollLock();
              }

              if (nextIndex !== activeIndex) {
                setActiveIndex(nextIndex);
              }
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                className="flex min-w-[100%] shrink-0 snap-center items-center justify-center py-1 sm:min-w-[92%] lg:min-w-[80%] xl:min-w-[78%]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.25rem] border border-dema-line bg-white shadow-[0_10px_28px_rgba(23,35,29,0.06)]">
                  <Image
                    src={slide}
                    alt={`${course.title} - slide ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 78vw"
                    className="object-contain bg-white"
                    priority={index === activeIndex}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6">
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              disabled={!canGoPrevious}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-dema-line/90 bg-white/92 text-brand-blue shadow-[0_8px_18px_rgba(23,35,29,0.08)] backdrop-blur transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Slide précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              disabled={!canGoNext}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-dema-line/90 bg-white/92 text-brand-blue shadow-[0_8px_18px_rgba(23,35,29,0.08)] backdrop-blur transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Slide suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-wrap gap-1.5 rounded-full border border-white/60 bg-white/72 px-2.5 py-1.5 shadow-[0_6px_14px_rgba(23,35,29,0.06)] backdrop-blur">
            {slides.map((slide, index) => (
              <button
                key={slide}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition ${
                  index === activeIndex ? "bg-dema-forest/85" : "bg-dema-line/75 hover:bg-dema-muted"
                }`}
                aria-label={`Aller à la slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
