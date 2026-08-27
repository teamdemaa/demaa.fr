import "server-only";

import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import { getDocumentModelBySlug } from "@/lib/document-models";

function toGoogleSheetsCopyUrl(destination: string): string | null {
  const parsed = new URL(destination);
  const sheetId = parsed.pathname.match(
    /^\/spreadsheets\/d\/([A-Za-z0-9_-]{20,160})\/edit$/,
  )?.[1];
  if (parsed.protocol !== "https:" || parsed.hostname !== "docs.google.com" || !sheetId) {
    return null;
  }
  return new URL(`/spreadsheets/d/${sheetId}/copy`, parsed.origin).toString();
}

function toAirtableBaseShareUrl(destination: string): string | null {
  const parsed = new URL(destination);
  const isPublicBaseShare = /^\/app[A-Za-z0-9]{14}\/shr[A-Za-z0-9]{14}\/?$/.test(
    parsed.pathname,
  );

  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "airtable.com" ||
    !isPublicBaseShare
  ) {
    return null;
  }

  return new URL(parsed.pathname, parsed.origin).toString();
}

export function getCopyableModelDestination(slug: string): string | null {
  const model = getPublishedCopyableModelBySlug(slug);
  if (!model?.documentModelSlug) return null;

  const documentModel = getDocumentModelBySlug(model.documentModelSlug);
  if (!documentModel) return null;

  if (model.platform === "google-sheets") {
    return toGoogleSheetsCopyUrl(documentModel.ctaHref);
  }

  if (model.platform === "airtable") {
    return toAirtableBaseShareUrl(documentModel.ctaHref);
  }

  return null;
}
