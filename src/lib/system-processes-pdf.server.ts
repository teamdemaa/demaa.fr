import "server-only";

import {
  PDFDocument,
  StandardFonts,
  type PDFFont,
  type PDFPage,
  rgb,
} from "pdf-lib";
import type { SystemeRoutine } from "@/lib/systeme-catalog";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 48;
const FOOTER_HEIGHT = 34;
const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2);

const COLORS = {
  blue: rgb(23 / 255, 35 / 255, 29 / 255),
  green: rgb(49 / 255, 95 / 255, 70 / 255),
  line: rgb(224 / 255, 229 / 255, 223 / 255),
  muted: rgb(104 / 255, 113 / 255, 106 / 255),
  paper: rgb(252 / 255, 252 / 255, 249 / 255),
  sage: rgb(236 / 255, 241 / 255, 234 / 255),
  white: rgb(1, 1, 1),
} as const;

function normalizePdfText(value: string) {
  return value
    .replaceAll("\u202f", " ")
    .replaceAll("\u00a0", " ")
    .replaceAll("\u2011", "-")
    .replaceAll("\u2013", "-")
    .replaceAll("\u2014", "-");
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
) {
  const words = normalizePdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function drawLines(input: {
  color: ReturnType<typeof rgb>;
  font: PDFFont;
  fontSize: number;
  lineHeight: number;
  lines: readonly string[];
  page: PDFPage;
  x: number;
  y: number;
}) {
  let y = input.y;
  for (const line of input.lines) {
    input.page.drawText(line, {
      color: input.color,
      font: input.font,
      size: input.fontSize,
      x: input.x,
      y,
    });
    y -= input.lineHeight;
  }
  return y;
}

function estimateRoutineHeight(
  routine: SystemeRoutine,
  regularFont: PDFFont,
  boldFont: PDFFont,
) {
  const titleLines = wrapText(routine.title, boldFont, 14, CONTENT_WIDTH - 42);
  const checklistHeight = routine.bullets.reduce((height, bullet) => {
    const lines = wrapText(bullet, regularFont, 10.5, CONTENT_WIDTH - 32);
    return height + Math.max(22, lines.length * 14 + 6);
  }, 0);

  return 42 + (titleLines.length * 18) + checklistHeight;
}

export async function buildSystemProcessesPdf(input: {
  routines: readonly SystemeRoutine[];
  systemName: string;
}) {
  const document = await PDFDocument.create();
  const regularFont = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const obliqueFont = await document.embedFont(StandardFonts.HelveticaOblique);
  const pages: PDFPage[] = [];
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - PAGE_MARGIN;
  pages.push(page);

  function addPage() {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    page.drawText("Demaa", {
      color: COLORS.green,
      font: obliqueFont,
      size: 13,
      x: PAGE_MARGIN,
      y: PAGE_HEIGHT - PAGE_MARGIN,
    });
    page.drawText("Checklist des processus métier", {
      color: COLORS.muted,
      font: regularFont,
      size: 9,
      x: PAGE_MARGIN + 48,
      y: PAGE_HEIGHT - PAGE_MARGIN + 1,
    });
    page.drawLine({
      color: COLORS.line,
      end: { x: PAGE_WIDTH - PAGE_MARGIN, y: PAGE_HEIGHT - PAGE_MARGIN - 12 },
      start: { x: PAGE_MARGIN, y: PAGE_HEIGHT - PAGE_MARGIN - 12 },
      thickness: 0.8,
    });
    y = PAGE_HEIGHT - PAGE_MARGIN - 38;
  }

  page.drawRectangle({
    color: COLORS.paper,
    height: PAGE_HEIGHT,
    width: PAGE_WIDTH,
    x: 0,
    y: 0,
  });
  page.drawText("Demaa", {
    color: COLORS.green,
    font: obliqueFont,
    size: 16,
    x: PAGE_MARGIN,
    y,
  });
  y -= 38;
  page.drawText("CHECKLIST - PROCESSUS MÉTIER", {
    color: COLORS.green,
    font: boldFont,
    size: 9,
    x: PAGE_MARGIN,
    y,
  });
  y -= 30;
  const systemTitleLines = wrapText(
    normalizePdfText(input.systemName),
    boldFont,
    27,
    CONTENT_WIDTH,
  );
  y = drawLines({
    color: COLORS.blue,
    font: boldFont,
    fontSize: 27,
    lineHeight: 32,
    lines: systemTitleLines,
    page,
    x: PAGE_MARGIN,
    y,
  });
  y -= 8;
  const introLines = wrapText(
    "Les processus essentiels à structurer pour piloter cette activité au quotidien.",
    regularFont,
    11,
    CONTENT_WIDTH - 72,
  );
  y = drawLines({
    color: COLORS.muted,
    font: regularFont,
    fontSize: 11,
    lineHeight: 16,
    lines: introLines,
    page,
    x: PAGE_MARGIN,
    y,
  });
  y -= 16;
  page.drawRectangle({
    borderColor: COLORS.line,
    borderWidth: 0.8,
    color: COLORS.sage,
    height: 32,
    width: 150,
    x: PAGE_MARGIN,
    y: y - 22,
  });
  page.drawText(`${input.routines.length} processus à parcourir`, {
    color: COLORS.green,
    font: boldFont,
    size: 9.5,
    x: PAGE_MARGIN + 12,
    y: y - 10,
  });
  y -= 54;

  for (const [routineIndex, routine] of input.routines.entries()) {
    const estimatedHeight = estimateRoutineHeight(routine, regularFont, boldFont);
    if (y - Math.min(estimatedHeight, 250) < PAGE_MARGIN + FOOTER_HEIGHT) {
      addPage();
    }

    const number = String(routineIndex + 1).padStart(2, "0");
    page.drawText(number, {
      color: COLORS.green,
      font: boldFont,
      size: 11,
      x: PAGE_MARGIN,
      y,
    });
    const titleLines = wrapText(routine.title, boldFont, 14, CONTENT_WIDTH - 42);
    y = drawLines({
      color: COLORS.blue,
      font: boldFont,
      fontSize: 14,
      lineHeight: 18,
      lines: titleLines,
      page,
      x: PAGE_MARGIN + 42,
      y,
    });
    page.drawText(normalizePdfText(routine.cadence), {
      color: COLORS.muted,
      font: regularFont,
      size: 8.5,
      x: PAGE_MARGIN + 42,
      y: y - 1,
    });
    y -= 24;

    for (const bullet of routine.bullets) {
      const bulletLines = wrapText(bullet, regularFont, 10.5, CONTENT_WIDTH - 32);
      const itemHeight = Math.max(22, bulletLines.length * 14 + 6);
      if (y - itemHeight < PAGE_MARGIN + FOOTER_HEIGHT) {
        addPage();
        const continuationLines = wrapText(
          `${number} - ${routine.title} (suite)`,
          boldFont,
          11,
          CONTENT_WIDTH,
        );
        y = drawLines({
          color: COLORS.blue,
          font: boldFont,
          fontSize: 11,
          lineHeight: 15,
          lines: continuationLines,
          page,
          x: PAGE_MARGIN,
          y,
        });
        y -= 14;
      }

      page.drawRectangle({
        borderColor: COLORS.green,
        borderWidth: 1,
        height: 10,
        width: 10,
        x: PAGE_MARGIN + 3,
        y: y - 8,
      });
      y = drawLines({
        color: COLORS.muted,
        font: regularFont,
        fontSize: 10.5,
        lineHeight: 14,
        lines: bulletLines,
        page,
        x: PAGE_MARGIN + 28,
        y,
      });
      y -= 6;
    }

    page.drawLine({
      color: COLORS.line,
      end: { x: PAGE_WIDTH - PAGE_MARGIN, y },
      start: { x: PAGE_MARGIN, y },
      thickness: 0.7,
    });
    y -= 22;
  }

  for (const [pageIndex, pdfPage] of pages.entries()) {
    pdfPage.drawLine({
      color: COLORS.line,
      end: { x: PAGE_WIDTH - PAGE_MARGIN, y: PAGE_MARGIN - 2 },
      start: { x: PAGE_MARGIN, y: PAGE_MARGIN - 2 },
      thickness: 0.6,
    });
    pdfPage.drawText("Checklist générée par Demaa", {
      color: COLORS.muted,
      font: regularFont,
      size: 8,
      x: PAGE_MARGIN,
      y: PAGE_MARGIN - 18,
    });
    const pageLabel = `${pageIndex + 1} / ${pages.length}`;
    pdfPage.drawText(pageLabel, {
      color: COLORS.muted,
      font: regularFont,
      size: 8,
      x: PAGE_WIDTH - PAGE_MARGIN - regularFont.widthOfTextAtSize(pageLabel, 8),
      y: PAGE_MARGIN - 18,
    });
  }

  document.setAuthor("Demaa");
  document.setCreator("Demaa");
  document.setSubject(`Checklist des processus métier - ${input.systemName}`);
  document.setTitle(`Checklist des processus métier - ${input.systemName}`);

  return document.save();
}

export function buildSystemProcessesPdfFilename(systemSlug: string) {
  const safeSlug = systemSlug.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  return `checklist-processus-${safeSlug}.pdf`;
}
