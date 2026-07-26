import { NextResponse } from "next/server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  return NextResponse.json(
      {
        error:
          "La livraison gratuite a été arrêtée. Consultez la démonstration puis obtenez le tableau prêt à utiliser depuis sa page métier.",
      },
    { status: 410 },
  );
}
