import "server-only";

import operationalSystemDemoAssets from "@/lib/operational-system-demo-assets.generated.json";

const PRIVATE_REGISTRY_ENV_NAME =
  "OPERATIONAL_SYSTEM_COPY_SHEET_IDS_JSON" as const;
const SHEET_ID_PATTERN = /^[A-Za-z0-9_-]{20,160}$/;
const SYSTEM_SLUG_PATTERN = /^[a-z0-9-]{2,120}$/;
const PUBLISHED_SYSTEM_SLUGS = new Set(
  Object.keys(operationalSystemDemoAssets),
);

let cachedRawRegistry: string | undefined;
let cachedRegistry: Readonly<Record<string, string>> = Object.freeze({});

function readPrivateRegistry(): Readonly<Record<string, string>> {
  const rawRegistry = process.env[PRIVATE_REGISTRY_ENV_NAME]?.trim() ?? "";

  if (rawRegistry === cachedRawRegistry) {
    return cachedRegistry;
  }

  cachedRawRegistry = rawRegistry;

  if (!rawRegistry) {
    cachedRegistry = Object.freeze({});
    return cachedRegistry;
  }

  let parsedRegistry: unknown;

  try {
    parsedRegistry = JSON.parse(rawRegistry);
  } catch {
    throw new Error("Le registre privé des copies est invalide.");
  }

  if (
    !parsedRegistry ||
    typeof parsedRegistry !== "object" ||
    Array.isArray(parsedRegistry)
  ) {
    throw new Error("Le registre privé des copies est invalide.");
  }

  const validatedRegistry: Record<string, string> = {};

  for (const [systemSlug, sheetId] of Object.entries(parsedRegistry)) {
    if (
      !SYSTEM_SLUG_PATTERN.test(systemSlug) ||
      !PUBLISHED_SYSTEM_SLUGS.has(systemSlug) ||
      typeof sheetId !== "string" ||
      !SHEET_ID_PATTERN.test(sheetId)
    ) {
      throw new Error("Le registre privé des copies est invalide.");
    }

    validatedRegistry[systemSlug] = sheetId;
  }

  const validatedEntries = Object.entries(validatedRegistry);
  if (
    validatedEntries.length !== PUBLISHED_SYSTEM_SLUGS.size ||
    new Set(validatedEntries.map(([, sheetId]) => sheetId)).size !==
      validatedEntries.length
  ) {
    throw new Error("Le registre privé des copies est invalide.");
  }

  cachedRegistry = Object.freeze(validatedRegistry);
  return cachedRegistry;
}

export function hasEditableOperationalSystemAsset(systemSlug: string) {
  return PUBLISHED_SYSTEM_SLUGS.has(systemSlug);
}

export function getEditableOperationalSystemCopyUrl(
  systemSlug: string,
): string | null {
  if (!PUBLISHED_SYSTEM_SLUGS.has(systemSlug)) {
    return null;
  }

  const sheetId = readPrivateRegistry()[systemSlug];

  if (!sheetId) {
    return null;
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/copy`;
}
