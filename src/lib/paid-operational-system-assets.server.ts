import "server-only";

import rawPaidOperationalSystemAssets from "@/lib/paid-operational-system-assets.generated.server.json";

const PAID_OPERATIONAL_SYSTEM_SHEET_URLS =
  rawPaidOperationalSystemAssets as Partial<Record<string, string>>;

export function hasPaidOperationalSystemAsset(systemSlug: string) {
  return Boolean(PAID_OPERATIONAL_SYSTEM_SHEET_URLS[systemSlug]);
}

export function getPaidOperationalSystemCopyUrl(
  systemSlug: string,
): string | null {
  const sheetUrl = PAID_OPERATIONAL_SYSTEM_SHEET_URLS[systemSlug];

  if (!sheetUrl) {
    return null;
  }

  return sheetUrl.replace(/\/edit(?:\?.*)?$/, "/copy");
}
