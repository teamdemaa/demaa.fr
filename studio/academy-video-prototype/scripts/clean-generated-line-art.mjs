import process from "node:process";
import sharp from "sharp";

const [input, output, strokeRadiusRaw = "0"] = process.argv.slice(2);
const strokeRadius = Number.parseInt(strokeRadiusRaw, 10);

if (
  !input ||
  !output ||
  !Number.isInteger(strokeRadius) ||
  strokeRadius < 0 ||
  strokeRadius > 4
) {
  console.error(
    "Usage: node scripts/clean-generated-line-art.mjs <input.png> <output.png> [stroke-radius: 0..4]",
  );
  process.exit(1);
}

const {data, info} = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({resolveWithObject: true});

for (let index = 0; index < data.length; index += 4) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const alpha = data[index + 3];

  if (alpha === 0) {
    continue;
  }

  const saturatedMagenta =
    red > 160 &&
    blue > 140 &&
    red - green > 4 &&
    blue - green > 4;

  if (saturatedMagenta) {
    data[index + 3] = 0;
    continue;
  }

  const sageAccent = green - red > 2 && green - blue > 2;

  if (sageAccent) {
    data[index] = 215;
    data[index + 1] = 227;
    data[index + 2] = 218;
  } else {
    data[index] = 255;
    data[index + 1] = 255;
    data[index + 2] = 255;
  }
}

if (strokeRadius > 0) {
  const alpha = Buffer.alloc(info.width * info.height);

  for (let pixel = 0; pixel < alpha.length; pixel += 1) {
    alpha[pixel] = data[pixel * 4 + 3] >= 24 ? 255 : 0;
  }

  const expandedAlpha = Buffer.alloc(alpha.length);

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (alpha[y * info.width + x] === 0) {
        continue;
      }

      for (let offsetY = -strokeRadius; offsetY <= strokeRadius; offsetY += 1) {
        const targetY = y + offsetY;
        if (targetY < 0 || targetY >= info.height) {
          continue;
        }

        for (
          let offsetX = -strokeRadius;
          offsetX <= strokeRadius;
          offsetX += 1
        ) {
          const targetX = x + offsetX;
          if (targetX < 0 || targetX >= info.width) {
            continue;
          }
          expandedAlpha[targetY * info.width + targetX] = 255;
        }
      }
    }
  }

  for (let pixel = 0; pixel < expandedAlpha.length; pixel += 1) {
    const index = pixel * 4;
    if (expandedAlpha[pixel] === 0) {
      data[index + 3] = 0;
      continue;
    }

    if (data[index + 3] < 24) {
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
    }
    data[index + 3] = 255;
  }
}

await sharp(data, {raw: info}).png().toFile(output);
console.log(
  `Line art cleaned: ${output} (stroke radius: ${strokeRadius}px)`,
);
