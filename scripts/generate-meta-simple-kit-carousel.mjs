import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "marketing", "meta", "carrousel-simple-kit");
const SOURCE_SCREENS = path.join(
  ROOT,
  "marketing",
  "meta",
  "general-lead-magnet",
  "source-screens",
);
const WIDTH = 1080;
const HEIGHT = 1350;

const colors = {
  canvas: "#F7F8F6",
  text: "#17231D",
  forest: "#315F46",
  line: "#ECEEED",
  muted: "#6F756E",
  paper: "#FFFFFF",
  positive: "#EAF3ED",
};

let embeddedFonts = "";

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function dataUri(buffer, mime = "image/png") {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function loadImage(filePath, extract) {
  let image = sharp(filePath);
  if (extract) image = image.extract(extract);
  return dataUri(await image.png().toBuffer());
}

async function loadFonts() {
  const fontDir = path.join(ROOT, "src", "app", "fonts");
  const [regular, medium, bold, gambetta] = await Promise.all([
    fs.readFile(path.join(fontDir, "satoshi-regular.woff2")),
    fs.readFile(path.join(fontDir, "satoshi-medium.woff2")),
    fs.readFile(path.join(fontDir, "satoshi-bold.woff2")),
    fs.readFile(path.join(fontDir, "gambetta-light-italic.woff2")),
  ]);

  embeddedFonts = `
    @font-face { font-family: "Satoshi"; src: url("${dataUri(regular, "font/woff2")}") format("woff2"); font-weight: 400; }
    @font-face { font-family: "Satoshi"; src: url("${dataUri(medium, "font/woff2")}") format("woff2"); font-weight: 500; }
    @font-face { font-family: "Satoshi"; src: url("${dataUri(bold, "font/woff2")}") format("woff2"); font-weight: 700; }
    @font-face { font-family: "Gambetta"; src: url("${dataUri(gambetta, "font/woff2")}") format("woff2"); font-weight: 300; font-style: italic; }
  `;
}

function text({
  x,
  y,
  lines,
  size,
  color = colors.text,
  weight = 500,
  lineHeight = 1.12,
  anchor = "start",
}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="Satoshi" font-size="${size}" font-weight="${weight}">
    ${lines
      .map(
        (line, index) =>
          `<tspan x="${x}" dy="${index === 0 ? 0 : size * lineHeight}">${escapeXml(line)}</tspan>`,
      )
      .join("\n")}
  </text>`;
}

function header(index, inverse = false) {
  return `
    <text x="72" y="100" fill="${inverse ? colors.paper : colors.text}" font-family="Gambetta" font-size="49" font-weight="300" font-style="italic" letter-spacing="-1.4">Demaa</text>
    <text x="1008" y="96" text-anchor="end" fill="${inverse ? "rgba(255,255,255,0.64)" : colors.muted}" font-family="Satoshi" font-size="18" font-weight="500">${String(index).padStart(2, "0")} / 05</text>
    <line x1="72" y1="132" x2="1008" y2="132" stroke="${inverse ? "rgba(255,255,255,0.16)" : colors.line}" />
  `;
}

function base({ index, body, inverse = false }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <style>${embeddedFonts}</style>
    <defs>
      <filter id="appShadow" x="-15%" y="-15%" width="130%" height="145%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#17231D" flood-opacity="0.035" />
      </filter>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${inverse ? colors.forest : colors.canvas}" />
    ${header(index, inverse)}
    ${body}
  </svg>`;
}

function eyebrow(label, y = 193, inverse = false) {
  return `<text x="72" y="${y}" fill="${inverse ? "rgba(255,255,255,0.72)" : colors.forest}" font-family="Satoshi" font-size="17" font-weight="700" letter-spacing="1.7">${escapeXml(label.toUpperCase())}</text>`;
}

function appSurface({ x = 72, y, width = 936, height, image, fit = "contain" }) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20" fill="${colors.paper}" stroke="${colors.line}" filter="url(#appShadow)" />
    <clipPath id="clip-${x}-${y}"><rect x="${x + 1}" y="${y + 1}" width="${width - 2}" height="${height - 2}" rx="19" /></clipPath>
    <image href="${image}" x="${x + 1}" y="${y + 1}" width="${width - 2}" height="${height - 2}" preserveAspectRatio="xMidYMid ${fit === "cover" ? "slice" : "meet"}" clip-path="url(#clip-${x}-${y})" />
  `;
}

function stepFooter(label, index, inverse = false) {
  return `
    <text x="72" y="1270" fill="${inverse ? "rgba(255,255,255,0.72)" : colors.muted}" font-family="Satoshi" font-size="17" font-weight="500">${escapeXml(label)}</text>
    <g transform="translate(901 1264)">
      ${Array.from({ length: 5 }, (_, position) => {
        const active = position + 1 === index;
        return `<circle cx="${position * 27}" cy="0" r="${active ? 5 : 4}" fill="${
          active
            ? inverse
              ? colors.paper
              : colors.forest
            : inverse
              ? "rgba(255,255,255,0.24)"
              : "#D9DEDA"
        }" />`;
      }).join("")}
    </g>
  `;
}

async function prepareImages() {
  return {
    kit: await loadImage(
      path.join(ROOT, "public/images/kits/batiment/tableau-suivi-preview.webp"),
    ),
    search: await loadImage(path.join(SOURCE_SCREENS, "recherche-metier.png"), {
      left: 390,
      top: 205,
      width: 930,
      height: 590,
    }),
    pilotage: await loadImage(path.join(SOURCE_SCREENS, "pilotage.png"), {
      left: 60,
      top: 55,
      width: 1585,
      height: 835,
    }),
  };
}

function buildSlides(images) {
  return [
    base({
      index: 1,
      body: `
        ${text({
          x: 72,
          y: 300,
          lines: [
            "Si vous vous absentiez",
            "pendant 1 mois,",
            "votre entreprise",
            "continuerait-elle à tourner ?",
          ],
          size: 65,
          weight: 500,
          lineHeight: 1.16,
        })}
        <line x1="72" y1="745" x2="1008" y2="745" stroke="${colors.line}" />
        ${text({
          x: 72,
          y: 835,
          lines: [
            "Le Kit opérationnel Demaa vous aide",
            "à rendre la réponse évidente.",
          ],
          size: 31,
          color: colors.muted,
          weight: 400,
          lineHeight: 1.42,
        })}
        <rect x="72" y="1010" width="258" height="52" rx="26" fill="${colors.paper}" stroke="${colors.line}" />
        <text x="201" y="1043" text-anchor="middle" fill="${colors.forest}" font-family="Satoshi" font-size="17" font-weight="500">Découvrez votre Kit →</text>
        ${stepFooter("Faites défiler", 1)}
      `,
    }),
    base({
      index: 2,
      body: `
        ${eyebrow("Votre Kit opérationnel")}
        ${text({
          x: 72,
          y: 282,
          lines: ["Une vision claire.", "Un fichier prêt à utiliser."],
          size: 51,
          weight: 500,
          lineHeight: 1.12,
        })}
        ${appSurface({ y: 440, height: 705, image: images.kit })}
        <rect x="813" y="1093" width="154" height="36" rx="18" fill="${colors.positive}" />
        <text x="890" y="1117" text-anchor="middle" fill="${colors.forest}" font-family="Satoshi" font-size="14" font-weight="500">APERÇU RÉEL</text>
        ${stepFooter("Votre entreprise, au même endroit", 2)}
      `,
    }),
    base({
      index: 3,
      body: `
        ${eyebrow("Comment ça marche ?")}
        ${text({
          x: 72,
          y: 282,
          lines: ["Sélectionnez simplement", "votre activité."],
          size: 54,
          weight: 500,
          lineHeight: 1.12,
        })}
        ${appSurface({ y: 440, height: 705, image: images.search })}
        ${stepFooter("Restaurant, commerce, cabinet, bâtiment…", 3)}
      `,
    }),
    base({
      index: 4,
      body: `
        ${eyebrow("Un espace adapté à votre entreprise")}
        ${text({
          x: 72,
          y: 282,
          lines: ["Pilotez l’essentiel.", "Sans partir de zéro."],
          size: 54,
          weight: 500,
          lineHeight: 1.12,
        })}
        ${appSurface({ y: 440, height: 625, image: images.pilotage })}
        <g transform="translate(72 1105)">
          ${["Pilotage", "Finance", "Actions", "Process", "Équipe", "Outils"]
            .map((label, index) => {
              const widths = [132, 121, 123, 128, 112, 106];
              const x = widths
                .slice(0, index)
                .reduce((sum, width) => sum + width + 12, 0);
              return `
                <rect x="${x}" y="0" width="${widths[index]}" height="48" rx="24" fill="${index === 3 ? colors.positive : colors.paper}" stroke="${colors.line}" />
                <text x="${x + widths[index] / 2}" y="31" text-anchor="middle" fill="${index === 3 ? colors.forest : colors.text}" font-family="Satoshi" font-size="16" font-weight="500">${label}</text>
              `;
            })
            .join("")}
        </g>
        ${stepFooter("Vos chiffres, vos actions, votre organisation", 4)}
      `,
    }),
    base({
      index: 5,
      inverse: true,
      body: `
        ${eyebrow("Votre Kit est gratuit", 220, true)}
        ${text({
          x: 72,
          y: 320,
          lines: ["Choisissez votre activité.", "Découvrez votre Kit."],
          size: 57,
          color: colors.paper,
          weight: 500,
          lineHeight: 1.14,
        })}
        <rect x="72" y="505" width="936" height="550" rx="20" fill="${colors.paper}" />
        <image href="${images.kit}" x="73" y="506" width="934" height="548" preserveAspectRatio="xMidYMid meet" />
        <rect x="72" y="1095" width="936" height="72" rx="36" fill="${colors.paper}" />
        <text x="540" y="1140" text-anchor="middle" fill="${colors.forest}" font-family="Satoshi" font-size="22" font-weight="700">Trouver le Kit de mon entreprise →</text>
        ${stepFooter("demaa.fr", 5, true)}
      `,
    }),
  ];
}

async function createContactSheet(pngFiles) {
  const thumbWidth = 216;
  const thumbHeight = 270;
  const gap = 16;
  const outer = 28;
  const canvasWidth = outer * 2 + thumbWidth * 5 + gap * 4;
  const canvasHeight = outer * 2 + thumbHeight;
  const composites = [];

  for (let index = 0; index < pngFiles.length; index += 1) {
    composites.push({
      input: await sharp(pngFiles[index])
        .resize(thumbWidth, thumbHeight, { fit: "cover" })
        .png()
        .toBuffer(),
      left: outer + index * (thumbWidth + gap),
      top: outer,
    });
  }

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: colors.canvas,
    },
  })
    .composite(composites)
    .png()
    .toFile(path.join(OUTPUT_DIR, "00-apercu.png"));
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await loadFonts();
  const images = await prepareImages();
  const slides = buildSlides(images);
  const pngFiles = [];

  for (let index = 0; index < slides.length; index += 1) {
    const number = String(index + 1).padStart(2, "0");
    const svgPath = path.join(OUTPUT_DIR, `${number}-carte.svg`);
    const pngPath = path.join(OUTPUT_DIR, `${number}-carte.png`);
    await fs.writeFile(svgPath, slides[index], "utf8");
    await sharp(Buffer.from(slides[index])).png().toFile(pngPath);
    pngFiles.push(pngPath);
  }

  await createContactSheet(pngFiles);
  console.log(`Generated ${slides.length} cards in ${OUTPUT_DIR}`);
}

await main();
