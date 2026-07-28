import { NextResponse } from "next/server";
import { hasEditableOperationalSystemAsset } from "@/lib/editable-operational-system-assets.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type KitOpenRouteContext = {
  params: Promise<{ slug: string }>;
};

function isValidKitSlug(value: string) {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

export async function GET(_request: Request, context: KitOpenRouteContext) {
  const { slug } = await context.params;

  if (!isValidKitSlug(slug)) {
    return NextResponse.json({ error: "Kit invalide." }, { status: 400 });
  }

  if (hasEditableOperationalSystemAsset(slug)) {
    return NextResponse.json(
      { error: "Ce système est envoyé gratuitement par e-mail." },
      { status: 410 },
    );
  }

  return NextResponse.json({ error: "Kit introuvable." }, { status: 404 });
}
