import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  LEVIER_ASSET_REVISION,
  buildLevierGoogleSheetsCopyUrl,
  getLevierAssetSnapshot,
  getLevierCopyUrl,
  parseLevierGoogleSheetsCopyUrl,
} from "@/lib/levier-asset.server";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

const SHEET_ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890";
const COPY_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/copy`;

describe("Levier private Google Sheets contract", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts only an exact Google Sheets /copy URL", () => {
    expect(parseLevierGoogleSheetsCopyUrl(COPY_URL)).toBe(SHEET_ID);
    expect(buildLevierGoogleSheetsCopyUrl(SHEET_ID)).toBe(COPY_URL);

    for (const invalid of [
      "http://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890/copy",
      "https://drive.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890/copy",
      "https://docs.google.com/spreadsheets/d/short/copy",
      "https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890/edit",
      `${COPY_URL}?usp=sharing`,
      `${COPY_URL}#fragment`,
      "javascript:alert(1)",
    ]) {
      expect(parseLevierGoogleSheetsCopyUrl(invalid)).toBeNull();
    }
  });

  it("creates an immutable server snapshot from the private environment", () => {
    vi.stubEnv("LEVIER_GOOGLE_SHEETS_COPY_URL", COPY_URL);

    const snapshot = getLevierAssetSnapshot();

    expect(snapshot).toEqual({
      assetRevision: "levier-google-sheet-v1-2026-08-03",
      resourceId: SHEET_ID,
      workbookVersion: "1.0.0",
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(getLevierCopyUrl(snapshot ?? { assetRevision: "", resourceId: "" }))
      .toBe(COPY_URL);
    expect(LEVIER_ASSET_REVISION).toBe(
      "levier-google-sheet-v1-2026-08-03",
    );
  });

  it("fails closed when the private configuration is missing or invalid", () => {
    expect(getLevierAssetSnapshot()).toBeNull();
    vi.stubEnv("LEVIER_GOOGLE_SHEETS_COPY_URL", "https://example.com/copy");
    expect(getLevierAssetSnapshot()).toBeNull();
    expect(getLevierCopyUrl({
      assetRevision: LEVIER_ASSET_REVISION,
      resourceId: "invalid",
    })).toBeNull();
    expect(getLevierCopyUrl({
      assetRevision: "another-revision",
      resourceId: SHEET_ID,
    })).toBeNull();
  });

  it("keeps the resource server-only and removes the XLSX runtime contract", async () => {
    const assetSource = await readSource("src/lib/levier-asset.server.ts");
    const configSource = await readSource("next.config.ts");
    const modalSource = await readSource(
      "src/components/OperationalSystemCopyRequestModal.tsx",
    );
    const vercelIgnoreSource = await readSource(".vercelignore");

    expect(assetSource.startsWith('import "server-only";')).toBe(true);
    expect(assetSource).toContain("LEVIER_GOOGLE_SHEETS_COPY_URL");
    expect(assetSource).not.toMatch(/NEXT_PUBLIC|private-assets|readFile|\.xlsx/);
    expect(configSource).not.toMatch(/private-assets\/levier|Levier\.xlsx/);
    expect(vercelIgnoreSource).not.toContain("!private-assets/levier/Levier.xlsx");
    expect(modalSource).not.toMatch(/\/copy|docs\.google|Google Sheets|resourceId/);
  });

  it("keeps the public demonstration separate from the private copy link", async () => {
    const previewSource = await readSource("src/lib/system-kit-previews.ts");
    const modalSource = await readSource(
      "src/components/OperationalSystemCopyRequestModal.tsx",
    );

    expect(previewSource).toContain(
      'src: "/images/levier/levier-tableau-de-bord-preview.webp"',
    );
    expect(previewSource).not.toContain("/copy");
    expect(modalSource).toContain(
      "Aperçu avec des données d’exemple. Votre copie sera vierge",
    );
    const preview = await readFile(
      new URL(
        "../public/images/levier/levier-tableau-de-bord-preview.webp",
        import.meta.url,
      ),
    );
    expect(createHash("sha256").update(preview).digest("hex")).toBe(
      "94be8ec327e6a1275a8fe11a11dc61dd6825ca201c5a9ef84e3bc9013079faf6",
    );
  });
});
