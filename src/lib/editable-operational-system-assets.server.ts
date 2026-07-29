import "server-only";

import operationalSystemDemoAssets from "@/lib/operational-system-demo-assets.generated.json";
import {
  getActiveOperationalSystemAssetSnapshot,
  LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION,
  type OperationalSystemAssetSnapshot,
} from "@/lib/operational-system-asset-revisions";

const PRIVATE_REGISTRY_ENV_NAME =
  "OPERATIONAL_SYSTEM_COPY_SHEET_IDS_JSON" as const;
const SHEET_ID_PATTERN = /^[A-Za-z0-9_-]{20,160}$/;
const SYSTEM_SLUG_PATTERN = /^[a-z0-9-]{2,120}$/;
const ASSET_REVISION_PATTERN = /^[a-z0-9.-]{2,120}$/;
const PUBLISHED_SYSTEM_SLUGS = new Set(
  Object.keys(operationalSystemDemoAssets),
);

export type PrivateOperationalSystemAssetEntry = {
  activeRevision: string;
  revisions: Readonly<Record<string, string>>;
};

let cachedRawRegistry: string | undefined;
let cachedRegistry: Readonly<
  Record<string, PrivateOperationalSystemAssetEntry>
> =
  Object.freeze({});

function assertCompleteRegistry(
  registry: Record<string, PrivateOperationalSystemAssetEntry>,
) {
  const entries = Object.entries(registry);
  const sheetIds = entries.flatMap(([, entry]) =>
    Object.values(entry.revisions),
  );

  if (
    entries.length !== PUBLISHED_SYSTEM_SLUGS.size ||
    new Set(sheetIds).size !== sheetIds.length
  ) {
    throw new Error("Le registre privé des copies est invalide.");
  }

  return Object.freeze(registry);
}

function parseLegacyRegistry(
  parsedRegistry: Record<string, unknown>,
): Readonly<Record<string, PrivateOperationalSystemAssetEntry>> {
  const validatedRegistry: Record<
    string,
    PrivateOperationalSystemAssetEntry
  > = {};

  for (const [systemSlug, sheetId] of Object.entries(parsedRegistry)) {
    if (
      !SYSTEM_SLUG_PATTERN.test(systemSlug) ||
      !PUBLISHED_SYSTEM_SLUGS.has(systemSlug) ||
      typeof sheetId !== "string" ||
      !SHEET_ID_PATTERN.test(sheetId)
    ) {
      throw new Error("Le registre privé des copies est invalide.");
    }

    validatedRegistry[systemSlug] = Object.freeze({
      activeRevision: LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION,
      revisions: Object.freeze({
        [LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION]: sheetId,
      }),
    });
  }

  return assertCompleteRegistry(validatedRegistry);
}

function parseVersionedRegistry(
  parsedRegistry: Record<string, unknown>,
): Readonly<Record<string, PrivateOperationalSystemAssetEntry>> {
  if (
    parsedRegistry.schemaVersion !== "operational-system-private-assets-v2" ||
    !parsedRegistry.systems ||
    typeof parsedRegistry.systems !== "object" ||
    Array.isArray(parsedRegistry.systems)
  ) {
    throw new Error("Le registre privé des copies est invalide.");
  }

  const validatedRegistry: Record<
    string,
    PrivateOperationalSystemAssetEntry
  > = {};

  for (const [systemSlug, rawEntry] of Object.entries(
    parsedRegistry.systems as Record<string, unknown>,
  )) {
    if (
      !SYSTEM_SLUG_PATTERN.test(systemSlug) ||
      !PUBLISHED_SYSTEM_SLUGS.has(systemSlug) ||
      !rawEntry ||
      typeof rawEntry !== "object" ||
      Array.isArray(rawEntry)
    ) {
      throw new Error("Le registre privé des copies est invalide.");
    }

    const entry = rawEntry as {
      activeRevision?: unknown;
      revisions?: unknown;
    };

    if (
      typeof entry.activeRevision !== "string" ||
      !ASSET_REVISION_PATTERN.test(entry.activeRevision) ||
      !entry.revisions ||
      typeof entry.revisions !== "object" ||
      Array.isArray(entry.revisions)
    ) {
      throw new Error("Le registre privé des copies est invalide.");
    }

    const revisions: Record<string, string> = {};
    for (const [assetRevision, sheetId] of Object.entries(
      entry.revisions as Record<string, unknown>,
    )) {
      if (
        !ASSET_REVISION_PATTERN.test(assetRevision) ||
        typeof sheetId !== "string" ||
        !SHEET_ID_PATTERN.test(sheetId)
      ) {
        throw new Error("Le registre privé des copies est invalide.");
      }
      revisions[assetRevision] = sheetId;
    }

    if (!revisions[entry.activeRevision]) {
      throw new Error("Le registre privé des copies est invalide.");
    }

    validatedRegistry[systemSlug] = Object.freeze({
      activeRevision: entry.activeRevision,
      revisions: Object.freeze(revisions),
    });
  }

  return assertCompleteRegistry(validatedRegistry);
}

function readPrivateRegistry(): Readonly<
  Record<string, PrivateOperationalSystemAssetEntry>
> {
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

  cachedRegistry =
    "schemaVersion" in parsedRegistry || "systems" in parsedRegistry
      ? parseVersionedRegistry(parsedRegistry as Record<string, unknown>)
      : parseLegacyRegistry(parsedRegistry as Record<string, unknown>);
  return cachedRegistry;
}

export function hasEditableOperationalSystemAsset(systemSlug: string) {
  return PUBLISHED_SYSTEM_SLUGS.has(systemSlug);
}

export function getActiveOperationalSystemDeliverySnapshot(
  systemSlug: string,
) {
  const publicSnapshot =
    getActiveOperationalSystemAssetSnapshot(systemSlug);
  const privateEntry = readPrivateRegistry()[systemSlug];
  return resolveOperationalSystemDeliverySnapshot(
    publicSnapshot,
    privateEntry,
  );
}

export function resolveOperationalSystemDeliverySnapshot(
  publicSnapshot: OperationalSystemAssetSnapshot | null,
  privateEntry: PrivateOperationalSystemAssetEntry | undefined,
) {
  if (
    !publicSnapshot ||
    !privateEntry ||
    privateEntry.activeRevision !== publicSnapshot.assetRevision ||
    !privateEntry.revisions[publicSnapshot.assetRevision]
  ) {
    return null;
  }

  return {
    assetRevision: publicSnapshot.assetRevision,
    workbookVersion: publicSnapshot.workbookVersion,
  };
}

export function getEditableOperationalSystemCopyUrl(
  systemSlug: string,
  assetRevision: string,
): string | null {
  if (!PUBLISHED_SYSTEM_SLUGS.has(systemSlug) || !assetRevision) {
    return null;
  }

  const sheetId =
    readPrivateRegistry()[systemSlug]?.revisions[assetRevision];

  if (!sheetId) {
    return null;
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/copy`;
}
