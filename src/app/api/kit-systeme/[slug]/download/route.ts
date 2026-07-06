import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { getSystemDetailPageData } from "@/lib/system-detail-page";
import { getSystemKitDocumentEntries } from "@/lib/system-kit";

export const runtime = "nodejs";

function normalizeFileSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getPublicFilePath(href: string) {
  return path.join(process.cwd(), "public", href.replace(/^\/+/, ""));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    return new Response("Kit système introuvable.", { status: 404 });
  }

  const documents = getSystemKitDocumentEntries(data.system.slug, data.detail.systeme);
  const downloadableEntries = documents
    .map((entry, index) => ({
      ...entry,
      index,
      href: entry.downloadHref ?? entry.csvHref,
    }))
    .filter((entry): entry is typeof entry & { href: string } => Boolean(entry.href));

  const zip = new JSZip();
  const rootFolderName = `kit-systeme-${normalizeFileSegment(data.system.slug)}`;

  await Promise.all(
    downloadableEntries.map(async (entry) => {
      const extension = path.extname(entry.href) || ".csv";
      const filename = `${String(entry.index + 1).padStart(2, "0")}-${normalizeFileSegment(
        entry.document,
      )}${extension}`;
      const fileBuffer = await readFile(getPublicFilePath(entry.href));

      zip.file(path.posix.join(rootFolderName, filename), fileBuffer);
    }),
  );

  const archive = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return new Response(Buffer.from(archive), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${rootFolderName}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
