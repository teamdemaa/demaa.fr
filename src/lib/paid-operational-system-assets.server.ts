import "server-only";

const PAID_OPERATIONAL_SYSTEM_SHEET_URLS: Partial<Record<string, string>> = {
  "plomberie-chauffage":
    "https://docs.google.com/spreadsheets/d/1YiIS1FwchjbZIJZhdOKwnkyF183ScTohJtYU3JKhUpQ/edit",
};

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
