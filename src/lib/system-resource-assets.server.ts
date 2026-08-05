import "server-only";

import { getLevierAssetSnapshot, getLevierCopyUrl, LEVIER_ASSET_REVISION } from "@/lib/levier-asset.server";
import type { LeadAssetSnapshot } from "@/lib/lead-storage";
import { getSystemResource, type SystemResourceSlug } from "@/lib/system-resource-catalog";

const RESOURCE_ASSETS: Readonly<Record<Exclude<SystemResourceSlug, "tableau-pilotage-operationnel">, Readonly<{
  assetRevision: string;
  destination: string;
  workbookVersion: string;
}>>> = {
  "suivi-previsionnel-financier": {
    assetRevision: "suivi-previsionnel-financier-v1-2026-08-05",
    destination: "https://docs.google.com/spreadsheets/d/1-7IDhGAtwNQJtZDYYvhDvM3VHfHVeGwOMTFKdAQuIOE/copy",
    workbookVersion: "1.0.0",
  },
  "crm-suivi-commercial": {
    assetRevision: "crm-suivi-commercial-airtable-v1-2026-08-05",
    destination: "https://airtable.com/app3fRlYVjiFAnrjW/shraiL72hO4EvQoh2",
    workbookVersion: "1.0.0",
  },
  "guide-facturation-electronique": {
    assetRevision: "guide-facturation-electronique-v1-2026-08-05",
    destination: "https://demaa.fr/downloads/guides/guide-facturation-electronique-demaa.pdf",
    workbookVersion: "1.0.0",
  },
  "guide-obligations-fiscales-sociales-comptables": {
    assetRevision: "guide-obligations-fiscales-sociales-comptables-v1-2026-08-05",
    destination: "https://demaa.fr/downloads/guides/guide-obligations-fiscales-sociales-comptables-demaa.pdf",
    workbookVersion: "1.0.0",
  },
};

export function getSystemResourceAssetSnapshot(resourceSlug: string): LeadAssetSnapshot | null {
  if (!getSystemResource(resourceSlug)) return null;
  if (resourceSlug === "tableau-pilotage-operationnel") {
    return getLevierAssetSnapshot();
  }

  const asset = RESOURCE_ASSETS[resourceSlug as keyof typeof RESOURCE_ASSETS];
  if (!asset) return null;
  return {
    assetRevision: asset.assetRevision,
    resourceId: resourceSlug,
    workbookVersion: asset.workbookVersion,
  };
}

export function resolveSystemResourceDelivery(snapshot: LeadAssetSnapshot): Readonly<{
  destination: string;
  resourceSlug: SystemResourceSlug;
}> | null {
  if (snapshot.assetRevision === LEVIER_ASSET_REVISION) {
    const destination = getLevierCopyUrl(snapshot);
    return destination
      ? { destination, resourceSlug: "tableau-pilotage-operationnel" }
      : null;
  }

  const resourceSlug = snapshot.resourceId as Exclude<SystemResourceSlug, "tableau-pilotage-operationnel"> | undefined;
  if (!resourceSlug) return null;
  const asset = RESOURCE_ASSETS[resourceSlug];
  if (!asset || asset.assetRevision !== snapshot.assetRevision) return null;
  return { destination: asset.destination, resourceSlug };
}
