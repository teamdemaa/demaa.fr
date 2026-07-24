import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(
  ROOT,
  "marketing",
  "meta",
  "batiment-lead-magnet",
);
const PREVIEW_PATH = path.join(
  ROOT,
  "public",
  "images",
  "kits",
  "batiment",
  "tableau-suivi-preview.webp",
);

const WIDTH = 1080;
const HEIGHT = 1350;

const palette = {
  background: "#FAFAFA",
  dark: "#17231D",
  forest: "#315F46",
  forestDark: "#284F3A",
  line: "#E5E8E5",
  muted: "#6F756E",
  paper: "#FFFFFF",
  sage: "#F1F3F0",
  softGreen: "#EAF3ED",
};

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function svgImage(buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function textBlock({
  x,
  y,
  lines,
  size,
  color = palette.dark,
  weight = 700,
  lineHeight = 1.08,
  anchor = "start",
  family = "Avenir Next, Avenir, Arial, sans-serif",
  letterSpacing = 0,
  italic = false,
}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${letterSpacing}"${italic ? ' font-style="italic"' : ""}>
    ${lines
      .map(
        (line, index) =>
          `<tspan x="${x}" dy="${index === 0 ? 0 : size * lineHeight}">${escapeXml(line)}</tspan>`,
      )
      .join("\n")}
  </text>`;
}

function logo({ inverse = false } = {}) {
  const color = inverse ? palette.paper : palette.dark;
  return `<g>
    <circle cx="91" cy="87" r="13" fill="${inverse ? palette.paper : palette.forest}" />
    <text x="118" y="100" fill="${color}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="46" font-weight="700" letter-spacing="-2">Demaa</text>
  </g>`;
}

function pill({ x, y, width, label, inverse = false }) {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="48" rx="24" fill="${inverse ? "rgba(255,255,255,0.14)" : palette.sage}" stroke="${inverse ? "rgba(255,255,255,0.22)" : palette.line}" />
    <text x="${x + width / 2}" y="${y + 31}" text-anchor="middle" fill="${inverse ? palette.paper : palette.forest}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="1.5">${escapeXml(label)}</text>
  </g>`;
}

function progress(index, inverse = false) {
  const gap = 12;
  const itemWidth = 116;
  const totalWidth = itemWidth * 7 + gap * 6;
  const startX = (WIDTH - totalWidth) / 2;
  return `<g>
    ${Array.from({ length: 7 }, (_, cardIndex) => {
      const active = cardIndex <= index - 1;
      return `<rect x="${startX + cardIndex * (itemWidth + gap)}" y="1287" width="${itemWidth}" height="7" rx="3.5" fill="${
        active
          ? inverse
            ? palette.paper
            : palette.forest
          : inverse
            ? "rgba(255,255,255,0.26)"
            : "#D9DEDA"
      }" />`;
    }).join("")}
  </g>`;
}

function cardNumber(index, inverse = false) {
  return `<text x="991" y="101" text-anchor="end" fill="${inverse ? "rgba(255,255,255,0.72)" : palette.muted}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="24" font-weight="600">${String(index).padStart(2, "0")} / 07</text>`;
}

function baseSvg({ index, body, background = palette.background, inverse = false }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#17231D" flood-opacity="0.12" />
      </filter>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#17231D" flood-opacity="0.08" />
      </filter>
      <clipPath id="previewClip">
        <rect x="72" y="430" width="936" height="658" rx="30" />
      </clipPath>
      <clipPath id="featureClip">
        <rect x="94" y="536" width="892" height="514" rx="28" />
      </clipPath>
      <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse">
        <path d="M 52 0 L 0 0 0 52" fill="none" stroke="${inverse ? "rgba(255,255,255,0.06)" : "rgba(49,95,70,0.055)"}" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${background}" />
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" />
    ${logo({ inverse })}
    ${cardNumber(index, inverse)}
    ${body}
    ${progress(index, inverse)}
  </svg>`;
}

function checkIcon(x, y) {
  return `<g transform="translate(${x} ${y})">
    <circle cx="20" cy="20" r="20" fill="${palette.softGreen}" />
    <path d="M11 20.5l6 6L29.5 14" fill="none" stroke="${palette.forest}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  </g>`;
}

async function buildPreviewAssets() {
  const full = await sharp(PREVIEW_PATH).png().toBuffer();
  const finance = await sharp(PREVIEW_PATH)
    .extract({ left: 24, top: 112, width: 716, height: 710 })
    .png()
    .toBuffer();
  const process = await sharp(PREVIEW_PATH)
    .extract({ left: 808, top: 94, width: 568, height: 730 })
    .png()
    .toBuffer();
  const tabs = await sharp(PREVIEW_PATH)
    .extract({ left: 250, top: 690, width: 900, height: 160 })
    .png()
    .toBuffer();

  return {
    finance: svgImage(finance),
    full: svgImage(full),
    process: svgImage(process),
    tabs: svgImage(tabs),
  };
}

function slideOne() {
  const body = `
    ${pill({ x: 72, y: 176, width: 362, label: "POUR DIRIGEANTS DU BÂTIMENT" })}
    ${textBlock({
      x: 72,
      y: 330,
      lines: ["Votre entreprise", "tourne encore trop", "dans votre tête ?"],
      size: 78,
      lineHeight: 1.04,
    })}
    ${textBlock({
      x: 72,
      y: 650,
      lines: [
        "Recevez le tableau qui centralise vos chiffres,",
        "vos priorités, votre équipe et vos process.",
      ],
      size: 31,
      color: palette.muted,
      weight: 500,
      lineHeight: 1.45,
    })}
    <g transform="translate(72 810)">
      <rect width="936" height="278" rx="34" fill="${palette.paper}" stroke="${palette.line}" filter="url(#softShadow)" />
      <rect x="32" y="32" width="220" height="214" rx="24" fill="${palette.sage}" />
      <path d="M81 143h122M81 104h82M81 182h98" stroke="${palette.forest}" stroke-width="12" stroke-linecap="round" opacity="0.9"/>
      <circle cx="188" cy="104" r="18" fill="${palette.softGreen}" stroke="${palette.forest}" stroke-width="5"/>
      ${textBlock({
        x: 294,
        y: 99,
        lines: ["Google Sheet prêt à copier"],
        size: 34,
        weight: 700,
      })}
      ${textBlock({
        x: 294,
        y: 160,
        lines: ["Adapté à votre métier.", "Disponible immédiatement.", "Gratuit."],
        size: 27,
        color: palette.muted,
        weight: 500,
        lineHeight: 1.5,
      })}
    </g>
    <text x="72" y="1200" fill="${palette.forest}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="24" font-weight="700">Faites défiler pour voir exactement ce que vous recevez</text>
    <path d="M924 1191h64m-20-20 20 20-20 20" fill="none" stroke="${palette.forest}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  `;
  return baseSvg({ index: 1, body });
}

function slideTwo(images) {
  const body = `
    ${pill({ x: 72, y: 176, width: 294, label: "APERÇU RÉEL DU FICHIER" })}
    ${textBlock({
      x: 72,
      y: 286,
      lines: ["Voici exactement", "ce que vous allez recevoir."],
      size: 60,
      lineHeight: 1.06,
    })}
    <rect x="72" y="430" width="936" height="658" rx="30" fill="${palette.paper}" stroke="${palette.line}" filter="url(#shadow)" />
    <image href="${images.full}" x="72" y="430" width="936" height="658" preserveAspectRatio="xMidYMid meet" clip-path="url(#previewClip)" />
    <g transform="translate(72 1131)">
      <rect width="459" height="76" rx="38" fill="${palette.forest}" />
      <circle cx="40" cy="38" r="14" fill="${palette.paper}" opacity="0.95" />
      <path d="M34 38l5 5 9-12" fill="none" stroke="${palette.forest}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="70" y="48" fill="${palette.paper}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="23" font-weight="700">Google Sheet prêt à copier</text>
    </g>
    <text x="1008" y="1179" text-anchor="end" fill="${palette.muted}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="23" font-weight="600">Aucun faux mockup</text>
  `;
  return baseSvg({ index: 2, body });
}

function slideThree(images) {
  const body = `
    ${pill({ x: 72, y: 176, width: 242, label: "01 — VOS CHIFFRES" })}
    ${textBlock({
      x: 72,
      y: 287,
      lines: ["Voyez venir.", "Décidez plus tôt."],
      size: 65,
      lineHeight: 1.06,
    })}
    ${textBlock({
      x: 72,
      y: 451,
      lines: ["CA, charges, marge, trésorerie et objectifs :", "les indicateurs utiles sont déjà structurés."],
      size: 29,
      color: palette.muted,
      weight: 500,
      lineHeight: 1.42,
    })}
    <rect x="94" y="536" width="892" height="514" rx="28" fill="${palette.paper}" stroke="${palette.line}" filter="url(#shadow)" />
    <image href="${images.finance}" x="94" y="536" width="892" height="514" preserveAspectRatio="xMidYMid slice" clip-path="url(#featureClip)" />
    <g transform="translate(72 1110)">
      ${["Chiffre d’affaires", "Marge", "Trésorerie"].map((label, index) => `
        <rect x="${index * 309}" y="0" width="285" height="78" rx="20" fill="${index === 1 ? palette.softGreen : palette.sage}" />
        <text x="${index * 309 + 142.5}" y="49" text-anchor="middle" fill="${palette.dark}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="22" font-weight="700">${escapeXml(label)}</text>
      `).join("")}
    </g>
  `;
  return baseSvg({ index: 3, body });
}

function slideFour(images) {
  const processExamples = [
    "Planning chantier",
    "Achats & appro",
    "Sous-traitants",
    "Sécurité & conformité",
    "Suivi client",
  ];
  const body = `
    ${pill({ x: 72, y: 176, width: 264, label: "02 — VOS PROCESS" })}
    ${textBlock({
      x: 72,
      y: 288,
      lines: ["39 process adaptés", "au bâtiment."],
      size: 65,
      lineHeight: 1.06,
    })}
    ${textBlock({
      x: 72,
      y: 450,
      lines: ["Chaque tâche peut avoir un responsable,", "une fréquence et un niveau d’avancement."],
      size: 29,
      color: palette.muted,
      weight: 500,
      lineHeight: 1.42,
    })}
    <rect x="94" y="536" width="892" height="514" rx="28" fill="${palette.paper}" stroke="${palette.line}" filter="url(#shadow)" />
    <rect x="94" y="536" width="432" height="514" rx="28" fill="${palette.sage}" />
    <rect x="498" y="536" width="28" height="514" fill="${palette.sage}" />
    <text x="138" y="592" fill="${palette.forest}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="1.2">EXEMPLES INCLUS</text>
    ${processExamples.map((label, index) => `
      <g transform="translate(138 ${635 + index * 76})">
        <circle cx="18" cy="18" r="18" fill="${palette.paper}" />
        <path d="M10 18l5 5 11-13" fill="none" stroke="${palette.forest}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
        <text x="53" y="27" fill="${palette.dark}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="24" font-weight="700">${escapeXml(label)}</text>
      </g>
    `).join("")}
    <text x="756" y="592" text-anchor="middle" fill="${palette.muted}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="1.1">APERÇU RÉEL DU FICHIER</text>
    <image href="${images.full}" x="548" y="628" width="416" height="320" preserveAspectRatio="xMidYMid meet" />
    <rect x="586" y="970" width="340" height="50" rx="25" fill="${palette.softGreen}" />
    <text x="756" y="1003" text-anchor="middle" fill="${palette.forest}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="19" font-weight="700">Process + responsables + fréquence</text>
    <g transform="translate(72 1110)">
      ${["Chantiers", "Achats", "Sécurité", "Clients"].map((label, index) => `
        <rect x="${index * 232}" y="0" width="214" height="78" rx="20" fill="${index === 0 ? palette.softGreen : palette.sage}" />
        <text x="${index * 232 + 107}" y="49" text-anchor="middle" fill="${palette.dark}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="22" font-weight="700">${escapeXml(label)}</text>
      `).join("")}
    </g>
  `;
  return baseSvg({ index: 4, body });
}

function slideFive(images) {
  const items = [
    ["Synthèse", "La vue d’ensemble"],
    ["Prévisionnel", "Chiffres & trésorerie"],
    ["Actions", "Priorités & échéances"],
    ["Équipe", "Rôles & responsabilités"],
    ["Écosystème", "Partenaires & outils"],
    ["Marketing", "Calendrier d’actions"],
    ["Process", "Fonctionnement métier"],
  ];
  const body = `
    ${pill({ x: 72, y: 176, width: 298, label: "03 — TOUT AU MÊME ENDROIT" })}
    ${textBlock({
      x: 72,
      y: 288,
      lines: ["Un seul fichier.", "Toute votre entreprise."],
      size: 65,
      lineHeight: 1.06,
    })}
    <rect x="72" y="458" width="936" height="154" rx="28" fill="${palette.paper}" stroke="${palette.line}" filter="url(#softShadow)" />
    <image href="${images.tabs}" x="89" y="475" width="902" height="120" preserveAspectRatio="xMidYMid meet" />
    <g transform="translate(72 661)">
      ${items.map(([title, detail], index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = column * 468;
        const y = row * 128;
        return `<g transform="translate(${x} ${y})">
          ${checkIcon(0, 9)}
          <text x="60" y="30" fill="${palette.dark}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="27" font-weight="700">${escapeXml(title)}</text>
          <text x="60" y="64" fill="${palette.muted}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="21" font-weight="500">${escapeXml(detail)}</text>
        </g>`;
      }).join("")}
    </g>
  `;
  return baseSvg({ index: 5, body });
}

function slideSix() {
  const body = `
    ${pill({ x: 72, y: 176, width: 276, label: "PRÊT À UTILISER" })}
    ${textBlock({
      x: 72,
      y: 290,
      lines: ["Vous ne partez pas", "d’une page blanche."],
      size: 65,
      lineHeight: 1.06,
    })}
    <g transform="translate(72 479)">
      <rect width="936" height="612" rx="34" fill="${palette.paper}" stroke="${palette.line}" filter="url(#softShadow)" />
      <g transform="translate(36 38)">
        ${[
          ["1", "Copiez", "le Google Sheet dans votre Drive."],
          ["2", "Renseignez", "vos chiffres, actions et responsables."],
          ["3", "Pilotez", "votre entreprise depuis une base claire."],
        ].map(([number, title, detail], index) => `
          <g transform="translate(0 ${index * 165})">
            <circle cx="51" cy="51" r="51" fill="${index === 1 ? palette.forest : palette.sage}" />
            <text x="51" y="64" text-anchor="middle" fill="${index === 1 ? palette.paper : palette.forest}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="35" font-weight="700">${number}</text>
            <text x="133" y="45" fill="${palette.dark}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="32" font-weight="700">${escapeXml(title)}</text>
            <text x="133" y="83" fill="${palette.muted}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="24" font-weight="500">${escapeXml(detail)}</text>
          </g>
        `).join("")}
      </g>
    </g>
    <g transform="translate(72 1134)">
      <rect width="936" height="76" rx="24" fill="${palette.softGreen}" />
      <text x="468" y="48" text-anchor="middle" fill="${palette.forest}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="24" font-weight="700">Modifiable • personnel • directement exploitable</text>
    </g>
  `;
  return baseSvg({ index: 6, body });
}

function slideSeven(images) {
  const body = `
    ${pill({ x: 72, y: 176, width: 228, label: "ACCÈS GRATUIT", inverse: true })}
    ${textBlock({
      x: 72,
      y: 292,
      lines: ["Votre tableau", "Bâtiment est prêt."],
      size: 72,
      color: palette.paper,
      lineHeight: 1.05,
    })}
    ${textBlock({
      x: 72,
      y: 474,
      lines: ["Prénom + e-mail. Le lien est disponible", "immédiatement et envoyé dans votre boîte mail."],
      size: 28,
      color: "rgba(255,255,255,0.78)",
      weight: 500,
      lineHeight: 1.45,
    })}
    <g transform="translate(72 585)">
      <rect width="936" height="390" rx="34" fill="${palette.paper}" filter="url(#shadow)" />
      <image href="${images.full}" x="28" y="28" width="880" height="334" preserveAspectRatio="xMidYMid meet" />
    </g>
    <g transform="translate(72 1027)">
      <rect width="936" height="104" rx="52" fill="${palette.paper}" />
      <text x="468" y="65" text-anchor="middle" fill="${palette.forestDark}" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="31" font-weight="700">Recevoir gratuitement le tableau →</text>
    </g>
    <text x="540" y="1198" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-family="Avenir Next, Avenir, Arial, sans-serif" font-size="23" font-weight="600">demaa.fr/kit-operationnel/batiment</text>
  `;
  return baseSvg({
    index: 7,
    body,
    background: palette.forest,
    inverse: true,
  });
}

async function renderCard(index, svg) {
  const padded = String(index).padStart(2, "0");
  const svgPath = path.join(OUTPUT_DIR, `${padded}-carousel-batiment.svg`);
  const pngPath = path.join(OUTPUT_DIR, `${padded}-carousel-batiment.png`);

  await fs.writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(pngPath);

  return pngPath;
}

async function buildContactSheet(paths) {
  const thumbWidth = 270;
  const thumbHeight = 338;
  const gap = 18;
  const padding = 30;
  const columns = 4;
  const rows = 2;
  const canvasWidth = padding * 2 + columns * thumbWidth + (columns - 1) * gap;
  const canvasHeight = padding * 2 + rows * thumbHeight + (rows - 1) * gap;
  const composites = [];

  for (const [index, imagePath] of paths.entries()) {
    const thumb = await sharp(imagePath)
      .resize(thumbWidth, thumbHeight, { fit: "cover" })
      .png()
      .toBuffer();
    composites.push({
      input: thumb,
      left: padding + (index % columns) * (thumbWidth + gap),
      top: padding + Math.floor(index / columns) * (thumbHeight + gap),
    });
  }

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: palette.sage,
    },
  })
    .composite(composites)
    .png()
    .toFile(path.join(OUTPUT_DIR, "00-apercu-carrousel.png"));
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const images = await buildPreviewAssets();
  const slides = [
    slideOne(),
    slideTwo(images),
    slideThree(images),
    slideFour(images),
    slideFive(images),
    slideSix(),
    slideSeven(images),
  ];

  const rendered = [];
  for (const [index, svg] of slides.entries()) {
    rendered.push(await renderCard(index + 1, svg));
  }

  await buildContactSheet(rendered);
  console.log(`Generated ${rendered.length} carousel cards in ${OUTPUT_DIR}`);
}

await main();
