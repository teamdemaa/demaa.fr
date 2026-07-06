import { getSystemDocumentAsset } from "@/lib/system-document-assets";
import type { SystemeDetail } from "@/lib/systeme-catalog";

export type SystemKitDocumentEntry = {
  pillar: string;
  process: string;
  document: string;
  csvHref: string | null;
  downloadHref: string | null;
};

export function getSystemKitDocumentEntries(
  systemSlug: string,
  systeme: SystemeDetail | null | undefined
): SystemKitDocumentEntry[] {
  if (!systeme?.cards.length) {
    return [];
  }

  return systeme.cards.flatMap((card) =>
    card.items.map((item) => {
      const asset = getSystemDocumentAsset(systemSlug, item.document);

      return {
        pillar: card.pillar,
        process: item.process,
        document: item.document,
        csvHref: asset?.csvHref ?? null,
        downloadHref: asset?.downloadHref ?? null,
      };
    })
  );
}
