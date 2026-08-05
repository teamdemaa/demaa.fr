import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const width = 1536;
const height = 864;
const background = "#6F8F7B";
const lineColor = { red: 241, green: 243, blue: 240 };
const illustrationPath = path.join(
  root,
  "public/images/academy/illustrations/piloter-sa-tresorerie-v2.png",
);
const generatedChartPath = path.join(
  root,
  "studio/academy-course-pack-v1/sources/thumbnails/piloter-sa-tresorerie-chart-generated-v3.png",
);
const outputPath = path.join(
  root,
  "public/images/academy/thumbnails/piloter-sa-tresorerie-test.png",
);

async function recolorTransparentImage(input, targetWidth, targetHeight) {
  const resized = await sharp(input)
    .resize({ width: targetWidth, height: targetHeight, fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.allocUnsafe(resized.info.width * resized.info.height * 4);

  for (let pixel = 0; pixel < resized.info.width * resized.info.height; pixel += 1) {
    const offset = pixel * 4;
    rgba[offset] = lineColor.red;
    rgba[offset + 1] = lineColor.green;
    rgba[offset + 2] = lineColor.blue;
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

async function extractChart() {
  const crop = await sharp(generatedChartPath)
    .extract({ left: 735, top: 95, width: 920, height: 745 })
    .resize({ width: 810, height: 670, fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.allocUnsafe(crop.info.width * crop.info.height * 4);

  for (let pixel = 0; pixel < crop.info.width * crop.info.height; pixel += 1) {
    const offset = pixel * 4;
    const red = crop.data[offset];
    const green = crop.data[offset + 1];
    const blue = crop.data[offset + 2];
    const luminance = red * 0.22 + green * 0.7 + blue * 0.08;
    const alpha = Math.max(0, Math.min(255, Math.round((luminance - 175) * 4)));

    rgba[offset] = lineColor.red;
    rgba[offset + 1] = lineColor.green;
    rgba[offset + 2] = lineColor.blue;
    rgba[offset + 3] = alpha;
  }

  return sharp(rgba, {
    raw: {
      width: crop.info.width,
      height: crop.info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

const [illustration, chart] = await Promise.all([
  recolorTransparentImage(illustrationPath, 720, 700),
  extractChart(),
]);

await sharp({
  create: { width, height, channels: 4, background },
})
  .composite([
    {
      input: illustration.data,
      left: 20,
      top: Math.round((height - illustration.info.height) / 2) + 28,
    },
    {
      input: chart.data,
      left: width - chart.info.width - 42,
      top: Math.round((height - chart.info.height) / 2),
    },
  ])
  .png()
  .toFile(outputPath);

console.log(path.relative(root, outputPath));
