import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const sourcePath = path.join(
  projectRoot,
  "docs/assets/demaa-casting-12-personnages-v1.png",
);
const outputDir = path.join(
  projectRoot,
  "public/images/marketing-ethique/personnages",
);

const columns = 4;
const rows = 3;
const cellSize = 362;

await mkdir(outputDir, { recursive: true });

for (let index = 0; index < columns * rows; index += 1) {
  const column = index % columns;
  const row = Math.floor(index / columns);
  const { data, info } = await sharp(sourcePath)
    .extract({
      left: column * cellSize,
      top: row * cellSize,
      width: cellSize,
      height: cellSize,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const neutralBrightness = Math.min(red, green, blue);
    const alpha = Math.max(
      0,
      Math.min(255, Math.round(((neutralBrightness - 72) / 150) * 255)),
    );

    data[offset] = 246;
    data[offset + 1] = 242;
    data[offset + 2] = 231;
    data[offset + 3] = alpha;
  }

  const fileName = `personnage-${String(index + 1).padStart(2, "0")}.png`;
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, fileName));
}

console.log(`12 personnages extraits dans ${outputDir}`);
