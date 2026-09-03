import { NextResponse } from "next/server";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost } from "@/lib/request-guard";
import { getSystemDetailPageData } from "@/lib/system-detail-page";
import { getSystemProcessGuideDetails } from "@/lib/system-process-guide-details";
import { orderSystemeRoutinesForDisplay } from "@/lib/system-process-order";
import {
  buildSystemProcessesPdf,
  buildSystemProcessesPdfFilename,
} from "@/lib/system-processes-pdf.server";

export const runtime = "nodejs";

type SystemProcessesPdfRouteContext = {
  params: Promise<{ slug: string }>;
};

async function handleGet(
  request: Request,
  context: SystemProcessesPdfRouteContext,
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const { slug } = await context.params;
  if (!/^[a-z0-9-]{2,120}$/.test(slug)) {
    return NextResponse.json(
      { error: "Le métier sélectionné est invalide." },
      { status: 400 },
    );
  }

  const data = await getSystemDetailPageData(slug);
  if (!data) {
    return NextResponse.json(
      { error: "Les processus de ce métier sont introuvables." },
      { status: 404 },
    );
  }

  const systeme = data.detail.systeme;
  const routines = systeme
    ? orderSystemeRoutinesForDisplay(systeme.routines, systeme.cards, slug)
    : [];
  if (routines.length === 0) {
    return NextResponse.json(
      { error: "Le document de ce métier n’est pas encore disponible." },
      { status: 404 },
    );
  }

  const pdfBytes = await buildSystemProcessesPdf({
    processGuideDetails: getSystemProcessGuideDetails(slug, routines),
    routines,
    systemName: data.system.name,
  });

  return new Response(Uint8Array.from(pdfBytes), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="${buildSystemProcessesPdfFilename(slug)}"`,
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(
  request: Request,
  context: SystemProcessesPdfRouteContext,
) {
  try {
    return await handleGet(request, context);
  } catch (error) {
    logOperationalError("system_processes_pdf.download_failed", error, {
      requestType: "system_processes_pdf_download",
    });
    return NextResponse.json(
      { error: "Impossible de télécharger le PDF pour le moment." },
      { status: 500 },
    );
  }
}
