"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function GuideSlidesDialog({ title, slides, onClose, downloadHref }: {
  title: string; slides: readonly string[]; onClose: () => void; downloadHref?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? []);
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "ArrowRight") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, slides.length - 1)); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
      if (event.key === "Tab") {
        const items = focusable(); const first = items[0]; const last = items.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", keydown);
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keydown); previousFocus?.focus(); };
  }, [onClose, slides.length]);
  if (!slides.length) return null;
  const previous = () => setActiveIndex((index) => Math.max(0, index - 1));
  const next = () => setActiveIndex((index) => Math.min(slides.length - 1, index + 1));
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/55 p-3" onMouseDown={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.22)]" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between gap-3 border-b border-dema-line px-4 py-3 sm:px-6">
          <p className="min-w-0 truncate text-sm font-medium text-brand-blue">{title} <span className="ml-2 text-dema-muted">{activeIndex + 1} / {slides.length}</span></p>
          <div className="flex gap-2">
            {downloadHref ? <a href={downloadHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-dema-line px-3 text-sm font-medium"><Download className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Télécharger le PDF</span></a> : null}
            <button type="button" onClick={onClose} aria-label="Fermer" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line"><X className="h-4 w-4" /></button>
          </div>
        </header>
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#f7f6f1] p-2">
          <Image src={slides[activeIndex]} alt={`${title} — diapositive ${activeIndex + 1}`} width={1560} height={878} className="max-h-[76vh] w-auto max-w-full object-contain" priority />
          <button type="button" aria-label="Diapositive précédente" disabled={activeIndex === 0} onClick={previous} className="absolute left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 disabled:opacity-35"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Diapositive suivante" disabled={activeIndex === slides.length - 1} onClick={next} className="absolute right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 disabled:opacity-35"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
}
