"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HorizontalScrollHintProps = {
  children: ReactNode;
  className: string;
  controlsClassName?: string;
};

export default function HorizontalScrollHint({
  children,
  className,
  controlsClassName = "absolute right-0 -top-11 z-10 flex items-center gap-1.5",
}: HorizontalScrollHintProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const node = scrollRef.current;
    if (!node) return;

    const { clientWidth, scrollLeft, scrollWidth } = node;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 4);
  };

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(node);

    window.addEventListener("resize", updateScrollState);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [children]);

  const scrollBy = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {canScrollLeft || canScrollRight ? (
        <div className={controlsClassName}>
          {canScrollLeft ? (
            <button
              type="button"
              onClick={() => scrollBy("left")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue/45 shadow-[0_4px_12px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/25 hover:text-dema-forest"
              aria-label="Faire défiler vers la gauche"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {canScrollRight ? (
            <button
              type="button"
              onClick={() => scrollBy("right")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue/45 shadow-[0_4px_12px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/25 hover:text-dema-forest"
              aria-label="Faire défiler vers la droite"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div ref={scrollRef} onScroll={updateScrollState} className={className}>
        {children}
      </div>
    </div>
  );
}
