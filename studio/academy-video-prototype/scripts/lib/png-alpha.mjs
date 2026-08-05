import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {inflateSync} from "node:zlib";

const PNG_SIGNATURE = "89504e470d0a1a0a";

const paeth = (left, above, upperLeft) => {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) {
    return left;
  }
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
};

const decodePng = async (file) => {
  const source = await readFile(file);
  if (source.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) {
    throw new Error(`Signature PNG invalide : ${file}`);
  }

  let offset = 8;
  let header;
  const compressedChunks = [];
  while (offset < source.length) {
    const length = source.readUInt32BE(offset);
    const type = source.subarray(offset + 4, offset + 8).toString("ascii");
    const data = source.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;
    if (type === "IHDR") {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === "IDAT") {
      compressedChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (!header) {
    throw new Error(`IHDR absent : ${file}`);
  }
  if (
    header.bitDepth !== 8 ||
    ![2, 6].includes(header.colorType) ||
    header.interlace !== 0
  ) {
    throw new Error(
      `PNG non pris en charge (${header.bitDepth}/${header.colorType}/${header.interlace}) : ${file}`,
    );
  }

  const bytesPerPixel = header.colorType === 6 ? 4 : 3;
  const stride = header.width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(compressedChunks));
  const previous = Buffer.alloc(stride);
  let cursor = 0;
  const rows = [];

  for (let y = 0; y < header.height; y += 1) {
    const filter = inflated[cursor];
    cursor += 1;
    const scanline = Buffer.alloc(stride);
    for (let index = 0; index < stride; index += 1) {
      const raw = inflated[cursor + index];
      const left =
        index >= bytesPerPixel ? scanline[index - bytesPerPixel] : 0;
      const above = previous[index];
      const upperLeft =
        index >= bytesPerPixel ? previous[index - bytesPerPixel] : 0;
      if (filter === 0) scanline[index] = raw;
      else if (filter === 1) scanline[index] = (raw + left) & 255;
      else if (filter === 2) scanline[index] = (raw + above) & 255;
      else if (filter === 3) {
        scanline[index] = (raw + Math.floor((left + above) / 2)) & 255;
      } else if (filter === 4) {
        scanline[index] = (raw + paeth(left, above, upperLeft)) & 255;
      } else {
        throw new Error(`Filtre PNG inconnu (${filter}) : ${file}`);
      }
    }
    cursor += stride;
    rows.push(scanline);
    scanline.copy(previous);
  }

  return {source, header, bytesPerPixel, rows};
};

export const inspectPngAlpha = async (file, alphaThreshold = 8) => {
  const {source, header, bytesPerPixel, rows} = await decodePng(file);
  if (header.colorType !== 6) {
    throw new Error(`Canal alpha PNG absent : ${file}`);
  }
  let minX = header.width;
  let minY = header.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < header.height; y += 1) {
    const scanline = rows[y];
    for (let x = 0; x < header.width; x += 1) {
      if (scanline[x * bytesPerPixel + 3] >= alphaThreshold) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error(`Aucun pixel visible dans : ${file}`);
  }

  return {
    sha256: createHash("sha256").update(source).digest("hex"),
    imageWidth: header.width,
    imageHeight: header.height,
    alphaThreshold,
    alphaBoundingBox: {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    },
  };
};

export const inspectPngRegion = async (
  file,
  {x, y, width, height, predicate},
) => {
  const {header, bytesPerPixel, rows} = await decodePng(file);
  const left = Math.max(0, Math.floor(x));
  const top = Math.max(0, Math.floor(y));
  const right = Math.min(header.width, Math.ceil(x + width));
  const bottom = Math.min(header.height, Math.ceil(y + height));
  let matchingPixels = 0;
  let sampledPixels = 0;
  let minX = right;
  let minY = bottom;
  let maxX = left - 1;
  let maxY = top - 1;
  for (let row = top; row < bottom; row += 1) {
    const scanline = rows[row];
    for (let column = left; column < right; column += 1) {
      const index = column * bytesPerPixel;
      const red = scanline[index];
      const green = scanline[index + 1];
      const blue = scanline[index + 2];
      const alpha = bytesPerPixel === 4 ? scanline[index + 3] : 255;
      sampledPixels += 1;
      if (predicate({red, green, blue, alpha})) {
        matchingPixels += 1;
        minX = Math.min(minX, column);
        minY = Math.min(minY, row);
        maxX = Math.max(maxX, column);
        maxY = Math.max(maxY, row);
      }
    }
  }
  return {
    imageWidth: header.width,
    imageHeight: header.height,
    sampledPixels,
    matchingPixels,
    matchingRatio: sampledPixels ? matchingPixels / sampledPixels : 0,
    matchingBoundingBox:
      matchingPixels > 0
        ? {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
          }
        : null,
  };
};
