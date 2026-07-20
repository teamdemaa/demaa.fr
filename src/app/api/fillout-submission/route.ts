import { NextResponse } from "next/server";
import { enforceSameOrigin } from "@/lib/request-guard";

export function POST(request: Request) {
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  return NextResponse.json(
    {
      error: "Cette trace navigateur a été remplacée par le webhook Fillout sécurisé.",
    },
    { status: 410 },
  );
}
