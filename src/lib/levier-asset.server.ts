import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const LEVIER_ATTACHMENT_FILENAME = "Levier.xlsx" as const;
export const LEVIER_ASSET_REVISION = "levier-v1-2026-08-03" as const;
export const LEVIER_WORKBOOK_VERSION = "1.0.0" as const;
export const LEVIER_ASSET_SHA256 =
  "424ea3b1b342898650fa14f776cc10d9590157abe15597fd18d271f2d306f22e" as const;

export const LEVIER_ASSET_SNAPSHOT = Object.freeze({
  assetRevision: LEVIER_ASSET_REVISION,
  workbookVersion: LEVIER_WORKBOOK_VERSION,
});

const LEVIER_ASSET_PATH = join(
  process.cwd(),
  "private-assets",
  "levier",
  LEVIER_ATTACHMENT_FILENAME,
);
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export async function readLevierAttachment(): Promise<Buffer | null> {
  try {
    const content = await readFile(LEVIER_ASSET_PATH);
    const isXlsxArchive = content[0] === 0x50 && content[1] === 0x4b;
    const sha256 = createHash("sha256").update(content).digest("hex");
    if (
      !isXlsxArchive ||
      content.length > MAX_ATTACHMENT_BYTES ||
      sha256 !== LEVIER_ASSET_SHA256
    ) return null;
    return content;
  } catch {
    return null;
  }
}
