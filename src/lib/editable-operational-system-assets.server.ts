import "server-only";

import rawEditableOperationalSystemAssets from "@/lib/editable-operational-system-assets.generated.server.json";

const EDITABLE_OPERATIONAL_SYSTEM_SHEET_URLS =
  rawEditableOperationalSystemAssets as Partial<Record<string, string>>;

export function hasEditableOperationalSystemAsset(systemSlug: string) {
  return Boolean(EDITABLE_OPERATIONAL_SYSTEM_SHEET_URLS[systemSlug]);
}

export function getEditableOperationalSystemCopyUrl(
  systemSlug: string,
): string | null {
  const sheetUrl = EDITABLE_OPERATIONAL_SYSTEM_SHEET_URLS[systemSlug];

  if (!sheetUrl) {
    return null;
  }

  return sheetUrl.replace(/\/edit(?:\?.*)?$/, "/copy");
}
