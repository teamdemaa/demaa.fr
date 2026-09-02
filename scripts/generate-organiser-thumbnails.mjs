import { readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import {
  AppWindow,
  ArrowRight,
  Boxes,
  CalendarDays,
  CalendarSync,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Droplets,
  FileCheck2,
  FileSpreadsheet,
  FolderKanban,
  GraduationCap,
  Hammer,
  House,
  Inbox,
  Mail,
  MessageSquareText,
  PanelsTopLeft,
  Phone,
  ReceiptText,
  Ruler,
  Users,
  Wrench,
} from "lucide-react";
import {
  ORGANISER_THUMBNAIL_COLORS,
  ORGANISER_THUMBNAIL_SIZE,
  getAllOrganiserThumbnails,
} from "../src/lib/organiser-thumbnail-catalog.ts";

const projectRoot = process.cwd();
const outputDirectory = join(projectRoot, "public/images/organiser/thumbnails");

const [gambettaFont, satoshiFont] = await Promise.all([
  readFile(join(projectRoot, "src/app/fonts/gambetta-light-italic.woff2")),
  readFile(join(projectRoot, "src/app/fonts/satoshi-regular.woff2")),
]);

const gambettaData = gambettaFont.toString("base64");
const satoshiData = satoshiFont.toString("base64");

const { background, border, forest, muted } = ORGANISER_THUMBNAIL_COLORS;
const { height, width } = ORGANISER_THUMBNAIL_SIZE;

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function icon(Icon, x, y, size, color = muted, strokeWidth = 0.65) {
  return renderToStaticMarkup(createElement(Icon, {
    "aria-hidden": "true",
    fill: "none",
    height: size,
    stroke: color,
    strokeWidth,
    width: size,
    x,
    y,
  }));
}

function iconPair(LeftIcon, RightIcon, {
  leftColor = muted,
  rightColor = forest,
} = {}) {
  return `
    ${icon(LeftIcon, 900, 304, 140, leftColor)}
    ${icon(ArrowRight, 1042, 350, 54, muted, 0.58)}
    ${icon(RightIcon, 1110, 304, 140, rightColor)}
  `;
}

function illustration(kind) {
  switch (kind) {
    case "electronic-invoice":
      return iconPair(ReceiptText, CheckCircle2);
    case "plumbing-workflow":
      return iconPair(Droplets, Wrench, { leftColor: forest, rightColor: muted });
    case "accounting-requests":
      return iconPair(MessageSquareText, Inbox);
    case "renovation-quotes":
      return iconPair(House, FileCheck2);
    case "carpentry-project":
      return iconPair(Ruler, Hammer);
    case "recurring-cleaning":
      return iconPair(CalendarDays, CalendarSync);
    case "garage-customer-journey":
      return iconPair(CarFront, CalendarDays);
    case "restaurant-stock":
      return iconPair(Boxes, ClipboardCheck);
    case "training-administration":
      return iconPair(GraduationCap, FileCheck2);
    case "agency-mission":
      return iconPair(FolderKanban, CheckCircle2);
    case "multichannel-inbox":
      return `
        ${icon(Phone, 916, 286, 68, muted, 0.62)}
        ${icon(MessageSquareText, 916, 366, 68, forest, 0.62)}
        ${icon(Mail, 916, 446, 68, muted, 0.62)}
        ${icon(ArrowRight, 1018, 359, 58, muted, 0.58)}
        ${icon(Inbox, 1096, 320, 158, forest)}
      `;
    case "technician-planning":
      return iconPair(Users, CalendarDays);
    case "work-order-to-invoice":
      return iconPair(ClipboardCheck, ReceiptText);
    case "excel-to-software":
      return iconPair(FileSpreadsheet, AppWindow);
    case "business-app-profitability":
      return iconPair(CalendarSync, CircleDollarSign);
    case "software-choice":
      return `
        ${icon(AppWindow, 884, 304, 148, muted)}
        <text class="sans muted-text" x="1045" y="396" font-size="28">ou</text>
        ${icon(PanelsTopLeft, 1102, 304, 148, forest)}
      `;
    case "urgent-workflow":
      return iconPair(CalendarSync, ClipboardCheck, { leftColor: forest, rightColor: muted });
    case "task-consolidation":
      return iconPair(PanelsTopLeft, Inbox);
    case "meeting-decisions":
      return iconPair(MessageSquareText, ClipboardCheck);
    case "team-autonomy":
      return iconPair(Users, CheckCircle2, { leftColor: muted, rightColor: forest });
    case "document-search":
      return iconPair(FolderKanban, FileCheck2);
    case "recurring-reporting":
      return iconPair(FileSpreadsheet, CalendarSync, { leftColor: muted, rightColor: forest });
    default:
      throw new Error(`Illustration inconnue : ${kind}`);
  }
}

function buildSvg(thumbnail) {
  const activeLines = thumbnail.lines.filter(Boolean);
  const lineHeight = Math.round(thumbnail.fontSize * 1.05);
  const blockHeight = lineHeight * activeLines.length;
  const startY = Math.round((height - blockHeight) / 2 + thumbnail.fontSize * 0.72);
  const text = activeLines
    .map((line, index) => (
      `<text class="title" x="82" y="${startY + index * lineHeight}" font-size="${thumbnail.fontSize}">${escapeXml(line)}</text>`
    ))
    .join("");

  const secondary = thumbnail.secondary
    ? `<text class="sans muted-text" x="84" y="594" font-size="34">${escapeXml(thumbnail.secondary)}</text>`
    : "";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <style>
          @font-face { font-family: Gambetta; src: url(data:font/woff2;base64,${gambettaData}) format('woff2'); font-style: italic; font-weight: 300; }
          @font-face { font-family: Satoshi; src: url(data:font/woff2;base64,${satoshiData}) format('woff2'); font-style: normal; font-weight: 400; }
          .title { fill: ${forest}; fill-opacity: .84; font-family: Gambetta, Georgia, serif; font-style: italic; font-weight: 300; font-synthesis: none; letter-spacing: -1.5px; }
          .sans { font-family: Satoshi, Arial, sans-serif; font-weight: 400; }
          .muted-text { fill: ${muted}; }
        </style>
      </defs>
      <rect width="${width}" height="${height}" fill="${background}" />
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="34" fill="none" stroke="${border}" stroke-width="2" />
      ${text}
      ${secondary}
      <g aria-hidden="true">${illustration(thumbnail.illustration)}</g>
    </svg>
  `;
}

await mkdir(outputDirectory, { recursive: true });

for (const thumbnail of getAllOrganiserThumbnails()) {
  const outputPath = join(outputDirectory, `${thumbnail.slug}.png`);
  await sharp(Buffer.from(buildSvg(thumbnail)))
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`Généré : ${outputPath}`);
}
