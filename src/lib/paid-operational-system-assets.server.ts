import "server-only";

const PAID_OPERATIONAL_SYSTEM_SHEET_URLS: Partial<Record<string, string>> = {
  "agence-marketing":
    "https://docs.google.com/spreadsheets/d/1yUZsTLGLETL9r--yuYTnOGL9yUtEfds4mM_JQ1cPfBA/edit",
  restaurant:
    "https://docs.google.com/spreadsheets/d/15aqd0DmZKqpoAu-7LjlUV545hpBpOKXOxcrN5u4h3vE/edit",
  pharmacie:
    "https://docs.google.com/spreadsheets/d/1pi4pZpq6GuD_EPFpb_OzXBzrz4owQYiOT9lG0_zO2rw/edit",
  creche:
    "https://docs.google.com/spreadsheets/d/1wJBIeclGwDiGMD6CD0RTQMxFLM1D1eoRJdBWUReVw_M/edit",
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
