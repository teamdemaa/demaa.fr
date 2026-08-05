import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const ILLUSTRATIONS_DIR = path.join(ROOT, "public/images/academy/illustrations");
const REVIEW_PATH = path.join(
  ROOT,
  "studio/academy-course-pack-v1/review/illustrations-v2-comparison.png",
);
const CANVAS = { width: 1536, height: 1024 };
const SAFE_AREA = { width: 1280, height: 820 };
const TARGET_STROKE = 7;

const illustrations = [
  { slug: "piloter-sa-tresorerie" },
  { slug: "comprendre-chiffre-affaires-benefice" },
  { slug: "fixer-ses-prix-sans-vendre-a-perte", closeSmallGaps: true },
  { slug: "construire-systeme-marketing-vente" },
  {
    slug: "transformer-demande-en-client",
    source: path.join(
      ROOT,
      "studio/academy-course-pack-v1/sources/transformer-demande-en-client-v2-transparent.png",
    ),
  },
  { slug: "deleguer-sans-perdre-le-controle" },
];

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0
    ? (ordered[middle - 1] + ordered[middle]) / 2
    : ordered[middle];
}

function measureStroke(alpha, width, height) {
  const runs = [];

  const collectRuns = (length, isOpaque) => {
    let start = -1;
    for (let index = 0; index <= length; index += 1) {
      const active = index < length && isOpaque(index);
      if (active && start === -1) start = index;
      if (!active && start !== -1) {
        const run = index - start;
        if (run >= 2 && run <= 24) runs.push(run);
        start = -1;
      }
    }
  };

  for (let y = 0; y < height; y += 1) {
    collectRuns(width, (x) => alpha[y * width + x] >= 128);
  }
  for (let x = 0; x < width; x += 1) {
    collectRuns(height, (y) => alpha[y * width + x] >= 128);
  }

  return median(runs);
}

async function morph(alpha, width, height, operation, radius = 1) {
  let pipeline = sharp(alpha, { raw: { width, height, channels: 1 } });
  pipeline = operation === "dilate" ? pipeline.dilate(radius) : pipeline.erode(radius);
  return pipeline.greyscale().raw().toBuffer();
}

function blendMasks(base, altered, weight) {
  const output = Buffer.allocUnsafe(base.length);
  for (let index = 0; index < base.length; index += 1) {
    output[index] = Math.round(base[index] * (1 - weight) + altered[index] * weight);
  }
  return output;
}

async function closeSmallGaps(alpha, width, height) {
  const expanded = await morph(alpha, width, height, "dilate", 1);
  return morph(expanded, width, height, "erode", 1);
}

async function calibrateStroke(alpha, width, height) {
  const thinner1 = await morph(alpha, width, height, "erode", 1);
  const thinner2 = await morph(alpha, width, height, "erode", 2);
  const thicker1 = await morph(alpha, width, height, "dilate", 1);
  const thicker2 = await morph(alpha, width, height, "dilate", 2);
  const candidates = [{ mask: alpha, adjustment: "none", strength: 0 }];

  for (const [operation, altered] of [
    ["erode-1", thinner1],
    ["erode-2", thinner2],
    ["dilate-1", thicker1],
    ["dilate-2", thicker2],
  ]) {
    for (const weight of [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]) {
      candidates.push({
        mask: blendMasks(alpha, altered, weight),
        adjustment: `${operation}@${weight}`,
        strength: Number(operation.endsWith("2")) + weight,
      });
    }
  }

  return candidates
    .map((candidate) => ({
      ...candidate,
      stroke: measureStroke(candidate.mask, width, height),
    }))
    .sort((a, b) => {
      const strokeDifference =
        Math.abs(a.stroke - TARGET_STROKE) - Math.abs(b.stroke - TARGET_STROKE);
      return strokeDifference || a.strength - b.strength;
    })[0];
}

async function normalizedAlpha(source, shouldCloseSmallGaps) {
  const sourceImage = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const sourceAlpha = Buffer.allocUnsafe(sourceImage.info.width * sourceImage.info.height);
  let minX = sourceImage.info.width;
  let minY = sourceImage.info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < sourceImage.info.height; y += 1) {
    for (let x = 0; x < sourceImage.info.width; x += 1) {
      const sourceOffset = (y * sourceImage.info.width + x) * sourceImage.info.channels;
      const alpha = sourceImage.data[sourceOffset + sourceImage.info.channels - 1];
      sourceAlpha[y * sourceImage.info.width + x] = alpha;
      if (alpha > 5) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error(`No visible line art found in ${source}`);
  }

  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;
  const trimmedAlpha = Buffer.allocUnsafe(trimmedWidth * trimmedHeight);
  for (let y = 0; y < trimmedHeight; y += 1) {
    const sourceStart = (minY + y) * sourceImage.info.width + minX;
    sourceAlpha.copy(trimmedAlpha, y * trimmedWidth, sourceStart, sourceStart + trimmedWidth);
  }

  const resized = await sharp(trimmedAlpha, {
    raw: {
      width: trimmedWidth,
      height: trimmedHeight,
      channels: 1,
    },
  })
    .resize({
      width: SAFE_AREA.width,
      height: SAFE_AREA.height,
      fit: "inside",
      withoutEnlargement: false,
    })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const left = Math.floor((CANVAS.width - resized.info.width) / 2);
  const top = Math.floor((CANVAS.height - resized.info.height) / 2);

  let alpha = Buffer.alloc(CANVAS.width * CANVAS.height);
  for (let y = 0; y < resized.info.height; y += 1) {
    const sourceStart = y * resized.info.width;
    const targetStart = (top + y) * CANVAS.width + left;
    resized.data.copy(alpha, targetStart, sourceStart, sourceStart + resized.info.width);
  }

  if (shouldCloseSmallGaps) {
    alpha = await closeSmallGaps(alpha, CANVAS.width, CANVAS.height);
  }

  return alpha;
}

async function writeWhiteLineArt(alpha, output) {
  const rgba = Buffer.allocUnsafe(CANVAS.width * CANVAS.height * 4);
  for (let pixel = 0; pixel < CANVAS.width * CANVAS.height; pixel += 1) {
    const offset = pixel * 4;
    rgba[offset] = 255;
    rgba[offset + 1] = 255;
    rgba[offset + 2] = 255;
    rgba[offset + 3] = alpha[pixel];
  }

  await sharp(rgba, { raw: { ...CANVAS, channels: 4 } }).png().toFile(output);
}

async function cardBuffer(asset, background, lineColor) {
  const width = 640;
  const height = 360;
  const resized = await sharp(asset)
    .resize({ width: 580, height: 320, fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const red = Number.parseInt(lineColor.slice(1, 3), 16);
  const green = Number.parseInt(lineColor.slice(3, 5), 16);
  const blue = Number.parseInt(lineColor.slice(5, 7), 16);
  const colored = Buffer.allocUnsafe(resized.info.width * resized.info.height * 4);
  for (let pixel = 0; pixel < resized.info.width * resized.info.height; pixel += 1) {
    const offset = pixel * 4;
    colored[offset] = red;
    colored[offset + 1] = green;
    colored[offset + 2] = blue;
    colored[offset + 3] = resized.data[offset + 3];
  }
  const illustration = await sharp(colored, {
    raw: {
      width: resized.info.width,
      height: resized.info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  return sharp({
    create: { width, height, channels: 4, background },
  })
    .composite([{ input: illustration, gravity: "centre" }])
    .png()
    .toBuffer();
}

async function writeComparisonBoard(outputs) {
  const cardWidth = 640;
  const cardHeight = 360;
  const gap = 20;
  const padding = 24;
  const boardWidth = padding * 2 + cardWidth * 2 + gap;
  const boardHeight = padding * 2 + cardHeight * outputs.length + gap * (outputs.length - 1);
  const composites = [];

  for (let row = 0; row < outputs.length; row += 1) {
    const top = padding + row * (cardHeight + gap);
    composites.push({
      input: await cardBuffer(outputs[row], "#F1F3F0", "#315F46"),
      left: padding,
      top,
    });
    composites.push({
      input: await cardBuffer(outputs[row], "#6F8F7B", "#F1F3F0"),
      left: padding + cardWidth + gap,
      top,
    });
  }

  await sharp({
    create: { width: boardWidth, height: boardHeight, channels: 4, background: "#FFFFFF" },
  })
    .composite(composites)
    .png()
    .toFile(REVIEW_PATH);
}

const outputs = [];

for (const illustration of illustrations) {
  const source =
    illustration.source ?? path.join(ILLUSTRATIONS_DIR, `${illustration.slug}.png`);
  const output = path.join(ILLUSTRATIONS_DIR, `${illustration.slug}-v2.png`);
  const alpha = await normalizedAlpha(source, illustration.closeSmallGaps);
  const calibrated = await calibrateStroke(alpha, CANVAS.width, CANVAS.height);

  await writeWhiteLineArt(calibrated.mask, output);
  outputs.push(output);
  console.log(
    `${illustration.slug}: ${calibrated.stroke}px (${calibrated.adjustment})${
      illustration.closeSmallGaps ? " + small-gap closing" : ""
    }`,
  );
}

await writeComparisonBoard(outputs);
console.log(`Comparison board: ${path.relative(ROOT, REVIEW_PATH)}`);
