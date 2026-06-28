"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Minus, Plus, RotateCcw, X } from "lucide-react";
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
  const [zoomLevels, setZoomLevels] = useState<Record<number, number>>({});
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isProgrammaticScrollRef = useRef(false);
  const scrollUnlockTimeoutRef = useRef<number | null>(null);
  const activeZoom = zoomLevels[activeIndex] ?? 1;

  function clearProgrammaticScrollLock() {
    if (scrollUnlockTimeoutRef.current !== null) {
      window.clearTimeout(scrollUnlockTimeoutRef.current);
    }

    scrollUnlockTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      scrollUnlockTimeoutRef.current = null;
    }, 420);
  }

  const goToSlide = useCallback((index: number) => {
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
  }, [slides.length]);

  const setZoomForSlide = useCallback((index: number, nextZoom: number) => {
    const boundedZoom = Math.max(1, Math.min(nextZoom, 3));
    setZoomLevels((current) => {
      if (boundedZoom === 1) {
        const updated = { ...current };
        delete updated[index];
        return updated;
      }

      return {
        ...current,
        [index]: boundedZoom,
      };
    });
  }, []);

  const zoomIn = useCallback(() => {
    setZoomForSlide(activeIndex, activeZoom + 0.25);
  }, [activeIndex, activeZoom, setZoomForSlide]);

  const zoomOut = useCallback(() => {
    setZoomForSlide(activeIndex, activeZoom - 0.25);
  }, [activeIndex, activeZoom, setZoomForSlide]);

  const resetZoom = useCallback(() => {
    setZoomForSlide(activeIndex, 1);
  }, [activeIndex, setZoomForSlide]);

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

      if ((event.key === "+" || event.key === "=") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        zoomIn();
      }

      if (event.key === "-" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        zoomOut();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, goToSlide, onClose, slides.length, zoomIn, zoomOut]);

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
        <div className="flex items-center justify-between gap-3 border-b border-dema-line px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={zoomOut}
              disabled={activeZoom <= 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Réduire le zoom"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={activeZoom >= 3}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Augmenter le zoom"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              disabled={activeZoom === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Réinitialiser le zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <span className="hidden text-sm font-medium text-dema-muted sm:inline">
              {Math.round(activeZoom * 100)}%
            </span>
          </div>
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

        <div className="relative flex-1 overflow-hidden bg-[#f7f6f1] p-1 sm:p-2">
          <div
            ref={scrollerRef}
            className="flex h-full snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden scroll-smooth px-0 touch-pan-x sm:gap-3 sm:px-1 lg:px-3"
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
                className="flex min-w-[100%] shrink-0 snap-center items-center justify-center py-0.5"
              >
                <div className="flex aspect-[16/9] w-full items-center justify-center overflow-auto rounded-[1rem] border border-dema-line/80 bg-white shadow-[0_8px_22px_rgba(23,35,29,0.045)]">
                  <div
                    className="relative shrink-0"
                    style={{
                      width: `${(zoomLevels[index] ?? 1) * 100}%`,
                      aspectRatio: "16 / 9",
                    }}
                    onDoubleClick={() =>
                      setZoomForSlide(index, (zoomLevels[index] ?? 1) > 1 ? 1 : 2)
                    }
                    onWheel={(event) => {
                      if (!(event.ctrlKey || event.metaKey)) {
                        return;
                      }

                      event.preventDefault();
                      const nextZoom = (zoomLevels[index] ?? 1) + (event.deltaY < 0 ? 0.2 : -0.2);
                      setZoomForSlide(index, nextZoom);
                    }}
                  >
                    <Image
                      src={slide}
                      alt={`${course.title} - slide ${index + 1}`}
                      fill
                      sizes="100vw"
                      className="object-contain bg-white"
                      priority={index === activeIndex}
                    />
                  </div>
                </div>
              </div>
            ))}
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
