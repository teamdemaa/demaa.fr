import { readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
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

function documentShape(x, y, width = 118, height = 150, accent = false) {
  const fold = 28;
  return `
    <path class="line" d="M${x} ${y}h${width - fold}l${fold} ${fold}v${height - fold}H${x}z" />
    <path class="line" d="M${x + width - fold} ${y}v${fold}h${fold}" />
    <line class="line ${accent ? "accent" : ""}" x1="${x + 24}" y1="${y + 70}" x2="${x + width - 24}" y2="${y + 70}" />
    <line class="line" x1="${x + 24}" y1="${y + 96}" x2="${x + width - 38}" y2="${y + 96}" />
    <line class="line" x1="${x + 24}" y1="${y + 122}" x2="${x + width - 50}" y2="${y + 122}" />
  `;
}

function flowArrow(x1, y1, x2, y2, accent = false) {
  const className = accent ? "line accent" : "line";
  return `
    <line class="${className}" x1="${x1}" y1="${y1}" x2="${x2 - 14}" y2="${y2}" />
    <path class="${className}" d="M${x2 - 26} ${y2 - 12}l14 12-14 12" />
  `;
}

function calendarShape(x, y, width = 190, height = 165) {
  const dots = [0, 1, 2].map((row) =>
    [0, 1, 2, 3].map((column) =>
      `<circle class="${row === 1 && column === 2 ? "accent-fill" : "muted-fill"}" cx="${x + 38 + column * 38}" cy="${y + 72 + row * 35}" r="5" />`,
    ).join(""),
  ).join("");
  return `
    <rect class="line" x="${x}" y="${y + 18}" width="${width}" height="${height - 18}" rx="18" />
    <line class="line" x1="${x}" y1="${y + 52}" x2="${x + width}" y2="${y + 52}" />
    <line class="line accent" x1="${x + 48}" y1="${y}" x2="${x + 48}" y2="${y + 34}" />
    <line class="line" x1="${x + width - 48}" y1="${y}" x2="${x + width - 48}" y2="${y + 34}" />
    ${dots}
  `;
}

function inboxShape(x, y) {
  return `
    <path class="line" d="M${x} ${y + 48}h136l22 66v54H${x - 22}v-54z" />
    <path class="line accent" d="M${x - 13} ${y + 114}h43l14 24h48l14-24h43" />
    <circle class="accent-fill" cx="${x + 68}" cy="${y + 18}" r="12" />
    <path class="line" d="M${x + 46} ${y + 18}h-38M${x + 8} ${y + 18}l-18-18M${x + 8} ${y + 18}l-18 18" />
  `;
}

function illustration(kind) {
  switch (kind) {
    case "electronic-invoice":
      return `
        ${documentShape(910, 280, 130, 172, true)}
        <circle class="line" cx="1092" cy="366" r="13" />
        <circle class="accent-fill" cx="1162" cy="366" r="13" />
        <line class="line" x1="1040" y1="366" x2="1079" y2="366" />
        <line class="line accent" x1="1105" y1="366" x2="1149" y2="366" />
        <text class="sans accent-text" x="946" y="353" font-size="42">€</text>
      `;
    case "plumbing-workflow":
      return `
        <path class="line accent" d="M916 286c0 0-54 70-54 110a54 54 0 0 0 108 0c0-40-54-110-54-110z" />
        <rect class="line" x="1006" y="330" width="105" height="78" rx="10" />
        <line class="line" x1="1028" y1="353" x2="1089" y2="353" />
        <line class="line accent" x1="1028" y1="378" x2="1070" y2="378" />
        ${flowArrow(1116, 370, 1192, 370, true)}
        <circle class="line" cx="1206" cy="370" r="18" />
      `;
    case "accounting-requests":
      return `
        <circle class="line" cx="898" cy="300" r="12" />
        <circle class="line" cx="898" cy="372" r="12" />
        <circle class="accent-fill" cx="898" cy="444" r="12" />
        <path class="line" d="M912 300c70 0 78 72 142 72M912 372h142M912 444c70 0 78-72 142-72" />
        ${inboxShape(1064, 278)}
      `;
    case "renovation-quotes":
      return `
        <path class="line accent" d="M888 366l112-100 112 100" />
        <path class="line" d="M916 340v132h168V340" />
        <rect class="line" x="1038" y="390" width="146" height="112" rx="8" />
        <line class="line accent" x1="1062" y1="421" x2="1158" y2="421" />
        <line class="line" x1="1062" y1="449" x2="1138" y2="449" />
        <path class="line" d="M1090 482c24-20 43 22 68 0" />
      `;
    case "carpentry-project":
      return `
        <rect class="line" x="894" y="300" width="58" height="202" rx="4" />
        <line class="line accent" x1="916" y1="324" x2="916" y2="478" />
        <rect class="line" x="988" y="318" width="132" height="174" rx="4" />
        <path class="line" d="M1010 318c22 36-18 65 8 98s-11 55 12 76M1050 318c22 36-18 65 8 98s-11 55 12 76M1090 318c22 36-18 65 8 98s-11 55 12 76" />
        <circle class="line accent" cx="1178" cy="444" r="34" />
        <path class="line accent" d="M1162 444l12 12 24-28" />
      `;
    case "recurring-cleaning":
      return `
        ${calendarShape(888, 300, 198, 172)}
        <circle class="line accent" cx="1138" cy="438" r="52" />
        <path class="line accent" d="M1111 438a28 28 0 0 1 46-21l13 12M1166 400l4 29-29 2M1165 438a28 28 0 0 1-46 21l-13-12M1110 476l-4-29 29-2" />
      `;
    case "garage-customer-journey":
      return `
        <path class="line" d="M870 418h230l-22-64-42-30H932l-34 30z" />
        <circle class="line accent" cx="930" cy="424" r="28" />
        <circle class="line" cx="1044" cy="424" r="28" />
        <line class="line" x1="1102" y1="390" x2="1142" y2="390" />
        ${calendarShape(1148, 332, 92, 96)}
      `;
    case "restaurant-stock":
      return `
        <rect class="line" x="858" y="384" width="228" height="92" rx="8" />
        <line class="line accent" x1="858" y1="414" x2="1086" y2="414" />
        <path class="line" d="M900 384v-58h36v58M908 326v-26h20v26" />
        <path class="line" d="M968 384v-78h52v78M978 326h32M978 350h32" />
        <path class="line" d="M1042 384v-46c0-18 30-18 30 0v46" />
        ${flowArrow(1098, 410, 1134, 410, true)}
        <circle class="line accent" cx="1192" cy="410" r="55" />
        <path class="line accent" d="M1192 410l24-27M1192 410h-28" />
      `;
    case "training-administration":
      return `
        ${documentShape(886, 294, 126, 170, true)}
        <circle class="line" cx="949" cy="340" r="16" />
        <path class="line" d="M922 382c14-22 42-22 56 0" />
        ${flowArrow(1026, 382, 1082, 382, true)}
        ${documentShape(1092, 318, 118, 150, false)}
        <circle class="line accent" cx="1152" cy="444" r="22" />
      `;
    case "agency-mission":
      return `
        <path class="line accent" d="M876 350h96l24 24h134v120H876z" />
        ${flowArrow(1016, 410, 1080, 410, false)}
        ${documentShape(1096, 292, 120, 158, true)}
      `;
    case "multichannel-inbox":
      return `
        <circle class="line" cx="888" cy="294" r="28" />
        <circle class="line" cx="888" cy="380" r="28" />
        <circle class="accent-fill" cx="888" cy="466" r="28" />
        <path class="line" d="M876 284c8-10 18-6 22 2M876 372h24v16h-15l-9 8zM878 466l10 8 14-18" />
        <path class="line" d="M916 294c62 0 76 86 136 86M916 380h136M916 466c62 0 76-86 136-86" />
        ${inboxShape(1062, 286)}
      `;
    case "technician-planning":
      return `
        ${calendarShape(886, 292, 292, 208)}
        <circle class="muted-fill" cx="930" cy="380" r="8" />
        <line class="line accent" x1="954" y1="380" x2="1134" y2="380" />
        <circle class="accent-fill" cx="1088" cy="380" r="9" />
        <circle class="muted-fill" cx="930" cy="430" r="8" />
        <line class="line" x1="954" y1="430" x2="1134" y2="430" />
        <circle class="accent-fill" cx="1034" cy="430" r="9" />
      `;
    case "work-order-to-invoice":
      return `
        ${documentShape(866, 292, 130, 174, true)}
        <path class="line accent" d="M900 346l10 10 18-22M900 386l10 10 18-22" />
        ${flowArrow(1010, 382, 1070, 382, true)}
        ${documentShape(1084, 292, 130, 174, false)}
        <text class="sans accent-text" x="1124" y="391" font-size="48">€</text>
      `;
    case "excel-to-software":
      return `
        <rect class="line" x="850" y="316" width="172" height="154" rx="8" />
        <line class="line" x1="850" y1="354" x2="1022" y2="354" />
        <line class="line accent" x1="908" y1="316" x2="908" y2="470" />
        <line class="line" x1="966" y1="316" x2="966" y2="470" />
        <line class="line" x1="850" y1="400" x2="1022" y2="400" />
        ${flowArrow(1038, 392, 1090, 392, true)}
        <rect class="line" x="1100" y="300" width="142" height="184" rx="16" />
        <rect class="line accent" x="1122" y="332" width="98" height="26" rx="6" />
        <line class="line" x1="1122" y1="390" x2="1220" y2="390" />
        <line class="line" x1="1122" y1="424" x2="1192" y2="424" />
      `;
    case "business-app-profitability":
      return `
        <line class="line" x1="852" y1="470" x2="1220" y2="470" />
        <circle class="line" cx="938" cy="418" r="48" />
        <path class="line" d="M938 388v34l24 14" />
        <circle class="line accent" cx="1140" cy="418" r="48" />
        <text class="sans accent-text" x="1125" y="435" font-size="48">€</text>
        <path class="line accent" d="M980 392c58-8 88-54 122-116" />
        <path class="line accent" d="M1082 282l26-16-2 31" />
      `;
    case "software-choice":
      return `
        <rect class="line" x="846" y="302" width="162" height="180" rx="14" />
        <line class="line accent" x1="870" y1="340" x2="984" y2="340" />
        <rect class="line" x="870" y="370" width="48" height="36" rx="5" />
        <rect class="line" x="936" y="370" width="48" height="36" rx="5" />
        <text class="sans muted-text" x="1030" y="407" font-size="32">ou</text>
        <rect class="line accent" x="1090" y="302" width="162" height="180" rx="14" />
        <rect class="line" x="1114" y="340" width="114" height="94" rx="6" />
        <line class="line accent" x1="1152" y1="340" x2="1152" y2="434" />
        <line class="line" x1="1114" y1="384" x2="1228" y2="384" />
      `;
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
  const illustrationScale = thumbnail.illustrationScale ?? 0.76;
  const illustrationShiftX = thumbnail.illustrationShiftX ?? 0;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <style>
          @font-face { font-family: Gambetta; src: url(data:font/woff2;base64,${gambettaData}) format('woff2'); font-style: italic; font-weight: 300; }
          @font-face { font-family: Satoshi; src: url(data:font/woff2;base64,${satoshiData}) format('woff2'); font-style: normal; font-weight: 400; }
          .title { fill: ${forest}; font-family: Gambetta, Georgia, serif; font-style: italic; font-weight: 300; letter-spacing: -2px; }
          .sans { font-family: Satoshi, Arial, sans-serif; font-weight: 400; }
          .line { fill: none; stroke: ${muted}; stroke-linecap: round; stroke-linejoin: round; stroke-opacity: .72; stroke-width: 3; }
          .accent { stroke: ${forest}; stroke-opacity: 1; }
          .accent-fill { fill: ${forest}; }
          .muted-fill { fill: ${muted}; fill-opacity: .66; }
          .accent-text { fill: ${forest}; }
          .muted-text { fill: ${muted}; }
        </style>
      </defs>
      <rect width="${width}" height="${height}" fill="${background}" />
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="34" fill="none" stroke="${border}" stroke-width="2" />
      ${text}
      ${secondary}
      <g aria-hidden="true" transform="translate(${1280 + illustrationShiftX} 360) scale(${illustrationScale}) translate(-1280 -360)">${illustration(thumbnail.illustration)}</g>
    </svg>
  `;
}

await mkdir(outputDirectory, { recursive: true });

for (const thumbnail of getAllOrganiserThumbnails()) {
  const outputPath = join(outputDirectory, `${thumbnail.slug}.png`);
  await sharp(Buffer.from(buildSvg(thumbnail)))
    .png({ compressionLevel: 9, palette: true })
    .toFile(outputPath);
  console.log(`Généré : ${outputPath}`);
}
