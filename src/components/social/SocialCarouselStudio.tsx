"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download, FileText, Images, Palette, Presentation } from "lucide-react";
import { toPng } from "html-to-image";
import {
  buildSocialCarousel,
  type SocialCarouselSlide,
  type SocialProcess,
  type SocialStudioSector,
  type SocialTool,
} from "@/lib/social-carousels";

type SocialCarouselStudioProps = {
  sectors: SocialStudioSector[];
  initialSlug?: string;
};

const PILLARS = [
  "Stratégie",
  "Marketing & Vente",
  "Opérations",
  "Finance & administration",
  "Équipe",
];

const SLIDE_SIZE = 1080;
const PREVIEW_SCALE = 0.25;

export default function SocialCarouselStudio({
  sectors,
  initialSlug = "cabinet-comptable",
}: SocialCarouselStudioProps) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [copiedCaption, setCopiedCaption] = useState<"meta" | "linkedin" | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const selectedSector = sectors.find((sector) => sector.slug === selectedSlug) ?? sectors[0];

  if (!selectedSector) {
    return (
      <div className="min-h-screen bg-dema-cream px-4 py-10 text-brand-blue md:px-8">
        <div className="mx-auto max-w-4xl rounded-lg border border-dema-line bg-dema-paper p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-dema-forest">
            Studio contenu
          </p>
          <h1 className="mt-3 text-3xl font-light tracking-tight">
            Aucun secteur disponible
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Ajoutez au moins un système opérationnel pour générer un carrousel.
          </p>
        </div>
      </div>
    );
  }

  const carousel = buildSocialCarousel(selectedSector);

  async function exportSlide(index: number) {
    const node = slideRefs.current[index];

    if (!node) return;

    await document.fonts.ready;
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 1,
      canvasWidth: SLIDE_SIZE,
      canvasHeight: SLIDE_SIZE,
      width: SLIDE_SIZE,
      height: SLIDE_SIZE,
      backgroundColor: "#ffffff",
    });

    downloadDataUrl(dataUrl, `${selectedSector.slug}-${String(index + 1).padStart(2, "0")}.png`);
  }

  async function exportAllPng() {
    setIsExporting(true);

    try {
      for (let index = 0; index < carousel.slides.length; index += 1) {
        await exportSlide(index);
      }
    } finally {
      setIsExporting(false);
    }
  }

  async function exportLinkedinPdf() {
    setIsExporting(true);

    try {
      await document.fonts.ready;
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [SLIDE_SIZE, SLIDE_SIZE],
        compress: true,
      });

      for (let index = 0; index < carousel.slides.length; index += 1) {
        const node = slideRefs.current[index];

        if (!node) continue;
        if (index > 0) pdf.addPage([SLIDE_SIZE, SLIDE_SIZE], "portrait");

        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 1,
          canvasWidth: SLIDE_SIZE,
          canvasHeight: SLIDE_SIZE,
          width: SLIDE_SIZE,
          height: SLIDE_SIZE,
          backgroundColor: "#ffffff",
        });

        pdf.addImage(dataUrl, "PNG", 0, 0, SLIDE_SIZE, SLIDE_SIZE);
      }

      pdf.save(`${selectedSector.slug}-linkedin.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  async function copyCaption(type: "meta" | "linkedin") {
    const caption = type === "meta" ? carousel.metaCaption : carousel.linkedinCaption;

    await navigator.clipboard.writeText(caption);
    setCopiedCaption(type);
    window.setTimeout(() => setCopiedCaption(null), 1600);
  }

  function exportCanvaBrief() {
    downloadTextFile(carousel.canvaBrief, `${selectedSector.slug}-brief-canva.txt`);
  }

  async function exportCanvaPptx() {
    setIsExporting(true);

    try {
      const response = await fetch("/api/social-studio/pptx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carousel),
      });

      if (!response.ok) {
        throw new Error("Impossible de générer le PPTX.");
      }

      const blob = await response.blob();
      downloadBlob(blob, `${selectedSector.slug}-canva-editable.pptx`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-dema-cream px-4 py-10 text-brand-blue md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border-b border-dema-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              Studio contenu
            </p>
            <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">
              Générateur de carrousels Demaa
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.target.value)}
              className="h-11 min-w-64 rounded-full border border-dema-line bg-dema-paper px-4 text-sm font-medium outline-none transition focus:border-dema-forest/35"
            >
              {sectors.map((sector) => (
                <option key={sector.slug} value={sector.slug}>
                  {sector.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={exportAllPng}
              disabled={isExporting}
              className="demaa-primary-button h-11 gap-2 disabled:cursor-wait disabled:opacity-60"
            >
              <Images className="h-4 w-4" />
              PNG
            </button>
            <button
              type="button"
              onClick={exportLinkedinPdf}
              disabled={isExporting}
              className="demaa-secondary-button h-11 gap-2 disabled:cursor-wait disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              PDF LinkedIn
            </button>
            <button
              type="button"
              onClick={exportCanvaPptx}
              disabled={isExporting}
              className="demaa-secondary-button h-11 gap-2 disabled:cursor-wait disabled:opacity-60"
            >
              <Presentation className="h-4 w-4" />
              Canva PPTX
            </button>
            <button
              type="button"
              onClick={exportCanvaBrief}
              className="demaa-secondary-button h-11 gap-2"
            >
              <Palette className="h-4 w-4" />
              Brief Canva
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {carousel.slides.map((slide, index) => (
              <article
                key={slide.id}
                className="w-[270px] justify-self-center overflow-hidden rounded-lg border border-dema-line bg-dema-paper"
              >
                <div
                  data-slide-preview={index + 1}
                  className="relative mx-auto overflow-hidden bg-white"
                  style={{
                    width: SLIDE_SIZE * PREVIEW_SCALE,
                    height: SLIDE_SIZE * PREVIEW_SCALE,
                  }}
                >
                  <div
                    style={{
                      width: SLIDE_SIZE,
                      height: SLIDE_SIZE,
                      transform: `scale(${PREVIEW_SCALE})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <div
                      data-slide-export-node={index + 1}
                      ref={(node) => {
                        slideRefs.current[index] = node;
                      }}
                      style={{
                        width: SLIDE_SIZE,
                        height: SLIDE_SIZE,
                      }}
                    >
                      <SocialSlide slide={slide} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <p className="text-sm font-medium text-dema-muted">Slide {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => exportSlide(index)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:border-dema-forest/30 hover:text-dema-forest"
                    aria-label={`Exporter la slide ${index + 1}`}
                    title={`Exporter la slide ${index + 1}`}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-dema-line bg-dema-paper p-5">
            <h2 className="text-lg font-semibold">Captions prêtes</h2>
            <CaptionBlock
              title="Meta"
              caption={carousel.metaCaption}
              copied={copiedCaption === "meta"}
              onCopy={() => copyCaption("meta")}
            />
            <CaptionBlock
              title="LinkedIn"
              caption={carousel.linkedinCaption}
              copied={copiedCaption === "linkedin"}
              onCopy={() => copyCaption("linkedin")}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function CaptionBlock({
  title,
  caption,
  copied,
  onCopy,
}: {
  title: string;
  caption: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-blue">{title}</h3>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:border-dema-forest/30 hover:text-dema-forest"
          aria-label={`Copier la caption ${title}`}
          title={`Copier la caption ${title}`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="whitespace-pre-line rounded-md bg-dema-sage/55 p-3 text-xs leading-relaxed text-dema-muted">
        {caption}
      </p>
    </section>
  );
}

function SocialSlide({ slide }: { slide: SocialCarouselSlide }) {
  if (slide.kind === "intro") {
    const highlightFontSize = slide.highlight.length > 38 ? 70 : slide.highlight.length > 28 ? 78 : 92;
    const subtitleLines = getIntroSubtitleLines(slide.subtitle);

    return (
      <SlideShell footer={slide.footer}>
        <div className="flex h-full flex-col items-start justify-center px-[82px] pt-[44px] text-left">
          <h2
            className="w-[900px] self-start text-left text-[92px] font-light leading-[1.12] tracking-normal text-black"
            style={{ textAlign: "left" }}
          >
            {slide.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span
              className="mt-6 block w-[900px] text-left font-bold leading-[1.06] text-dema-forest"
              style={{ fontSize: highlightFontSize, textAlign: "left" }}
            >
              {slide.highlight} ?
            </span>
          </h2>
          <p
            className="demaa-section-title mt-20 w-[900px] self-start text-left text-[56px] leading-[1.05] text-dema-forest/60"
            style={{ textAlign: "left" }}
          >
            {subtitleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </SlideShell>
    );
  }

  if (slide.kind === "process-snapshot") {
    return (
      <SlideShell footer={slide.footer}>
        <div className="pt-20">
          <SlideTitle title={slide.title} subtitle={slide.subtitle} />
          <div className="mt-[20px]">
            <SnapshotFrame height={520}>
              <ProcessSnapshot sector={slide.sector} openProcessTitle={slide.openProcessTitle} />
            </SnapshotFrame>
          </div>
        </div>
      </SlideShell>
    );
  }

  if (slide.kind === "tools-snapshot") {
    return (
      <SlideShell footer={slide.footer}>
        <div className="pt-[84px]">
          <SlideTitle title={slide.title} subtitle={slide.subtitle} />
          <div className="mt-[48px]">
            <SnapshotFrame height={500}>
              <ToolsSnapshot tools={slide.tools} />
            </SnapshotFrame>
          </div>
        </div>
      </SlideShell>
    );
  }

  if (slide.kind === "checklist") {
    return (
      <SlideShell footer={slide.footer}>
        <div className="px-14 pt-[82px]">
          <h2 className="max-w-[920px] text-[78px] font-light leading-[1.08] tracking-normal text-black">
            {slide.title}
          </h2>
          <p className="mt-[58px] text-[42px] font-light text-dema-muted">{slide.subtitle}</p>
          <div className="mt-[40px] space-y-[28px] pl-[74px]">
            {slide.steps.map((step, index) => (
              <div key={step} className="flex items-center gap-[34px]">
                <span className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md border-2 border-dema-forest">
                  <span className="absolute -top-[26px] left-1 text-[70px] font-bold leading-none text-black">✓</span>
                </span>
                <span className="min-w-[520px] rounded-full border-2 border-dema-forest px-[28px] py-[12px] text-[24px] font-bold leading-tight text-black">
                  {index + 1}. {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SlideShell>
    );
  }

  if (slide.kind === "cta-snapshot") {
    return (
      <SlideShell footer={slide.footer}>
        <div className="px-[76px] pt-[224px]">
          <h2 className="demaa-section-title max-w-[920px] text-[58px] leading-[1.08] text-dema-muted">
            {slide.title}
          </h2>
        </div>
        <div className="mt-[58px] -ml-[60px]">
          <SnapshotFrame width={1120} height={390}>
            <ProcessSnapshot sector={slide.sector} openProcessTitle={slide.openProcessTitle} showCta />
          </SnapshotFrame>
        </div>
      </SlideShell>
    );
  }

  return (
    <SlideShell footer={slide.footer}>
      <div className="px-[34px] pt-[250px]">
        <h2 className="text-[78px] font-light tracking-normal text-black">{slide.title}</h2>
      </div>
      <div className="mt-[108px] ml-[34px]">
        <SnapshotFrame faded width={1040} height={420}>
          <LandingSnapshot sector={slide.sector} />
        </SnapshotFrame>
      </div>
    </SlideShell>
  );
}

function getIntroSubtitleLines(subtitle: string): string[] {
  if (subtitle === "Pour que tout ne repose pas que sur vous") {
    return ["Pour que tout ne repose pas", "que sur vous"];
  }

  return [subtitle];
}

function SlideShell({ children, footer }: { children: React.ReactNode; footer: string }) {
  return (
    <div className="relative h-[1080px] w-[1080px] overflow-hidden bg-white text-brand-blue">
      {children}
      <p className="absolute bottom-[34px] left-0 right-0 text-center text-[32px] font-light text-black/32">
        {footer}
      </p>
    </div>
  );
}

function SlideTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-[54px]">
      <h2 className="max-w-[900px] text-[76px] font-light leading-[1.08] tracking-normal text-black">
        {title}
      </h2>
      <p className="mt-[58px] text-[44px] font-light leading-tight text-dema-muted">{subtitle}</p>
    </div>
  );
}

function SnapshotFrame({
  children,
  faded = false,
  width = 1060,
  height = 580,
}: {
  children: React.ReactNode;
  faded?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-[16px] border-2 border-dema-forest bg-white"
      style={{ width, height, opacity: faded ? 0.5 : 1 }}
    >
      {children}
    </div>
  );
}

function ProcessSnapshot({
  sector,
  openProcessTitle,
  showCta = false,
}: {
  sector: SocialStudioSector;
  openProcessTitle?: string;
  showCta?: boolean;
}) {
  const processesByPillar = PILLARS.map((pillar) => ({
    pillar,
    processes: sector.processes.filter((process) => process.pillar === pillar).slice(0, 3),
  }));

  return (
    <div className="h-full w-[1120px] bg-white px-[26px] py-[24px]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[14px] font-bold uppercase tracking-[0.22em] text-dema-forest">
            {sector.sectorLabel}
          </p>
          <h3 className="mt-[10px] text-[34px] font-bold leading-none text-brand-blue">{sector.name}</h3>
          <p className="mt-[14px] max-w-[820px] text-[18px] leading-snug text-dema-muted">{sector.description}</p>
        </div>
        {showCta ? (
          <div className="mt-4 rounded-full bg-dema-forest px-[22px] py-[10px] text-[15px] font-medium text-white shadow-[0_12px_28px_rgba(49,95,70,0.16)]">
            Demander un audit de mes process
          </div>
        ) : null}
      </div>
      <div className="mt-[30px] flex gap-[48px]">
        <button className="border-b-2 border-dema-forest px-2 pb-[8px] text-[17px] font-semibold">Processus</button>
        <button className="px-2 pb-[8px] text-[17px] font-medium text-dema-muted">Outils</button>
      </div>
      <div className="mt-[24px] grid grid-cols-5 gap-[12px]">
        {processesByPillar.map(({ pillar, processes }) => (
          <div key={pillar} className="min-h-[330px] rounded-[16px] border border-dema-line bg-white p-[12px]">
            <h4 className="demaa-section-title text-center text-[22px] leading-tight text-brand-blue">{pillar}</h4>
            <div className="mt-[14px] space-y-[10px]">
              {processes.map((process) => (
                <ProcessPill
                  key={process.title}
                  process={process}
                  isOpen={process.title === openProcessTitle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessPill({ process, isOpen }: { process: SocialProcess; isOpen: boolean }) {
  return (
    <div
      className={`rounded-[14px] p-[10px] ${
        isOpen ? "border border-dema-forest/20 bg-white shadow-sm" : "bg-dema-sage/55"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold leading-tight text-brand-blue">{process.title}</p>
        <span className="text-[18px] leading-none text-dema-forest/45">{isOpen ? "⌃" : "⌄"}</span>
      </div>
      {isOpen ? (
        <div className="mt-[8px]">
          <p className="text-[12px] leading-relaxed text-brand-blue/70">{process.description}</p>
          {process.examples ? (
            <p className="mt-[8px] text-[12px] italic leading-relaxed text-dema-muted">{process.examples}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ToolsSnapshot({ tools }: { tools: SocialTool[] }) {
  return (
    <div className="grid h-full w-[1060px] grid-cols-2 gap-[24px] bg-white p-[32px]">
      {tools.slice(0, 4).map((tool) => (
        <article key={tool.name} className="rounded-[20px] border border-dema-line bg-white p-[24px] shadow-sm">
          <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-dema-muted">{tool.type}</p>
          <h3 className="mt-[14px] text-[28px] font-bold leading-tight text-brand-blue">{tool.name}</h3>
          <p className="mt-[22px] text-[21px] leading-relaxed text-dema-muted">{tool.usage}</p>
        </article>
      ))}
    </div>
  );
}

function LandingSnapshot({ sector }: { sector: SocialStudioSector }) {
  return (
    <div className="h-full w-[1060px] bg-white px-[74px] py-[34px]">
      <div className="flex items-center justify-between">
        <p className="demaa-brand-logo text-[22px] text-dema-muted">Demaa</p>
        <div className="flex rounded-full bg-dema-sage/45 p-4 text-[12px] font-medium">
          <span className="rounded-full bg-dema-forest px-[26px] py-[10px] text-white">Structurer</span>
          <span className="px-[26px] py-[10px] text-dema-muted">S&apos;équiper</span>
          <span className="px-[26px] py-[10px] text-dema-muted">Déléguer</span>
        </div>
      </div>
      <div className="mt-[86px] text-center">
        <p className="text-[50px] font-light text-black/18">Pour que votre entreprise</p>
        <p className="demaa-section-title text-[50px] text-black/24">ne repose pas que sur vous</p>
      </div>
      <div className="mx-auto mt-[48px] h-[44px] max-w-[760px] rounded-full bg-dema-sage/35" />
      <h3 className="demaa-section-title mt-[78px] text-[28px] text-dema-muted">{sector.sectorLabel}</h3>
      <div className="mt-20 grid grid-cols-4 gap-[18px]">
        {[sector, ...Array.from({ length: 3 }, (_, index) => ({ ...sector, name: ["Conseil", "Gestion", "Finance"][index] }))].map(
          (item) => (
            <article key={item.name} className="h-[150px] rounded-[18px] border border-dema-line bg-white p-[18px]">
              <div className="h-[34px] w-[34px] rounded-full bg-dema-sage" />
              <h4 className="mt-[18px] text-[18px] font-bold text-brand-blue/45">{item.name}</h4>
              <p className="mt-10 text-[13px] leading-relaxed text-dema-muted/60">{sector.description}</p>
            </article>
          ),
        )}
      </div>
    </div>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
