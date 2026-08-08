import "server-only";

import { getDocumentModelBySlug } from "@/lib/document-models";
import { getLevierAssetSnapshot, getLevierCopyUrl, LEVIER_ASSET_REVISION } from "@/lib/levier-asset.server";
import type { LeadAssetSnapshot } from "@/lib/lead-storage";
import { getSystemResource, type SystemResourceSlug } from "@/lib/system-resource-catalog";
import { getCanonicalOrigin } from "@/lib/site-url";

type ExternalResourceSlug = Exclude<
  SystemResourceSlug,
  "tableau-pilotage-operationnel" | "recapitulatif-systeme"
>;

const SYSTEM_RECAP_ASSET_REVISION = "recapitulatif-systeme-v1-2026-08-08";

type ResourceAssetRevision = Readonly<{
  assetRevision: string;
  destination: string;
  workbookVersion: string;
}>;

function getDocumentModelDestination(
  documentModelSlug: string,
  mode: "copy" | "direct",
): string {
  const destination = getDocumentModelBySlug(documentModelSlug)?.ctaHref;
  if (!destination) {
    throw new Error(`Missing document model destination: ${documentModelSlug}.`);
  }
  if (mode === "direct") return destination;

  const parsed = new URL(destination);
  const sheetId = parsed.pathname.match(
    /^\/spreadsheets\/d\/([A-Za-z0-9_-]{20,160})\/edit$/,
  )?.[1];
  if (parsed.protocol !== "https:" || parsed.hostname !== "docs.google.com" || !sheetId) {
    throw new Error(`Invalid Google Sheets document model: ${documentModelSlug}.`);
  }

  return new URL(`/spreadsheets/d/${sheetId}/copy`, parsed.origin).toString();
}

const RESOURCE_ASSET_REVISIONS: Readonly<Partial<Record<ExternalResourceSlug, readonly ResourceAssetRevision[]>>> = {
  "suivi-previsionnel-financier": [{
    assetRevision: "suivi-previsionnel-financier-v1-2026-08-05",
    destination: getDocumentModelDestination("suivi-previsionnel-financier", "copy"),
    workbookVersion: "1.0.0",
  }],
  "crm-suivi-commercial": [{
    assetRevision: "crm-suivi-commercial-airtable-v1-2026-08-05",
    destination: getDocumentModelDestination("pilotage-marketing-vente", "direct"),
    workbookVersion: "1.0.0",
  }],
  "guide-facturation-electronique": [
    {
      assetRevision: "guide-facturation-electronique-slides-v2-2026-08-06",
      destination: "https://demaa.co/downloads/presentations/presentation-facturation-electronique-demaa.pdf",
      workbookVersion: "2.0.0",
    },
    {
      assetRevision: "guide-facturation-electronique-v1-2026-08-05",
      destination: "https://demaa.co/downloads/guides/guide-facturation-electronique-demaa.pdf",
      workbookVersion: "1.0.0",
    },
  ],
  "guide-obligations-fiscales-sociales-comptables": [
    {
      assetRevision: "guide-obligations-fiscales-sociales-comptables-slides-v2-2026-08-06",
      destination: "https://demaa.co/downloads/presentations/presentation-obligations-finances-demaa.pdf",
      workbookVersion: "2.0.0",
    },
    {
      assetRevision: "guide-obligations-fiscales-sociales-comptables-v1-2026-08-05",
      destination: "https://demaa.co/downloads/guides/guide-obligations-fiscales-sociales-comptables-demaa.pdf",
      workbookVersion: "1.0.0",
    },
  ],
};

export function getSystemResourceAssetSnapshot(resourceSlug: string): LeadAssetSnapshot | null {
  if (!getSystemResource(resourceSlug)) return null;
  if (resourceSlug === "recapitulatif-systeme") {
    return {
      assetRevision: SYSTEM_RECAP_ASSET_REVISION,
      resourceId: resourceSlug,
      workbookVersion: "1.0.0",
    };
  }
  if (resourceSlug === "tableau-pilotage-operationnel") {
    return getLevierAssetSnapshot();
  }

  const asset = RESOURCE_ASSET_REVISIONS[resourceSlug as ExternalResourceSlug]?.[0];
  if (!asset) return null;
  return {
    assetRevision: asset.assetRevision,
    resourceId: resourceSlug,
    workbookVersion: asset.workbookVersion,
  };
}

export function resolveSystemResourceDelivery(
  snapshot: LeadAssetSnapshot,
  systemSlug?: string,
): Readonly<{
  destination: string;
  resourceSlug: SystemResourceSlug;
}> | null {
  if (snapshot.assetRevision === SYSTEM_RECAP_ASSET_REVISION) {
    if (!systemSlug || !/^[a-z0-9-]{2,120}$/.test(systemSlug)) return null;
    return {
      destination: `${getCanonicalOrigin()}/kit-operationnel/${systemSlug}/recapitulatif`,
      resourceSlug: "recapitulatif-systeme",
    };
  }
  if (snapshot.assetRevision === LEVIER_ASSET_REVISION) {
    const destination = getLevierCopyUrl(snapshot);
    return destination
      ? { destination, resourceSlug: "tableau-pilotage-operationnel" }
      : null;
  }

  const resourceSlug = snapshot.resourceId as ExternalResourceSlug | undefined;
  if (!resourceSlug) return null;
  const asset = RESOURCE_ASSET_REVISIONS[resourceSlug]?.find(
    (revision) => revision.assetRevision === snapshot.assetRevision,
  );
  if (!asset) return null;
  return { destination: asset.destination, resourceSlug };
}
