import publicAssetManifest from "@/lib/operational-system-asset-revisions.generated.json";

export const LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION =
  "d032-v1-2026-07-28" as const;
export const LEGACY_OPERATIONAL_WORKBOOK_VERSION = "1.0.0" as const;
export const OPERATIONAL_SYSTEM_PUBLIC_ASSET_SCHEMA_VERSION =
  "operational-system-public-assets-v2" as const;

export type OperationalSystemAssetPreview = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export type OperationalSystemPublicAssetRevision = {
  assetRevision: string;
  demoUrl: string | null;
  preview: OperationalSystemAssetPreview | null;
  state: "active" | "draft" | "retired";
  workbookVersion: string;
};

export type OperationalSystemPublicAssetEntry = {
  activeRevision: string;
  revisions: Record<string, OperationalSystemPublicAssetRevision>;
};

export type OperationalSystemPublicAssetManifest = {
  schemaVersion: typeof OPERATIONAL_SYSTEM_PUBLIC_ASSET_SCHEMA_VERSION;
  systems: Record<string, OperationalSystemPublicAssetEntry>;
};

export type OperationalSystemAssetSnapshot = {
  assetRevision: string;
  demoUrl: string;
  preview: OperationalSystemAssetPreview;
  systemSlug: string;
  workbookVersion: string;
};

const manifest =
  publicAssetManifest as OperationalSystemPublicAssetManifest;

function isCompleteRevision(
  revision: OperationalSystemPublicAssetRevision | undefined,
): revision is OperationalSystemPublicAssetRevision & {
  demoUrl: string;
  preview: OperationalSystemAssetPreview;
} {
  return Boolean(
    revision &&
      revision.demoUrl?.startsWith(
        "https://docs.google.com/spreadsheets/",
      ) &&
      revision.preview?.src.startsWith("/images/kits/") &&
      revision.preview.alt.trim() &&
      Number.isInteger(revision.preview.width) &&
      revision.preview.width > 0 &&
      Number.isInteger(revision.preview.height) &&
      revision.preview.height > 0,
  );
}

export function resolveOperationalSystemAssetSnapshot(
  candidateManifest: OperationalSystemPublicAssetManifest,
  systemSlug: string,
): OperationalSystemAssetSnapshot | null {
  const system = candidateManifest.systems[systemSlug];
  if (!system) {
    return null;
  }

  const revision = system.revisions[system.activeRevision];
  if (
    !revision ||
    revision.assetRevision !== system.activeRevision ||
    revision.state !== "active" ||
    !isCompleteRevision(revision)
  ) {
    return null;
  }

  return {
    assetRevision: revision.assetRevision,
    demoUrl: revision.demoUrl,
    preview: revision.preview,
    systemSlug,
    workbookVersion: revision.workbookVersion,
  };
}

export function getActiveOperationalSystemAssetSnapshot(
  systemSlug: string,
): OperationalSystemAssetSnapshot | null {
  return resolveOperationalSystemAssetSnapshot(manifest, systemSlug);
}

export function validateOperationalSystemAssetManifest(
  candidateManifest: OperationalSystemPublicAssetManifest = manifest,
) {
  if (
    candidateManifest.schemaVersion !==
    OPERATIONAL_SYSTEM_PUBLIC_ASSET_SCHEMA_VERSION
  ) {
    throw new Error("Le manifeste public des systèmes est invalide.");
  }

  const systems = Object.entries(candidateManifest.systems);
  if (systems.length !== 115) {
    throw new Error(
      "Le manifeste public doit versionner les 115 systèmes publiés.",
    );
  }

  for (const [systemSlug, system] of systems) {
    const activeRevision = system.revisions[system.activeRevision];
    if (
      !activeRevision ||
      activeRevision.state !== "active" ||
      !resolveOperationalSystemAssetSnapshot(
        candidateManifest,
        systemSlug,
      )
    ) {
      throw new Error(
        `La révision active de ${systemSlug} ne forme pas une paire démo + aperçu atomique.`,
      );
    }

    for (const [assetRevision, revision] of Object.entries(
      system.revisions,
    )) {
      if (revision.assetRevision !== assetRevision) {
        throw new Error(
          `La révision ${assetRevision} de ${systemSlug} est incohérente.`,
        );
      }

      if (
        revision.state === "active" &&
        assetRevision !== system.activeRevision
      ) {
        throw new Error(
          `Plusieurs révisions actives sont déclarées pour ${systemSlug}.`,
        );
      }

      if (
        (revision.demoUrl === null) !== (revision.preview === null) ||
        (revision.demoUrl !== null && !isCompleteRevision(revision))
      ) {
        throw new Error(
          `La révision ${assetRevision} de ${systemSlug} ne forme pas une paire atomique.`,
        );
      }
    }
  }

  return true;
}
