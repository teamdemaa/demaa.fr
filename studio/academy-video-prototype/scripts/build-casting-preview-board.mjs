import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "output", "casting-v2");
const courses = [
  {
    slug: "01-gestion-tresorerie",
    previous: "01-gestion-tresorerie.png",
  },
  {
    slug: "02-chiffre-affaires-benefice",
    previous: "02-chiffre-affaires-benefice.png",
  },
  {
    slug: "03-fixer-ses-prix",
    previous: "03-fixer-ses-prix.png",
  },
  {
    slug: "04-transformer-demande-client",
    previous: "04-transformer-demande-client.png",
  },
  {
    slug: "05-deleguer-sans-perdre-controle",
    previous: "05-deleguer-sans-perdre-controle.png",
  },
];

const cellWidth = 960;
const cellHeight = 540;
const headerHeight = 92;
const forest = "#173e2e";

const labelSvg = (label, width, height, x = "50%") =>
  Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>
        text {
          font-family: Arial, sans-serif;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 5px;
          fill: #f7f4ed;
        }
      </style>
      <text x="${x}" y="58" text-anchor="middle">${label}</text>
    </svg>
  `);

const resizeCell = (file) =>
  sharp(file).resize(cellWidth, cellHeight, {fit: "fill"}).png().toBuffer();

const comparisonCanvas = sharp({
  create: {
    width: cellWidth * 2,
    height: headerHeight + cellHeight * courses.length,
    channels: 4,
    background: forest,
  },
});

const comparisonLayers = [
  {
    input: labelSvg("PREMIER ESSAI", cellWidth, headerHeight),
    left: 0,
    top: 0,
  },
  {
    input: labelSvg("CORRECTION", cellWidth, headerHeight),
    left: cellWidth,
    top: 0,
  },
];

for (const [index, course] of courses.entries()) {
  comparisonLayers.push(
    {
      input: await resizeCell(
        path.join(root, "output", "casting-v1", "after", course.previous),
      ),
      left: 0,
      top: headerHeight + index * cellHeight,
    },
    {
      input: await resizeCell(
        path.join(outputDir, "previews", `${course.slug}.png`),
      ),
      left: cellWidth,
      top: headerHeight + index * cellHeight,
    },
  );
}

await comparisonCanvas
  .composite(comparisonLayers)
  .png()
  .toFile(path.join(outputDir, "planche-avant-apres-5-cours.png"));

const safeOverlay = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${cellWidth}" height="${cellHeight}">
    <rect x="0" y="0" width="120" height="${cellHeight}" fill="rgba(8,28,20,0.62)" />
    <rect x="840" y="0" width="120" height="${cellHeight}" fill="rgba(8,28,20,0.62)" />
    <line x1="120" y1="0" x2="120" y2="${cellHeight}" stroke="#d7e3da" stroke-width="3" stroke-dasharray="12 10" />
    <line x1="840" y1="0" x2="840" y2="${cellHeight}" stroke="#d7e3da" stroke-width="3" stroke-dasharray="12 10" />
  </svg>
`);

const safeRows = Math.ceil(courses.length / 2);
const safeCanvas = sharp({
  create: {
    width: cellWidth * 2,
    height: headerHeight + cellHeight * safeRows,
    channels: 4,
    background: forest,
  },
});
const safeLayers = [
  {
    input: labelSvg("SAFE ZONE CENTRALE 4:3", cellWidth * 2, headerHeight),
    left: 0,
    top: 0,
  },
];

for (const [index, course] of courses.entries()) {
  const left = (index % 2) * cellWidth;
  const top = headerHeight + Math.floor(index / 2) * cellHeight;
  safeLayers.push(
    {
      input: await resizeCell(
        path.join(outputDir, "previews", `${course.slug}.png`),
      ),
      left,
      top,
    },
    {
      input: safeOverlay,
      left,
      top,
    },
  );
}

await safeCanvas
  .composite(safeLayers)
  .png()
  .toFile(path.join(outputDir, "planche-safe-zone-4x3.png"));

console.log(`Preview boards written to ${outputDir}`);
