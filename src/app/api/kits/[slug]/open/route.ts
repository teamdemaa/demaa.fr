import { NextResponse } from "next/server";
import { getPilotingSheetCopyUrl } from "@/lib/document-models";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { recordKitOpen } from "@/lib/kit-analytics.server";
import { shouldCountKitOpen } from "@/lib/kit-analytics-utils";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { hasEditableOperationalSystemAsset } from "@/lib/editable-operational-system-assets.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type KitOpenRouteContext = {
  params: Promise<{ slug: string }>;
};

function isValidKitSlug(value: string) {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

export async function GET(request: Request, context: KitOpenRouteContext) {
  const { slug } = await context.params;

  if (!isValidKitSlug(slug)) {
    return NextResponse.json({ error: "Système invalide." }, { status: 400 });
  }

  if (hasEditableOperationalSystemAsset(slug)) {
    return NextResponse.json(
      { error: "Ce système est envoyé gratuitement par e-mail." },
      { status: 410 },
    );
  }

  const copyUrl = getPilotingSheetCopyUrl(slug);
  const enterprise = await getEnterpriseBySlug(slug);

  if (!copyUrl || !enterprise) {
    return NextResponse.json({ error: "Système introuvable." }, { status: 404 });
  }

  if (shouldCountKitOpen(request)) {
    const kitName = enterpriseToSystem(enterprise).name || enterprise.name;

    try {
      await recordKitOpen({
        kitName,
        kitSlug: slug,
        request,
      });
      logOperationalEvent("kit.open.recorded", { kitSlug: slug });
    } catch (error) {
      logOperationalError("kit.open.record_failed", error, { kitSlug: slug });
    }
  }

  const response = NextResponse.redirect(copyUrl, 307);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");

  return response;
}
