import "server-only";

export const LEVIER_ASSET_REVISION =
  "levier-google-sheet-v1-2026-08-03" as const;
export const LEVIER_LEGACY_ATTACHMENT_REVISION =
  "levier-v1-2026-08-03" as const;
export const LEVIER_WORKBOOK_VERSION = "1.0.0" as const;

const LEVIER_COPY_URL_ENV_NAME =
  "LEVIER_GOOGLE_SHEETS_COPY_URL" as const;
const GOOGLE_SHEET_ID_PATTERN = /^[A-Za-z0-9_-]{20,160}$/;

export type LevierAssetSnapshot = Readonly<{
  assetRevision: typeof LEVIER_ASSET_REVISION;
  resourceId: string;
  workbookVersion: typeof LEVIER_WORKBOOK_VERSION;
}>;

export function parseLevierGoogleSheetsCopyUrl(
  candidate: string | null | undefined,
): string | null {
  const value = candidate?.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "docs.google.com" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return null;
  }

  const match = url.pathname.match(
    /^\/spreadsheets\/d\/([A-Za-z0-9_-]{20,160})\/copy$/,
  );
  const resourceId = match?.[1] ?? "";
  return GOOGLE_SHEET_ID_PATTERN.test(resourceId) ? resourceId : null;
}

export function buildLevierGoogleSheetsCopyUrl(
  resourceId: string | null | undefined,
): string | null {
  const normalizedResourceId = resourceId?.trim() ?? "";
  if (!GOOGLE_SHEET_ID_PATTERN.test(normalizedResourceId)) return null;

  return `https://docs.google.com/spreadsheets/d/${normalizedResourceId}/copy`;
}

export function getLevierAssetSnapshot(): LevierAssetSnapshot | null {
  const resourceId = parseLevierGoogleSheetsCopyUrl(
    process.env[LEVIER_COPY_URL_ENV_NAME],
  );
  if (!resourceId) return null;

  return Object.freeze({
    assetRevision: LEVIER_ASSET_REVISION,
    resourceId,
    workbookVersion: LEVIER_WORKBOOK_VERSION,
  });
}

export function getLevierCopyUrl(input: {
  assetRevision: string;
  resourceId?: string | null;
}): string | null {
  if (input.assetRevision !== LEVIER_ASSET_REVISION) return null;
  return buildLevierGoogleSheetsCopyUrl(input.resourceId);
}
