import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const width = 1536;
const height = 864;
const illustrationBox = { width: 690, height: 670 };
const diagramBox = { width: 760, height: 700 };
const fontRegular = fs
  .readFileSync(path.join(root, "src/app/fonts/satoshi-regular.woff2"))
  .toString("base64");
const fontBold = fs
  .readFileSync(path.join(root, "src/app/fonts/satoshi-bold.woff2"))
  .toString("base64");

const courses = [
  {
    slug: "comprendre-chiffre-affaires-benefice",
    background: "#F1F3F0",
    ink: "#315F46",
    diagram: "profit",
  },
  {
    slug: "fixer-ses-prix-sans-vendre-a-perte",
    background: "#D7E1D9",
    ink: "#315F46",
    diagram: "price",
  },
  {
    slug: "construire-systeme-marketing-vente",
    background: "#F1F3F0",
    ink: "#315F46",
    diagram: "marketing",
  },
  {
    slug: "transformer-demande-en-client",
    background: "#D7E1D9",
    ink: "#315F46",
    diagram: "conversion",
  },
  {
    slug: "deleguer-sans-perdre-le-controle",
    background: "#6F8F7B",
    ink: "#F1F3F0",
    diagram: "delegation",
  },
];

function colorChannels(hex) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16),
  };
}

async function recolorTransparentImage(input, targetColor) {
  const resized = await sharp(input)
    .resize({
      width: illustrationBox.width,
      height: illustrationBox.height,
      fit: "inside",
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.allocUnsafe(resized.info.width * resized.info.height * 4);
  const channels = colorChannels(targetColor);

  for (let pixel = 0; pixel < resized.info.width * resized.info.height; pixel += 1) {
    const offset = pixel * 4;
    rgba[offset] = channels.red;
    rgba[offset + 1] = channels.green;
    rgba[offset + 2] = channels.blue;
    rgba[offset + 3] = resized.data[offset + 3];
  }

  return sharp(rgba, {
    raw: {
      width: resized.info.width,
      height: resized.info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

function arrow(y1, y2, ink) {
  const x = 380;
  return `
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - 13}" stroke="${ink}" stroke-width="4" stroke-linecap="round" opacity="0.65" />
    <path d="M ${x - 9} ${y2 - 22} L ${x} ${y2 - 12} L ${x + 9} ${y2 - 22}" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.65" />
  `;
}

function pill(y, title, detail, ink, options = {}) {
  const { width: pillWidth = 610, emphasis = false } = options;
  const x = (diagramBox.width - pillWidth) / 2;
  const fillOpacity = emphasis ? 0.14 : 0.035;
  return `
    <rect x="${x}" y="${y}" width="${pillWidth}" height="112" rx="28" fill="${ink}" fill-opacity="${fillOpacity}" stroke="${ink}" stroke-width="3" stroke-opacity="0.38" />
    <text x="380" y="${y + 47}" class="pill-title">${title}</text>
    <text x="380" y="${y + 80}" class="pill-detail">${detail}</text>
  `;
}

function diagramMarkup(type, ink) {
  if (type === "profit") {
    return `
      <text x="380" y="92" class="label">VENTES</text>
      <text x="380" y="165" class="value">100 000 €</text>
      ${arrow(198, 260, ink)}
      <text x="380" y="306" class="small-value">− 95 000 € DE CHARGES</text>
      <line x1="145" y1="344" x2="615" y2="344" stroke="${ink}" stroke-width="3" stroke-opacity="0.35" />
      <text x="380" y="408" class="label">BÉNÉFICE RÉEL</text>
      <text x="380" y="500" class="hero-value">5 000 €</text>
    `;
  }

  if (type === "price") {
    return `
      <text x="380" y="88" class="label">COÛTS COMPLETS</text>
      <text x="380" y="164" class="value">78 €</text>
      ${arrow(198, 260, ink)}
      <text x="380" y="304" class="small-value">+ 8 % DE COMMISSION</text>
      <line x1="145" y1="344" x2="615" y2="344" stroke="${ink}" stroke-width="3" stroke-opacity="0.35" />
      <text x="380" y="405" class="label">PRIX MINIMUM</text>
      <text x="380" y="498" class="hero-value">84,78 € HT</text>
    `;
  }

  if (type === "marketing") {
    return `
      ${pill(55, "ATTIRER", "Créer des demandes", ink)}
      ${arrow(177, 235, ink)}
      ${pill(235, "TRANSFORMER", "Faire avancer chaque demande", ink, { emphasis: true })}
      ${arrow(357, 415, ink)}
      ${pill(415, "FIDÉLISER", "Faire revenir les clients", ink)}
    `;
  }

  if (type === "conversion") {
    const rows = [
      ["12", "DEMANDES", 45, 610],
      ["7", "ÉCHANGES", 182, 500],
      ["4", "PROPOSITIONS", 319, 405],
      ["2", "CLIENTS", 456, 315],
    ];
    return rows
      .map(([value, label, y, rowWidth], index) => {
        const x = (diagramBox.width - rowWidth) / 2;
        return `
          <rect x="${x}" y="${y}" width="${rowWidth}" height="106" rx="26" fill="${ink}" fill-opacity="${index === rows.length - 1 ? 0.15 : 0.045}" stroke="${ink}" stroke-width="3" stroke-opacity="0.35" />
          <text x="${x + 40}" y="${y + 68}" class="row-value" text-anchor="start">${value}</text>
          <text x="${x + rowWidth - 35}" y="${y + 64}" class="row-label" text-anchor="end">${label}</text>
        `;
      })
      .join("");
  }

  return `
    ${pill(55, "RÉSULTAT", "Ce qui doit être livré", ink)}
    ${arrow(177, 235, ink)}
    ${pill(235, "AUTONOMIE", "Ce qui peut être décidé", ink, { emphasis: true })}
    ${arrow(357, 415, ink)}
    ${pill(415, "SUIVI", "Trois indicateurs suffisent", ink)}
  `;
}

function createDiagramSvg(type, ink) {
  return Buffer.from(`
    <svg width="${diagramBox.width}" height="${diagramBox.height}" viewBox="0 0 ${diagramBox.width} ${diagramBox.height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @font-face { font-family: Satoshi; src: url(data:font/woff2;base64,${fontRegular}) format('woff2'); font-weight: 400; }
        @font-face { font-family: Satoshi; src: url(data:font/woff2;base64,${fontBold}) format('woff2'); font-weight: 700; }
        text { fill: ${ink}; font-family: Satoshi, Arial, sans-serif; text-anchor: middle; }
        .label { font-size: 27px; font-weight: 700; letter-spacing: 4px; }
        .value { font-size: 67px; font-weight: 700; letter-spacing: -2px; }
        .small-value { font-size: 31px; font-weight: 700; }
        .hero-value { font-size: 82px; font-weight: 700; letter-spacing: -3px; }
        .pill-title { font-size: 31px; font-weight: 700; letter-spacing: 2px; }
        .pill-detail { font-size: 22px; font-weight: 400; opacity: 0.76; }
        .row-value { font-size: 48px; font-weight: 700; }
        .row-label { font-size: 27px; font-weight: 700; letter-spacing: 2px; }
      </style>
      ${diagramMarkup(type, ink)}
    </svg>
  `);
}

await fs.promises.mkdir(path.join(root, "public/images/academy/thumbnails"), {
  recursive: true,
});

for (const course of courses) {
  const illustrationPath = path.join(
    root,
    `public/images/academy/illustrations/${course.slug}-v2.png`,
  );
  const outputPath = path.join(
    root,
    `public/images/academy/thumbnails/${course.slug}-v1.png`,
  );
  const illustration = await recolorTransparentImage(illustrationPath, course.ink);
  const diagram = await sharp(createDiagramSvg(course.diagram, course.ink))
    .png()
    .toBuffer({ resolveWithObject: true });

  await sharp({
    create: { width, height, channels: 4, background: course.background },
  })
    .composite([
      {
        input: illustration.data,
        left: 18,
        top: Math.round((height - illustration.info.height) / 2) + 14,
      },
      {
        input: diagram.data,
        left: width - diagram.info.width - 28,
        top: Math.round((height - diagram.info.height) / 2),
      },
    ])
    .png()
    .toFile(outputPath);

  console.log(path.relative(root, outputPath));
}

